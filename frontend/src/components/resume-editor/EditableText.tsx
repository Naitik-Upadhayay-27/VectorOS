import { useRef, useLayoutEffect, useCallback } from 'react'
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
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  // Always sync innerHTML from value when not focused
  // This runs on every render — safe because we guard with isFocused
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || isFocused.current) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
      lastSaved.current = value
    }
  })

  const handleFocus = useCallback(() => {
    isFocused.current = true
    document.dispatchEvent(new CustomEvent('editable-focus'))
  }, [])

  const handleBlur = useCallback(() => {
    isFocused.current = false
    const el = ref.current
    if (!el) return
    const html = el.innerHTML
    if (html !== lastSaved.current) {
      lastSaved.current = html
      onSaveRef.current(html)
    }
    document.dispatchEvent(new CustomEvent('editable-blur'))
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      const el = ref.current
      if (el) { el.innerHTML = lastSaved.current; el.blur() }
      e.preventDefault()
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      ref.current?.blur()
    }
  }, [multiline])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any

  if (!editMode) {
    return <T className={className} style={style} dangerouslySetInnerHTML={{ __html: value }} />
  }

  return (
    <T
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
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
