import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
  texts: string[]
  className?: string
  style?: React.CSSProperties
  typeSpeed?: number
  deleteSpeed?: number
  pauseAfter?: number
}

export default function TypewriterText({
  texts,
  className = '',
  style,
  typeSpeed = 55,
  deleteSpeed = 30,
  pauseAfter = 1800,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')
  const [index, setIndex] = useState(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = texts[index]

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeout.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1))
        }, typeSpeed)
      } else {
        timeout.current = setTimeout(() => setPhase('pausing'), pauseAfter)
      }
    } else if (phase === 'pausing') {
      timeout.current = setTimeout(() => setPhase('deleting'), 0)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, deleteSpeed)
      } else {
        setIndex((i) => (i + 1) % texts.length)
        setPhase('typing')
      }
    }

    return () => { if (timeout.current) clearTimeout(timeout.current) }
  }, [displayed, phase, index, texts, typeSpeed, deleteSpeed, pauseAfter])

  return (
    <span className={className} style={style}>
      {displayed}
      <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />
    </span>
  )
}

