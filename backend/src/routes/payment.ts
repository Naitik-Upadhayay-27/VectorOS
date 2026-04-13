import { Router, Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { User } from '../models/User'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = Router()

// ── Plan config ───────────────────────────────────────────────────────────────
const PLANS = {
  pro:      { amount: 14900, currency: 'INR', label: 'Skill Vector Pro — 1 Week' },
  lifetime: { amount: 89900, currency: 'INR', label: 'Skill Vector Exclusive — 1 Month' },
}

function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

// ── POST /api/payment/create-order  (authenticated) ──────────────────────────
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as { plan: 'pro' | 'lifetime' }
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' })

  try {
    const order = await getRazorpay().orders.create({
      amount:   PLANS[plan].amount,
      currency: PLANS[plan].currency,
      notes:    { userId: req.userId!, plan },
    })
    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/payment/verify  (authenticated) ────────────────────────────────
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' })
  }

  try {
    const update: any = { plan, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id }
    if (plan === 'pro') {
      const exp = new Date(); exp.setDate(exp.getDate() + 7)
      update.planExpiresAt = exp
      update.downloadsUsed = 0
      update.chatsUsed = 0
    } else {
      const exp = new Date(); exp.setDate(exp.getDate() + 30)
      update.planExpiresAt = exp
      update.downloadsUsed = 0
      update.chatsUsed = 0
    }
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, user: { plan: user.plan, downloadsUsed: user.downloadsUsed, chatsUsed: user.chatsUsed ?? 0, planExpiresAt: user.planExpiresAt } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
// Razorpay sends payment.captured events here.
// Verify the webhook signature, then upgrade the user's plan.
router.post('/webhook', async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  const signature = req.headers['x-razorpay-signature'] as string
  const rawBody   = (req as any).rawBody as Buffer

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (expected !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  const event = JSON.parse(rawBody.toString())
  if (event.event !== 'payment.captured') return res.json({ ok: true })

  const payment = event.payload?.payment?.entity
  // notes field carries { userId, plan } set during order creation
  const uid  = payment?.notes?.userId as string | undefined
  const plan = payment?.notes?.plan   as 'pro' | 'lifetime' | undefined

  if (!uid || !PLANS[plan!]) return res.json({ ok: true })

  try {
    const update: any = { plan, razorpayOrderId: payment.order_id ?? payment.id }
    if (plan === 'pro') {
      const exp = new Date()
      exp.setDate(exp.getDate() + 7)
      update.planExpiresAt = exp
      update.downloadsUsed = 0
      update.chatsUsed = 0
    } else {
      // Monthly plan — expires in 30 days
      const exp = new Date()
      exp.setDate(exp.getDate() + 30)
      update.planExpiresAt = exp
      update.downloadsUsed = 0
      update.chatsUsed = 0
    }
    await User.findByIdAndUpdate(uid, update)
  } catch (err: any) {
    console.error('Webhook DB update failed:', err.message)
  }

  res.json({ ok: true })
})

// ── POST /api/payment/track-download  (authenticated) ────────────────────────
router.post('/track-download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { downloadsUsed: 1 } },
      { new: true }
    )
    res.json({ downloadsUsed: user?.downloadsUsed ?? 0 })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/payment/status  (authenticated) ─────────────────────────────────
router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('plan downloadsUsed chatsUsed planExpiresAt')
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Auto-downgrade expired plans
    if ((user.plan === 'pro' || user.plan === 'lifetime') && user.planExpiresAt && user.planExpiresAt < new Date()) {
      user.plan = 'free'
      await user.save()
    }

    res.json({ plan: user.plan, downloadsUsed: user.downloadsUsed, chatsUsed: user.chatsUsed ?? 0, planExpiresAt: user.planExpiresAt })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
