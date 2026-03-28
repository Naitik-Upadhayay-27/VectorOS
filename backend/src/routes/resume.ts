import { Router, Response } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { repairJson } from '../lib/repairJson'
import { Resume } from '../models/Resume'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse')

const router = Router()
router.use(authenticate)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'))
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────

// Gemini sometimes returns null for optional fields — coerce to undefined
function nullToUndefined(obj: any): any {
  if (obj === null) return undefined
  if (Array.isArray(obj)) return obj.map(nullToUndefined)
  if (typeof obj === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = nullToUndefined(v)
    }
    return out
  }
  return obj
}

// Zod helper: accept string | null | undefined, output string | undefined
const optStr = z.union([z.string(), z.null()]).optional().transform(v => v ?? undefined)
// reqStr: accepts string | null | undefined, outputs string (empty string if missing)
const reqStr = z.union([z.string(), z.null()]).optional().transform(v => v ?? '')

// ── Zod schemas ──────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  email:    optStr,
  phone:    optStr,
  location: optStr,
  linkedin: optStr,
  github:   optStr,
  website:  optStr,
}).optional()

const PersonalInfoSchema = z.object({
  name:    optStr,
  title:   optStr,
  contact: ContactSchema,
}).optional()

const ExperienceSchema = z.array(z.object({
  id:          optStr,
  title:       reqStr,
  company:     reqStr,
  location:    optStr,
  startDate:   reqStr,
  endDate:     reqStr,
  description: z.array(z.union([z.string(), z.null()]).transform(v => v ?? '')).default([]),
})).optional()

const EducationSchema = z.array(z.object({
  id:             optStr,
  degree:         reqStr,
  institution:    reqStr,
  location:       optStr,
  graduationDate: reqStr,
  gpa:            optStr,
  description:    z.array(z.union([z.string(), z.null()]).transform(v => v ?? '')).optional(),
})).optional()

const SkillsSchema = z.array(z.object({
  id:       optStr,
  category: reqStr,
  skills:   z.array(z.union([z.string(), z.null()]).transform(v => v ?? '')).default([]),
})).optional()

const ProjectsSchema = z.array(z.object({
  id:           optStr,
  name:         reqStr,
  role:         optStr,
  link:         optStr,
  startDate:    optStr,
  endDate:      optStr,
  description:  z.union([z.string(), z.array(z.string()), z.null()]).optional().transform(v => v ?? undefined),
  technologies: z.array(z.union([z.string(), z.null()]).transform(v => v ?? '')).optional(),
})).optional()

const CertificatesSchema = z.array(z.object({
  id:     optStr,
  name:   reqStr,
  issuer: reqStr,
  date:   reqStr,
})).optional()

const AwardsSchema = z.array(z.object({
  id:          optStr,
  title:       reqStr,
  date:        reqStr,
  description: optStr,
})).optional()

const LanguagesSchema = z.array(z.object({
  id:          optStr,
  language:    reqStr,
  proficiency: reqStr,
})).optional()

const VolunteerSchema = z.array(z.object({
  id:           optStr,
  role:         reqStr,
  organization: reqStr,
  startDate:    reqStr,
  endDate:      reqStr,
  description:  z.union([
    z.string(),
    z.array(z.union([z.string(), z.null()]).transform(v => v ?? '')),
    z.null(),
  ]).optional().transform(v => {
    if (!v) return undefined
    if (Array.isArray(v)) return v.join(' ')
    return v
  }),
})).optional()

const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary:      optStr,
  experience:   ExperienceSchema,
  education:    EducationSchema,
  skills:       SkillsSchema,
  projects:     ProjectsSchema,
  certificates: CertificatesSchema,
  awards:       AwardsSchema,
  languages:    LanguagesSchema,
  volunteer:    VolunteerSchema,
})

// ── Gemini prompt ────────────────────────────────────────────────────────────
const SCHEMA_PROMPT = `You are a resume parser. Extract all information from the resume text and return ONLY a single valid JSON object. No markdown, no code fences, no explanation — raw JSON only.

CRITICAL: Never use null. Omit fields that are not present. Keep string values concise.

JSON schema:
{"personalInfo":{"name":"","title":"","contact":{"email":"","phone":"","location":"","linkedin":"","github":"","website":""}},"summary":"","experience":[{"title":"","company":"","location":"","startDate":"","endDate":"","description":[""]}],"education":[{"degree":"","institution":"","location":"","graduationDate":"","gpa":"","description":[""]}],"skills":[{"category":"","skills":[""]}],"projects":[{"name":"","role":"","link":"","startDate":"","endDate":"","description":[""],"technologies":[""]}],"certificates":[{"name":"","issuer":"","date":""}],"awards":[{"title":"","date":"","description":""}],"languages":[{"language":"","proficiency":""}],"volunteer":[{"role":"","organization":"","startDate":"","endDate":"","description":""}]}

Rules:
- Omit any top-level section not present in the resume
- Split bullet points into separate array items (max 5 bullets per role)
- Dates: use format found in resume (e.g. "Jan 2022", "2020")
- Do NOT truncate — output the complete JSON

RESUME:
`

// ── GET /api/resumes ─────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 }).select('-experience -education -skills -projects -certificates -awards -languages -volunteer')
  res.json({ resumes })
})

// ── POST /api/resumes ────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.create({ userId: req.userId, ...req.body })
    res.status(201).json({ resume })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── GET /api/resumes/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId })
  if (!resume) return res.status(404).json({ error: 'Resume not found' })
  res.json({ resume })
})

// ── PUT /api/resumes/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...req.body, updatedAt: new Date() },
    { new: true, upsert: false }
  )
  if (!resume) return res.status(404).json({ error: 'Resume not found' })
  res.json({ resume })
})

