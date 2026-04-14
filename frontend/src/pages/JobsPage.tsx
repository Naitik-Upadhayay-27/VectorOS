import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, MapPin, Building2, ExternalLink, Zap, Filter, Wifi, Clock, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, ArrowLeft, Edit, Copy, Sparkles, TrendingUp, BookOpen, FileText, Bookmark, BookmarkCheck, Lock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useDraftStore, type ResumeDraft } from '@/store/draftStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useProfileStore } from '@/store/profileStore'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES } from '@/components/resume-templates'
import { useChatStore } from '@/store/chatStore'
import { useSavedJobsStore } from '@/store/savedJobsStore'
import { usePlanStore } from '@/store/planStore'
import PaywallModal from '@/components/ui/PaywallModal'

const PAGE_W = 794
const PAGE_H = 1123
const THUMB_SCALE = 0.18

function ResumeThumbnail({ draft, active }: { draft: ResumeDraft; active: boolean }) {
  const template = TEMPLATES.find((t) => t.id === draft.templateId) ?? TEMPLATES[0]
  const Comp = template.component
  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
        active ? 'border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.2)]' : 'border-gray-200 hover:border-purple-300'
      }`}
      style={{ width: PAGE_W * THUMB_SCALE, height: PAGE_H * THUMB_SCALE }}
    >
      <div style={{ width: PAGE_W, transformOrigin: 'top left', transform: `scale(${THUMB_SCALE})`, pointerEvents: 'none' }}>
        <Comp data={draft.resumeData} />
      </div>
      {active && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={12} className="text-white" />
        </div>
      )}
    </div>
  )
}

// Current resume thumbnail (no draft)
function CurrentResumeThumbnail({ active }: { active: boolean }) {
  const data = useTemplateResumeStore((s) => s.data)
  const templateId = useTemplateResumeStore((s) => s.activeTemplateId)
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]
  const Comp = template.component
  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
        active ? 'border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.2)]' : 'border-gray-200 hover:border-purple-300'
      }`}
      style={{ width: PAGE_W * THUMB_SCALE, height: PAGE_H * THUMB_SCALE }}
    >
      <div style={{ width: PAGE_W, transformOrigin: 'top left', transform: `scale(${THUMB_SCALE})`, pointerEvents: 'none' }}>
        <Comp data={data} />
      </div>
      {active && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={12} className="text-white" />
        </div>
      )}
    </div>
  )
}

interface Job {
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

interface CompatibilityResult {
  overallScore: number
  breakdown: { technical: number; experience: number; keywords: number }
  missingSkills: string[]
  matchedSkills: string[]
  summary: string
  recommendation: string
}

const SOURCE_LABELS: Record<string, string> = {
  indeed:   'Indeed',
  linkedin: 'LinkedIn',
}

const SOURCE_COLORS: Record<string, string> = {
  indeed:   'bg-blue-50 text-blue-600 border-blue-100',
  linkedin: 'bg-sky-50 text-sky-700 border-sky-100',
}

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

const JOB_SUGGESTIONS: string[] = []  // unused — replaced by API

export default function JobsPage() {
  const navigate = useNavigate()
  const { data: onboarding } = useOnboardingStore()
  const { save: saveJob, unsave, isSaved, load: loadSaved } = useSavedJobsStore()
  const { plan } = usePlanStore()
  const isPro = plan === 'pro' || plan === 'lifetime'
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => { loadSaved() }, [])
  const { drafts } = useDraftStore()
  const resumeData = useTemplateResumeStore((s) => s.data)
  const { profile } = useProfileStore()

