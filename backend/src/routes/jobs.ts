import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { CachedJob } from '../models/CachedJob'
import { Application } from '../models/Application'

const router = Router()
router.use(authenticate)

// ── In-memory L1 cache (1 min) + MongoDB L2 cache (6 hours) ─────────────────
const memCache = new Map<string, { jobs: NormalisedJob[]; ts: number }>()
const MEM_TTL  = 60 * 1000  // 1 minute

function getMemCached(key: string): NormalisedJob[] | null {
  const e = memCache.get(key)
  if (!e) return null
  if (Date.now() - e.ts > MEM_TTL) { memCache.delete(key); return null }
  return e.jobs
}
function setMemCached(key: string, jobs: NormalisedJob[]) {
  memCache.set(key, { jobs, ts: Date.now() })
}

async function getDbCached(query: string): Promise<NormalisedJob[] | null> {
  try {
    const docs = await CachedJob.find({ query })
      .sort({ cachedAt: -1 })
      .limit(20)
      .lean()
    if (!docs.length) return null
    return docs.map(docToJob)
  } catch { return null }
}

async function setDbCached(query: string, jobs: NormalisedJob[]) {
  try {
    const ops = jobs.map(j => ({
      updateOne: {
        filter: { jobId: j.id.replace('linkedin-', '') },
        update: {
          $set: {
            jobId: j.id.replace('linkedin-', ''),
            query,
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
    id:          `linkedin-${doc.jobId}`,
    source:      doc.source ?? 'linkedin',
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

// ── Normalised job shape ─────────────────────────────────────────────────────
export interface NormalisedJob {
  id: string
  source: 'adzuna' | 'jsearch' | 'himalayas' | 'linkedin'
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

// ── Adzuna ───────────────────────────────────────────────────────────────────
async function fetchAdzuna(query: string, location: string, page = 1): Promise<NormalisedJob[]> {
  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    console.warn('[Adzuna] Skipped — ADZUNA_APP_ID or ADZUNA_APP_KEY not set in .env')
    return []
  }

  const country = 'us'
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '10',
    what: query,
    where: location || '',
    'content-type': 'application/json',
  })

  try {
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`)
    if (!res.ok) {
      console.error(`[Adzuna] HTTP ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json() as any
    console.log(`[Adzuna] Got ${data.results?.length ?? 0} results`)
    return (data.results ?? []).map((j: any): NormalisedJob => ({
      id: `adzuna-${j.id}`,
      source: 'adzuna',
      title: j.title ?? '',
      company: j.company?.display_name ?? 'Unknown',
      location: j.location?.display_name ?? '',
      type: j.contract_time ?? 'full_time',
      salary: j.salary_min && j.salary_max
        ? `$${Math.round(j.salary_min / 1000)}k–$${Math.round(j.salary_max / 1000)}k`
        : j.salary_min ? `From $${Math.round(j.salary_min / 1000)}k` : 'Not specified',
      description: j.description ?? '',
      url: j.redirect_url ?? '',
      postedAt: j.created ?? '',
      remote: (j.title ?? '').toLowerCase().includes('remote') || (j.location?.display_name ?? '').toLowerCase().includes('remote'),
      tags: j.category?.label ? [j.category.label] : [],
    }))
  } catch { return [] }
}

// ── JSearch (RapidAPI) ───────────────────────────────────────────────────────
async function fetchJSearch(query: string, location: string): Promise<NormalisedJob[]> {
  const key = process.env.JSEARCH_API_KEY
  if (!key) {
    console.warn('[JSearch] Skipped — JSEARCH_API_KEY not set in .env')
    return []
  }

  try {
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: '1',
      num_pages: '1',
      country: 'us',
      date_posted: 'all',
    })
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      console.error(`[JSearch] HTTP ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json() as any
    console.log(`[JSearch] Got ${data.data?.length ?? 0} results`)
    return (data.data ?? []).map((j: any): NormalisedJob => ({
      id: `jsearch-${j.job_id}`,
      source: 'jsearch',
      title: j.job_title ?? '',
      company: j.employer_name ?? 'Unknown',
      location: j.job_city ? `${j.job_city}, ${j.job_state ?? ''}` : (j.job_country ?? ''),
      type: j.job_employment_type ?? 'FULLTIME',
      salary: j.job_min_salary && j.job_max_salary
        ? `$${Math.round(j.job_min_salary / 1000)}k–$${Math.round(j.job_max_salary / 1000)}k`
        : 'Not specified',
      description: j.job_description ?? '',
      url: j.job_apply_link ?? '',
      postedAt: j.job_posted_at_datetime_utc ?? '',
      logo: j.employer_logo ?? undefined,
      remote: j.job_is_remote ?? false,
      tags: j.job_required_skills ?? [],
    }))
  } catch { return [] }
}

// ── Himalayas (free, remote only) ────────────────────────────────────────────
async function fetchHimalayas(query: string): Promise<NormalisedJob[]> {
  try {
    const params = new URLSearchParams({ search: query, limit: '20' })
    const res = await fetch(`https://himalayas.app/jobs/api?${params}`)
    if (!res.ok) return []
    const data = await res.json() as any
    const q = query.toLowerCase().split(' ')
    // Filter to only jobs where title contains at least one query word
    const filtered = (data.jobs ?? []).filter((j: any) => {
      const title = (j.title ?? '').toLowerCase()
      return q.some(word => word.length > 2 && title.includes(word))
    })
    return filtered.slice(0, 8).map((j: any): NormalisedJob => ({
      id: `himalayas-${j.slug}`,
      source: 'himalayas',
      title: j.title ?? '',
      company: j.company?.name ?? 'Unknown',
      location: 'Remote',
      type: j.jobType ?? 'full-time',
      salary: j.salaryCurrency && j.salaryMin
        ? `${j.salaryCurrency}${Math.round(j.salaryMin / 1000)}k–${Math.round((j.salaryMax ?? j.salaryMin) / 1000)}k`
        : 'Not specified',
      description: j.description ?? '',
      url: `https://himalayas.app/jobs/${j.slug}`,
      postedAt: j.publishedAt ?? '',
      logo: j.company?.logoUrl ?? undefined,
      remote: true,
      tags: j.skills ?? [],
    }))
  } catch { return [] }
}

// ── Internships API (RapidAPI) ───────────────────────────────────────────────
async function fetchInternships(query: string, location: string): Promise<NormalisedJob[]> {
  const key = process.env.JSEARCH_API_KEY
  if (!key) return []

  try {
    const res = await fetch(`https://internships-api.p.rapidapi.com/active-jb-7d?description_type=text`, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'internships-api.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      console.error(`[Internships] HTTP ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json() as any
    const arr: any[] = Array.isArray(data) ? data : (data.jobs ?? data.data ?? [])
    console.log(`[Internships] Got ${arr.length} total, filtering for: "${query}"`)

    const q = query.toLowerCase()
    const loc = location.toLowerCase()
    const filtered = arr.filter((j: any) => {
      const titleMatch = (j.title ?? '').toLowerCase().includes(q)
      const orgMatch   = (j.organization ?? '').toLowerCase().includes(q)
      const locMatch   = !loc || (j.locations_derived?.[0] ?? '').toLowerCase().includes(loc)
      return (titleMatch || orgMatch) && locMatch
    }).slice(0, 15)

    return filtered.map((j: any): NormalisedJob => ({
      id: `internships-${j.id}`,
      source: 'jsearch',
      title: j.title ?? '',
      company: j.organization ?? 'Unknown',
      location: j.locations_derived?.[0] ?? j.cities_derived?.[0] ?? '',
      type: j.employment_type?.[0] ?? 'INTERN',
      salary: 'Not specified',
      description: j.description ?? `${j.title} at ${j.organization}. Seniority: ${j.seniority ?? 'Entry level'}. Source: ${j.source ?? 'LinkedIn'}.`,
      url: j.url ?? j.external_apply_url ?? '',
      postedAt: j.date_posted ?? '',
      logo: j.organization_logo ?? undefined,
      remote: j.remote_derived ?? false,
      tags: Array.isArray(j.linkedin_org_specialties) ? j.linkedin_org_specialties.slice(0, 4) : [],
    }))
  } catch (e) {
    console.error('[Internships] Error:', e)
    return []
  }
}

// Python scraper URL — same EC2, different port
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8002'

async function fetchFromScraper(q: string, location: string, type: string, remote: string): Promise<NormalisedJob[]> {
  try {
    const params = new URLSearchParams({ q, location, limit: '20' })
    if (type) params.set('type', type)
    if (remote === 'true') params.set('remote', 'true')

    const res = await fetch(`${SCRAPER_URL}/jobs/search?${params}`, {
      signal: AbortSignal.timeout(30000), // 30s timeout
    })
    if (!res.ok) throw new Error(`Scraper HTTP ${res.status}`)

    const data = await res.json() as any
    const jobs: any[] = data.jobs ?? []

    return jobs.map((j: any): NormalisedJob => ({
      id:          `linkedin-${j.job_id}`,
      source:      'linkedin',
      title:       j.title ?? '',
      company:     j.company ?? '',
      location:    j.location ?? '',
      type:        j.employment_type ?? 'Full-time',
      salary:      j.salary ?? 'Not specified',
      description: j.description ?? '',
      url:         j.url ?? '',
      postedAt:    j.posted_at ?? '',
      logo:        undefined,
      remote:      j.remote ?? false,
      tags:        j.tags ?? [],
    }))
  } catch (e: any) {
    console.warn(`[Jobs] Scraper unavailable: ${e.message} — falling back to free APIs`)
    return []
  }
}

router.get('/search', async (req: AuthRequest, res: Response) => {
  const { q = '', location = '', type = '', remote = '' } = req.query as Record<string, string>
  if (!q.trim()) return res.json({ jobs: [] })

  const cacheKey = `${q}|${location}|${type}|${remote}`.toLowerCase().trim()

  // L1 — memory
  const mem = getMemCached(cacheKey)
  if (mem) {
    console.log(`[Jobs] L1 cache hit for "${q}"`)
    return res.json({ jobs: mem, total: mem.length, cached: true })
  }

  // L2 — MongoDB (6h TTL via TTL index)
  const db = await getDbCached(cacheKey)
  if (db && db.length > 0) {
    console.log(`[Jobs] L2 DB cache hit for "${q}" (${db.length} jobs)`)
    setMemCached(cacheKey, db)
    return res.json({ jobs: db, total: db.length, cached: true })
  }

  // L3 — live scrape
  let jobs: NormalisedJob[] = await fetchFromScraper(q, location, type, remote)

  if (jobs.length === 0) {
    console.log(`[Jobs] Scraper empty, using fallback APIs for "${q}"`)
    const [jsearch, adzuna, himalayas] = await Promise.all([
      fetchJSearch(q, location),
      fetchAdzuna(q, ''),
      fetchHimalayas(q),
    ])
    jobs = [...jsearch, ...adzuna, ...himalayas]
  }

  // Deduplicate
  const seen = new Set<string>()
  jobs = jobs.filter((j) => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (type && jobs[0]?.source !== 'linkedin') jobs = jobs.filter((j) => j.type.toLowerCase().includes(type.toLowerCase()))
  if (remote === 'true') jobs = jobs.filter((j) => j.remote)
  jobs = jobs.slice(0, 20)

  // Write to both caches
  setMemCached(cacheKey, jobs)
  setDbCached(cacheKey, jobs)   // async, don't await

  res.json({ jobs, total: jobs.length })
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
      { upsert: true, new: true }
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