// ── DELETE /api/resumes/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  res.json({ success: true })
})

// ── POST /api/resumes/parse ──────────────────────────────────────────────────
router.post(
  '/parse',
  (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' })
      }
      if (err) return res.status(400).json({ error: err.message })
      next()
    })
  },
  async (req: AuthRequest, res: Response) => {
    console.log('\n========== /api/resumes/parse ==========')
    console.log(`[1] File received: ${req.file?.originalname ?? 'none'}, size: ${req.file?.size ?? 0} bytes`)

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send a PDF as form field "resume".' })
    }

    // ── Step 1: PDF text extraction ──────────────────────────────────────────
    let rawText: string
    try {
      console.log('[2] Starting PDF text extraction...')
      const parser = new PDFParse({ data: req.file.buffer, verbosity: 0 })
      const result = await parser.getText()
      rawText = result.text?.trim() ?? ''
      console.log(`[2] Extraction OK — ${rawText.length} chars extracted`)
      console.log(`[2] First 300 chars:\n${rawText.slice(0, 300)}`)
    } catch (err: any) {
      console.error('[2] PDF extraction ERROR:', err)
      return res.status(500).json({ error: `PDF extraction failed: ${err.message}` })
    }

    // Scanned/image PDFs produce near-zero text — detect and reject early
    const meaningfulText = rawText.replace(/[-\s\n]/g, '')
    if (!rawText || meaningfulText.length < 50) {
      console.warn('[2] PDF appears to be a scanned image — not enough text extracted')
      return res.status(422).json({
        error: 'This PDF appears to be a scanned image and contains no readable text. Please use a text-based PDF (created digitally, not scanned). You can try copy-pasting text from your PDF to verify.',
      })
    }

    // ── Step 2: AI structured parse (Gemini first, Groq fallback on any failure) ─
    let structuredData: any
    let rawAiText: string = ''

    const parseAiResponse = async (aiText: string): Promise<any> => {
      const cleaned = aiText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      try {
        return JSON.parse(cleaned)
      } catch {
        const repaired = repairJson(cleaned)
        return JSON.parse(repaired)
      }
    }

    try {
      console.log('[3] Sending to Gemini...')
      const geminiRaw = await (async () => {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite']
        for (const modelName of GEMINI_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { maxOutputTokens: 8192, temperature: 0.4 } })
            const result = await model.generateContent(SCHEMA_PROMPT + rawText)
            return result.response.text()
          } catch (e: any) {
            console.warn(`[3] Gemini ${modelName} failed:`, e.message)
          }
        }
        throw new Error('All Gemini models failed')
      })()

      rawAiText = geminiRaw
      console.log(`[3] Gemini raw (first 300):\n${rawAiText.slice(0, 300)}`)
      structuredData = await parseAiResponse(rawAiText)
      console.log('[3] Gemini parse OK')
    } catch (geminiErr: any) {
      console.warn('[3] Gemini failed, switching to Groq:', geminiErr.message)
      try {
        const groqKey = process.env.GROQ_API_KEY
        if (!groqKey) throw new Error('GROQ_API_KEY not configured')
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: SCHEMA_PROMPT + rawText }],
            temperature: 0.4,
            max_tokens: 8192,
          }),
        })
        if (!groqRes.ok) throw new Error(`Groq error ${groqRes.status}`)
        const groqData = await groqRes.json() as any
        rawAiText = groqData.choices?.[0]?.message?.content ?? ''
        console.log(`[3] Groq raw (first 300):\n${rawAiText.slice(0, 300)}`)
        structuredData = await parseAiResponse(rawAiText)
        console.log('[3] Groq parse OK')
      } catch (groqErr: any) {
        console.error('[3] Both Gemini and Groq failed:', groqErr.message)
        return res.status(500).json({ error: 'Resume parsing failed. Please try again in a moment.' })
      }
    }

    // ── Step 3: Sanitize nulls ────────────────────────────────────────────────
    console.log('[4] Sanitizing null values...')
    const sanitized = nullToUndefined(structuredData)
    console.log('[4] personalInfo after sanitize:', JSON.stringify(sanitized.personalInfo, null, 2))

    // ── Step 4: Add UUIDs ─────────────────────────────────────────────────────
    const addIds = (arr?: any[]) => arr?.map((item) => ({ id: crypto.randomUUID(), ...item }))

    const withIds = {
      ...sanitized,
      experience:   addIds(sanitized.experience),
      education:    addIds(sanitized.education),
      skills:       addIds(sanitized.skills),
      projects:     addIds(sanitized.projects),
      certificates: addIds(sanitized.certificates),
      awards:       addIds(sanitized.awards),
      languages:    addIds(sanitized.languages),
      volunteer:    addIds(sanitized.volunteer),
    }
    console.log('[4] withIds keys:', Object.keys(withIds))

    // ── Step 5: Zod validation ────────────────────────────────────────────────
    console.log('[5] Running Zod validation...')
    const validation = ResumeSchema.safeParse(withIds)

    if (!validation.success) {
      console.error('[5] Zod validation FAILED:')
      validation.error.errors.forEach((e, i) => {
        console.error(`  [${i}] path: ${e.path.join('.')} | code: ${e.code} | message: ${e.message}`)
        // Log the actual value at the failing path
        let val: any = withIds
        for (const key of e.path) val = val?.[key]
        console.error(`  [${i}] actual value:`, JSON.stringify(val))
      })
      const firstError = validation.error.errors[0]
      return res.status(422).json({
        error: `Validation failed: ${firstError.path.join('.')} — ${firstError.message}`,
        allErrors: validation.error.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
      })
    }

    console.log('[5] Zod validation OK')
    console.log('========== /api/resumes/parse DONE ==========\n')
    return res.json({ data: validation.data, rawText })
  }
)

export default router