  // No auto-fill — start empty
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [magicMode, setMagicMode] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // India location data
  const [locationData, setLocationData] = useState<Array<{ state: string; cities: string[] }>>([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const stateRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch(`${API_BASE}/api/jobs/locations`).then(r => r.json()).then(d => {
      setLocationData(d.states ?? [])
    }).catch(() => {})
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!stateRef.current?.contains(e.target as Node)) setStateOpen(false)
      if (!cityRef.current?.contains(e.target as Node)) setCityOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current)
    if (val.trim().length < 2) { setShowSuggestions(false); return }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/ai/job-titles?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        const titles: string[] = data.titles ?? []
        setSuggestions(titles)
        setShowSuggestions(titles.length > 0)
      } catch { setShowSuggestions(false) }
    }, 200)
  }

  const selectSuggestion = (s: string) => {
    setQuery(s)
    setShowSuggestions(false)
  }
  const [location, setLocation] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedDraftId, setSelectedDraftId] = useState<string>('')
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [checkingCompat, setCheckingCompat] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)
  const JOBS_PER_PAGE = 6

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setJobs([])
    setHasSearched(true)
    setPage(1)
    // Build location string from state + city selection
    const locationStr = selectedCity
      ? `${selectedCity}, ${selectedState}`
      : selectedState || ''
    try {
      const params = new URLSearchParams({ q: query, location: locationStr, type: typeFilter, remote: remoteOnly ? 'true' : '' })
      const res = await apiFetch(`${API_BASE}/api/jobs/search?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setJobs(data.jobs ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [query, selectedState, selectedCity, typeFilter, remoteOnly])

  // Auto-search disabled — user must click Search or use Magic
  // useEffect auto-search removed intentionally

  // Magic search — auto-searches using profile data
  const startWithMagic = useCallback(async () => {
    const magicQuery = profile.targetRoles[0] || profile.jobTitle || onboarding.jobTitle || resumeData.personalInfo?.title || ''
    if (!magicQuery) return
    setQuery(magicQuery)
    setSelectedState('')
    setSelectedCity('')
    setMagicMode(true)
    setMagicLoading(true)
    setLoading(true)
    setError('')
    setJobs([])
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: magicQuery, location: '', remote: profile.openToRemote ? 'true' : '' })
      const res = await apiFetch(`${API_BASE}/api/jobs/search?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setJobs(data.jobs ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setMagicLoading(false)
    }
  }, [profile, onboarding, resumeData])

  const checkCompatibility = async () => {
    if (!selectedJob) return
    setCheckingCompat(true)
    setCompatibility(null)
    try {
      // Use selected draft or current resume
      const draft = drafts.find((d) => d.id === selectedDraftId)
      const resume = draft ? draft.resumeData : resumeData

      const res = await apiFetch(`${API_BASE}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: JSON.stringify(resume),
          jobDescription: `${selectedJob.title} at ${selectedJob.company}\n\n${selectedJob.description}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Map the match result to our CompatibilityResult shape
      setCompatibility({
        overallScore: data.score ?? 0,
        breakdown: {
          technical: Math.min(100, (data.score ?? 0) + 5),
          experience: Math.max(0, (data.score ?? 0) - 8),
          keywords: Math.min(100, (data.score ?? 0) + 2),
        },
        missingSkills: data.missingKeywords ?? [],
        matchedSkills: data.strengths ?? [],
        summary: data.suggestions?.[0] ?? '',
        recommendation: data.score >= 75 ? 'Strong match — apply now' : data.score >= 50 ? 'Good fit with some gaps' : 'Consider improving your resume first',
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCheckingCompat(false)
    }
  }

  const editWithDraft = (asCopy: boolean) => {
    if (!selectedJob) return
    if (asCopy && selectedDraftId) {
      const draft = drafts.find((d) => d.id === selectedDraftId)
      if (draft) {
        useTemplateResumeStore.getState().resetData(draft.resumeData)
        useTemplateResumeStore.getState().setTemplate(draft.templateId)
      }
    }

    // Build a targeted message with the job context and missing skills
    const missing = compatibility?.missingSkills ?? []
    const score = compatibility?.overallScore

    const parts: string[] = [
      `I want to tailor my resume for this job: "${selectedJob.title}" at ${selectedJob.company}.`,
    ]
    if (score !== undefined) parts.push(`My current match score is ${score}%.`)
    if (missing.length > 0) parts.push(`Missing keywords to add: ${missing.join(', ')}.`)
    parts.push('Please optimize my resume for this role — add the missing keywords naturally, strengthen my bullet points, and improve my summary to match this position.')

    useChatStore.getState().triggerMessage(parts.join(' '))
    navigate('/resume/resume-1')
  }

  // ── Job Detail Panel ────────────────────────────────────────────────────────
  if (selectedJob) {
    const scoreColor = compatibility
      ? compatibility.overallScore >= 75 ? '#22c55e' : compatibility.overallScore >= 50 ? '#f59e0b' : '#ef4444'
      : '#a855f7'
    const scoreLabel = compatibility
      ? compatibility.overallScore >= 75 ? 'Strong Match' : compatibility.overallScore >= 50 ? 'Good Fit' : 'Needs Work'
      : null

    return (
      <>
        <AppLayout>
          <div className="h-full overflow-y-auto bg-[#f6f7fb]">

          {/* Hero banner — clean light */}
          <div className="bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-8 py-5">
              <button onClick={() => { setSelectedJob(null); setCompatibility(null) }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft size={13} /> Back to results
              </button>

              <div className="flex items-center gap-5">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                  {selectedJob.logo
                    ? <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain p-1" />
                    : <span className="text-purple-600 font-black text-lg">{selectedJob.company[0]}</span>}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[selectedJob.source]}`}>{SOURCE_LABELS[selectedJob.source]}</span>
                    {selectedJob.remote && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1"><Wifi size={9} /> Remote</span>}
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} />{timeAgo(selectedJob.postedAt)}</span>
                    {selectedJob.type && <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{selectedJob.type.replace('_', ' ')}</span>}
                  </div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">{selectedJob.title}</h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 size={11} className="text-gray-400" />{selectedJob.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{selectedJob.location}</span>
                    {selectedJob.salary !== 'Not specified' && <span className="text-green-600 font-semibold">{selectedJob.salary}</span>}
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Apply Now */}
                  <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors">
                    Apply Now <ExternalLink size={13} />
                  </a>

                  {/* Save */}
                  <button onClick={() => isSaved(selectedJob.id) ? unsave(selectedJob.id) : saveJob({ jobId: selectedJob.id, title: selectedJob.title, company: selectedJob.company, location: selectedJob.location, url: selectedJob.url, description: selectedJob.description })}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isSaved(selectedJob.id) ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {isSaved(selectedJob.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    {isSaved(selectedJob.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Body — 3 columns */}
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-3 gap-5">

              {/* ── Col 1: Job Description ─────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col" style={{ height: '75vh' }}>
                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 shrink-0">
                  <span className="w-1 h-4 bg-purple-500 rounded-full" /> About the Role
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed space-y-2 overflow-y-auto pr-1 flex-1">
                  {selectedJob.description
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/\s{2,}/g, '\n\n')
                    .trim()
                    .split('\n')
                    .map((line, i) => line.trim() === '' ? <div key={i} className="h-1" /> : <p key={i}>{line}</p>)}
                </div>
              </div>

              {/* ── Col 2: AI Analysis ─────────────────────────────── */}
              <div className="flex flex-col" style={{ height: '75vh' }}>
                {/* Before check — prompt */}
                {!compatibility && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center"><Zap size={13} className="text-white" /></div>
                      <span className="text-sm font-bold text-gray-800">AI Match Analysis</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">Select a resume on the right and run the analysis to see your match score, missing keywords, and exactly what to fix.</p>
                    <button onClick={checkCompatibility} disabled={checkingCompat || (!drafts.length && !resumeData.personalInfo?.name)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40">
                      {checkingCompat ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : <><Zap size={12} /> Run Analysis</>}
                    </button>
                  </div>
                )}

                {/* After check — full analysis */}
                {compatibility && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden">
                    {/* Fixed header */}
                    <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center"><Zap size={13} className="text-white" /></div>
                          <span className="text-sm font-bold text-gray-800">AI Match Analysis</span>
                        </div>
                        <span className="text-2xl font-black" style={{ color: scoreColor }}>{compatibility.overallScore}%</span>
                      </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      {/* Score bars */}
                      <div className="space-y-2.5">
                        {[
                          { label: 'Technical Skills', score: compatibility.breakdown.technical },
                          { label: 'Experience', score: compatibility.breakdown.experience },
                          { label: 'Keyword Match', score: compatibility.breakdown.keywords },
                        ].map(({ label, score }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-bold text-gray-700">{score}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {compatibility.recommendation && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">"{compatibility.recommendation}"</p>
                      )}

                      {compatibility.matchedSkills.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <CheckCircle2 size={10} /> Skills you have
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {compatibility.matchedSkills.map(s => (
                              <span key={s} className="text-[11px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                                <CheckCircle2 size={8} /> {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing + action items — blurred for free */}
                      <div className="relative">
                        <div className={!isPro ? 'blur-sm select-none pointer-events-none' : ''}>
                          {compatibility.missingSkills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <AlertCircle size={10} /> Missing keywords
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {compatibility.missingSkills.map(s => (
                                  <span key={s} className="text-[11px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                                    <AlertCircle size={8} /> {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">What to fix</p>
                            {compatibility.missingSkills.slice(0, 3).map((skill, i) => (
                              <div key={skill} className="flex items-start gap-2 text-xs text-gray-700">
                                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <span>Add <strong>"{skill}"</strong> to your skills or experience section</span>
                              </div>
                            ))}
                            {compatibility.breakdown.keywords < 50 && (
                              <div className="flex items-start gap-2 text-xs text-gray-700">
                                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">!</span>
                                <span>Tailor your summary to include role-specific terms</span>
                              </div>
                            )}
                            {compatibility.breakdown.experience < 50 && (
                              <div className="flex items-start gap-2 text-xs text-gray-700">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">↑</span>
                                <span>Strengthen experience bullets with quantified achievements</span>
                              </div>
                            )}
                          </div>
                          {compatibility.summary && (
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mt-3">
                              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">AI Suggestion</p>
                              <p className="text-xs text-blue-700 leading-relaxed">{compatibility.summary}</p>
                            </div>
                          )}
                        </div>
                        {!isPro && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 px-4 py-3 flex flex-col items-center gap-2 text-center max-w-[200px]">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Lock size={14} className="text-white" />
                              </div>
                              <p className="text-xs font-bold text-gray-800">{compatibility.missingSkills.length} missing keywords found</p>
                              <p className="text-[10px] text-gray-400 leading-relaxed">Upgrade to see what to fix and auto-tailor your resume</p>
                              <button onClick={() => setPaywallOpen(true)}
                                className="w-full py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-all">
                                Unlock Full Analysis
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fixed footer buttons */}
                    <div className="px-5 py-3 border-t border-gray-100 flex gap-2 shrink-0">
                      <button onClick={() => editWithDraft(false)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors">
                        <Sparkles size={12} /> Tailor with AI
                      </button>
                      <button onClick={() => editWithDraft(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>              {/* Right: resume + actions */}
              <div className="space-y-4">

                {/* Resume selector */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col" style={{ height: '75vh' }}>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 shrink-0">
                    <FileText size={14} className="text-purple-500" /> Your Resumes
                  </h3>
                  {drafts.length === 0 && !resumeData.personalInfo?.name ? (
                    <div className="flex flex-col items-center py-6 text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <FileText size={20} className="text-purple-400" />
                      </div>
                      <p className="text-xs text-gray-500">No resume yet.</p>
                      <button onClick={() => navigate('/resume/resume-1')}
                        className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors">
                        Create Resume
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                      {resumeData.personalInfo?.name && (
                        <button onClick={() => { setSelectedDraftId(''); setCompatibility(null) }} className="flex flex-col items-center gap-1.5 shrink-0">
                          <CurrentResumeThumbnail active={selectedDraftId === ''} />
                          <span className="text-[10px] text-gray-500 font-medium max-w-[130px] truncate">Current</span>
                        </button>
                      )}
                      {drafts.map((draft) => (
                        <button key={draft.id} onClick={() => { setSelectedDraftId(draft.id); setCompatibility(null) }} className="flex flex-col items-center gap-1.5 shrink-0">
                          <ResumeThumbnail draft={draft} active={selectedDraftId === draft.id} />
                          <span className="text-[10px] text-gray-500 font-medium max-w-[130px] truncate">{draft.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {(drafts.length > 0 || resumeData.personalInfo?.name) && (
                    <button onClick={checkCompatibility} disabled={checkingCompat}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shrink-0">
                      {checkingCompat
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                        : <><Zap size={14} /> Check Match Score</>}
                    </button>
                  )}
                </div>

                {/* Skill Vector pitch — removed, actions moved to header */}

              </div>
            </div>
          </div>
        </div>
        </AppLayout>
        <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} reason="ats" />
      </>
    )
  }

  // ── Job List ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
            <p className="text-sm text-gray-400 mt-0.5">Search across LinkedIn & Indeed · Powered by real-time scraping</p>
          </div>

          {/* ── Search bar ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-visible">
            <div className="p-5">
              {/* Main search row */}
              <div className="flex gap-3 mb-3">
                {/* Job title input */}
                <div className="relative flex-1" ref={searchRef}>
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); search() } if (e.key === 'Escape') setShowSuggestions(false) }}
                    onFocus={() => query.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Job title, skill, or keyword..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-y-auto" style={{ maxHeight: '15rem' }}>
                      {suggestions.slice(0, 6).map((s) => (
                        <button key={s} onMouseDown={() => selectSuggestion(s)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <Search size={11} className="text-gray-300 shrink-0" />{s}
                        </button>
                      ))}
                      {suggestions.length > 6 && (
                        <div className="px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100">Scroll for more</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search button */}
                <button onClick={() => { setShowSuggestions(false); search() }}
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Search size={14} />}
                  Search
                </button>
              </div>

              {/* Location row */}
              <div className="flex gap-3 mb-3">
                {/* State dropdown */}
                <div className="relative flex-1" ref={stateRef}>
                  <button onClick={() => { setStateOpen(!stateOpen); setCityOpen(false) }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-left hover:border-purple-300 transition-colors bg-white">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span className={selectedState ? 'text-gray-800' : 'text-gray-400'}>{selectedState || 'Select State'}</span>
                    <svg className="ml-auto w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {stateOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-y-auto" style={{ maxHeight: '15rem' }}>
                      <button onMouseDown={() => { setSelectedState(''); setSelectedCity(''); setStateOpen(false) }}
                        className="w-full px-4 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        All India
                      </button>
                      {locationData.map(({ state }) => (
                        <button key={state} onMouseDown={() => { setSelectedState(state); setSelectedCity(''); setStateOpen(false) }}
                          className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${selectedState === state ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* City dropdown */}
                <div className="relative flex-1" ref={cityRef}>
                  <button onClick={() => { if (selectedState) { setCityOpen(!cityOpen); setStateOpen(false) } }}
                    disabled={!selectedState}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-left hover:border-purple-300 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span className={selectedCity ? 'text-gray-800' : 'text-gray-400'}>
                      {selectedCity || (selectedState ? 'Select City' : 'Select state first')}
                    </span>
                    <svg className="ml-auto w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {cityOpen && selectedState && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-y-auto" style={{ maxHeight: '15rem' }}>
                      <button onMouseDown={() => { setSelectedCity(''); setCityOpen(false) }}
                        className="w-full px-4 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        All cities in {selectedState}
                      </button>
                      {(locationData.find(l => l.state === selectedState)?.cities ?? []).map(city => (
                        <button key={city} onMouseDown={() => { setSelectedCity(city); setCityOpen(false) }}
                          className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${selectedCity === city ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-50">
                <Filter size={12} className="text-gray-400" />
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mr-1">Filters</span>
                {['full_time', 'part_time', 'contract', 'internship'].map((t) => (
                  <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${typeFilter === t
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'}`}>
                    {t.replace('_', ' ')}
                  </button>
                ))}
                <button onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1.5 ${remoteOnly
                    ? 'bg-green-500 text-white border-green-500'
                    : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'}`}>
                  <Wifi size={10} /> Remote only
                </button>
                {(selectedState || selectedCity || typeFilter || remoteOnly) && (
                  <button onClick={() => { setSelectedState(''); setSelectedCity(''); setTypeFilter(''); setRemoteOnly(false) }}
                    className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-all ml-auto">
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Magic mode banner */}
          {magicMode && jobs.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <Sparkles size={16} className="text-purple-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-800">Personalized for you</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Showing jobs matching your profile: <span className="font-semibold">{query}</span>
                  {profile.topSkills.length > 0 && <> · Skills: {profile.topSkills.slice(0, 3).join(', ')}</>}
                </p>
              </div>
              <button onClick={() => setMagicMode(false)} className="text-xs text-purple-400 hover:text-purple-600">Dismiss</button>
            </div>
          )}

          {/* Tips panel — shown when no jobs and not loading */}
          {jobs.length === 0 && !loading && !hasSearched && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Sparkles, title: 'Magic Search', desc: 'Instantly find jobs matched to your profile, skills, and target roles.', color: 'text-purple-500', bg: 'bg-purple-50' },
                { icon: TrendingUp, title: 'Check Compatibility', desc: 'Run AI compatibility check to see your match score and missing keywords.', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: BookOpen, title: 'Tailor Your Resume', desc: 'Auto-optimize your resume for any specific role with one click.', color: 'text-green-500', bg: 'bg-green-50' },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className={`${bg} rounded-2xl p-4 border border-white`}>
                  <Icon size={16} className={`${color} mb-2`} />
                  <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && jobs.length === 0 && (
            <div className="space-y-3 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-100 rounded w-2/5" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Source legend */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
              <span>{jobs.length} jobs found</span>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <span key={k} className={`px-2 py-0.5 rounded-full border ${SOURCE_COLORS[k]}`}>{v}</span>
              ))}
            </div>
          )}

          {/* Job cards — 2-col grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE).map((job) => {
              const bookmarked = isSaved(job.url)
              return (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all group flex flex-col overflow-hidden">
                <div className="p-5 flex-1">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {job.logo
                      ? <img src={job.logo} alt={job.company} className="w-11 h-11 rounded-xl object-contain border border-gray-100 shrink-0" />
                      : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-base shrink-0">{job.company[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-snug line-clamp-2">{job.title}</h3>
                        {/* Bookmark button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            bookmarked
                              ? unsave(job.url)
                              : saveJob({ jobId: job.id, title: job.title, company: job.company, location: job.location, url: job.url, description: job.description })
                          }}
                          className={`shrink-0 p-1.5 rounded-lg transition-all ${bookmarked ? 'text-purple-600 bg-purple-50' : 'text-gray-300 hover:text-purple-500 hover:bg-purple-50'}`}
                          title={bookmarked ? 'Remove bookmark' : 'Save job'}
                        >
                          {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium"><Building2 size={10} />{job.company}</span>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Salary + time */}
                  <div className="flex items-center gap-2 mb-3">
                    {job.salary !== 'Not specified' && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">{job.salary}</span>
                    )}
                    {job.postedAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{timeAgo(job.postedAt)}</span>
                    )}
                  </div>

                  {/* Description preview */}
                  {job.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
                      {job.description.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 200)}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[job.source]}`}>
                      {SOURCE_LABELS[job.source]}
                    </span>
                    {job.remote && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1"><Wifi size={8} /> Remote</span>}
                    {job.type && job.type !== 'Not specified' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 capitalize">{job.type.replace('_', ' ')}</span>
                    )}
                    {job.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] border border-gray-100 text-gray-400 px-2 py-0.5 rounded-full bg-gray-50">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Action bar */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-xs text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-1"
                  >
                    View Details <ChevronRight size={11} />
                  </button>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Apply Now <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              )
            })}

            {!loading && jobs.length === 0 && query && (
              <div className="text-center py-12 text-gray-400">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Finding jobs for you...</p>
                  </div>
                ) : hasSearched ? (
                  <div className="flex flex-col items-center gap-3">
                    <Search size={28} className="opacity-30" />
                    <p className="text-sm font-medium text-gray-500">No jobs found</p>
                    <p className="text-xs text-gray-400">Try a different search term or remove filters</p>
                    <button onClick={startWithMagic} className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors">
                      <Sparkles size={12} /> Try Magic Search
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Sparkles size={28} className="text-purple-300" />
                    <p className="text-sm font-medium text-gray-500">Ready to find your next role?</p>
                    <button onClick={startWithMagic} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors">
                      <Sparkles size={12} /> Start with Magic
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && jobs.length === 0 && !query && (
              <div className="text-center py-16 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-gray-500">Search for jobs above</p>
                <p className="text-xs mt-1">Results from LinkedIn & Indeed</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {jobs.length > JOBS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(jobs.length / JOBS_PER_PAGE) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setPage(p => Math.min(Math.ceil(jobs.length / JOBS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === Math.ceil(jobs.length / JOBS_PER_PAGE)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

