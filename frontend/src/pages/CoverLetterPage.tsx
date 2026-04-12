import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Sparkles, RefreshCw, Pencil, Eye, Check, Wand2, Camera, X, Minus, Plus, PenLine } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import CoverLetterTemplate1 from '@/components/cover-letter/CoverLetterTemplate1'
import CoverLetterTemplate2 from '@/components/cover-letter/CoverLetterTemplate2'
import CoverLetterTemplate3 from '@/components/cover-letter/CoverLetterTemplate3'
import CoverLetterTemplate4 from '@/components/cover-letter/CoverLetterTemplate4'
import CoverLetterTemplate5 from '@/components/cover-letter/CoverLetterTemplate5'
import CoverLetterTemplate6 from '@/components/cover-letter/CoverLetterTemplate6'
import CoverLetterTemplate7 from '@/components/cover-letter/CoverLetterTemplate7'
import CoverLetterTemplate8 from '@/components/cover-letter/CoverLetterTemplate8'
import CoverLetterTemplate9 from '@/components/cover-letter/CoverLetterTemplate9'
import CoverLetterTemplate10 from '@/components/cover-letter/CoverLetterTemplate10'
import CoverLetterTemplate11 from '@/components/cover-letter/CoverLetterTemplate11'
import CoverLetterTemplate12 from '@/components/cover-letter/CoverLetterTemplate12'
import CoverLetterTemplate13 from '@/components/cover-letter/CoverLetterTemplate13'
import CoverLetterTemplate14 from '@/components/cover-letter/CoverLetterTemplate14'
import CoverLetterTemplate15 from '@/components/cover-letter/CoverLetterTemplate15'
import CoverLetterTemplate16 from '@/components/cover-letter/CoverLetterTemplate16'
import { printResume, printCoverLetter } from '@/lib/printResume'
import { EditableContext } from '@/components/resume-editor/EditableContext'

const CL_TEMPLATES = [
  { id: 15, label: 'Grey Sidebar',   defaultAccent: '#444444', component: CoverLetterTemplate15 },
  { id: 13, label: 'B&W Modern',     defaultAccent: '#e07b2a', component: CoverLetterTemplate13 },
  { id: 14, label: 'Simple Modern',  defaultAccent: '#111111', component: CoverLetterTemplate14 },
  { id: 16, label: 'Dark Bold',      defaultAccent: '#222222', component: CoverLetterTemplate16 },
  { id: 12, label: 'Geometric',      defaultAccent: '#1a2744', component: CoverLetterTemplate12 },
  { id: 9,  label: 'Dark Header',    defaultAccent: '#1a2e44', component: CoverLetterTemplate9 },
  { id: 11, label: 'Elegant',        defaultAccent: '#111111', component: CoverLetterTemplate11 },
  { id: 6,  label: 'Sidebar',        defaultAccent: '#4b5563', component: CoverLetterTemplate6 },
  { id: 1,  label: 'Professional',   defaultAccent: '#1e3a5f', component: CoverLetterTemplate1 },
  { id: 2,  label: 'Creative',       defaultAccent: '#7c3aed', component: CoverLetterTemplate2 },
  { id: 7,  label: 'Bold Header',    defaultAccent: '#111111', component: CoverLetterTemplate7 },
  { id: 8,  label: 'Letterhead',     defaultAccent: '#111111', component: CoverLetterTemplate8 },
  { id: 10, label: 'ATS Clean',      defaultAccent: '#b8960c', component: CoverLetterTemplate10 },
  { id: 3,  label: 'Graduate',       defaultAccent: '#16a34a', component: CoverLetterTemplate3 },
  { id: 4,  label: 'Career Switch',  defaultAccent: '#ea580c', component: CoverLetterTemplate4 },
  { id: 5,  label: 'Minimal',        defaultAccent: '#111111', component: CoverLetterTemplate5 },
]

const TONES = [
  { value: 'professional',    label: 'Professional',     emoji: '💼' },
  { value: 'creative',        label: 'Creative',         emoji: '🎨' },
  { value: 'entry-level',     label: 'Entry-Level',      emoji: '🎓' },
  { value: 'career-switcher', label: 'Career Switch',    emoji: '🔄' },
]

const PAGE_W     = 794
const PAGE_H     = 1123
const THUMB_SCALE = 0.175
const THUMB_W    = Math.round(PAGE_W * THUMB_SCALE)  // ≈ 139px
const THUMB_H    = Math.round(PAGE_H * THUMB_SCALE)  // ≈ 197px

