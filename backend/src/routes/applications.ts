import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { Application } from '../models/Application'

const router = Router()
router.use(authenticate)

// GET /api/applications
router.get('/', async (req: AuthRequest, res: Response) => {
  const apps = await Application.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json({ applications: apps })
})

// POST /api/applications
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const app = await Application.create({ userId: req.userId, ...req.body })
    res.status(201).json({ application: app })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/applications/:id/status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const valid = ['saved', 'applied', 'interview', 'offer', 'rejected']
  if (!valid.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' })
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: req.body.status },
    { new: true }
  )
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

// DELETE /api/applications/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  res.json({ success: true })
})

export default router
