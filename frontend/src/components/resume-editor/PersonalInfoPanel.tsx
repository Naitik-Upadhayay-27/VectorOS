import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronUp, Upload, Lightbulb, Search, Lock } from 'lucide-react'
import Input from '@/components/ui/Input'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

// Templates that show GitHub in their layout
const GITHUB_TEMPLATES = new Set([16, 17, 18, 19, 20])
// Templates that show a profile photo
const PHOTO_TEMPLATES = new Set([22, 24, 25])

function JobTitleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/ai/job-titles?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSuggestions(data.titles ?? [])
      } catch { setSuggestions([]) }
    }, 200)
  }, [])

  const pick = (title: string) => {
    setQuery(title); onChange(title); setSuggestions([]); setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={wrapRef}>
      <label className="text-xs font-medium text-gray-500 block mb-1">Job Title</label>
      <div className="relative">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); search(e.target.value) }}
          onFocus={() => { setOpen(true); if (query) search(query) }}
          placeholder="Software Engineer"
          className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-y-auto max-h-48">
          {suggestions.map(s => (
            <button key={s} onMouseDown={e => { e.preventDefault(); pick(s) }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PersonalInfoPanel() {
  const [open, setOpen] = useState(true)
  const [tipsOpen, setTipsOpen] = useState(false)
  const { data, setPersonalInfo, setContact, activeTemplateId } = useTemplateResumeStore()
  const info = data.personalInfo ?? {}
  const contact = info.contact ?? {}
  const photoRef = useRef<HTMLInputElement>(null)

  const githubEnabled = GITHUB_TEMPLATES.has(activeTemplateId)
  const photoEnabled  = PHOTO_TEMPLATES.has(activeTemplateId)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPersonalInfo({ image: reader.result as string })
    reader.readAsDataURL(file)
    if (photoRef.current) photoRef.current.value = ''
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Personal Information</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="w-full flex items-center justify-between py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb size={12} className="text-yellow-500" />
              Tips and Recommendations
            </span>
            {tipsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {tipsOpen && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
              Use a professional email and include your LinkedIn URL to increase recruiter response rates.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" placeholder="Your name"
              value={info.name ?? ''} onChange={(e) => setPersonalInfo({ name: e.target.value })} />
            <JobTitleInput value={info.title ?? ''} onChange={(v) => setPersonalInfo({ title: v })} />
            <Input label="Email" placeholder="email@example.com"
              value={contact.email ?? ''} onChange={(e) => setContact({ email: e.target.value })} />
            <Input label="Phone" placeholder="+1 (555) 000-0000"
              value={contact.phone ?? ''} onChange={(e) => setContact({ phone: e.target.value })} />
            <Input label="Location" placeholder="New York, NY"
              value={contact.location ?? ''} onChange={(e) => setContact({ location: e.target.value })} />
            <Input label="LinkedIn" placeholder="linkedin.com/in/you"
              value={contact.linkedin ?? ''} onChange={(e) => setContact({ linkedin: e.target.value })} />
          </div>

          {/* GitHub — only enabled for templates that show it */}
          <div className={!githubEnabled ? 'opacity-40 pointer-events-none select-none' : ''}>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-xs font-medium text-gray-500">GitHub</label>
              {!githubEnabled && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Lock size={9} /> not used in this template
                </span>
              )}
            </div>
            <input
              disabled={!githubEnabled}
              placeholder="github.com/you"
              value={contact.github ?? ''}
              onChange={(e) => setContact({ github: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400 disabled:bg-gray-50"
            />
          </div>

          {/* Profile Photo — only enabled for templates that show it */}
          <div className={!photoEnabled ? 'opacity-40 pointer-events-none select-none' : ''}>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-xs font-medium text-gray-500">Profile Photo</label>
              {!photoEnabled && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Lock size={9} /> not used in this template
                </span>
              )}
            </div>
            <div
              onClick={() => photoEnabled && photoRef.current?.click()}
              className={`flex items-center gap-3 px-3 py-2 border border-dashed border-gray-300 rounded-lg transition-colors ${
                photoEnabled ? 'cursor-pointer hover:border-brand-400 hover:bg-brand-50/30' : 'cursor-not-allowed'
              }`}
            >
              {info.image ? (
                <img src={info.image} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Upload size={14} className="text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-600">{info.image ? 'Change photo' : 'Upload photo'}</p>
                <p className="text-[10px] text-gray-400">JPG or PNG, max 5MB</p>
              </div>
              {info.image && photoEnabled && (
                <button
                  onClick={e => { e.stopPropagation(); setPersonalInfo({ image: undefined }) }}
                  className="ml-auto text-[10px] text-red-400 hover:text-red-600 shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Optional. Not recommended for US/Canada resumes.</p>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={handlePhotoUpload} disabled={!photoEnabled} />
          </div>
        </div>
      )}
    </div>
  )
}
