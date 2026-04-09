import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronUp, Upload, Lightbulb, Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

function JobTitleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Keep local query in sync if parent value changes externally
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
    setQuery(title)
    onChange(title)
    setSuggestions([])
    setOpen(false)
  }

  // Close on outside click
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
  const { data, setPersonalInfo, setContact } = useTemplateResumeStore()
  const info = data.personalInfo ?? {}
  const contact = info.contact ?? {}
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPersonalInfo({ image: reader.result as string })
    reader.readAsDataURL(file)
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

          {/* Restart / Upload new resume banner */}
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
            <Input
              label="Full Name"
              placeholder="Your name"
              value={info.name ?? ''}
              onChange={(e) => setPersonalInfo({ name: e.target.value })}
            />
            <JobTitleInput
              value={info.title ?? ''}
              onChange={(v) => setPersonalInfo({ title: v })}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              value={contact.email ?? ''}
              onChange={(e) => setContact({ email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              value={contact.phone ?? ''}
              onChange={(e) => setContact({ phone: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="New York, NY"
              value={contact.location ?? ''}
              onChange={(e) => setContact({ location: e.target.value })}
            />
            <Input
              label="LinkedIn"
              placeholder="linkedin.com/in/you"
              value={contact.linkedin ?? ''}
              onChange={(e) => setContact({ linkedin: e.target.value })}
            />
          </div>

          <Input
            label="GitHub"
            placeholder="github.com/you"
            value={contact.github ?? ''}
            onChange={(e) => setContact({ github: e.target.value })}
          />

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Profile Photo</label>
            <button className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors w-full">
              <Upload size={13} />
              Upload Photo
            </button>
            <p className="text-xs text-gray-400 mt-1">Optional. Not recommended for US/Canada resumes.</p>
          </div>
        </div>
      )}
    </div>
  )
}

