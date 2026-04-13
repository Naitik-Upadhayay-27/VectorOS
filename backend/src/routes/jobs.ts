import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { CachedJob } from '../models/CachedJob'
import { Application } from '../models/Application'
import http from 'http'

const router = Router()
router.use(authenticate)

const JOBSPY_URL = process.env.JOBSPY_URL || 'http://127.0.0.1:8002'
const MEM_TTL    = 60 * 1000  // 1 min

// ── Types ────────────────────────────────────────────────────────────────────
export interface NormalisedJob {
  id: string
  source: 'linkedin' | 'indeed'
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  url: string
  postedAt: string
  logo?: string
  remote: boolean
  tags: string[]
}

// ── In-memory L1 cache ───────────────────────────────────────────────────────
const memCache = new Map<string, { jobs: NormalisedJob[]; ts: number }>()

function getMemCached(key: string): NormalisedJob[] | null {
  const e = memCache.get(key)
  if (!e) return null
  if (Date.now() - e.ts > MEM_TTL) { memCache.delete(key); return null }
  return e.jobs
}
function setMemCached(key: string, jobs: NormalisedJob[]) {
  memCache.set(key, { jobs, ts: Date.now() })
}

// ── MongoDB L2 cache (6h TTL via index) ──────────────────────────────────────
async function getDbCached(key: string): Promise<NormalisedJob[] | null> {
  try {
    const docs = await CachedJob.find({ query: key }).sort({ cachedAt: -1 }).limit(25).lean()
    // Require at least 10 jobs — anything less is stale/partial data from old scrapers
    if (docs.length < 10) return null
    return docs.map(docToJob)
  } catch { return null }
}

async function setDbCached(key: string, jobs: NormalisedJob[]) {
  try {
    const ops = jobs.map(j => ({
      updateOne: {
        filter: { jobId: j.id },
        update: {
          $set: {
            jobId:          j.id,
            query:          key,
            title:          j.title,
            company:        j.company,
            location:       j.location,
            employmentType: j.type,
            salary:         j.salary,
            postedAt:       j.postedAt,
            description:    j.description,
            url:            j.url,
            remote:         j.remote,
            tags:           j.tags,
            source:         j.source,
            cachedAt:       new Date(),
          }
        },
        upsert: true,
      }
    }))
    if (ops.length) await CachedJob.bulkWrite(ops)
  } catch (e: any) {
    console.warn('[Jobs] DB cache write failed:', e.message)
  }
}

function docToJob(doc: any): NormalisedJob {
  return {
    id:          doc.jobId,
    source:      doc.source ?? 'indeed',
    title:       doc.title ?? '',
    company:     doc.company ?? '',
    location:    doc.location ?? '',
    type:        doc.employmentType ?? '',
    salary:      doc.salary ?? 'Not specified',
    description: doc.description ?? '',
    url:         doc.url ?? '',
    postedAt:    doc.postedAt ?? '',
    logo:        undefined,
    remote:      doc.remote ?? false,
    tags:        doc.tags ?? [],
  }
}

// ── JobSpy microservice fetch ─────────────────────────────────────────────────
function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(url, { timeout: 60000 }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')))
  })
}

async function fetchFromJobSpy(q: string, location: string, type: string, remote: string): Promise<NormalisedJob[]> {
  try {
    // Clean query — replace hyphens with spaces
    const cleanQ = q.replace(/-/g, ' ').trim()
    // Clean location — strip pincodes (6-digit numbers)
    const cleanLocation = (location || 'India').replace(/,?\s*\d{6}/g, '').trim().replace(/^,|,$/g, '').trim() || 'India'

    const params = new URLSearchParams({ q: cleanQ, location: cleanLocation, limit: '25' })
    if (type)              params.set('type', type)
    if (remote === 'true') params.set('remote', 'true')

    const url = `${JOBSPY_URL}/jobs/search?${params}`
    console.log(`[Jobs] Fetching: ${url}`)
    const text = await httpGet(url)
    const data = JSON.parse(text)
    console.log(`[Jobs] JobSpy raw count: ${data.count}, jobs array: ${data.jobs?.length}`)
    return (data.jobs ?? []) as NormalisedJob[]
  } catch (e: any) {
    console.warn('[Jobs] JobSpy unavailable:', e.message)
    return []
  }
}

// ── GET /api/jobs/search ──────────────────────────────────────────────────────
router.get('/search', async (req: AuthRequest, res: Response) => {
  const { q = '', location = '', type = '', remote = '' } = req.query as Record<string, string>
  if (!q.trim()) return res.json({ jobs: [] })

  const cacheKey = `${q}|${remote === 'true' ? '' : location}|${type}|${remote}`.toLowerCase().trim()

  // L1 — memory
  const mem = getMemCached(cacheKey)
  if (mem) {
    console.log(`[Jobs] L1 hit for "${q}"`)
    return res.json({ jobs: mem, total: mem.length, cached: true })
  }

  // L2 — MongoDB (6h TTL)
  const db = await getDbCached(cacheKey)
  if (db && db.length > 0) {
    console.log(`[Jobs] L2 hit for "${q}" (${db.length} jobs)`)
    setMemCached(cacheKey, db)
    return res.json({ jobs: db, total: db.length, cached: true })
  }

  console.log(`[Jobs] Cache miss for "${q}" — hitting JobSpy`)
  const jobs = await fetchFromJobSpy(q, location, type, remote)
  console.log(`[Jobs] JobSpy returned ${jobs.length} jobs for "${q}"`)

  // Only cache if we got actual results
  if (jobs.length > 0) {
    setMemCached(cacheKey, jobs)
    setDbCached(cacheKey, jobs)
  }

  res.json({ jobs, total: jobs.length })
})

// ── DELETE /api/jobs/cache — flush stale cache (dev/admin use) ────────────────
router.delete('/cache', async (_req: AuthRequest, res: Response) => {
  try {
    memCache.clear()
    const result = await CachedJob.deleteMany({})
    res.json({ success: true, deleted: result.deletedCount })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/jobs/saved — get all bookmarked jobs ─────────────────────────────
router.get('/saved', async (req: AuthRequest, res: Response) => {
  try {
    const saved = await Application.find({ userId: req.userId, status: 'saved' })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ jobs: saved })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/jobs/save — bookmark a job ─────────────────────────────────────
router.post('/save', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, title, company, location, url, description } = req.body
    const app = await Application.findOneAndUpdate(
      { userId: req.userId, jobUrl: url },
      {
        userId:         req.userId,
        jobTitle:       title,
        company:        company,
        location:       location,
        jobUrl:         url,
        jobDescription: description,
        status:         'saved',
      },
      { upsert: true, returnDocument: 'after' }
    )
    res.status(201).json({ application: app })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/jobs/save — remove bookmark ───────────────────────────────────
router.delete('/save', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body
    await Application.findOneAndDelete({ userId: req.userId, jobUrl: url, status: 'saved' })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── GET /api/jobs/:id — must be LAST (catches all) ───────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  res.status(404).json({ error: 'Job not found' })
})

export default router
