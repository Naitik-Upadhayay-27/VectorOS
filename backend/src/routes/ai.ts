import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { generateText, generateChat } from '../lib/ai'
import { repairJson } from '../lib/repairJson'
import * as fs from 'fs'
import * as path from 'path'

const router = Router()
router.use(authenticate)

// Load job titles once at startup
const jobTitlesPath = path.join(__dirname, '../data/job_titles.json')
const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

const JOB_TITLES: string[] = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(jobTitlesPath, 'utf-8'))
    return Array.from(new Set(
      (raw['job-titles'] as string[]).map((t: string) => toTitleCase(t.trim())).filter(Boolean)
    )) as string[]
  } catch { return [] }
})()

// GET /api/ai/job-titles?q=engineer
router.get('/job-titles', (req: AuthRequest, res: Response) => {
  const q = String(req.query.q ?? '').toLowerCase().trim()
  if (!q) return res.json({ titles: [] })
  // Two full passes: starts-with first, then word-boundary starts, then contains
  const startsWith: string[] = []
  const wordStarts: string[] = []
  const contains: string[] = []
  for (const t of JOB_TITLES) {
    const tl = t.toLowerCase()
    if (tl.startsWith(q)) {
      startsWith.push(t)
    } else if (tl.split(/\s+/).some(word => word.startsWith(q))) {
      wordStarts.push(t)
    } else if (tl.includes(q)) {
      contains.push(t)
    }
  }
  res.json({ titles: [...startsWith, ...wordStarts, ...contains].slice(0, 20) })
})

