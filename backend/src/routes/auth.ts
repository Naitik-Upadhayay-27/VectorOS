import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import passport from '../config/passport'
import { User } from '../models/User'

const router = Router()

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

function makeTokens(userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
  return { token, refreshToken }
}

function userPayload(u: any) {
  return { id: u._id.toString(), name: u.name, email: u.email, plan: u.plan, aiTokensLeft: u.aiTokensLeft, avatar: u.avatar }
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body)

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })

    const { token, refreshToken } = makeTokens(user._id.toString())
    res.status(201).json({ user: userPayload(user), token, refreshToken })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ email })
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const { token, refreshToken } = makeTokens(user._id.toString())
    res.json({ user: userPayload(user), token, refreshToken })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' })
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    const token = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    res.json({ token })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// ── Google OAuth ──────────────────────────────────────────────────────────────

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    return res.status(503).json({ error: 'Google OAuth is not configured.' })
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

router.get('/google/callback', (req: Request, res: Response, next) => {
  passport.authenticate('google', { session: false }, async (err: any, profile: any) => {
    if (err || !profile)
      return res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`)

    try {
      // Upsert user by googleId or email
      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: profile.email }] })
      if (!user) {
        user = await User.create({
          name: profile.name,
          email: profile.email,
          googleId: profile.id,
          avatar: profile.avatar,
        })
      } else if (!user.googleId) {
        user.googleId = profile.id
        if (profile.avatar) user.avatar = profile.avatar
        await user.save()
      }

      const { token, refreshToken } = makeTokens(user._id.toString())
      const userB64 = Buffer.from(JSON.stringify(userPayload(user))).toString('base64url')
      const params = new URLSearchParams({ token, refreshToken, user: userB64 })
      res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/auth/callback?${params}`)
    } catch (e: any) {
      console.error('[Google OAuth] DB error:', e)
      res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=db_error`)
    }
  })(req, res, next)
})

export default router
