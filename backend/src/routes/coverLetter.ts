import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { CoverLetter } from '../models/CoverLetter'

const router = Router()
router.use(authenticate)

// GET /api/cover-letters
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const letters = await CoverLetter.find({ userId: req.userId }).sort({ updatedAt: -1 })
    res.json({ coverLetters: letters })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/cover-letters
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const letter = await CoverLetter.create({ userId: req.userId, ...req.body })
    res.status(201).json({ coverLetter: letter })
  } catch (err: any) { res.status(400).json({ error: err.message }) }
})

// PUT /api/cover-letters/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const letter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: false }
    )
    if (!letter) return res.status(404).json({ error: 'Not found' })
    res.json({ coverLetter: letter })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/cover-letters/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ success: true })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

export default router
