import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useResumeUploadStore } from '@/store/resumeUploadStore'
import { TEMPLATES } from '@/components/resume-templates'
import { sampleData } from '@/lib/sampleResumeData'
import { AILoader } from '@/components/ui/AILoader'
import { DOMAINS } from '@/lib/domains'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import {
  Upload, FileText, Sparkles, ChevronRight, ChevronLeft,
  Check, X, Search, Briefcase, MapPin, DollarSign,
  Building2, Clock, Target
} from 'lucide-react'
import { useState } from 'react'

const PAGE_W = 794
const PAGE_H = 1123
const THUMB_SCALE = 0.19

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–9 years', '10+ years']
const EMPLOYMENT_OPTIONS  = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Open to all']
const SALARY_RANGES       = [
  'Under $40k', '$40k–$60k', '$60k–$80k', '$80k–$100k',
  '$100k–$130k', '$130k–$160k', '$160k–$200k', '$200k+', 'Prefer not to say',
]

const slide = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0  },
  exit:     { opacity: 0, x: -40 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

// ── Progress bar ────────────────────────────────────────────────────────────
const STEPS = ['start', 'template', 'personal', 'career', 'domain']
function ProgressBar({ step }: { step: string }) {
  const idx = STEPS.indexOf(step)
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STEPS.length) * 100)
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const { open, step, data, setStep, update, closeOnboarding } = useOnboardingStore()
  const { setTemplate } = useTemplateResumeStore()
  const { markOnboarded, user } = useAuthStore()
  const navigate = useNavigate()

  if (!open) return null

  const finish = () => {
    const { clearMessages } = useChatStore.getState()
    clearMessages()

    if (data.templateId) setTemplate(data.templateId)

    const resumeStore = useTemplateResumeStore.getState()

    if (data.resumeMode === 'upload') {
      if (data.fullName) resumeStore.setPersonalInfo({ name: data.fullName })
      if (data.jobTitle) resumeStore.setPersonalInfo({ title: data.jobTitle })
      if (data.location) resumeStore.setContact({ location: data.location })
    } else {
      resumeStore.resetData({
        personalInfo: {
          name: data.fullName || 'Your Name',
          title: data.jobTitle || 'Your Job Title',
          contact: {
            location: data.location || '',
            email: '', phone: '', linkedin: '', github: '',
          },
        },
        summary: '',
        experience: [], education: [], skills: [],
        projects: [], certificates: [], awards: [],
        languages: [], volunteer: [],
      })
    }

    // Auto-fill profile from onboarding data
    import('@/store/profileStore').then(({ useProfileStore }) => {
      const resumeData = useTemplateResumeStore.getState().data
      useProfileStore.getState().fillFromOnboarding({
        fullName: data.fullName || user?.name || '',
        jobTitle: data.jobTitle || '',
        location: data.location || '',
        email: resumeData.personalInfo?.contact?.email || user?.email || '',
        phone: resumeData.personalInfo?.contact?.phone || '',
        linkedin: resumeData.personalInfo?.contact?.linkedin || '',
        github: resumeData.personalInfo?.contact?.github || '',
        summary: resumeData.summary || '',
        currentCompany: data.currentCompany || '',
        yearsOfExperience: data.yearsOfExperience || '',
        employmentType: data.employmentType || 'full-time',
        currentSalary: data.currentSalary || '',
        expectedSalary: data.expectedSalary || '',
        targetDomains: data.targetDomains || [],
        targetRoles: data.jobTitle ? [data.jobTitle] : [],
        topSkills: resumeData.skills?.flatMap(s => s.skills).slice(0, 10) || [],
        avatar: user?.avatar || '',
      })
    })

    markOnboarded()
    closeOnboarding()
    navigate('/resume/resume-1')
  }

  const back: Record<string, string> = {
    template: 'start', personal: 'template', career: 'personal', domain: 'career',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={closeOnboarding}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Progress */}
        <div className="px-8 pt-6 pb-0">
          <ProgressBar step={step} />
        </div>

        {/* Step content */}
        <div className="px-8 py-6 flex flex-col" style={{ height: 520 }}>
          <AnimatePresence mode="wait">
            {step === 'start'    && <StepStart    key="start"    />}
            {step === 'template' && <StepTemplate key="template" />}
            {step === 'personal' && <StepPersonal key="personal" />}
            {step === 'career'   && <StepCareer   key="career"   />}
            {step === 'domain'   && <StepDomain   key="domain"   onFinish={finish} />}
          </AnimatePresence>
        </div>

        {/* Back nav */}
        {back[step] && (
          <div className="px-8 pb-5">
            <button
              onClick={() => setStep(back[step] as any)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={13} /> Back
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Step 1 — Upload or Scratch ──────────────────────────────────────────────
function StepStart() {
  const { update, setStep } = useOnboardingStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.')
      return
    }

    setUploading(true)
    update({ resumeMode: 'upload' })

    const formData = new FormData()
    formData.append('resume', file)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await apiFetch(`${API_BASE}/api/resumes/parse`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }

      const { data, rawText } = await res.json()

      // Bulk-fill the resume store
      useTemplateResumeStore.getState().resetData(data)

      // Store raw text for chat context
      useResumeUploadStore.getState().setResumeText(rawText)

      // Advance to template picker
      setStep('template')
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === 'AbortError') {
        setError('Upload timed out. Please try again.')
      } else {
        setError(err.message ?? 'Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <motion.div {...slide} className="flex flex-col flex-1">
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Step 1 of 5</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's build your resume 🚀</h2>
        <p className="text-sm text-gray-500">Do you have an existing resume, or would you like to start fresh?</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <X size={13} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Upload */}
        {uploading ? (
          <div className="col-span-2 flex items-center justify-center rounded-2xl border border-brand-100 bg-brand-50/30">
            <AILoader type="parsing" />
          </div>
        ) : (
        <button
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
            <Upload size={24} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">Upload Resume</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Import your existing PDF and we'll parse it automatically
            </p>
          </div>
          <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full font-medium">PDF only · max 10 MB</span>
        </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFile}
        />

        {/* Scratch — hide while uploading */}
        {!uploading && (
        <button
          onClick={() => { update({ resumeMode: 'scratch' }); setStep('template') }}
          className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <FileText size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">Start from Scratch</p>
            <p className="text-xs text-gray-500 leading-relaxed">Build a polished resume step by step with AI guidance</p>
          </div>
          <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">Recommended</span>
        </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Step 2 — Template picker ────────────────────────────────────────────────
function StepTemplate() {
  const { data, update, setStep } = useOnboardingStore()
  const [selected, setSelected] = useState<number | null>(data.templateId)

  const confirm = () => {
    if (!selected) return
    update({ templateId: selected })
    setStep('personal')
  }

  return (
    <motion.div {...slide} className="flex flex-col flex-1">
      <div className="mb-5">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Step 2 of 5</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Pick your template ✨</h2>
        <p className="text-sm text-gray-500">All templates are ATS-friendly. You can change this anytime.</p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-64 pr-1 mb-5">
        {TEMPLATES.map((t) => {
          const Comp = t.component
          const isActive = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-150"
                style={{
                  width: PAGE_W * THUMB_SCALE,
                  height: PAGE_H * THUMB_SCALE,
                  border: `2px solid ${isActive ? t.thumbnail : 'transparent'}`,
                  outline: isActive ? `2px solid ${t.thumbnail}` : '2px solid transparent',
                  boxShadow: isActive ? `0 0 0 3px ${t.thumbnail}33` : '0 1px 6px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    width: PAGE_W,
                    height: PAGE_H,
                    transform: `scale(${THUMB_SCALE})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                >
                  <Comp data={sampleData} />
                </div>
                {isActive && (
                  <div
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
                    style={{ background: t.thumbnail }}
                  >
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-700 truncate w-full text-center">
                {t.name}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={confirm}
        disabled={!selected}
        className="w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Use this template <ChevronRight size={15} />
      </button>
    </motion.div>
  )
}

// ── Step 3 — Personal details ───────────────────────────────────────────────
function StepPersonal() {
  const { data, update, setStep } = useOnboardingStore()
  const resumeData = useTemplateResumeStore.getState().data

  // Pre-fill from parsed resume on first render if fields are empty
  useState(() => {
    const patches: Partial<typeof data> = {}
    if (!data.fullName && resumeData.personalInfo?.name)
      patches.fullName = resumeData.personalInfo.name
    if (!data.jobTitle && resumeData.personalInfo?.title)
      patches.jobTitle = resumeData.personalInfo.title
    if (!data.location && resumeData.personalInfo?.contact?.location)
      patches.location = resumeData.personalInfo.contact.location
    if (Object.keys(patches).length) update(patches)
  })

  const next = () => {
    if (!data.fullName.trim()) return
    setStep('career')
  }

  return (
    <motion.div {...slide} className="flex flex-col flex-1">
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Step 3 of 5</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about yourself 👋</h2>
        <p className="text-sm text-gray-500">This helps us personalize your resume and job matches.</p>
      </div>

      <div className="space-y-4 flex-1">
        <Field
          icon={<Sparkles size={15} className="text-brand-400" />}
          label="Full Name *"
          placeholder="Alex Johnson"
          value={data.fullName}
          onChange={(v) => update({ fullName: v })}
        />
        <Field
          icon={<Briefcase size={15} className="text-purple-400" />}
          label="Current / Desired Job Title *"
          placeholder="Senior Software Engineer"
          value={data.jobTitle}
          onChange={(v) => update({ jobTitle: v })}
        />
        <Field
          icon={<MapPin size={15} className="text-green-400" />}
          label="Location"
          placeholder="San Francisco, CA / Remote"
          value={data.location}
          onChange={(v) => update({ location: v })}
        />
      </div>

      <button
        onClick={next}
        disabled={!data.fullName.trim()}
        className="mt-6 w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Continue <ChevronRight size={15} />
      </button>
    </motion.div>
  )
}

// ── Step 4 — Career details ─────────────────────────────────────────────────
function StepCareer() {
  const { data, update, setStep } = useOnboardingStore()
  const resumeData = useTemplateResumeStore.getState().data

  // Pre-fill current company from most recent experience
  useState(() => {
    if (!data.currentCompany) {
      const latestExp = resumeData.experience?.[0]
      if (latestExp?.company) update({ currentCompany: latestExp.company })
    }
  })

  return (
    <motion.div {...slide} className="flex flex-col flex-1">
      <div className="mb-5">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Step 4 of 5</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your career snapshot 💼</h2>
        <p className="text-sm text-gray-500">We use this to find the best-fit jobs and salary benchmarks for you.</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        <Field
          icon={<Building2 size={15} className="text-blue-400" />}
          label="Current Company"
          placeholder="Acme Inc. (or 'Unemployed / Freelance')"
          value={data.currentCompany}
          onChange={(v) => update({ currentCompany: v })}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            icon={<DollarSign size={15} className="text-green-400" />}
            label="Current Salary"
            value={data.currentSalary}
            options={SALARY_RANGES}
            onChange={(v) => update({ currentSalary: v })}
          />
          <SelectField
            icon={<DollarSign size={15} className="text-brand-400" />}
            label="Expected Salary"
            value={data.expectedSalary}
            options={SALARY_RANGES}
            onChange={(v) => update({ expectedSalary: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            icon={<Clock size={15} className="text-orange-400" />}
            label="Years of Experience"
            value={data.yearsOfExperience}
            options={EXPERIENCE_OPTIONS}
            onChange={(v) => update({ yearsOfExperience: v })}
          />
          <SelectField
            icon={<Briefcase size={15} className="text-purple-400" />}
            label="Employment Type"
            value={data.employmentType}
            options={EMPLOYMENT_OPTIONS}
            onChange={(v) => update({ employmentType: v })}
          />
        </div>
      </div>

      <button
        onClick={() => setStep('domain')}
        className="mt-5 w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
      >
        Continue <ChevronRight size={15} />
      </button>
    </motion.div>
  )
}

// ── Step 5 — Domain / Industry ──────────────────────────────────────────────
function StepDomain({ onFinish }: { onFinish: () => void }) {
  const { data, update } = useOnboardingStore()
  const [query, setQuery] = useState('')

  const suggestions = query.trim()
    ? DOMAINS.filter((d) => d.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  const toggle = (domain: string) => {
    const current = data.targetDomains
    update({
      targetDomains: current.includes(domain)
        ? current.filter((d) => d !== domain)
        : [...current, domain],
    })
    setQuery('')
  }

  return (
    <motion.div {...slide} className="flex flex-col flex-1">
      <div className="mb-5">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Step 5 of 5</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Where do you want to work? 🎯</h2>
        <p className="text-sm text-gray-500">Search and select domains. We'll tailor your job matches accordingly.</p>
      </div>

      {/* Search with dropdown */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search... e.g. Machine Learning, Finance"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
        />

        {/* Dropdown suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map((domain) => {
              const active = data.targetDomains.includes(domain)
              return (
                <button
                  key={domain}
                  onClick={() => toggle(domain)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                    active ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {active
                    ? <Check size={13} className="text-brand-500 shrink-0" />
                    : <span className="w-[13px] shrink-0" />
                  }
                  {domain}
                </button>
              )
            })}
            {query.trim() && DOMAINS.filter((d) => d.toLowerCase().includes(query.toLowerCase())).length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No domains found for "{query}"</p>
            )}
          </div>
        )}

        {/* Empty query hint */}
        {!query.trim() && data.targetDomains.length === 0 && (
          <p className="mt-2 text-xs text-gray-400">Start typing to see suggestions</p>
        )}
      </div>

      {/* Selected chips */}
      {data.targetDomains.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.targetDomains.map((d) => (
            <span
              key={d}
              className="flex items-center gap-1 px-2.5 py-1 bg-brand-500 text-white text-xs font-medium rounded-full"
            >
              {d}
              <button onClick={() => toggle(d)} className="hover:opacity-70">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={onFinish}
        disabled={data.targetDomains.length === 0}
        className="w-full py-3 bg-gradient-to-r from-brand-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
      >
        <Sparkles size={15} />
        Let's build my resume!
      </button>
    </motion.div>
  )
}

// ── Shared field components ─────────────────────────────────────────────────

function Field({ icon, label, placeholder, value, onChange }: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400 transition-colors"
      />
    </div>
  )
}

function SelectField({ icon, label, value, options, onChange }: {
  icon: React.ReactNode
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-white text-gray-700 transition-colors"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

