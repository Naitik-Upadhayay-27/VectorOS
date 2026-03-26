import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Bot, CheckCheck, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { useChatStore } from '@/store/chatStore'
import { useResumeUploadStore } from '@/store/resumeUploadStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { apiFetch } from '@/lib/apiFetch'

const quickActions = [
  { icon: '✏️', title: 'Rewrite my summary to be more impactful',    subtitle: 'AI rewrites it directly in your resume', color: 'text-blue-500',   isEdit: true  },
  { icon: '💪', title: 'Improve the bullet points in my latest job',  subtitle: 'Stronger action verbs + quantified results', color: 'text-green-500', isEdit: true  },
  { icon: '🎯', title: "What are the top keywords I'm missing for ATS?", subtitle: 'Get a keyword gap analysis',          color: 'text-purple-500', isEdit: false },
  { icon: '🔍', title: 'Review my resume and give me honest feedback', subtitle: 'Practical, actionable critique',        color: 'text-orange-500', isEdit: false },
]

interface ResumeEdits {
  summary?: string
  personalInfo?: { name?: string; title?: string; contact?: Record<string, string> }
  experience?: Array<{ id: string; [k: string]: any }>
  education?: Array<{ id: string; [k: string]: any }>
  skills?: Array<{ id: string; [k: string]: any }>
  projects?: Array<{ id: string; [k: string]: any }>
  deleteExperience?: string[]
  deleteEducation?: string[]
  deleteSkills?: string[]
  deleteProjects?: string[]
}

function applyResumeEdits(edits: ResumeEdits) {
  const store = useTemplateResumeStore.getState()
  if (edits.summary !== undefined) store.setSummary(edits.summary)
  if (edits.personalInfo) {
    const { name, title, contact } = edits.personalInfo
    if (name || title) store.setPersonalInfo({ ...(name ? { name } : {}), ...(title ? { title } : {}) })
    if (contact) store.setContact(contact)
  }
  edits.experience?.forEach(({ id, ...f }) => id === 'new' ? store.addExperience({ title: '', company: '', location: '', startDate: '', endDate: '', description: [], ...f }) : store.updateExperience(id, f))
  edits.deleteExperience?.forEach((id) => store.removeExperience(id))
  edits.education?.forEach(({ id, ...f }) => id === 'new' ? store.addEducation({ degree: '', institution: '', location: '', graduationDate: '', gpa: '', description: [], ...f }) : store.updateEducation(id, f))
  edits.deleteEducation?.forEach((id) => store.removeEducation(id))
  edits.skills?.forEach(({ id, ...f }) => id === 'new' ? store.addSkillCategory({ category: '', skills: [], ...f }) : store.updateSkillCategory(id, f))
  edits.deleteSkills?.forEach((id) => store.removeSkillCategory(id))
  edits.projects?.forEach(({ id, ...f }) => id === 'new' ? store.addProject({ name: '', role: '', link: '', startDate: '', endDate: '', description: [], technologies: [], ...f }) : store.updateProject(id, f))
  edits.deleteProjects?.forEach((id) => store.removeProject(id))
}

// Simple markdown renderer: bold, bullets, line breaks
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        // Bullet points
        const isBullet = /^[-•*]\s/.test(line.trim())
        const content = isBullet ? line.trim().replace(/^[-•*]\s/, '') : line
        // Bold: **text**
        const parts = content.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} className="font-semibold text-gray-800">{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        )
        if (isBullet) {
          return <div key={i} className="flex items-start gap-1.5"><span className="text-brand-400 mt-0.5 shrink-0">•</span><span>{rendered}</span></div>
        }
        // Heading: starts with #
        if (line.trim().startsWith('# ')) {
          return <p key={i} className="font-bold text-gray-800 text-xs mt-2">{line.trim().slice(2)}</p>
        }
        return <p key={i}>{rendered}</p>
      })}
    </div>
  )
}

// Word-by-word streaming reveal
function StreamingMessage({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)
  const words = useRef(text.split(' '))

  useEffect(() => {
    idx.current = 0
    words.current = text.split(' ')
    setDisplayed('')
    const interval = setInterval(() => {
      if (idx.current >= words.current.length) {
        clearInterval(interval)
        onDone()
        return
      }
      setDisplayed((prev) => prev + (idx.current === 0 ? '' : ' ') + words.current[idx.current])
      idx.current++
    }, 18) // ~18ms per word ≈ fast but visible
    return () => clearInterval(interval)
  }, [text])

  return (
    <div className="text-xs leading-relaxed text-gray-700">
      <MarkdownText text={displayed} />
      <span className="inline-block w-1 h-3 bg-brand-400 ml-0.5 animate-pulse align-middle" />
    </div>
  )
}

