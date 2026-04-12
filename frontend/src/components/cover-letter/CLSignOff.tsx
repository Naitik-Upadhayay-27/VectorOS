/**
 * CLSignOff — sign-off block with draggable + fully resizable signature image.
 * 8 resize handles: 4 corners + 4 edges — width AND height independently.
 */
import { useRef, useCallback } from 'react'
import { useEditableContext } from '@/components/resume-editor/EditableContext'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import type { CoverLetterData } from '@/store/coverLetterStore'
import EditableText from '@/components/resume-editor/EditableText'

interface Props {
  data: CoverLetterData
  salutation?: string
  nameStyle?: React.CSSProperties
  accentColor?: string
}

const MIN_W = 40
const MAX_W = 400
const MIN_H = 20
const MAX_H = 300

type HandleDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLE_CURSORS: Record<HandleDir, string> = {
  n: 'n-resize', s: 's-resize',
  e: 'e-resize', w: 'w-resize',
  ne: 'ne-resize', nw: 'nw-resize',
  se: 'se-resize', sw: 'sw-resize',
}

// Position each handle on the border
const HANDLE_STYLES: Record<HandleDir, React.CSSProperties> = {
  n:  { top: -5,  left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
  s:  { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
  e:  { right: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' },
  w:  { left: -5,  top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' },
  ne: { top: -5,  right: -5,  cursor: 'ne-resize' },
  nw: { top: -5,  left: -5,   cursor: 'nw-resize' },
  se: { bottom: -5, right: -5, cursor: 'se-resize' },
  sw: { bottom: -5, left: -5,  cursor: 'sw-resize' },
}

export default function CLSignOff({ data, salutation = 'Sincerely,', nameStyle, accentColor }: Props) {
  const { editMode } = useEditableContext()
  const { setData } = useCoverLetterStore()

  const sig = data.signature
  const w   = data.signatureWidth  ?? 160
  const h   = data.signatureHeight ?? 80
  const x   = data.signatureX ?? 0
  const y   = data.signatureY ?? 0

  // ── Drag ──────────────────────────────────────────────────────────────────
  const dragRef = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  const onDragDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      setData({
        signatureX: dragRef.current.ox + (ev.clientX - dragRef.current.mx),
        signatureY: dragRef.current.oy + (ev.clientY - dragRef.current.my),
      })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [x, y, setData])

  // ── Resize ────────────────────────────────────────────────────────────────
  const resizeRef = useRef<{ mx: number; my: number; ow: number; oh: number; dir: HandleDir } | null>(null)

  const onResizeDown = useCallback((dir: HandleDir) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = { mx: e.clientX, my: e.clientY, ow: w, oh: h, dir }
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const { mx, my, ow, oh, dir } = resizeRef.current
      const dx = ev.clientX - mx
      const dy = ev.clientY - my
      let newW = ow, newH = oh
      if (dir.includes('e')) newW = Math.min(MAX_W, Math.max(MIN_W, ow + dx))
      if (dir.includes('w')) newW = Math.min(MAX_W, Math.max(MIN_W, ow - dx))
      if (dir.includes('s')) newH = Math.min(MAX_H, Math.max(MIN_H, oh + dy))
      if (dir.includes('n')) newH = Math.min(MAX_H, Math.max(MIN_H, oh - dy))
      setData({ signatureWidth: newW, signatureHeight: newH })
    }
    const onUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [w, h, setData])

  const defaultNameStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '10pt',
    color: accentColor ?? '#1a1a1a',
    ...nameStyle,
  }

  return (
    <div style={{ marginTop: 32, fontSize: '9.5pt' }}>
      <div style={{ marginBottom: sig ? 16 : 8, color: '#555' }}>{salutation}</div>

      {sig && (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginLeft: x,
            marginTop: y,
            width: w,
            height: h,
            cursor: editMode ? 'move' : 'default',
            userSelect: 'none',
            marginBottom: 8,
            flexShrink: 0,
          }}
          onMouseDown={editMode ? onDragDown : undefined}
        >
          <img
            src={sig}
            alt="Signature"
            draggable={false}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', pointerEvents: 'none' }}
          />

          {editMode && (
            <>
              {/* Dashed border */}
              <div style={{
                position: 'absolute', inset: 0,
                border: '1.5px dashed #3b82f6',
                borderRadius: 2,
                pointerEvents: 'none',
              }} />

              {/* 8 resize handles */}
              {(Object.keys(HANDLE_STYLES) as HandleDir[]).map(dir => (
                <div
                  key={dir}
                  onMouseDown={onResizeDown(dir)}
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    background: '#3b82f6',
                    borderRadius: 2,
                    zIndex: 10,
                    ...HANDLE_STYLES[dir],
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}

      <div style={defaultNameStyle}>
        <EditableText value={data.name} onSave={v => setData({ name: v })} />
      </div>
    </div>
  )
}
