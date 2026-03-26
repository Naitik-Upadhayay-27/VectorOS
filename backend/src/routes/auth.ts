import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import passport from '../config/passport'

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

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body)
    const hashed = await bcrypt.hash(password, 12)

    // TODO: persist to DB
    const user = { id: crypto.randomUUID(), name, email, plan: 'free', aiTokensLeft: 20 }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })

    res.status(201).json({ user, token, refreshToken })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // TODO: fetch user from DB and verify password
    const user = { id: 'mock-id', name: 'Alex Johnson', email, plan: 'free', aiTokensLeft: 20 }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })

    res.json({ user, token, refreshToken })
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

// ── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/auth/google — redirect to Google consent screen
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google OAuth is not configured.' })
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

// GET /api/auth/google/callback
router.get('/google/callback', (req: Request, res: Response, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err) {
      console.error('[Google OAuth] Auth error:', err)
      return res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=oauth_error`)
    }
    if (!user) {
      console.error('[Google OAuth] No user returned')
      return res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`)
    }
    try {
      console.log('[Google OAuth] Success:', user.email)
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' })
      const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
      // Encode user as base64 to avoid URL encoding issues with JSON special chars
      const userB64 = Buffer.from(JSON.stringify(user)).toString('base64url')
      const params = new URLSearchParams({ token, refreshToken, user: userB64 })
      const redirectUrl = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/auth/callback?${params}`
      console.log('[Google OAuth] Redirecting to:', redirectUrl.slice(0, 100) + '...')
      res.redirect(redirectUrl)
    } catch (e: any) {
      console.error('[Google OAuth] JWT error:', e)
      res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=jwt_error`)
    }
  })(req, res, next)
})

export default router
