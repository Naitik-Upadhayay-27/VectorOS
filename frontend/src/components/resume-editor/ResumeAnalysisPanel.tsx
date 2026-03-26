import { useState } from 'react'
import { ChevronDown, ChevronUp, FileSearch, Target, Star, Zap, AlertCircle, CheckCircle2, TrendingUp, RotateCcw, Wand2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useChatStore } from '@/store/chatStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

interface ATSResult {
  overallScore: number
  breakdown: {
    keywordMatch:        { score: number; found: string[];       missing: string[] }
    formatting:          { score: number; issues: string[] }
    sectionCompleteness: { score: number; present: string[];     missing: string[] }
    quantification:      { score: number; examples: string[];    suggestions: string[] }
    actionVerbs:         { score: number; weak: string[];        suggestions: string[] }
  }
  topIssues:   string[]
  quickWins:   string[]
  gapAnalysis: string
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 28, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="72" height="72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{score}</text>
    </svg>
  )
}

function MiniBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? 'bg-green-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-7 text-right">{score}</span>
    </div>
  )
}

export default function ResumeAnalysisPanel() {
  const [open, setOpen]       = useState(true)
  const [mode, setMode]       = useState<'analyze' | 'tailor'>('analyze')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<ATSResult | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [jd, setJd]           = useState('')

  const { data } = useTemplateResumeStore()
  const { data: onboardingData } = useOnboardingStore()
  const { triggerMessage } = useChatStore()

  const fixResume = () => {
    if (!result) return
    const missing = result.breakdown.keywordMatch.missing ?? []
    const issues  = result.topIssues ?? []
    const wins    = result.quickWins ?? []

    // Build a tight imperative command — no markdown, no formatting
    // This ensures the AI enters EDIT mode and applies changes directly
    const parts: string[] = [
      'Apply all of the following fixes directly to my resume right now:',
    ]
    if (missing.length > 0)
      parts.push(`1. Add these missing keywords naturally into my skills and experience: ${missing.join(', ')}.`)
    if (issues.length > 0)
      parts.push(`2. Fix these issues: ${issues.join('; ')}.`)
    if (wins.length > 0)
      parts.push(`3. Apply these quick wins: ${wins.join('; ')}.`)
    if (result.gapAnalysis)
      parts.push(`4. Address this gap: ${result.gapAnalysis}`)
    parts.push('Make all edits now and confirm what you changed.')

    triggerMessage(parts.join('\n'))
  }

  const runATS = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`${API_BASE}/api/ai/ats-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: data,
          // Target role = what they want to become (onboarding job title)
          targetRole: onboardingData.jobTitle || data.personalInfo?.title,
          // Target domains = industries they want to work in
          targetDomains: onboardingData.targetDomains,
          // Current role = where they are now (for gap analysis)
          currentRole: data.personalInfo?.title || onboardingData.jobTitle,
          currentCompany: onboardingData.currentCompany,
          yearsOfExperience: onboardingData.yearsOfExperience,
          // Tailor mode: paste JD overrides everything
          jobDescription: mode === 'tailor' && jd ? jd : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const scoreLabel = (s: number) => s >= 75 ? 'Good' : s >= 50 ? 'Needs Work' : 'Poor'
  const scoreColor = (s: number) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-card overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Resume Analysis</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
      <div className="p-4 space-y-3">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(['analyze', 'tailor'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(null) }}
              className={clsx('flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                mode === m ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300')}>
              {m === 'analyze'
                ? <FileSearch size={15} className={mode === m ? 'text-brand-500' : 'text-gray-400'} />
                : <Target size={15} className={mode === m ? 'text-brand-500' : 'text-gray-400'} />}
              <div>
                <p className={clsx('text-xs font-semibold', mode === m ? 'text-brand-700' : 'text-gray-600')}>
                  {m === 'analyze' ? 'ATS Score' : 'Tailor to Job'}
                </p>
                <p className="text-xs text-gray-400">{m === 'analyze' ? 'Full ATS analysis' : 'Match job description'}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Tailor mode — JD input */}
        {mode === 'tailor' && (
          <textarea
            rows={3}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
          />
        )}

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Run button */}
        {!result && (
          <button onClick={runATS} disabled={loading}
            className="w-full py-2.5 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
              : <><Zap size={13} /> {mode === 'analyze' ? 'Run ATS Analysis' : 'Analyze & Tailor'}</>}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Score header */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <ScoreRing score={result.overallScore} />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">ATS Score</p>
                <p className={clsx('text-lg font-bold', scoreColor(result.overallScore))}>
                  {scoreLabel(result.overallScore)}
                </p>
                <p className="text-xs text-gray-400">{result.overallScore}/100 — {
                  result.overallScore >= 75 ? 'Likely to pass ATS screening'
                  : result.overallScore >= 50 ? 'May be filtered by some ATS'
                  : 'High risk of ATS rejection'
                }</p>
              </div>
            </div>

            {/* Score breakdown bars */}
            <div className="space-y-2 px-1">
              <MiniBar score={result.breakdown.keywordMatch.score}        label="Keyword Match" />
              <MiniBar score={result.breakdown.formatting.score}          label="Formatting" />
              <MiniBar score={result.breakdown.sectionCompleteness.score} label="Completeness" />
              <MiniBar score={result.breakdown.quantification.score}      label="Quantification" />
              <MiniBar score={result.breakdown.actionVerbs.score}         label="Action Verbs" />
            </div>

            {/* Gap analysis */}
            {result.gapAnalysis && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><TrendingUp size={12} /> Gap Analysis</p>
                {result.gapAnalysis}
              </div>
            )}

            {/* Quick wins */}
            {result.quickWins?.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Quick Wins
                </p>
                <ul className="space-y-1">
                  {result.quickWins.map((w, i) => (
                    <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top issues */}
            {result.topIssues?.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} /> Top Issues
                </p>
                <ul className="space-y-1">
                  {result.topIssues.map((issue, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">•</span>{issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing keywords */}
            {result.breakdown.keywordMatch.missing?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Missing Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {result.breakdown.keywordMatch.missing.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full border border-red-100">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Fix Resume — sends all issues to chat AI */}
            <button
              onClick={fixResume}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-brand-500 text-white text-xs font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Wand2 size={13} /> Fix Resume with AI
            </button>

            {/* Re-analyze after edits */}
            <button
              onClick={runATS}
              disabled={loading}
              className="w-full py-2.5 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                : <><RotateCcw size={12} /> Re-analyze after edits</>}
            </button>
          </div>
        )}

        {!result && !loading && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-700">How it works</span>
            </div>
            <p className="text-xs text-amber-600">
              Uses the same scoring criteria as Workday, Greenhouse & Lever — keyword density, section completeness, quantification rate, and action verb strength.
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

