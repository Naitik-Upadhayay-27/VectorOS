// Load env FIRST before any other imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import passport from './config/passport'
import authRoutes from './routes/auth'
import resumeRoutes from './routes/resume'
import jobRoutes from './routes/jobs'
import aiRoutes from './routes/ai'
import applicationRoutes from './routes/applications'

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(passport.initialize())
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' }))

app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/applications', applicationRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.listen(PORT, () => console.log(`🚀 VectorOS API running on http://localhost:${PORT}`))

export default app
