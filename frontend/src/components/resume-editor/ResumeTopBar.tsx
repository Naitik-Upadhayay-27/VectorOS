import { useState, useRef, useEffect } from 'react'
import { Download, Layout, Palette, Minus, Plus, MessageSquare, Save, FilePlus, Check, Pencil } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useResumeStore } from '@/store/resumeStore'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useDraftStore } from '@/store/draftStore'
import { useAtsStore } from '@/store/atsStore'

interface ResumeTopBarProps {
  onOpenTemplates?: () => void
  onDownload?: () => void
  onOpenLayout?: () => void
  downloading?: boolean
}

export default function ResumeTopBar({ onOpenTemplates, onDownload, onOpenLayout, downloading }: ResumeTopBarProps) {
  const { zoom, setZoom } = useResumeStore()
  const { toggleChat, isOpen, messages, editLog } = useChatStore()
  const { resetOnboarding } = useAuthStore()
  const { openOnboarding, reset: resetOnboarding2 } = useOnboardingStore()
  const { data, activeTemplateId, sectionOrder, layout } = useTemplateResumeStore()
  const { saveDraft, activeDraftId, drafts } = useDraftStore()

  // Draft name — editable
  const activeDraft = drafts.find((d) => d.id === activeDraftId)
  const [draftName, setDraftName] = useState(activeDraft?.name ?? 'Untitled Resume')
  const [editingName, setEditingName] = useState(false)
  const [saved, setSaved] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeDraft) setDraftName(activeDraft.name)
  }, [activeDraftId])

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  const handleSaveDraft = () => {
    const id = activeDraftId ?? crypto.randomUUID()
    saveDraft({
      id,
      name: draftName,
      templateId: activeTemplateId,
      resumeData: data,
      sectionOrder,
      layout,
      chatMessages: messages,
      editLog,
      atsResult: useAtsStore.getState().result,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleStartNew = () => {
    resetOnboarding()
    resetOnboarding2()
    const { resetData } = useTemplateResumeStore.getState()
    resetData({
      personalInfo: { name: '', title: '', contact: {} },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
    })
    useChatStore.getState().clearMessages()
    useAtsStore.getState().clearResult()
    useDraftStore.getState().setActiveDraft(null)
    openOnboarding()
  }

  return (
    <div className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 gap-3">
      {/* Left — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Start New */}
        <button
          onClick={handleStartNew}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-500 font-medium transition-colors"
          title="Start a new resume from scratch or upload a new PDF"
        >
          <FilePlus size={14} />
          New
        </button>

        {/* Analyze Resume */}
        <Button size="sm" className="gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Analyze Resume
        </Button>

        {/* Hide/Show Assistant */}
        <button
          onClick={toggleChat}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          <MessageSquare size={14} />
          {isOpen ? 'Hide' : 'Show'} Assistant
        </button>
      </div>

      {/* Center — editable draft name */}
      <div className="flex items-center gap-1.5 min-w-0">
        {editingName ? (
          <input
            ref={nameRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false) }}
            className="text-sm font-semibold text-gray-800 border-b border-brand-400 outline-none bg-transparent text-center w-48"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 group"
          >
            <span className="truncate max-w-[180px]">{draftName}</span>
            <Pencil size={11} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
          </button>
        )}
      </div>

      {/* Right — style/template/zoom/save/download */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={onOpenLayout}>
          <Palette size={13} />
          Layout &amp; Style
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenTemplates}>
          <Layout size={13} />
          Templates
        </Button>

        {/* Zoom */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="text-gray-400 hover:text-gray-700">
            <Minus size={12} />
          </button>
          <span className="text-xs font-medium text-gray-600 w-8 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="text-gray-400 hover:text-gray-700">
            <Plus size={12} />
          </button>
        </div>

        {/* Save Draft */}
        <button
          onClick={handleSaveDraft}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            saved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-500'
          }`}
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? 'Saved!' : 'Save Draft'}
        </button>

        <Button size="sm" onClick={onDownload} disabled={downloading}>
          {downloading
            ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
            : <><Download size={13} /> Download PDF</>}
        </Button>
      </div>
    </div>
  )
}