// POST /api/ai/rewrite-bullet
router.post('/rewrite-bullet', async (req: AuthRequest, res: Response) => {
  const { bullet, jobTitle, industry } = req.body
  if (!bullet) return res.status(400).json({ error: 'bullet is required' })
  try {
    const text = await generateChat(`Rewrite this resume bullet point to be more impactful, quantified, and ATS-friendly for a ${jobTitle ?? 'professional'} in ${industry ?? 'tech'}. Return only the rewritten bullet, nothing else.\n\nBullet: ${bullet}`)
    res.json({ result: text.trim() })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/match
router.post('/match', async (req: AuthRequest, res: Response) => {
  const { resumeText, jobDescription } = req.body
  if (!resumeText || !jobDescription) return res.status(400).json({ error: 'resumeText and jobDescription are required' })
  try {
    const text = await generateText(`You are an ATS expert. Analyze the resume against the job description and return ONLY valid JSON:
{"score":<0-100>,"missingKeywords":[<string>],"strengths":[<string>],"suggestions":[<string>]}
RESUME:\n${resumeText}\nJOB DESCRIPTION:\n${jobDescription}`)
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/cover-letter
router.post('/cover-letter', async (req: AuthRequest, res: Response) => {
  const { resumeText, jobDescription, tone = 'professional' } = req.body
  if (!resumeText || !jobDescription) return res.status(400).json({ error: 'resumeText and jobDescription are required' })
  try {
    const prompt = `You are an expert cover letter writer. Write a ${tone} cover letter body for the candidate below.

STRICT RULES:
- Return ONLY valid JSON, no markdown fences, no extra text
- The "body" field must contain ONLY the letter paragraphs — NO salutation (no "Dear ..."), NO subject line, NO sign-off (no "Sincerely", no "Best regards"), NO candidate name at the end
- The template already renders the salutation, subject, and sign-off separately
- Extract the hiring manager name from the job description if present (look for "Reporting To:", "Manager:", or similar). If not found, return empty string
- Keep the body under 280 words, 3-4 paragraphs
- Tone: ${tone}

Return this exact JSON:
{"body":"<3-4 paragraphs of letter body only>","hiringManager":"<name or empty string>","jobTitle":"<job title from JD>","companyName":"<company name from JD>"}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`

    const raw = await generateText(prompt)
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
      return res.json({
        coverLetter: parsed.body ?? '',
        hiringManager: parsed.hiringManager ?? '',
        jobTitle: parsed.jobTitle ?? '',
        companyName: parsed.companyName ?? '',
      })
    }
    // fallback — return raw as body
    res.json({ coverLetter: raw.trim(), hiringManager: '', jobTitle: '', companyName: '' })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/chat
router.post('/chat', async (req: AuthRequest, res: Response) => {
  const { messages, resumeContext, resumeData, userContext, editLog } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages are required' })

  try {
    const systemPrompt = `You are a concise, expert career coach embedded in a resume builder. You help users improve their resumes through conversation.

RESPONSE RULES (follow strictly):
- Be brief and direct. No fluff, no preamble like "Great question!" or "Of course!"
- Use bullet points (- item) when listing multiple things
- Use ## for section headings if needed
- Never show JSON, code blocks, or technical data to the user — ever
- Keep replies under 120 words unless the user asks for detailed feedback

You operate in two modes only:

MODE 1 — ADVICE (for questions, feedback requests, analysis):
Reply in plain conversational text with markdown formatting (bullets, bold, headings).
Do NOT include any JSON. Do NOT ask for permission to make changes.

MODE 2 — EDIT (for ANY edit/change/rewrite/add/remove/improve/fix request):
Apply the change IMMEDIATELY and tell the user what improvements you made in a friendly, first-person tone.
Start the reply with "Here's what I improved for you:" or similar, then list the specific changes as bullets.
NEVER say "Here are suggestions" or "You could try" — you ARE making the changes, not suggesting them.
NEVER ask "Should I apply?" — just do it and tell them what you did.
Reply with this exact JSON (no fences, no extra text):
{"reply":"Here's what I improved for you:\\n- <specific change 1>\\n- <specific change 2>","resumeEdits":{<edits>}}

EDIT SCHEMA (only include fields that actually change):
{
  "summary": "<string>",
  "personalInfo": {"name":"...","title":"...","contact":{...}},
  "experience": [{"id":"<existing id or new>","title":"...","company":"...","location":"...","startDate":"...","endDate":"...","description":["bullet"]}],
  "education": [{"id":"...","degree":"...","institution":"...","location":"...","graduationDate":"...","gpa":"..."}],
  "skills": [{"id":"...","category":"...","skills":["skill1"]}],
  "projects": [{"id":"...","name":"...","role":"...","link":"...","startDate":"...","endDate":"...","description":["bullet"],"technologies":["tech"]}],
  "deleteExperience":["id"],"deleteEducation":["id"],"deleteSkills":["id"],"deleteProjects":["id"]
}

Use real IDs from resume data for existing items. Use "new" for new items.
Only include fields that need to change — never send unchanged data.

User profile:
- Name: ${userContext?.name ?? 'Unknown'}
- Current Role: ${userContext?.currentRole ?? 'Not specified'}
- Target Role: ${userContext?.targetRole ?? 'Not specified'}
- Target Industries: ${userContext?.targetDomains?.join(', ') ?? 'Not specified'}
- Years of Experience: ${userContext?.yearsOfExperience ?? 'Not specified'}

${editLog?.length > 0 ? `Recent edits:\n${editLog.slice(-3).map((e: { summary: string }, i: number) => `${i + 1}. ${e.summary}`).join('\n')}\n` : ''}
Current resume:
${JSON.stringify(resumeData ?? resumeContext ?? {}, null, 2)}`

    const lastMessage = messages[messages.length - 1].content

    // Convert history to Groq format (role: user | assistant)
    const chatHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }))
    // Groq requires history to start with a user message
    while (chatHistory.length > 0 && chatHistory[0].role !== 'user') chatHistory.shift()

    const raw = (await generateChat(lastMessage, { systemPrompt, history: chatHistory })).trim()

    // ── Parse response ────────────────────────────────────────────────────────
    // The AI should return either:
    //   A) Plain text (advice mode)
    //   B) JSON: { "reply": "...", "resumeEdits": { ... } }
    try {
      // Strip markdown fences and find the JSON object
      let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

      // Find first { — ignore any preamble text
      const jsonStart = cleaned.indexOf('{')
      // Find last } — ignore any trailing text
      const jsonEnd = cleaned.lastIndexOf('}')

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1)
        const parsed = JSON.parse(jsonStr)

        // Valid edit response (applied)
        if (parsed.reply !== undefined && parsed.resumeEdits !== undefined) {
          return res.json({ reply: String(parsed.reply), resumeEdits: parsed.resumeEdits })
        }
        // Proposal response (pending confirmation)
        if (parsed.reply !== undefined && parsed.proposedEdits !== undefined) {
          return res.json({ reply: String(parsed.reply), proposedEdits: parsed.proposedEdits })
        }
        // Valid advice response (JSON with just reply)
        if (parsed.reply !== undefined) {
          return res.json({ reply: String(parsed.reply) })
        }
      }

      // Not JSON or no reply field — return as plain text
      // Strip any leftover JSON blocks from plain text responses
      const plainText = raw
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim()
      return res.json({ reply: plainText })

    } catch {
      // JSON.parse failed — return as plain text
      return res.json({ reply: raw.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim() })
    }
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/parse-jd
router.post('/parse-jd', async (req: AuthRequest, res: Response) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'description is required' })
  try {
    const text = await generateText(`Extract structured data from this job description. Return ONLY valid JSON:
{"skills":[<string>],"keywords":[<string>],"responsibilities":[<string>],"roleType":"<string>","seniorityLevel":"<string>"}
JOB DESCRIPTION:\n${description}`)
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/ats-score
router.post('/ats-score', async (req: AuthRequest, res: Response) => {
  const { resumeData, targetRole, targetRoles, targetDomains, currentRole, currentCompany, yearsOfExperience, jobDescription } = req.body
  if (!resumeData) return res.status(400).json({ error: 'resumeData is required' })
  try {
    // Support both single targetRole and multi targetRoles array
    const rolesLabel = Array.isArray(targetRoles) && targetRoles.length > 0
      ? targetRoles.join(', ')
      : (targetRole ?? 'Not specified')
    const targetContext = jobDescription
      ? `Job Description provided:\n${jobDescription}`
      : `Target Role(s): ${rolesLabel}\nTarget Industries: ${Array.isArray(targetDomains) && targetDomains.length > 0 ? targetDomains.join(', ') : 'Not specified'}`

    const today = new Date().toISOString().split('T')[0] // e.g. 2026-04-01

    const prompt = `You are a senior ATS specialist and resume reviewer. Today's date is ${today}. Score this resume honestly and accurately.

IMPORTANT SCORING RULES:
- overallScore = weighted average: keywordMatch×35% + sectionCompleteness×25% + actionVerbs×20% + quantification×15% + formatting×5%
- Do NOT penalize dates that are in the future relative to today if they represent ongoing roles, current education, or internships that started before today — these are valid
- formatting score should reflect actual resume structure issues (missing sections, bad layout, HTML artifacts like <br> tags in text fields) — a clean structured resume should score 70+
- Missing keywords must be SHORT strings (2-4 words max), not sentences or paragraphs
- Be realistic: a resume with 80 keyword match should not score below 55 overall
- quickWins must be concise actionable items (1 sentence each, no markdown bold)
- topIssues must be concise (1-2 sentences each, no markdown bold)

Return ONLY valid JSON, no markdown fences:
{
  "overallScore":<0-100>,
  "breakdown":{
    "keywordMatch":{"score":<0-100>,"found":[<short string>],"missing":[<2-4 word keyword>]},
    "formatting":{"score":<0-100>,"issues":[<short string>]},
    "sectionCompleteness":{"score":<0-100>,"present":[<string>],"missing":[<string>]},
    "quantification":{"score":<0-100>,"examples":[<string>],"suggestions":[<short string>]},
    "actionVerbs":{"score":<0-100>,"weak":[<string>],"suggestions":[<short string>]}
  },
  "topIssues":[<1-2 sentence string>],
  "quickWins":[<1 sentence actionable string>],
  "gapAnalysis":"<2-4 sentence honest summary>"
}
${targetContext}
Current Role: ${currentRole ?? 'Not specified'} | Company: ${currentCompany ?? 'Not specified'} | Experience: ${yearsOfExperience ?? 'Not specified'}
RESUME DATA:\n${JSON.stringify(resumeData, null, 2)}`

    const text = await generateText(prompt)
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      const jsonStart = cleaned.indexOf('{')
      const jsonEnd = cleaned.lastIndexOf('}')
      const jsonStr = jsonStart !== -1 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned
      try {
        res.json(JSON.parse(jsonStr))
      } catch {
        res.json(JSON.parse(repairJson(jsonStr)))
      }
    } catch (parseErr: any) {
      res.status(422).json({ error: `ATS scoring failed to parse response: ${parseErr.message}` })
    }
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/improve-section
router.post('/improve-section', async (req: AuthRequest, res: Response) => {
  const { section, content, targetRole, targetDomains, currentRole, targetCompany } = req.body
  if (!section || !content) return res.status(400).json({ error: 'section and content are required' })
  try {
    const prompt = `You are an expert resume writer. Improve this ${section} section for the TARGET role. Return ONLY valid JSON with no markdown fences:
{"improved":<string or array>,"changes":[<string>],"keywords_added":[<string>]}
Target Role: ${targetRole ?? 'Not specified'} | Industries: ${Array.isArray(targetDomains) ? targetDomains.join(', ') : 'Not specified'} | Current: ${currentRole ?? 'Not specified'} | Company: ${targetCompany ?? 'Not specified'}
CURRENT CONTENT:\n${typeof content === 'string' ? content : JSON.stringify(content)}`

    const text = await generateChat(prompt)
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    const jsonStr = jsonStart !== -1 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned
    res.json(JSON.parse(jsonStr))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

export default router
