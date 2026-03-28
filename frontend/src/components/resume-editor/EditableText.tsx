import { useRef, useLayoutEffect, useCallback, useEffect } from 'react'
import { useEditableContext } from './EditableContext'

interface EditableTextProps {
  value: string
  onSave: (val: string) => void
  className?: string
  style?: React.CSSProperties
  multiline?: boolean
  as?: keyof JSX.IntrinsicElements
}

export default function EditableText({
  value,
  onSave,
  className = '',
  style,
  multiline = false,
  as: Tag = 'span',
}: EditableTextProps) {
  const { editMode } = useEditableContext()
  const ref = useRef<HTMLElement>(null)
  const isFocused = useRef(false)
  const lastSaved = useRef(value)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value into DOM only when not focused
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || isFocused.current) return
    if (value !== lastSaved.current) {
      el.innerHTML = value
      lastSaved.current = value
    }
  }, [value])

  const save = useCallback((html: string) => {
    if (html === lastSaved.current) return
    lastSaved.current = html
    onSave(html)
  }, [onSave])

  const handleFocus = useCallback(() => {
    isFocused.current = true
    // Dispatch a custom event so FormatToolbar knows a field is focused
    document.dispatchEvent(new CustomEvent('editable-focus'))
  }, [])

  const handleBlur = useCallback(() => {
    isFocused.current = false
    if (saveTimer.current) clearTimeout(saveTimer.current)
    const el = ref.current
    if (el) save(el.innerHTML)
    document.dispatchEvent(new CustomEvent('editable-blur'))
  }, [save])

  // Debounced save on input — doesn't touch the DOM so undo stack is preserved
  const handleInput = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(el.innerHTML), 300)
  }, [save])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      const el = ref.current
      if (el) { el.innerHTML = lastSaved.current; el.blur() }
      e.preventDefault()
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      ref.current?.blur()
    }
    // Let Ctrl+Z / Cmd+Z pass through to browser's native undo
  }, [multiline])

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  if (!editMode) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const T = Tag as any
    return <T className={className} style={style} dangerouslySetInnerHTML={{ __html: value }} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any

  return (
    <T
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: value }}
      className={[
        className,
        'outline-none cursor-text',
        'hover:ring-1 hover:ring-blue-300 rounded-[2px]',
        'focus:ring-2 focus:ring-blue-400 focus:bg-blue-50/40',
      ].join(' ')}
      style={{ ...style, minWidth: '1ch', display: 'inline-block' }}
    />
  )
}
