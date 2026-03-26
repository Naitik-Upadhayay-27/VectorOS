import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useResumeStore } from '@/store/resumeStore'
import { TEMPLATES } from '@/components/resume-templates'
import { EditableContext } from './EditableContext'
import { Pencil, Eye } from 'lucide-react'
import { printResume } from '@/lib/printResume'

export interface TemplateLivePreviewHandle {
  print: () => void
}

const PAGE_W = 794
const PAGE_H = 1123

function computePageOffsets(container: HTMLDivElement, totalHeight: number): number[] {
  const offsets: number[] = [0]
  let nextCut = PAGE_H

  while (nextCut < totalHeight) {
    const all = Array.from(
      container.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, h4, h5, h6, span, div')
    )

    let bestY = nextCut
    let bestDelta = Infinity

    for (const el of all) {
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const elBottom = rect.bottom - containerRect.top

      if (elBottom <= nextCut && elBottom > nextCut - 120) {
        const delta = nextCut - elBottom
        if (delta < bestDelta) {
          bestDelta = delta
          bestY = elBottom
        }
      }
    }

    offsets.push(bestY)
    nextCut = bestY + PAGE_H
  }

  return offsets
}

export default function TemplateLivePreview({ previewRef }: { previewRef?: React.RefObject<HTMLDivElement | null> }) {
  const { data, activeTemplateId } = useTemplateResumeStore()
  const { zoom } = useResumeStore()
  const [editMode, setEditMode] = useState(false)

  const template = TEMPLATES.find((t) => t.id === activeTemplateId) ?? TEMPLATES[0]
  const TemplateComponent = template.component

  const scale = zoom / 100

  const measureRef = useRef<HTMLDivElement>(null)

  // Expose the measure div to parent for printing
  useEffect(() => {
    if (previewRef && measureRef.current) {
      (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = measureRef.current
    }
  })  const [pageOffsets, setPageOffsets] = useState<number[]>([0])
  const [totalHeight, setTotalHeight] = useState(PAGE_H)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    const recalc = () => {
      const h = el.scrollHeight
      setTotalHeight(h)
      if (h <= PAGE_H) {
        setPageOffsets([0])
      } else {
        setPageOffsets(computePageOffsets(el, h))
      }
    }

    const ro = new ResizeObserver(recalc)
    ro.observe(el)
    recalc()
    return () => ro.disconnect()
  }, [data, activeTemplateId])

  const pageCount = pageOffsets.length
  const pageHeights = pageOffsets.map((offset, i) => {
    const next = pageOffsets[i + 1] ?? totalHeight
    return Math.min(next - offset, PAGE_H)
  })

  return (
    <EditableContext.Provider value={{ editMode }}>
      <div className="absolute inset-0 overflow-auto bg-[#dde1ed] resume-preview-scroll">

        {/* Edit mode toggle button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setEditMode((v) => !v)}
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
        <div
          ref={measureRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '-9999px',
            width: PAGE_W,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <TemplateComponent data={data} />
        </div>

        {/* Page stack */}
        <div
          className="flex flex-col items-center gap-6 py-8"
          style={{ minWidth: PAGE_W * scale + 64 }}
        >
          {pageOffsets.map((offset, i) => {
            const sliceH = pageHeights[i]
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: PAGE_W * scale,
                  height: sliceH * scale,
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
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: PAGE_W,
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                    overflow: 'visible',
                    // In edit mode, pointer events pass through to contentEditable elements
                    pointerEvents: editMode ? 'auto' : 'none',
                  }}
                >
                  <div style={{ marginTop: -offset }}>
                    <TemplateComponent data={data} />
                  </div>
                </div>

                {/* Page number badge */}
                {pageCount > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 10,
                      fontSize: 10,
                      color: '#9ca3af',
                      pointerEvents: 'none',
                      zIndex: 5,
                    }}
                  >
                    {i + 1} / {pageCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Edit mode hint bar */}
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

