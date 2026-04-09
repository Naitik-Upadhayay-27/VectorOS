import { useState, useRef } from 'react'
import { X, GripVertical, User, Briefcase, BookOpen, Wrench, FolderOpen, Award, Globe, Heart, FileText, Settings, Layout, RotateCcw } from 'lucide-react'
import { useTemplateResumeStore, SectionKey, SECTION_LABELS, DEFAULT_SECTION_ORDER, DEFAULT_LAYOUT, FONT_OPTIONS } from '@/store/templateResumeStore'

const SECTION_ICONS: Record<SectionKey, React.ReactNode> = {
  summary:      <FileText size={13} />,
  experience:   <Briefcase size={13} />,
  education:    <BookOpen size={13} />,
  skills:       <Wrench size={13} />,
  projects:     <FolderOpen size={13} />,
  certificates: <Award size={13} />,
  awards:       <Award size={13} />,
  languages:    <Globe size={13} />,
  volunteer:    <Heart size={13} />,
}

interface Props { onClose: () => void }

export default function LayoutStylePanel({ onClose }: Props) {
  const [tab, setTab] = useState<'settings' | 'layout'>('settings')
  const { sectionOrder, setSectionOrder, layout, setLayout } = useTemplateResumeStore()

  const dragIdx = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  const onDragStart = (i: number) => { dragIdx.current = i; setDragging(i) }
  const onDragEnter = (i: number) => setDragOver(i)
  const onDrop = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...sectionOrder]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    setSectionOrder(next)
    dragIdx.current = null; setDragOver(null); setDragging(null)
  }
  const onDragEnd = () => { dragIdx.current = null; setDragOver(null); setDragging(null) }
  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...sectionOrder]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setSectionOrder(next)
  }
  const moveDown = (i: number) => {
    if (i === sectionOrder.length - 1) return
    const next = [...sectionOrder]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; setSectionOrder(next)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-sm font-semibold text-gray-800">Layout &amp; Style</span>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex border-b border-gray-100 shrink-0">
        {(['settings', 'layout'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'settings' ? <><Settings size={12} /> Settings</> : <><Layout size={12} /> Layout</>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'settings' ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-700">Reorder Sections</p>
              <button onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-500 transition-colors">
                <RotateCcw size={10} /> Reset
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">Drag rows or use arrows to reorder.</p>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 mb-2">
              <div className="w-4 shrink-0" />
              <User size={13} className="text-brand-400 shrink-0" />
              <span className="text-xs text-gray-600 flex-1">Personal Information</span>
              <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Fixed</span>
            </div>

            <div className="space-y-1.5">
              {sectionOrder.map((key, i) => (
                <div key={key} draggable
                  onDragStart={() => onDragStart(i)} onDragEnter={() => onDragEnter(i)}
                  onDrop={() => onDrop(i)} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all select-none ${
                    dragging === i ? 'opacity-40 border-brand-300 bg-brand-50'
                    : dragOver === i ? 'border-brand-400 bg-brand-50 shadow-sm scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <GripVertical size={14} className="text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
                  <span className="text-brand-500 shrink-0">{SECTION_ICONS[key]}</span>
                  <span className="text-xs text-gray-700 flex-1">{SECTION_LABELS[key]}</span>
                  <div className="flex gap-0.5 shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors text-[10px]">▲</button>
                    <button onClick={() => moveDown(i)} disabled={i === sectionOrder.length - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors text-[10px]">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">

            {/* Margins */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Margins</p>
              <div className="space-y-4">
                <SliderRow label="TOP & BOTTOM" value={layout.marginTopBottom} min={0} max={100} step={5}
                  display={`${(layout.marginTopBottom / 100).toFixed(2)} in`}
                  onChange={(v) => setLayout({ marginTopBottom: v })} />
                <SliderRow label="LEFT & RIGHT" value={layout.marginLeftRight} min={0} max={100} step={5}
                  display={`${(layout.marginLeftRight / 100).toFixed(2)} in`}
                  onChange={(v) => setLayout({ marginLeftRight: v })} />
              </div>
            </div>

            {/* Typography */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Typography</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FONT_OPTIONS.map(f => (
                  <button key={f.value} onClick={() => setLayout({ fontFamily: f.value })}
                    className={`px-2 py-2 rounded-lg border text-xs transition-all text-left truncate ${
                      layout.fontFamily === f.value
                        ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setLayout(DEFAULT_LAYOUT)}
              className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-brand-500 transition-colors">
              <RotateCcw size={11} /> Reset to defaults
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  display: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-[11px] text-gray-700 font-semibold tabular-nums">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-brand-500 cursor-pointer"
      />
    </div>
  )
}
