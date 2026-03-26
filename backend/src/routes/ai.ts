import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { generateText, generateChat } from '../lib/ai'

const router = Router()
router.use(authenticate)

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
    const text = await generateText(`Write a ${tone} cover letter under 300 words using the resume for the job. Return only the letter.\nRESUME:\n${resumeText}\nJOB:\n${jobDescription}`)
    res.json({ coverLetter: text })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// POST /api/ai/chat
router.post('/chat', async (req: AuthRequest, res: Response) => {
  const { messages, resumeContext, resumeData, userContext, editLog } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages are required' })

  try {
    const systemPrompt = `You are an expert career coach and resume editor embedded inside a resume builder app.

You have two modes:
1. ADVICE mode — answer questions, give feedback, suggest improvements in plain text
2. EDIT mode — when the user asks you to change, update, rewrite, add, or remove something in their resume, you MUST apply the edit directly

When in EDIT mode, respond with ONLY valid JSON in this exact format — no markdown fences, no text before or after, just the raw JSON object:
{
  "reply": "<friendly confirmation message explaining what you changed>",
  "resumeEdits": {
    "summary": "<new summary string, only if changed>",
    "personalInfo": { "name": "...", "title": "...", "contact": { "email": "...", "phone": "...", "location": "...", "linkedin": "...", "github": "..." } },
    "experience": [{ "id": "<existing id or 'new'>", "title": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "description": ["bullet 1", "bullet 2"] }],
    "education": [{ "id": "<existing id or 'new'>", "degree": "...", "institution": "...", "location": "...", "graduationDate": "...", "gpa": "..." }],
    "skills": [{ "id": "<existing id or 'new'>", "category": "...", "skills": ["skill1", "skill2"] }],
    "projects": [{ "id": "<existing id or 'new'>", "name": "...", "role": "...", "link": "...", "startDate": "...", "endDate": "...", "description": ["bullet 1"], "technologies": ["tech1"] }],
    "deleteExperience": ["<id to delete>"],
    "deleteEducation": ["<id to delete>"],
    "deleteSkills": ["<id to delete>"],
    "deleteProjects": ["<id to delete>"]
  }
}

RULES for EDIT mode:
- Only include fields that actually need to change in resumeEdits
- For existing items, use their real id from the resume data. For new items, use "new" as the id
- For partial updates to an existing item, include the full item with all fields
- If the user only wants advice, respond in plain text — do NOT include resumeEdits
- Section ordering is controlled by the template and CANNOT be changed. If asked to move a section, explain and offer to improve content instead
- When in EDIT mode, respond with ONLY the JSON object — no text before or after it

User profile:
- Name: ${userContext?.name ?? 'Unknown'}
- Current Role: ${userContext?.currentRole ?? 'Not specified'}
- Target Role: ${userContext?.targetRole ?? 'Not specified'}
- Target Industries: ${userContext?.targetDomains?.join(', ') ?? 'Not specified'}
- Location: ${userContext?.location ?? 'Not specified'}
- Current Company: ${userContext?.currentCompany ?? 'Not specified'}
- Years of Experience: ${userContext?.yearsOfExperience ?? 'Not specified'}
- Employment Type: ${userContext?.employmentType ?? 'Not specified'}
- Current Salary: ${userContext?.currentSalary ?? 'Not specified'}
- Expected Salary: ${userContext?.expectedSalary ?? 'Not specified'}

Always optimize for TARGET ROLE and TARGET DOMAINS. Never ask for info already in the profile.

${editLog?.length > 0 ? `Edit history this session:\n${editLog.map((e: { timestamp: string; summary: string }, i: number) => `${i + 1}. [${new Date(e.timestamp).toLocaleTimeString()}] ${e.summary}`).join('\n')}\n` : ''}
Current resume data:
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

        // Valid edit response
        if (parsed.reply !== undefined && parsed.resumeEdits !== undefined) {
          return res.json({ reply: String(parsed.reply), resumeEdits: parsed.resumeEdits })
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
  const { resumeData, targetRole, targetDomains, currentRole, currentCompany, yearsOfExperience, jobDescription } = req.body
  if (!resumeData) return res.status(400).json({ error: 'resumeData is required' })
  try {
    const targetContext = jobDescription
      ? `Job Description provided:\n${jobDescription}`
      : `Target Role: ${targetRole ?? 'Not specified'}\nTarget Industries: ${Array.isArray(targetDomains) && targetDomains.length > 0 ? targetDomains.join(', ') : 'Not specified'}`

    const prompt = `You are an ATS expert. Score this resume against the TARGET ROLE below (not current role). Return ONLY valid JSON:
{
  "overallScore":<0-100>,
  "breakdown":{
    "keywordMatch":{"score":<0-100>,"found":[<string>],"missing":[<string>]},
    "formatting":{"score":<0-100>,"issues":[<string>]},
    "sectionCompleteness":{"score":<0-100>,"present":[<string>],"missing":[<string>]},
    "quantification":{"score":<0-100>,"examples":[<string>],"suggestions":[<string>]},
    "actionVerbs":{"score":<0-100>,"weak":[<string>],"suggestions":[<string>]}
  },
  "topIssues":[<string>],
  "quickWins":[<string>],
  "gapAnalysis":"<string>"
}
${targetContext}
Current Role: ${currentRole ?? 'Not specified'} | Company: ${currentCompany ?? 'Not specified'} | Experience: ${yearsOfExperience ?? 'Not specified'}
RESUME DATA:\n${JSON.stringify(resumeData, null, 2)}`

    const text = await generateText(prompt)
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()))
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
