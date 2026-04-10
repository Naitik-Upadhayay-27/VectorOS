import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES: Record<string, string[]> = {
  parsing: [
    'Reading your resume...',
    'Extracting work experience...',
    'Parsing education & skills...',
    'Structuring your data...',
    'Almost there...',
  ],
  ats: [
    'Scanning for ATS keywords...',
    'Checking section completeness...',
    'Analyzing action verbs...',
    'Measuring quantification...',
    'Calculating your score...',
  ],
  chat: [
    'Thinking...',
    'Reviewing your resume...',
    'Crafting a response...',
  ],
}

interface AILoaderProps {
  type: 'parsing' | 'ats' | 'chat'
  /** inline = small spinner inside a button/panel, overlay = full panel takeover */
  variant?: 'inline' | 'overlay'
}

export function AILoader({ type, variant = 'overlay' }: AILoaderProps) {
  const msgs = MESSAGES[type]

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0" />
        <span>{msgs[0]}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-5 py-10 px-4"
    >
      {/* Animated rings */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-300 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">
            {type === 'parsing' ? '📄' : type === 'ats' ? '🎯' : '✨'}
          </span>
        </div>
      </div>

      {/* Cycling messages */}
      <CyclingText messages={msgs} />

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function CyclingText({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1800)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div className="min-h-6 overflow-hidden relative w-full max-w-xs text-center mx-auto">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-gray-500 font-medium w-full text-center"
        >
          {messages[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// need these for CyclingText
import { useState, useEffect } from 'react'
