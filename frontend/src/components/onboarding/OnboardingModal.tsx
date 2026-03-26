import { useState } from 'react'
import { ChevronRight, FileSearch, Target } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const steps = [
  {
    title: 'Welcome to JobOS',
    body: 'Your AI-powered job application operating system. Let\'s get you set up in 3 quick steps.',
    cta: 'Get Started',
  },
  {
    title: 'Analyze or Tailor?',
    body: 'Analyze your resume to get insights on its strengths and areas for improvement. This step is recommended before matching your resume to job descriptions.',
    cta: 'Next',
    actions: true,
  },
  {
    title: 'You\'re all set!',
    body: 'I\'ll point out the Analyze and Tailor buttons so you can use either one when you\'re ready.',
    cta: 'Let\'s go',
    final: true,
  },
]

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Bot avatar */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-brand-100 to-purple-100 rounded-full flex items-center justify-center text-4xl">
          🤖
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-2">{current.title}</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{current.body}</p>

        {/* Step 2 action cards */}
        {current.actions && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 border-2 border-brand-500 rounded-xl bg-brand-50 text-left">
              <FileSearch size={18} className="text-brand-500 mb-1" />
              <p className="text-xs font-semibold text-brand-700">Analyze Resume</p>
              <p className="text-xs text-gray-500 mt-0.5">Get detailed insights</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-left">
              <Target size={18} className="text-gray-400 mb-1" />
              <p className="text-xs font-semibold text-gray-600">Tailor to Specific Job</p>
              <p className="text-xs text-gray-500 mt-0.5">Match job requirements</p>
            </div>
          </div>
        )}

        {/* Recommended workflow */}
        {current.actions && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">⭐ Recommended workflow</p>
            <p className="text-xs text-amber-600">
              For optimal results, start by analyzing your resume to understand its current strengths before tailoring it to specific job opportunities.
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-brand-500 w-4' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <Button onClick={next} className="w-full justify-center gap-2">
          {current.cta}
          <ChevronRight size={14} />
        </Button>
      </div>
    </Modal>
  )
}