// ── Inline photo upload panel for the left sidebar ───────────────────────────
function PhotoUploadPanel({ photo, onPhoto }: { photo?: string; onPhoto: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 hover:border-brand-400 overflow-hidden flex items-center justify-center cursor-pointer transition-colors shrink-0 bg-gray-50"
      >
        {photo
          ? <img src={photo} alt="Photo" className="w-full h-full object-cover" />
          : <Camera size={18} className="text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full text-xs font-medium text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1.5 transition-colors flex items-center justify-center gap-1.5"
        >
          <Camera size={12} /> {photo ? 'Change Photo' : 'Upload Photo'}
        </button>
        {photo && (
          <button
            onClick={() => onPhoto('')}
            className="w-full mt-1 text-xs text-gray-400 hover:text-red-400 flex items-center justify-center gap-1 transition-colors"
          >
            <X size={10} /> Remove
          </button>
        )}
        <p className="text-[10px] text-gray-400 mt-1 text-center">JPG or PNG · shown in template</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function SignatureUploadPanel({ signature, onSignature }: { signature?: string; onSignature: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onSignature(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      {/* Guidance */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <p className="text-[10px] text-amber-700 leading-relaxed">
          <span className="font-semibold">Tip:</span> Remove the background from your signature image before uploading for a clean look. Use{' '}
          <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="underline font-medium">remove.bg</a> (free).
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 hover:border-brand-400 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-colors bg-gray-50 hover:bg-brand-50"
      >
        {signature ? (
          <img src={signature} alt="Signature preview" className="max-h-16 max-w-full object-contain" />
        ) : (
          <>
            <PenLine size={20} className="text-gray-300" />
            <p className="text-xs text-gray-400 text-center">Click to upload signature image<br /><span className="text-[10px]">PNG with transparent bg recommended</span></p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 text-xs font-medium text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1.5 transition-colors flex items-center justify-center gap-1.5"
        >
          <PenLine size={11} /> {signature ? 'Change' : 'Upload'}
        </button>
        {signature && (
          <button
            onClick={() => onSignature('')}
            className="text-xs text-gray-400 hover:text-red-400 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Remove
          </button>
        )}
      </div>

      {signature && (
        <p className="text-[10px] text-gray-400 text-center">Drag the signature on the preview to reposition · drag corner to resize</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function TemplateRenderer({ templateId, data, accentColor }: { templateId: number; data: any; accentColor: string }) {  const T = CL_TEMPLATES.find(t => t.id === templateId)?.component ?? CoverLetterTemplate1
  return <T data={data} accentColor={accentColor} />
}

// ── Scaled A4 preview — fits the center column, renders at true 794px for PDF ─
function CoverLetterPreview({
  templateId, data, accentColor, editMode, setEditMode, previewRef, zoom,
}: {
  templateId: number; data: any; accentColor: string
  editMode: boolean; setEditMode: (v: (p: boolean) => boolean) => void
  previewRef: React.RefObject<HTMLDivElement | null>
  zoom: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseScale, setBaseScale] = useState(1)

  // Recompute base scale whenever the container resizes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const available = el.clientWidth - 48
      setBaseScale(Math.min(1, available / PAGE_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sync hidden measure ref
  useEffect(() => {
    if (previewRef && measureRef.current) {
      (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = measureRef.current
    }
  })

  const measureRef = useRef<HTMLDivElement>(null)

  const scale    = baseScale * (zoom / 100)
  const scaledW  = PAGE_W * scale
  const scaledH  = PAGE_H * scale

  return (
    <div ref={containerRef} className="flex-1 relative bg-[#dde1ed] overflow-auto">
      {/* Edit / Preview toggle */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={() => setEditMode(v => !v)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all',
            editMode
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
          ].join(' ')}
        >
          {editMode ? <><Eye size={12} /> Preview</> : <><Pencil size={12} /> Edit</>}
        </button>
      </div>

      {/* Hidden true-size div for PDF export */}
      <div
        ref={measureRef}
        data-resume-measure
        style={{ position: 'absolute', top: 0, left: 0, width: PAGE_W, height: 'auto', visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}
      >
        <EditableContext.Provider value={{ editMode: false }}>
          <TemplateRenderer templateId={templateId} data={data} accentColor={accentColor} />
        </EditableContext.Provider>
      </div>

      {/* Scaled visible page — always A4 aspect ratio */}
      <div className="flex flex-col items-center py-8">
        <div style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
          {/* Clip wrapper */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden',
            boxShadow: editMode ? '0 0 0 2px #3b82f6, 0 4px 20px rgba(0,0,0,0.15)' : '0 2px 16px rgba(0,0,0,0.15)',
            borderRadius: 2,
          }}>
            <EditableContext.Provider value={{ editMode }}>
              <div style={{
                width: PAGE_W,
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                pointerEvents: editMode ? 'auto' : 'none',
                cursor: editMode ? 'text' : 'default',
              }}>
                <TemplateRenderer templateId={templateId} data={data} accentColor={accentColor} />
              </div>
            </EditableContext.Provider>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-3 pointer-events-none">
          <div className="bg-blue-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg">
            Click any text to edit · Enter to confirm · Esc to cancel
          </div>
        </div>
      )}
    </div>
  )
}

export default function CoverLetterPage() {
  const navigate = useNavigate()
  const { data, templateId, generating, jobDescription, setData, setTemplate, setGenerating, setJobDescription } = useCoverLetterStore()
  const resumeData = useTemplateResumeStore((s) => s.data)

  const [accentColor, setAccentColor] = useState(
    CL_TEMPLATES.find(t => t.id === templateId)?.defaultAccent ?? '#1e3a5f'
  )
  const [tone, setTone]             = useState('professional')
  const [downloading, setDownloading] = useState(false)
  const [editMode, setEditMode]     = useState(false)
  const [zoom, setZoom]             = useState(100)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pi = resumeData.personalInfo
    if (!pi) return
    setData({
      name:     pi.name              || '',
      email:    pi.contact?.email    || '',
      phone:    pi.contact?.phone    || '',
      linkedin: pi.contact?.linkedin || '',
      address:  pi.contact?.location || '',
      city:     '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTemplateChange = (id: number) => {
    setTemplate(id)
    setAccentColor(CL_TEMPLATES.find(t => t.id === id)?.defaultAccent ?? '#1e3a5f')
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const resumeText = [
        resumeData.personalInfo?.name,
        resumeData.personalInfo?.title,
        resumeData.summary,
        resumeData.experience?.map(e =>
          `${e.title} at ${e.company}${e.location ? `, ${e.location}` : ''} (${e.startDate} – ${e.endDate}): ${e.description?.join('; ')}`
        ).join('\n'),
        resumeData.education?.map(e => `${e.degree} from ${e.institution}`).join('\n'),
        resumeData.skills?.map(s => `${s.category}: ${s.skills.join(', ')}`).join('\n'),
        resumeData.projects?.map(p => `Project: ${p.name}`).join('\n'),
      ].filter(Boolean).join('\n\n')

      const res = await apiFetch(`${API_BASE}/api/ai/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription || `Position: ${data.jobTitle || 'the role'} at ${data.companyName || 'the company'}`,
          tone,
        }),
      })
      const json = await res.json()
      const updates: Partial<typeof data> = {}
      if (json.coverLetter) updates.body = json.coverLetter
      if (json.hiringManager && (!data.hiringManager || data.hiringManager === 'Hiring Manager'))
        updates.hiringManager = json.hiringManager
      if (json.jobTitle && !data.jobTitle) updates.jobTitle = json.jobTitle
      if (json.companyName && !data.companyName) updates.companyName = json.companyName
      if (Object.keys(updates).length) setData(updates)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      await printCoverLetter(previewRef.current, `cover-letter-${data.name || 'draft'}`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-500 font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-700">Cover Letter Editor</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-medium text-gray-600 w-8 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            <Button size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                : <><Download size={13} /> Download PDF</>}
            </Button>
          </div>
        </div>

        {/* ── Three-column body ───────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT PANEL ══════════════════════════════════════════════ */}
          <div className="w-72 shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* ── AI Generate — top, redesigned ── */}
              <section>
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-brand-500 flex items-center justify-center shrink-0">
                    <Wand2 size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-none">AI Write</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Uses your resume automatically</p>
                  </div>
                </div>

                {/* Tone pills */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        tone === t.value
                          ? 'bg-violet-50 border-violet-300 text-violet-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>

                {/* JD box — always visible */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Job Description
                    <span className="ml-1 text-[10px] text-gray-400 font-normal">(paste for best results)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here — the AI will tailor your letter to match the role, keywords, and company..."
                    rows={7}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-400 resize-none leading-relaxed transition-colors"
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    generating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 to-brand-500 text-white hover:opacity-90 shadow-sm hover:shadow-md'
                  }`}
                >
                  {generating
                    ? <><RefreshCw size={14} className="animate-spin" /> Writing your letter...</>
                    : <><Sparkles size={14} /> Generate Cover Letter</>}
                </button>
              </section>

              <div className="h-px bg-gray-100" />

              {/* ── Job Details ── */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Details</p>
                <div className="space-y-2">
                  {([
                    ['jobTitle',       'Job Title'],
                    ['hiringManager',  'Hiring Manager Name'],
                    ['companyName',    'Company Name'],
                    ['companyAddress', 'Company Address'],
                    ['companyCity',    'City, State, ZIP'],
                  ] as [keyof typeof data, string][]).map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-400 block mb-0.5">{label}</label>
                      <input
                        value={(data[field] as string) ?? ''}
                        onChange={e => setData({ [field]: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white transition-colors"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-gray-100" />

              {/* ── Photo Upload — only for templates 6, 7 & 9 ── */}
              {(templateId === 6 || templateId === 7 || templateId === 9) && (
                <section>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile Photo</p>
                  <PhotoUploadPanel photo={data.photo} onPhoto={v => setData({ photo: v })} />
                </section>
              )}

              {(templateId === 6 || templateId === 7 || templateId === 9) && <div className="h-px bg-gray-100" />}

              {/* ── Signature Upload — all templates ── */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Signature</p>
                <SignatureUploadPanel
                  signature={data.signature}
                  onSignature={v => setData({ signature: v, signatureX: 0, signatureY: 0, signatureWidth: 160, signatureHeight: 80 })}
                />
              </section>

              <div className="h-px bg-gray-100" />
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Your Info</p>
                <p className="text-[10px] text-gray-400 mb-2">Auto-filled from your resume</p>
                <div className="space-y-2">
                  {([
                    ['name',     'Full Name'],
                    ['email',    'Email'],
                    ['phone',    'Phone'],
                    ['linkedin', 'LinkedIn (optional)'],
                    ['address',  'Address (optional)'],
                  ] as [keyof typeof data, string][]).map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-400 block mb-0.5">{label}</label>
                      <input
                        value={(data[field] as string) ?? ''}
                        onChange={e => setData({ [field]: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white transition-colors"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

          {/* ══ CENTER: live preview ════════════════════════════════════ */}
          <CoverLetterPreview
            templateId={templateId}
            data={data}
            accentColor={accentColor}
            editMode={editMode}
            setEditMode={setEditMode}
            previewRef={previewRef}
            zoom={zoom}
          />

          {/* ══ RIGHT: Canva-style template panel ══════════════════════ */}
          <div className="w-80 shrink-0 bg-white border-l border-gray-100 overflow-y-auto">
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Templates</p>

              <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                {CL_TEMPLATES.map(t => {
                  const isActive = templateId === t.id
                  const TComp = t.component

                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      className="group flex flex-col items-center gap-2 focus:outline-none"
                    >
                      <div
                        className="relative overflow-hidden rounded-xl transition-all duration-200"
                        style={{
                          width: THUMB_W,
                          height: THUMB_H,
                          outline: isActive ? `2.5px solid ${t.defaultAccent}` : '2.5px solid transparent',
                          outlineOffset: 3,
                          boxShadow: isActive
                            ? `0 0 0 4px ${t.defaultAccent}20, 0 6px 16px rgba(0,0,0,0.14)`
                            : '0 2px 10px rgba(0,0,0,0.10)',
                          transform: isActive ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        {/* Live thumbnail — renders actual user data */}
                        <div
                          style={{
                            width: PAGE_W,
                            height: PAGE_H,
                            transform: `scale(${THUMB_SCALE})`,
                            transformOrigin: 'top left',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          <EditableContext.Provider value={{ editMode: false }}>
                            <TComp data={data} accentColor={isActive ? accentColor : t.defaultAccent} />
                          </EditableContext.Provider>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl" />

                        {/* Active badge */}
                        {isActive && (
                          <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                            style={{ backgroundColor: t.defaultAccent }}
                          >
                            <Check size={12} className="text-white" />
                          </div>
                        )}

                        {/* Hover "Use" pill */}
                        {!isActive && (
                          <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-3 py-1 rounded-full shadow">
                              Use this
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className="text-xs font-semibold transition-colors"
                        style={{ color: isActive ? t.defaultAccent : '#9ca3af' }}
                      >
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
