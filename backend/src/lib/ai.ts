import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite']
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function isRateLimitError(err: any): boolean {
  const msg = err?.message ?? ''
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('Service Unavailable') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('RESOURCE_EXHAUSTED')
  )
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function callGroq(
  prompt: string,
  options?: {
    systemPrompt?: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    maxTokens?: number
  }
): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY not configured')

  const messages: { role: string; content: string }[] = []
  if (options?.systemPrompt) messages.push({ role: 'system', content: options.systemPrompt })
  if (options?.history?.length) messages.push(...options.history)
  messages.push({ role: 'user', content: prompt })

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: options?.maxTokens ?? 8192,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error ${res.status}: ${err}`)
  }

  const data = await res.json() as any
  const text = data.choices?.[0]?.message?.content ?? ''
  console.log(`[AI] Groq OK (${text.length} chars)`)
  return text
}

// ── Gemini fallback ───────────────────────────────────────────────────────────
async function callGemini(
  prompt: string,
  options?: {
    systemPrompt?: string
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
    maxOutputTokens?: number
  }
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not configured')

  const genAI = new GoogleGenerativeAI(key)

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: options?.maxOutputTokens ?? 8192, temperature: 0.4 },
          ...(options?.systemPrompt
            ? { systemInstruction: { role: 'user', parts: [{ text: options.systemPrompt }] } }
            : {}),
        })

        let result
        if (options?.history?.length) {
          const chat = model.startChat({ history: options.history })
          result = await chat.sendMessage(prompt)
        } else {
          result = await model.generateContent(prompt)
        }

        const text = result.response.text()
        console.log(`[AI] Gemini ${modelName} OK (${text.length} chars)`)
        return text
      } catch (err: any) {
        if (!isRateLimitError(err)) throw err
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
        console.warn(`[AI] Gemini ${modelName} rate limited (attempt ${attempt + 1}), retrying in ${Math.round(delay)}ms`)
        await sleep(delay)
      }
    }
    console.warn(`[AI] Gemini ${modelName} exhausted, trying next model...`)
  }

  throw new Error('All Gemini models exhausted')
}

// ── Chat — always Groq first, Gemini fallback ─────────────────────────────────
export async function generateChat(
  userMessage: string,
  options?: {
    systemPrompt?: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    maxTokens?: number
  }
): Promise<string> {
  try {
    return await callGroq(userMessage, options)
  } catch (err: any) {
    console.warn('[AI] Groq failed for chat, falling back to Gemini:', err.message)
    // Convert history format for Gemini
    const geminiHistory = options?.history?.map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))
    return await callGemini(userMessage, {
      systemPrompt: options?.systemPrompt,
      history: geminiHistory,
      maxOutputTokens: options?.maxTokens ?? 8192,
    })
  }
}

// ── General text generation — Gemini first, Groq fallback ────────────────────
// Used for resume parsing, ATS scoring, cover letters, JD parsing
export async function generateText(
  prompt: string,
  options?: {
    systemPrompt?: string
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
    maxOutputTokens?: number
  }
): Promise<string> {
  try {
    return await callGemini(prompt, options)
  } catch (err: any) {
    console.warn('[AI] Gemini failed, falling back to Groq:', err.message)
    return await callGroq(prompt, {
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxOutputTokens ?? 8192,
    })
  }
}
