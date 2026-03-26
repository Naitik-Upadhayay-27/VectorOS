import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { apiFetch } from '@/lib/apiFetch'

export default function SummaryPanel() {
  const [open, setOpen] = useState(true)
  const [improving, setImproving] = useState(false)
  const [changes, setChanges] = useState<string[] | null>(null)
  const { data, setSummary } = useTemplateResumeStore()
  const { data: onboardingData } = useOnboardingStore()

  const handleImprove = async () => {
    if (!data.summary) return
    setImproving(true)
    setChanges(null)
    try {
      const res = await apiFetch('http://localhost:4000/api/ai/improve-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'summary',
          content: data.summary,
          targetRole: onboardingData.jobTitle,
          currentRole: onboardingData.currentCompany,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (typeof json.improved === 'string') setSummary(json.improved)
      if (json.changes?.length) setChanges(json.changes)
    } catch (e: any) {
      setChanges([`Error: ${e.message}`])
    } finally {
      setImproving(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Professional Summary</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          <textarea
            rows={4}
            placeholder="Write 2–3 sentences about your experience, key skills, and career goals..."
            value={data.summary ?? ''}
            onChange={(e) => { setSummary(e.target.value); setChanges(null) }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
          />

          <button
            onClick={handleImprove}
            disabled={improving || !data.summary}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-brand-200 bg-brand-50 text-brand-600 text-xs font-medium rounded-lg hover:bg-brand-100 disabled:opacity-40 transition-colors"
          >
            {improving
              ? <><div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /> Improving...</>
              : <><Sparkles size={12} /> Improve with AI</>}
          </button>

          {changes && (
            <div className="p-2.5 bg-brand-50 border border-brand-100 rounded-lg">
              <p className="text-xs font-semibold text-brand-600 mb-1 flex items-center gap-1">
                <Sparkles size={11} /> Changes made
              </p>
              <ul className="space-y-0.5">
                {changes.map((c, i) => (
                  <li key={i} className="text-xs text-brand-700 flex items-start gap-1">
                    <span className="shrink-0 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
              <button onClick={() => setChanges(null)} className="text-xs text-brand-400 hover:text-brand-600 mt-1">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
