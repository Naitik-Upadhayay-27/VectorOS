import { useEffect, useRef, useState, useCallback } from 'react'
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useEditableContext } from './EditableContext'

const COLORS = ['#000000', '#374151', '#1e3a5f', '#dc2626', '#16a34a', '#9333ea', '#ea580c']
const SIZES = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24']

function applyFontSize(px: string) {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  // Wrap selection in a span with font-size
  const span = document.createElement('span')
  span.style.fontSize = `${px}px`
  try {
    range.surroundContents(span)
  } catch {
    // surroundContents fails if selection crosses element boundaries — use extractContents
    const fragment = range.extractContents()
    span.appendChild(fragment)
    range.insertNode(span)
  }
  // Re-select the span contents
  const newRange = document.createRange()
  newRange.selectNodeContents(span)
  sel.removeAllRanges()
  sel.addRange(newRange)
  // Trigger input event so EditableText saves
  span.closest('[contenteditable]')?.dispatchEvent(new Event('input', { bubbles: true }))
}

export default function FormatToolbar() {
  const { editMode } = useEditableContext()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, strikeThrough: false })
  const toolbarRef = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const focusedEl = useRef<HTMLElement | null>(null)

  const refreshFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
    })
  }

  const showAtElement = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setPos({
      top: rect.top - 48,
      left: Math.max(8, rect.left + rect.width / 2 - 200),
    })
    refreshFormats()
  }, [])

  const updateFromSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    // Find contentEditable ancestor
    let el: Node | null = sel.anchorNode
    while (el) {
      if (el instanceof HTMLElement && el.contentEditable === 'true') break
      el = el.parentNode
    }
    if (!el) return

    if (!sel.isCollapsed) {
      // Text selected — show above selection
      const range = sel.getRangeAt(0)
      savedRange.current = range.cloneRange()
      const rect = range.getBoundingClientRect()
      setPos({
        top: rect.top - 48,
        left: Math.max(8, rect.left + rect.width / 2 - 200),
      })
    } else {
      // Just cursor — show above the element
      focusedEl.current = el as HTMLElement
      showAtElement(el as HTMLElement)
    }
    refreshFormats()
  }, [showAtElement])

  useEffect(() => {
    if (!editMode) { setPos(null); return }

    const onSelChange = () => updateFromSelection()
    const onFocus = () => updateFromSelection()
    const onBlur = () => {
      // Small delay so toolbar clicks don't hide it
      setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) {
          const active = document.activeElement
          if (!toolbarRef.current?.contains(active)) setPos(null)
        }
      }, 150)
    }

    document.addEventListener('selectionchange', onSelChange)
    document.addEventListener('editable-focus', onFocus)
    document.addEventListener('editable-blur', onBlur)
    return () => {
      document.removeEventListener('selectionchange', onSelChange)
      document.removeEventListener('editable-focus', onFocus)
      document.removeEventListener('editable-blur', onBlur)
    }
  }, [editMode, updateFromSelection])

  const exec = useCallback((cmd: string, value?: string) => {
    const sel = window.getSelection()
    if (savedRange.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
    document.execCommand(cmd, false, value)
    refreshFormats()
  }, [])

  if (!pos || !editMode) return null

  return (
    <div
      ref={toolbarRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999 }}
      className="flex items-center gap-0.5 bg-white text-gray-800 rounded-xl shadow-xl px-2 py-1.5 border border-gray-200"
    >
      <ToolBtn active={activeFormats.bold} onClick={() => exec('bold')} title="Bold (Ctrl+B)">
        <Bold size={13} />
      </ToolBtn>
      <ToolBtn active={activeFormats.italic} onClick={() => exec('italic')} title="Italic (Ctrl+I)">
        <Italic size={13} />
      </ToolBtn>
      <ToolBtn active={activeFormats.underline} onClick={() => exec('underline')} title="Underline (Ctrl+U)">
        <Underline size={13} />
      </ToolBtn>
      <ToolBtn active={activeFormats.strikeThrough} onClick={() => exec('strikeThrough')} title="Strikethrough">
        <Strikethrough size={13} />
      </ToolBtn>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <select
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const sel = window.getSelection()
          if (savedRange.current && sel) { sel.removeAllRanges(); sel.addRange(savedRange.current) }
          applyFontSize(e.target.value)
          e.target.value = ''
        }}
        value=""
        className="bg-white text-gray-700 text-[11px] rounded-lg px-1.5 py-1 border border-gray-200 cursor-pointer outline-none hover:border-gray-300"
        title="Font size"
      >
        <option value="" disabled>Size</option>
        {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
      </select>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1" title="Text color">
        {COLORS.map(c => (
          <button
            key={c}
            onMouseDown={(e) => { e.preventDefault(); exec('foreColor', c) }}
            className="w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform shadow-sm"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <ToolBtn onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft size={13} /></ToolBtn>
      <ToolBtn onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter size={13} /></ToolBtn>
      <ToolBtn onClick={() => exec('justifyRight')} title="Align right"><AlignRight size={13} /></ToolBtn>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <button
        onMouseDown={(e) => { e.preventDefault(); exec('removeFormat') }}
        className="text-[10px] text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors font-medium"
        title="Clear formatting"
      >
        Clear
      </button>
    </div>
  )
}

function ToolBtn({ children, active, onClick, title }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick?.() }}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-brand-100 text-brand-700 font-bold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  )
}
