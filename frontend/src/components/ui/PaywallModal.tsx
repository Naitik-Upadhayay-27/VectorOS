/**
 * PaywallModal — dark neon theme. Uses Razorpay SDK checkout (popup).
 * Shows WelcomeModal after successful payment.
 */
import { useState } from 'react'
import { X, Zap, Crown, Check, Sparkles, Loader2 } from 'lucide-react'
import { usePlanStore } from '@/store/planStore'
import { useAuthStore } from '@/store/authStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import WelcomeModal from './WelcomeModal'

declare global { interface Window { Razorpay: any } }

interface Props {
  open: boolean
  onClose: () => void
  reason?: 'download_limit' | 'template_locked' | 'ats' | 'jd_tailor'
  initialPlan?: 'pro' | 'lifetime'
}

const PLANS = [
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '₹149',
    period: '/ week',
    accent: '#a855f7',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_24px_rgba(168,85,247,0.35)]',
    icon: Zap,
    features: [
      '20 PDF downloads',
      'No watermark',
      'All resume & cover letter templates',
      '1000 AI chat messages',
    ],
  },
  {
    key: 'lifetime' as const,
    name: 'Exclusive',
    price: '₹899',
    period: '/ month',
    accent: '#f59e0b',
    border: 'border-amber-500/50',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
    icon: Crown,
    features: [
      'Unlimited downloads (no watermark)',
      'All templates — now & future',
      'Unlimited AI chat messages',
      'All Pro features',
      'ATS score + JD tailoring',
      'Priority support',
    ],
  },
]

const REASON_COPY: Record<string, { title: string; sub: string }> = {
  download_limit:  { title: 'Upgrade for more',               sub: 'First 3 downloads are free. After that, downloads include a watermark. Upgrade to remove it.' },
  template_locked: { title: 'Premium template',               sub: 'This template is available on Pro and Exclusive plans.' },
  ats:             { title: 'ATS Analysis is a Pro feature',  sub: 'Upgrade to see your full ATS score and keyword gaps.' },
  jd_tailor:       { title: 'JD Tailoring is a Pro feature',  sub: 'Upgrade to tailor your resume to any job description.' },
}

async function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.head.appendChild(s)
  })
}

export default function PaywallModal({ open, onClose, reason = 'download_limit', initialPlan }: Props) {
  const [loading, setLoading] = useState<'pro' | 'lifetime' | null>(null)
  const [welcomePlan, setWelcomePlan] = useState<'pro' | 'lifetime' | null>(null)
  const { setPlan } = usePlanStore()
  const { user, updateUser } = useAuthStore()
  const copy = REASON_COPY[reason] ?? REASON_COPY.download_limit

  const handleUpgrade = async (plan: 'pro' | 'lifetime') => {
    setLoading(plan)
    try {
      await loadRazorpayScript()
      const res = await apiFetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const order = await res.json()
      if (!order.orderId) throw new Error('Failed to create order')

      const planConfig = PLANS.find(p => p.key === plan)!
      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'Skill Vector',
        description: planConfig.name + ' Plan',
        image:       '/logo.png',
        order_id:    order.orderId,
        prefill:     { name: user?.name ?? '', email: user?.email ?? '' },
        theme:       { color: planConfig.accent },
        handler: async (response: any) => {
          const verifyRes = await apiFetch(`${API_BASE}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan }),
          })
          const data = await verifyRes.json()
          if (data.success) {
            setPlan(data.user.plan, data.user.downloadsUsed, data.user.planExpiresAt)
            // chatsUsed resets on plan purchase — sync from server
            usePlanStore.getState().syncPlan()
            updateUser({ plan: data.user.plan })
            setLoading(null)
            onClose()
            setWelcomePlan(plan)
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      })
      rzp.open()
    } catch (e) {
      console.error(e)
      setLoading(null)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-[#0a0a0f] border border-white/[0.08] rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.15)] w-full max-w-lg overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors">
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-purple-400" />
                <span className="text-purple-400 text-[10px] font-bold uppercase tracking-widest">Upgrade Required</span>
              </div>
              <h2 className="text-white text-lg font-bold">{copy.title}</h2>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">{copy.sub}</p>
            </div>

            <div className="p-5 grid grid-cols-2 gap-3">
              {PLANS.map(plan => {
                const Icon = plan.icon
                const isHighlighted = initialPlan === plan.key
                const isLoading = loading === plan.key
                return (
                  <div key={plan.key}
                    className={`relative rounded-xl border p-4 flex flex-col gap-3 bg-black transition-all ${plan.border} ${isHighlighted ? plan.glow : ''}`}>
                    {isHighlighted && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                          style={{ background: plan.accent, color: '#000' }}>
                          Selected
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: plan.accent + '20' }}>
                        <Icon size={12} style={{ color: plan.accent }} />
                      </div>
                      <span className="font-bold text-white text-sm">{plan.name}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-white/30 text-xs mb-1">{plan.period}</span>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] text-white/50">
                          <Check size={10} className="mt-0.5 shrink-0" style={{ color: plan.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={loading !== null}
                      className="w-full py-2 rounded-lg text-xs font-bold text-black transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
                      style={{ background: plan.accent }}
                    >
                      {isLoading
                        ? <><Loader2 size={11} className="animate-spin" /> Processing...</>
                        : `Get ${plan.name}`}
                    </button>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-white/20 text-[10px] pb-4">
              Secure payment via Razorpay · No hidden charges
            </p>
          </div>
        </div>
      )}

      <WelcomeModal
        open={!!welcomePlan}
        plan={welcomePlan ?? 'pro'}
        onClose={() => setWelcomePlan(null)}
      />
    </>
  )
}
