import { useState, useRef, useCallback, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import ResumeTopBar from '@/components/resume-editor/ResumeTopBar'
import PersonalInfoPanel from '@/components/resume-editor/PersonalInfoPanel'
import SectionPanel from '@/components/resume-editor/SectionPanel'
import SummaryPanel from '@/components/resume-editor/SummaryPanel'
import TemplateLivePreview from '@/components/resume-editor/TemplateLivePreview'
import TemplatePicker from '@/components/resume-editor/TemplatePicker'
import LayoutStylePanel from '@/components/resume-editor/LayoutStylePanel'
import ChatPanel from '@/components/chat/ChatPanel'
import ResumeAnalysisPanel from '@/components/resume-editor/ResumeAnalysisPanel'
import { useChatStore } from '@/store/chatStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useDraftStore } from '@/store/draftStore'
import { useAtsStore } from '@/store/atsStore'
import { GripVertical } from 'lucide-react'
import { printResume } from '@/lib/printResume'

const sections = [
  { type: 'experience',     title: 'Work Experience' },
  { type: 'education',      title: 'Education' },
  { type: 'skills',         title: 'Skills' },
  { type: 'projects',       title: 'Projects' },
  { type: 'certifications', title: 'Certifications' },
  { type: 'languages',      title: 'Languages' },
  { type: 'volunteering',   title: 'Volunteering & Leadership' },
  { type: 'awards',         title: 'Awards' },
] as const

const MIN_LEFT  = 220
const MAX_LEFT  = 520
const MIN_RIGHT = 260
const MAX_RIGHT = 500

export default function ResumeEditorPage() {
  const { isOpen: chatOpen, messages, editLog } = useChatStore()
  const { data, activeTemplateId, sectionOrder, layout } = useTemplateResumeStore()
  const { saveDraft, activeDraftId, drafts } = useDraftStore()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showLayoutPanel, setShowLayoutPanel] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save 4s after any resume change (only if there's an active draft)
  useEffect(() => {
    if (!activeDraftId) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      const activeDraft = drafts.find(d => d.id === activeDraftId)
      saveDraft({
        id: activeDraftId,
        name: activeDraft?.name ?? 'Untitled Resume',
        templateId: activeTemplateId,
        resumeData: data,
        sectionOrder,
        layout,
        chatMessages: messages,
        editLog,
        atsResult: useAtsStore.getState().result,
      })
    }, 4000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [data, activeTemplateId, sectionOrder, layout])

  const handleDownload = async () => {
    const measureEl = document.querySelector<HTMLDivElement>('[data-resume-measure]')
    if (!measureEl) return
    setDownloading(true)
    try {
      await printResume(measureEl, 'resume')
    } finally {
      setDownloading(false)
    }
  }

  // Panel visibility — open by default
  const [leftOpen, setLeftOpen]   = useState(true)

  // Panel widths (px)
  const [leftW,  setLeftW]  = useState(320)
  const [rightW, setRightW] = useState(340)

  // ── Drag logic ──────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  const startDrag = useCallback(
    (side: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = side === 'left' ? leftW : rightW

      const onMove = (ev: MouseEvent) => {
        const delta = side === 'left'
          ? ev.clientX - startX
          : startX - ev.clientX

        if (side === 'left') {
          setLeftW(Math.min(MAX_LEFT, Math.max(MIN_LEFT, startW + delta)))
        } else {
          setRightW(Math.min(MAX_RIGHT, Math.max(MIN_RIGHT, startW + delta)))
        }
      }

      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [leftW, rightW]
  )

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <ResumeTopBar onOpenTemplates={() => setShowTemplatePicker(true)} onDownload={handleDownload} onOpenLayout={() => setShowLayoutPanel(true)} downloading={downloading} onToggleSidebar={() => setLeftOpen((v) => !v)} sidebarOpen={leftOpen} />

        <div ref={containerRef} className="flex flex-1 overflow-hidden select-none">

          {/* ── Left panel ─────────────────────────────────────────────── */}
          {leftOpen && (
            <div
              style={{ width: showLayoutPanel ? 300 : leftW }}
              className="bg-surface-50 border-r border-gray-100 overflow-y-auto shrink-0 transition-none"
            >
              {showLayoutPanel ? (
                <LayoutStylePanel onClose={() => setShowLayoutPanel(false)} />
              ) : (
                <div className="p-3 space-y-3">
                  <ResumeAnalysisPanel />
                  <PersonalInfoPanel />
                  <SummaryPanel />
                  {sections.map((s) => (
                    <SectionPanel key={s.type} type={s.type} title={s.title} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Left resize handle ─────────────────────────────────────── */}
          {leftOpen && (
            <div
              onMouseDown={startDrag('left')}
              className="relative flex items-center justify-center w-3 shrink-0 group z-10 cursor-col-resize"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 group-hover:bg-brand-400 group-active:bg-brand-500 transition-colors" />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-300 group-hover:text-brand-400 transition-colors">
                <GripVertical size={10} />
              </div>
            </div>
          )}

          {/* ── Center preview ─────────────────────────────────────────── */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
            <TemplateLivePreview />
          </div>

          {/* ── Right resize handle (only when chat is open) ───────────── */}
          {chatOpen && (
            <div
              onMouseDown={startDrag('right')}
              className="relative flex items-center justify-center w-3 shrink-0 group z-10 cursor-col-resize"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 group-hover:bg-brand-400 group-active:bg-brand-500 transition-colors" />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-300 group-hover:text-brand-400 transition-colors">
                <GripVertical size={10} />
              </div>
            </div>
          )}

          {/* ── Right chat panel ───────────────────────────────────────── */}
          {chatOpen && (
            <div style={{ width: rightW }} className="shrink-0 transition-none">
              <ChatPanel />
            </div>
          )}

        </div>
      </div>

      <TemplatePicker open={showTemplatePicker} onClose={() => setShowTemplatePicker(false)} />
    </AppLayout>
  )
}

