import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ── Simple in-memory cache (5 min TTL) ──────────────────────────────────────
const cache = new Map<string, { jobs: NormalisedJob[]; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCached(key: string): NormalisedJob[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null }
  return entry.jobs
}

function setCached(key: string, jobs: NormalisedJob[]) {
  cache.set(key, { jobs, ts: Date.now() })
}
router.use(authenticate)

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

  const cacheKey = `${q}|${location}|${type}|${remote}`.toLowerCase()
  const cached = getCached(cacheKey)
  if (cached) {
    console.log(`[Jobs] Cache hit for "${q}"`)
    return res.json({ jobs: cached, total: cached.length, cached: true })
  }

  // Try LinkedIn scraper first (real-time, most relevant)
  let jobs: NormalisedJob[] = await fetchFromScraper(q, location, type, remote)

  // Fallback to free APIs if scraper is down
  if (jobs.length === 0) {
    console.log(`[Jobs] Using fallback APIs for "${q}"`)
    const [jsearch, adzuna, himalayas] = await Promise.all([
      fetchJSearch(q, location),
      fetchAdzuna(q, ''),
      fetchHimalayas(q),
    ])
    jobs = [...jsearch, ...adzuna, ...himalayas]
  }

  // Deduplicate by title+company
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
  setCached(cacheKey, jobs)
  res.json({ jobs, total: jobs.length })
})

// ── GET /api/jobs/:id — get single job detail ────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  // For now return a 404 — detail is fetched client-side from the search results cache
  res.status(404).json({ error: 'Job not found' })
})

// ── POST /api/jobs/save — save a job ─────────────────────────────────────────
router.post('/save', async (req: AuthRequest, res: Response) => {
  const job = { id: crypto.randomUUID(), userId: req.userId, ...req.body, savedAt: new Date() }
  res.status(201).json({ job })
})

export default router
