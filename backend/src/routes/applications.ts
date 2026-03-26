import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// GET /api/applications
router.get('/', async (req: AuthRequest, res: Response) => {
  // TODO: fetch from DB by userId
  res.json({ applications: [] })
})

// POST /api/applications
router.post('/', async (req: AuthRequest, res: Response) => {
  const app = { id: crypto.randomUUID(), userId: req.userId, ...req.body, createdAt: new Date() }
  // TODO: persist to DB
  res.status(201).json({ application: app })
})

// PATCH /api/applications/:id/status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['saved', 'applied', 'interview', 'offer', 'rejected']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  // TODO: update in DB
  res.json({ id: req.params.id, status })
})

// DELETE /api/applications/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  // TODO: delete from DB
  res.json({ success: true })
})

export default router
