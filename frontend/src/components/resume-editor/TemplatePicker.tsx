import { useState } from 'react'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/components/resume-templates'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import Modal from '@/components/ui/Modal'
import { Check } from 'lucide-react'
import { sampleData } from '@/lib/sampleResumeData'

interface TemplatePickerProps {
  open: boolean
  onClose: () => void
}

const PREVIEW_SCALE = 0.22
const PAGE_W = 794
const PAGE_H = 1123
const CARD_W = Math.round(PAGE_W * PREVIEW_SCALE)
const CARD_H = Math.round(PAGE_H * PREVIEW_SCALE)

export default function TemplatePicker({ open, onClose }: TemplatePickerProps) {
  const { activeTemplateId, setTemplate } = useTemplateResumeStore()
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <Modal open={open} onClose={onClose} title="Choose a Template" size="lg">
      {/* Category tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat.label}
            <span className={`ml-1.5 text-[10px] ${activeCategory === cat.key ? 'text-white/70' : 'text-gray-400'}`}>
              {cat.key === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-3 gap-5 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((t) => {
          const TemplateComponent = t.component
          const isActive = activeTemplateId === t.id

          return (
            <button
              key={t.id}
              onClick={() => { setTemplate(t.id); onClose() }}
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-150 shadow-sm group-hover:shadow-lg"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  outline: isActive ? `2px solid ${t.thumbnail}` : '2px solid transparent',
                  outlineOffset: 2,
                }}
              >
                <div
                  style={{
                    width: PAGE_W,
                    height: PAGE_H,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  <TemplateComponent data={sampleData} />
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors rounded-xl" />

                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: t.thumbnail }}
                  >
                    <Check size={13} className="text-white" />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-black/40 text-white/90">
                    {t.category}
                  </span>
                </div>
              </div>

              <span
                className="text-xs font-medium transition-colors"
                style={{ color: isActive ? t.thumbnail : '#6b7280' }}
              >
                {t.name}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No templates in this category yet.
        </div>
      )}
    </Modal>
  )
}
