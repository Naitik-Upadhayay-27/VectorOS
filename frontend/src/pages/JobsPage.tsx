import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, MapPin, Building2, ExternalLink, Zap, Filter, Wifi, Clock, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, ArrowLeft, Edit, Copy, Sparkles, TrendingUp, BookOpen, FileText } from 'lucide-react'
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
  source: 'adzuna' | 'jsearch' | 'himalayas'
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
  adzuna: 'Adzuna',
  jsearch: 'Google Jobs',
  himalayas: 'Himalayas',
  linkedin: 'LinkedIn',
}

const SOURCE_COLORS: Record<string, string> = {
  adzuna: 'bg-blue-50 text-blue-600 border-blue-100',
  jsearch: 'bg-green-50 text-green-600 border-green-100',
  himalayas: 'bg-purple-50 text-purple-600 border-purple-100',
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

import occupations from '@/lib/occupations.json'

const JOB_SUGGESTIONS: string[] = occupations

export default function JobsPage() {
  const navigate = useNavigate()
  const { data: onboarding } = useOnboardingStore()
  const { drafts } = useDraftStore()
  const resumeData = useTemplateResumeStore((s) => s.data)
  const { profile } = useProfileStore()

  // Smart defaults from profile
  const smartQuery = profile.targetRoles[0] || profile.jobTitle || onboarding.jobTitle || ''
  const smartLocation = profile.targetLocations[0] || profile.location || onboarding.location || ''

  const [query, setQuery] = useState(smartQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [magicMode, setMagicMode] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (val.trim().length >= 2) {
      const filtered = JOB_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 7)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (s: string) => {
    setQuery(s)
    setShowSuggestions(false)
  }
  const [location, setLocation] = useState(smartLocation)
  const [typeFilter, setTypeFilter] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(profile.openToRemote)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedDraftId, setSelectedDraftId] = useState<string>('')
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [checkingCompat, setCheckingCompat] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setJobs([])
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: query, location, type: typeFilter, remote: remoteOnly ? 'true' : '' })
      const res = await apiFetch(`${API_BASE}/api/jobs/search?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setJobs(data.jobs ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [query, location, typeFilter, remoteOnly])

  // Auto-search on mount if profile has a target role
  useEffect(() => {
    if (smartQuery) {
      setLoading(true)
      setHasSearched(true)
      const params = new URLSearchParams({ q: smartQuery, location: smartLocation, remote: profile.openToRemote ? 'true' : '' })
      apiFetch(`${API_BASE}/api/jobs/search?${params}`)
        .then(r => r.json())
        .then(d => setJobs(d.jobs ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Magic search — auto-searches using profile data
  const startWithMagic = useCallback(async () => {
    const magicQuery = profile.targetRoles[0] || profile.jobTitle || onboarding.jobTitle || resumeData.personalInfo?.title || ''
    const magicLoc = profile.openToRemote ? '' : (profile.targetLocations[0] || profile.location || '')
    if (!magicQuery) return
    setQuery(magicQuery)
    setLocation(magicLoc)
    setMagicMode(true)
    setMagicLoading(true)
    setLoading(true)
    setError('')
    setJobs([])
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: magicQuery, location: magicLoc, remote: profile.openToRemote ? 'true' : '' })
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
    return (
      <AppLayout>
        <div className="h-full overflow-y-auto bg-[#f4f5f7]">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <button onClick={() => { setSelectedJob(null); setCompatibility(null) }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft size={15} /> Back to results
            </button>

            <div className="grid grid-cols-5 gap-6">
              {/* Left — job header + meta */}
              <div className="col-span-3 space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {selectedJob.logo
                      ? <img src={selectedJob.logo} alt={selectedJob.company} className="w-12 h-12 rounded-xl object-contain border border-gray-100" />
                      : <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">{selectedJob.company[0]}</div>
                    }
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-gray-900">{selectedJob.title}</h1>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Building2 size={13} />{selectedJob.company}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} />{selectedJob.location}</span>
                        {selectedJob.salary !== 'Not specified' && <span className="text-green-600 font-medium">{selectedJob.salary}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${SOURCE_COLORS[selectedJob.source]}`}>
                          {SOURCE_LABELS[selectedJob.source]}
                        </span>
                        {selectedJob.remote && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1"><Wifi size={10} /> Remote</span>}
                        <span className="text-[11px] text-gray-400">{timeAgo(selectedJob.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {selectedJob.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedJob.tags.map((t) => (
                        <span key={t} className="text-xs border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full transition-colors">
                    Apply Now <ExternalLink size={13} />
                  </a>
                </div>

                {/* Job description */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-500 rounded-full inline-block" /> The Role
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedJob.description.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim()}
                  </div>
                </div>

                {/* Job meta */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" /> Job Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Company',         value: selectedJob.company },
                      { label: 'Location',        value: selectedJob.location || 'Not specified' },
                      { label: 'Employment Type', value: selectedJob.type || 'Not specified' },
                      { label: 'Salary',          value: selectedJob.salary },
                      { label: 'Remote',          value: selectedJob.remote ? 'Yes' : 'No' },
                      { label: 'Source',          value: SOURCE_LABELS[selectedJob.source] },
                      { label: 'Posted',          value: selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-gray-800 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — resume selector → compatibility → job description */}
              <div className="col-span-2 space-y-4">
                {/* Resume selector */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Select Resume</h3>

                  {drafts.length === 0 && !resumeData.personalInfo?.name ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <FileText size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">No resume yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Create a resume to check compatibility</p>
                      </div>
                      <button onClick={() => navigate('/resume/resume-1')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors">
                        Create Resume
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {resumeData.personalInfo?.name && (
                        <button onClick={() => { setSelectedDraftId(''); setCompatibility(null) }}
                          className="flex flex-col items-center gap-1.5 shrink-0">
                          <CurrentResumeThumbnail active={selectedDraftId === ''} />
                          <span className="text-[11px] text-gray-500 font-medium max-w-[143px] truncate">Current Resume</span>
                        </button>
                      )}
                      {drafts.map((draft) => (
                        <button key={draft.id} onClick={() => { setSelectedDraftId(draft.id); setCompatibility(null) }}
                          className="flex flex-col items-center gap-1.5 shrink-0">
                          <ResumeThumbnail draft={draft} active={selectedDraftId === draft.id} />
                          <span className="text-[11px] text-gray-500 font-medium max-w-[143px] truncate">{draft.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {(drafts.length > 0 || resumeData.personalInfo?.name) && (
                    <button onClick={checkCompatibility} disabled={checkingCompat}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                      {checkingCompat
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                        : <><Zap size={14} /> Check Compatibility</>}
                    </button>
                  )}
                </div>

                {/* Compatibility result */}
                {compatibility && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">Match Intelligence</h3>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 ${
                        compatibility.overallScore >= 75 ? 'border-green-400 text-green-600 bg-green-50'
                        : compatibility.overallScore >= 50 ? 'border-amber-400 text-amber-600 bg-amber-50'
                        : 'border-red-400 text-red-600 bg-red-50'
                      }`}>{compatibility.overallScore}%</div>
                    </div>
                    {[
                      { label: 'Technical Skills', score: compatibility.breakdown.technical },
                      { label: 'Domain Experience', score: compatibility.breakdown.experience },
                      { label: 'Keyword Match', score: compatibility.breakdown.keywords },
                    ].map(({ label, score }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 uppercase tracking-wide font-semibold">{label}</span>
                          <span className="font-bold text-gray-700">{score}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic leading-relaxed">"{compatibility.recommendation}"</div>
                    {compatibility.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Strengths</p>
                        <div className="space-y-1">
                          {compatibility.matchedSkills.slice(0, 3).map((s) => (
                            <p key={s} className="text-xs text-gray-600 flex items-start gap-1.5"><span className="text-green-500 mt-0.5 shrink-0">•</span>{s}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {compatibility.missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><AlertCircle size={12} className="text-amber-500" /> Missing Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {compatibility.missingSkills.slice(0, 6).map((s) => (
                            <span key={s} className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <button onClick={() => editWithDraft(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-purple-200 text-purple-600 text-sm font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                        <Edit size={13} /> Edit This Resume
                      </button>
                      <button onClick={() => editWithDraft(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <Copy size={13} /> Edit as Copy
                      </button>
                      <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        Apply Now <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Job description — below resume selector */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" /> Job Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Company',         value: selectedJob.company },
                      { label: 'Location',        value: selectedJob.location || 'Not specified' },
                      { label: 'Employment Type', value: selectedJob.type || 'Not specified' },
                      { label: 'Salary',          value: selectedJob.salary },
                      { label: 'Remote',          value: selectedJob.remote ? 'Yes' : 'No' },
                      { label: 'Source',          value: SOURCE_LABELS[selectedJob.source] },
                      { label: 'Posted',          value: selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-gray-800 font-medium text-xs">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ── Job List ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
              <p className="text-sm text-gray-400 mt-0.5">Search across Adzuna, Google Jobs & Himalayas in one place</p>
            </div>
            {/* Magic button */}
            <button
              onClick={startWithMagic}
              disabled={magicLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-70 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-200 transition-all"
            >
              {magicLoading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding your jobs...</>
                : <><Sparkles size={15} /> Start with Magic</>}
            </button>
          </div>

          {/* Search bar — always at top */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex gap-3">
              <div className="relative flex-1" ref={searchRef}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); search() } if (e.key === 'Escape') setShowSuggestions(false) }}
                  onFocus={() => query.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Job title, skill, or company..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => selectSuggestion(s)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Search size={12} className="text-gray-300 shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (optional)"
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 w-48"
                />
              </div>
              <button
                onClick={search}
                disabled={loading || !query.trim()}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={15} />}
                Search
              </button>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
              <Filter size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Filters:</span>
              {['full_time', 'part_time', 'contract', 'internship'].map((t) => (
                <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${typeFilter === t ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                  {t.replace('_', ' ')}
                </button>
              ))}
              <button onClick={() => setRemoteOnly(!remoteOnly)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${remoteOnly ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                <Wifi size={10} /> Remote only
              </button>
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

          {/* Job cards */}
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all cursor-pointer group"
                onClick={() => setSelectedJob(job)}
              >
                <div className="p-5 flex items-start gap-4">
                  {job.logo
                    ? <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-xl object-contain border border-gray-100 shrink-0" />
                    : <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">{job.company[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><Building2 size={11} />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                          {job.salary !== 'Not specified' && <span className="text-green-600 font-semibold">{job.salary}</span>}
                          {job.postedAt && <span className="flex items-center gap-1 text-gray-400"><Clock size={10} />{timeAgo(job.postedAt)}</span>}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[job.source]}`}>
                        {SOURCE_LABELS[job.source]}
                      </span>
                      {job.remote && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1"><Wifi size={9} /> Remote</span>}
                      {job.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[11px] border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
                <p className="text-xs mt-1">Results from Adzuna, Google Jobs & Himalayas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

