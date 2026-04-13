/**
 * WelcomeModal — shown immediately after a successful payment.
 * Dark neon aesthetic matching the landing page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Zap, Crown, Check, Sparkles, ArrowRight, Star } from 'lucide-react'

interface Props {
  open: boolean
  plan: 'pro' | 'lifetime'
  onClose: () => void
}

const CONFIGS = {
  pro: {
    accent: '#a855f7',
    accentDim: 'rgba(168,85,247,0.15)',
    glow: '0 0 80px rgba(168,85,247,0.25)',
    icon: Zap,
    badge: 'PRO',
    headline: 'You\'re now Pro.',
    sub: 'Unlock the full power of Skill Vector. Your resume just got a serious upgrade.',
    features: [
      '20 PDF downloads — no watermark',
      'All resume & cover letter templates',
      'Full ATS score analysis',
      'Tailor resume to any job description',
      '150 AI chat messages',
      'AI cover letter generation',
    ],
    cta: 'Start Building',
    ctaTo: '/resume/resume-1',
    gradient: 'from-[#0d0020] via-[#1a0040] to-[#0d0020]',
    trailColor: 'via-purple-500/50',
  },
  lifetime: {
    accent: '#f59e0b',
    accentDim: 'rgba(245,158,11,0.12)',
    glow: '0 0 80px rgba(245,158,11,0.2)',
    icon: Crown,
    badge: 'EXCLUSIVE',
    headline: 'Welcome to Exclusive.',
    sub: 'You\'ve unlocked everything — forever. This is the full Skill Vector experience.',
    features: [
      'Unlimited downloads — no watermark, ever',
      'All templates — current & future',
      'Unlimited AI chat messages',
      'Full ATS + JD tailoring',
      'Priority support',
      'Monthly billing — cancel anytime',
    ],
    cta: 'Explore Everything',
    ctaTo: '/resume/resume-1',
    gradient: 'from-[#0d0800] via-[#1a1000] to-[#0d0800]',
    trailColor: 'via-amber-500/50',
  },
}

// Animated particle dot
function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse" style={style} />
}

export default function WelcomeModal({ open, plan, onClose }: Props) {
  const navigate = useNavigate()
  const cfg = CONFIGS[plan]
  const Icon = cfg.icon
  const [visible, setVisible] = useState(false)
  const [checked, setChecked] = useState<boolean[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (open) {
      setVisible(false)
      setChecked([])
      // Stagger feature checkmarks
      requestAnimationFrame(() => {
        setTimeout(() => setVisible(true), 50)
        cfg.features.forEach((_, i) => {
          const t = setTimeout(() => setChecked(prev => {
            const next = [...prev]
            next[i] = true
            return next
          }), 400 + i * 120)
          timerRef.current.push(t)
        })
      })
    }
    return () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }
  }, [open, plan])

  if (!open) return null

  const handleCta = () => {
    onClose()
    navigate(cfg.ctaTo)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-b ${cfg.gradient} border border-white/[0.08] transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ boxShadow: cfg.glow }}
      >
        {/* Top glow line */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${cfg.trailColor} to-transparent`} />

        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <Particle key={i} style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.3 + Math.random() * 0.4,
          }} />
        ))}

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
          <X size={14} />
        </button>

        <div className="relative z-10 px-8 pt-10 pb-8">

          {/* Icon + badge */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: cfg.accentDim, border: `1px solid ${cfg.accent}30` }}>
                <Icon size={36} style={{ color: cfg.accent }} />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ background: cfg.accentDim }} />
            </div>

            <span className="text-[10px] font-black tracking-[0.3em] uppercase mb-3 px-3 py-1 rounded-full border"
              style={{ color: cfg.accent, borderColor: cfg.accent + '40', background: cfg.accentDim }}>
              {cfg.badge}
            </span>

            <h2 className="text-3xl font-black text-white text-center leading-tight mb-2">
              {cfg.headline}
            </h2>
            <p className="text-white/50 text-sm text-center leading-relaxed max-w-xs">
              {cfg.sub}
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2.5 mb-8">
            {cfg.features.map((f, i) => (
              <div key={f}
                className={`flex items-center gap-3 transition-all duration-300 ${checked[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{ background: checked[i] ? cfg.accent : 'rgba(255,255,255,0.05)', border: `1px solid ${checked[i] ? cfg.accent : 'rgba(255,255,255,0.1)'}` }}>
                  {checked[i] && <Check size={10} className="text-black" strokeWidth={3} />}
                </div>
                <span className="text-sm text-white/70">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={handleCta}
            className="w-full py-3.5 rounded-2xl text-sm font-black text-black flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}cc)` }}>
            {cfg.cta} <ArrowRight size={15} />
          </button>

          <p className="text-center text-white/20 text-[10px] mt-4 flex items-center justify-center gap-1.5">
            <Star size={9} className="fill-white/20" />
            Payment confirmed · Skill Vector {cfg.badge.charAt(0) + cfg.badge.slice(1).toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  )
}