export default function ChatPanel() {
  const { messages, editLog, isOpen, isTyping, tokensLeft, addMessage, addEditLogEntry, setTyping, toggleChat, clearMessages, pendingTrigger, clearTrigger } = useChatStore()
  const { resumeText } = useResumeUploadStore()
  const resumeData = useTemplateResumeStore((s) => s.data)
  const onboardingData = useOnboardingStore((s) => s.data)
  const user = useAuthStore((s) => s.user)
  const [input, setInput] = useState('')
  const [editedMsgIds, setEditedMsgIds] = useState<Set<string>>(new Set())
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, streamingId])

  // Auto-send any message triggered externally (e.g. "Fix Resume with AI" button)
  useEffect(() => {
    if (pendingTrigger) {
      clearTrigger()
      sendMessage(pendingTrigger)
    }
  }, [pendingTrigger])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || tokensLeft <= 0) return
    addMessage({ role: 'user', content: text })
    setInput('')
    setTyping(true)

    try {
      const res = await apiFetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          resumeContext: resumeText || undefined,
          resumeData,
          editLog: editLog.length > 0 ? editLog : undefined,
          userContext: {
            name: user?.name || onboardingData.fullName || undefined,
            targetRole: onboardingData.jobTitle || undefined,
            currentRole: resumeData.personalInfo?.title || onboardingData.jobTitle || undefined,
            location: onboardingData.location || undefined,
            currentCompany: onboardingData.currentCompany || undefined,
            yearsOfExperience: onboardingData.yearsOfExperience || undefined,
            employmentType: onboardingData.employmentType || undefined,
            currentSalary: onboardingData.currentSalary || undefined,
            expectedSalary: onboardingData.expectedSalary || undefined,
            targetDomains: onboardingData.targetDomains.length > 0 ? onboardingData.targetDomains : undefined,
          },
        }),
      })

      const data = await res.json()
      setTyping(false)
      if (!res.ok) throw new Error(data.error ?? 'AI request failed')

      // Safety net: if reply looks like raw JSON (AI leaked it), extract the reply field
      let replyText: string = data.reply ?? ''
      if (replyText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(replyText)
          if (parsed.reply) replyText = String(parsed.reply)
        } catch {}
      }

      const msgId = crypto.randomUUID()
      setStreamingId(msgId)
      addMessage({ id: msgId, role: 'assistant', content: replyText })

      if (data.resumeEdits && Object.keys(data.resumeEdits).length > 0) {
        applyResumeEdits(data.resumeEdits)
        setEditedMsgIds((prev) => new Set([...prev, msgId]))
        addEditLogEntry(replyText)
      }
    } catch (err: any) {
      setTyping(false)
      addMessage({ role: 'assistant', content: `Sorry, something went wrong: ${err.message}` })
    }
  }, [messages, resumeText, resumeData, editLog, onboardingData, user, tokensLeft])

  if (!isOpen) return null

  const showQuickActions = messages.length <= 1

  return (
    <div className="w-full h-full flex flex-col bg-white border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">VectorOS AI</p>
            <p className="text-xs text-green-500">● Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearMessages} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          <button onClick={toggleChat} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          const id = msg.id ?? ''
          const wasEdited = editedMsgIds.has(id)
          const isStreaming = streamingId === id

          return (
            <div key={id} className={clsx('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className={clsx(
                  'px-3 py-2.5 rounded-2xl text-xs leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm'
                    : 'bg-brand-500 text-white rounded-tr-sm'
                )}>
                  {msg.role === 'assistant' ? (
                    isStreaming
                      ? <StreamingMessage text={msg.content} onDone={() => setStreamingId(null)} />
                      : <MarkdownText text={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={clsx('text-[10px] mt-1.5 opacity-40', msg.role === 'user' ? 'text-right' : '')}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {wasEdited && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-100 rounded-lg self-start">
                    <CheckCheck size={11} className="text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Applied to resume</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {showQuickActions && (
          <div className="space-y-2 mt-2">
            {quickActions.map((action) => (
              <button key={action.title} onClick={() => sendMessage(action.title)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all group">
                <div className="flex items-start gap-2">
                  <span className={clsx('text-base shrink-0', action.color)}>{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-gray-700 group-hover:text-brand-600 leading-snug">{action.title}</p>
                      {action.isEdit && (
                        <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-50 text-brand-500 text-xs rounded-full border border-brand-100">
                          <Sparkles size={9} /> edit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{action.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {tokensLeft <= 5 && (
        <div className="mx-4 mb-2 p-2 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-600 text-center">
          {tokensLeft} tokens left — <button className="underline font-medium">upgrade for unlimited</button>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask anything or say 'rewrite my summary'..."
            rows={1}
            className="flex-1 resize-none text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || tokensLeft <= 0}
            className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Say "rewrite", "add", "improve" to edit your resume · {tokensLeft} tokens left
        </p>
      </div>
    </div>
  )
}
