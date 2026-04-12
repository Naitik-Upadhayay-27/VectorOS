import { useRef, useEffect, useState } from 'react'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useResumeStore } from '@/store/resumeStore'
import { TEMPLATES } from '@/components/resume-templates'
import { EditableContext } from './EditableContext'
import { Pencil, Eye } from 'lucide-react'
import FormatToolbar from './FormatToolbar'
import {
  PAGE_W, PAGE_H,
  PAGE_MARGIN_TOP, PAGE_MARGIN_BOTTOM,
  USABLE_H_FIRST, USABLE_H_REST,
  computePageOffsets,
} from '@/lib/paginate'

export default function TemplateLivePreview({ previewRef }: { previewRef?: React.RefObject<HTMLDivElement | null> }) {
  const { data, activeTemplateId, layout, sectionOrder } = useTemplateResumeStore()
  const { zoom } = useResumeStore()
  const [editMode, setEditMode] = useState(false)

  const template = TEMPLATES.find((t) => t.id === activeTemplateId) ?? TEMPLATES[0]
  const TemplateComponent = template.component

  const scale = zoom / 100
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (previewRef && measureRef.current) {
      (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = measureRef.current
    }
  })

  const [pageOffsets, setPageOffsets] = useState<number[]>([0])
  const [totalH, setTotalH] = useState(0)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const recalc = () => {
      const h = el.scrollHeight
      setTotalH(h)
      setPageOffsets(h <= USABLE_H_FIRST ? [0] : computePageOffsets(el, h))
    }
    const ro = new ResizeObserver(recalc)
    ro.observe(el)
    recalc()
    return () => ro.disconnect()
  }, [data, activeTemplateId, layout, sectionOrder])

  const pageCount = pageOffsets.length

  const sharedStyle: React.CSSProperties = {
    fontFamily: layout.fontFamily,
    fontSize: `${layout.fontSize}pt`,
    lineHeight: layout.lineHeight ?? 1.5,
    // @ts-ignore
    '--resume-accent': layout.accentColor ?? '#111111',
  }

  return (
    <EditableContext.Provider value={{ editMode }}>
      <div className="absolute inset-0 overflow-auto bg-[#dde1ed] resume-preview-scroll">
        <FormatToolbar />

        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setEditMode(v => !v)}
            title={editMode ? 'Switch to preview mode' : 'Click to edit text directly'}
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

        {/* Hidden measurement render */}
        <EditableContext.Provider value={{ editMode: false }}>
          <div
            ref={measureRef}
            data-resume-measure
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: PAGE_W,
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
              ...sharedStyle,
            }}
          >
            <TemplateComponent data={data} />
          </div>
        </EditableContext.Provider>

        {/* Page stack */}
        <div
          className="flex flex-col items-center gap-6 py-8"
          style={{ minWidth: PAGE_W * scale + 64 }}
        >
          {pageOffsets.map((offset, i) => {
            const isFirst = i === 0
            const nextOffset = pageOffsets[i + 1] ?? totalH

            // How many px of content this page shows
            const sliceH = nextOffset - offset

            // Where inside the PAGE_H box the content window sits
            const contentTop = isFirst ? 0 : PAGE_MARGIN_TOP

            // Shift the full render so content at `offset` lands at y=0 of the window.
            // The window itself is positioned at contentTop, creating the top margin.
            const shift = -offset

            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: PAGE_W * scale,
                  height: PAGE_H * scale,
                  flexShrink: 0,
                  background: '#fff',
                  boxShadow: editMode
                    ? '0 0 0 2px #3b82f6, 0 4px 20px rgba(0,0,0,0.15)'
                    : '0 2px 16px rgba(0,0,0,0.15)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: editMode ? 'text' : 'default',
                }}
              >
                {/*
                 * Content window:
                 *  - starts at contentTop (0 for page 1, PAGE_MARGIN_TOP for pages 2+)
                 *  - height = exactly the slice of content for this page
                 *  - overflow hidden ensures nothing bleeds outside the slice
                 *
                 * The space above (top margin, pages 2+) and below (bottom margin,
                 * all pages) is the white page background — real empty space,
                 * not hidden content.
                 */}
                <div style={{
                  position: 'absolute',
                  top: contentTop * scale,
                  left: 0,
                  width: PAGE_W * scale,
                  height: sliceH * scale,
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: PAGE_W,
                      transformOrigin: 'top left',
                      transform: `scale(${scale})`,
                      pointerEvents: editMode ? 'auto' : 'none',
                      ...sharedStyle,
                    }}
                  >
                    <div style={{ marginTop: shift, width: PAGE_W }}>
                      <TemplateComponent data={data} />
                    </div>
                  </div>
                </div>

                {/* Page number — sits in the bottom margin */}
                {pageCount > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: Math.max(8, (PAGE_MARGIN_BOTTOM * scale) / 2 - 6),
                    right: 10,
                    fontSize: 10,
                    color: '#9ca3af',
                    pointerEvents: 'none',
                    zIndex: 5,
                  }}>
                    {i + 1} / {pageCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {editMode && (
          <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-3 pointer-events-none">
            <div className="bg-blue-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg pointer-events-none">
              Click any text to edit · Enter to confirm · Esc to cancel
            </div>
          </div>
        )}
      </div>
    </EditableContext.Provider>
  )
}
