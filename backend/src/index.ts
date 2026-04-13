// Load env FIRST before any other imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv')
const fs = require('fs')
// Load .env.local first (local dev overrides), then fall back to .env
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import passport from './config/passport'
import { connectDB } from './db/connect'
import authRoutes from './routes/auth'
import resumeRoutes from './routes/resume'
import jobRoutes from './routes/jobs'
import aiRoutes from './routes/ai'
import applicationRoutes from './routes/applications'
import coverLetterRoutes from './routes/coverLetter'
import paymentRoutes from './routes/payment'

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Trust proxy — required on EC2/behind load balancer for rate limiting + IP detection
app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
// Raw body for Razorpay webhook signature verification (must be before express.json)
app.use('/api/payment/webhook', (req, _res, next) => {
  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => { (req as any).rawBody = Buffer.concat(chunks); next() })
})
app.use(express.json({ limit: '10mb' }))
app.use(passport.initialize())
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests' }))

app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/cover-letters', coverLetterRoutes)
app.use('/api/payment', paymentRoutes)

app.get('/', (_req, res) => res.send('VectorOS API is running 🚀'))
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 VectorOS API running on http://0.0.0.0:${PORT}`))
})

export default app
