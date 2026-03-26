import { useState, useRef, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ResumeTopBar from '@/components/resume-editor/ResumeTopBar'
import PersonalInfoPanel from '@/components/resume-editor/PersonalInfoPanel'
import SectionPanel from '@/components/resume-editor/SectionPanel'
import SummaryPanel from '@/components/resume-editor/SummaryPanel'
import TemplateLivePreview from '@/components/resume-editor/TemplateLivePreview'
import TemplatePicker from '@/components/resume-editor/TemplatePicker'
import ChatPanel from '@/components/chat/ChatPanel'
import ResumeAnalysisPanel from '@/components/resume-editor/ResumeAnalysisPanel'
import { useChatStore } from '@/store/chatStore'
import { PanelLeftClose, PanelLeftOpen, GripVertical } from 'lucide-react'

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
  const { isOpen: chatOpen } = useChatStore()
  const location = useLocation()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  // Auto-print when navigated with ?print=1
  useEffect(() => {
    if (location.search.includes('print=1')) {
      setTimeout(() => window.print(), 800)
    }
  }, [location.search])

  // Panel visibility
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
        <ResumeTopBar onOpenTemplates={() => setShowTemplatePicker(true)} />

        <div ref={containerRef} className="flex flex-1 overflow-hidden select-none">

          {/* ── Left panel ─────────────────────────────────────────────── */}
          {leftOpen && (
            <div
              style={{ width: leftW }}
              className="bg-surface-50 border-r border-gray-100 overflow-y-auto p-3 space-y-3 shrink-0 transition-none"
            >
              <ResumeAnalysisPanel />
              <PersonalInfoPanel />
              <SummaryPanel />
              {sections.map((s) => (
                <SectionPanel key={s.type} type={s.type} title={s.title} />
              ))}
            </div>
          )}

          {/* ── Left resize handle ─────────────────────────────────────── */}
          <div
            onMouseDown={leftOpen ? startDrag('left') : undefined}
            className="relative flex items-center justify-center w-3 shrink-0 group z-10"
            style={{ cursor: leftOpen ? 'col-resize' : 'default' }}
          >
            {/* Visible drag bar */}
            {leftOpen && (
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 group-hover:bg-brand-400 group-active:bg-brand-500 transition-colors" />
            )}

            {/* Toggle button — sits on the divider */}
            <button
              onClick={() => setLeftOpen((v) => !v)}
              title={leftOpen ? 'Hide editor panel' : 'Show editor panel'}
              className="absolute top-1/2 -translate-y-1/2 z-20 w-5 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-brand-500 hover:border-brand-300 transition-all"
            >
              {leftOpen
                ? <PanelLeftClose size={12} />
                : <PanelLeftOpen  size={12} />
              }
            </button>
          </div>

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

