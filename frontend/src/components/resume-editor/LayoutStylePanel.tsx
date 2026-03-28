import { useState, useRef } from 'react'
import { X, GripVertical, User, Briefcase, BookOpen, Wrench, FolderOpen, Award, Globe, Heart, FileText, Settings, Layout } from 'lucide-react'
import { useTemplateResumeStore, SectionKey, SECTION_LABELS, DEFAULT_SECTION_ORDER, DEFAULT_LAYOUT } from '@/store/templateResumeStore'

const SECTION_ICONS: Record<SectionKey, React.ReactNode> = {
  summary:     <FileText size={14} />,
  experience:  <Briefcase size={14} />,
  education:   <BookOpen size={14} />,
  skills:      <Wrench size={14} />,
  projects:    <FolderOpen size={14} />,
  certificates:<Award size={14} />,
  awards:      <Award size={14} />,
  languages:   <Globe size={14} />,
  volunteer:   <Heart size={14} />,
}

interface Props { onClose: () => void }

export default function LayoutStylePanel({ onClose }: Props) {
  const [tab, setTab] = useState<'settings' | 'layout'>('settings')
  const { sectionOrder, setSectionOrder, layout, setLayout } = useTemplateResumeStore()

  // ── Drag-to-reorder ──────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const onDragStart = (i: number) => { dragIdx.current = i }
  const onDragEnter = (i: number) => setDragOver(i)
  const onDrop = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...sectionOrder]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    setSectionOrder(next)
    dragIdx.current = null
    setDragOver(null)
  }
  const onDragEnd = () => { dragIdx.current = null; setDragOver(null) }

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...sectionOrder]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setSectionOrder(next)
  }
  const moveDown = (i: number) => {
    if (i === sectionOrder.length - 1) return
    const next = [...sectionOrder]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setSectionOrder(next)
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-sm font-semibold text-gray-800">Layout &amp; Style</span>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 shrink-0">
        <button
          onClick={() => setTab('settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            tab === 'settings' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={12} /> Settings
        </button>
        <button
          onClick={() => setTab('layout')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            tab === 'layout' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout size={12} /> Layout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'settings' ? (
          <div className="p-4 space-y-4">
            {/* Reorder Sections */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Reorder Sections</p>
              <p className="text-[11px] text-gray-400 mb-3">Personal Information stays at top. Drag to reorder.</p>

              {/* Fixed personal info */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 mb-2">
                <User size={14} className="text-brand-500 shrink-0" />
                <span className="text-xs text-gray-700 flex-1">Personal Information</span>
                <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Fixed</span>
              </div>

              {/* Draggable sections */}
              <div className="space-y-1.5">
                {sectionOrder.map((key, i) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDrop={() => onDrop(i)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none ${
                      dragOver === i
                        ? 'border-brand-400 bg-brand-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <GripVertical size={14} className="text-gray-300 shrink-0" />
                    <span className="text-brand-500 shrink-0">{SECTION_ICONS[key]}</span>
                    <span className="text-xs text-gray-700 flex-1">{SECTION_LABELS[key]}</span>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      >▲</button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === sectionOrder.length - 1}
                        className="p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      >▼</button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}
                className="mt-3 text-[11px] text-gray-400 hover:text-brand-500 transition-colors"
              >
                Reset to default order
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Format */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Layout size={12} /> Format
              </p>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                A4 (8.27" × 11.69")
              </div>
            </div>

            {/* Margins & Paddings */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Margins &amp; Paddings</p>
              <div className="space-y-3">
                <SliderRow
                  label="TOP & BOTTOM"
                  value={layout.marginTopBottom}
                  min={20} max={100}
                  display={`${(layout.marginTopBottom / 100).toFixed(1)} in`}
                  onChange={(v) => setLayout({ marginTopBottom: v })}
                />
                <SliderRow
                  label="LEFT & RIGHT"
                  value={layout.marginLeftRight}
                  min={20} max={100}
                  display={`${(layout.marginLeftRight / 100).toFixed(1)} in`}
                  onChange={(v) => setLayout({ marginLeftRight: v })}
                />
                <SliderRow
                  label="BETWEEN SECTIONS"
                  value={layout.spacingBetweenSections}
                  min={4} max={24}
                  display={`${layout.spacingBetweenSections} pt`}
                  onChange={(v) => setLayout({ spacingBetweenSections: v })}
                />
                <SliderRow
                  label="BETWEEN TITLES & CONTENT"
                  value={layout.spacingTitleContent}
                  min={2} max={16}
                  display={`${layout.spacingTitleContent} pt`}
                  onChange={(v) => setLayout({ spacingTitleContent: v })}
                />
                <SliderRow
                  label="BETWEEN CONTENT BLOCKS"
                  value={layout.spacingContentBlocks}
                  min={2} max={20}
                  display={`${layout.spacingContentBlocks} pt`}
                  onChange={(v) => setLayout({ spacingContentBlocks: v })}
                />
              </div>
            </div>

            <button
              onClick={() => setLayout(DEFAULT_LAYOUT)}
              className="text-[11px] text-gray-400 hover:text-brand-500 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, display, onChange }: {
  label: string; value: number; min: number; max: number; display: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-[11px] text-gray-600 font-medium">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-brand-500 cursor-pointer"
      />
    </div>
  )
}
