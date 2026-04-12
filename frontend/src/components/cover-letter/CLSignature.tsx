/**
 * CLSignature — draggable + resizable signature image for cover letter templates.
 *
 * When editMode is on: shows drag handle and resize corner.
 * When editMode is off (PDF export): renders as a plain positioned image.
 * If no signature uploaded: renders nothing.
 */
import { useRef, useCallback } from 'react'
import { useEditableContext } from '@/components/resume-editor/EditableContext'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import type { CoverLetterData } from '@/store/coverLetterStore'

interface Props {
  data: CoverLetterData
}

const MIN_W = 60
const MAX_W = 320

export default function CLSignature({ data }: Props) {
  const { editMode } = useEditableContext()
  const { setData } = useCoverLetterStore()

  const sig = data.signature
  const w   = data.signatureWidth ?? 160
  const x   = data.signatureX ?? 0
  const y   = data.signatureY ?? 0

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart    = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const resizeStart  = useRef<{ mx: number; ow: number } | null>(null)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y }

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.mx
      const dy = ev.clientY - dragStart.current.my
      setData({ signatureX: dragStart.current.ox + dx, signatureY: dragStart.current.oy + dy })
    }
    const onUp = () => {
      dragStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [x, y, setData])

  // ── Resize ────────────────────────────────────────────────────────────────
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeStart.current = { mx: e.clientX, ow: w }

    const onMove = (ev: MouseEvent) => {
      if (!resizeStart.current) return
      const dx = ev.clientX - resizeStart.current.mx
      const newW = Math.min(MAX_W, Math.max(MIN_W, resizeStart.current.ow + dx))
      setData({ signatureWidth: newW })
    }
    const onUp = () => {
      resizeStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [w, setData])

  if (!sig) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: x,
        marginTop: y,
        width: w,
        cursor: editMode ? 'move' : 'default',
        userSelect: 'none',
      }}
      onMouseDown={editMode ? onDragMouseDown : undefined}
    >
      <img
        src={sig}
        alt="Signature"
        draggable={false}
        style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
      />

      {/* Resize handle — bottom-right corner, only in edit mode */}
      {editMode && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 12,
            height: 12,
            background: '#3b82f6',
            borderRadius: 2,
            cursor: 'se-resize',
            zIndex: 10,
          }}
        />
      )}

      {/* Drag hint border in edit mode */}
      {editMode && (
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '1.5px dashed #3b82f6',
          borderRadius: 2,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
