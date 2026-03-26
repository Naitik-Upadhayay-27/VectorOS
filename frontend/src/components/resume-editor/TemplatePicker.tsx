import { TEMPLATES } from '@/components/resume-templates'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import Modal from '@/components/ui/Modal'
import { Check } from 'lucide-react'
import { sampleData } from '@/lib/sampleResumeData'

interface TemplatePickerProps {
  open: boolean
  onClose: () => void
}

// Scale factor: A4 page is 794px wide, we want ~180px card → 180/794 ≈ 0.227
const PREVIEW_SCALE = 0.227
const PAGE_W = 794
const PAGE_H = 1123
const CARD_W = Math.round(PAGE_W * PREVIEW_SCALE)   // ~180px
const CARD_H = Math.round(PAGE_H * PREVIEW_SCALE)   // ~255px

export default function TemplatePicker({ open, onClose }: TemplatePickerProps) {
  const { activeTemplateId, setTemplate } = useTemplateResumeStore()

  return (
    <Modal open={open} onClose={onClose} title="Choose a Template" size="lg">
      <div className="grid grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto pr-1">
        {TEMPLATES.map((t) => {
          const TemplateComponent = t.component
          const isActive = activeTemplateId === t.id

          return (
            <button
              key={t.id}
              onClick={() => { setTemplate(t.id); onClose() }}
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              {/* Preview box */}
              <div
                className="relative rounded-xl overflow-hidden border-2 transition-all duration-150 shadow-sm group-hover:shadow-lg"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  borderColor: isActive ? t.thumbnail : 'transparent',
                  outline: isActive ? `2px solid ${t.thumbnail}` : '2px solid transparent',
                }}
              >
                {/* Scaled-down template render */}
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

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />

                {/* Active checkmark */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: t.thumbnail }}
                  >
                    <Check size={13} className="text-white" />
                  </div>
                )}
              </div>

              {/* Label */}
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
    </Modal>
  )
}
