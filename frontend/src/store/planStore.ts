/**
 * Plan store — tracks the user's current plan, download count, and expiry.
 * Syncs with the backend on mount and after payments.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

export type Plan = 'free' | 'pro' | 'lifetime'

// Chat limits per plan
export const CHAT_LIMITS = {
  free:     25,
  pro:      150,
  lifetime: Infinity,
}

export const PLAN_LIMITS = {
  free:     { downloads: 3,  watermark: true  },
  pro:      { downloads: 20, watermark: false },
  lifetime: { downloads: Infinity, watermark: false },
}

// Resume template IDs available per plan — 6 free, rest pro
export const FREE_RESUME_TEMPLATES = [3, 19, 11, 21, 18, 2]   // Slate Pro, Startup Green, Template 11, Tech Resume 1, PM Classic, Rose Modern
// Cover letter template IDs available per plan — 6 free, rest pro
export const FREE_CL_TEMPLATES     = [1, 5, 14, 13, 8, 3]     // Professional, Minimal, Simple Modern, B&W Modern, Letterhead, Graduate

interface PlanState {
  plan: Plan
  downloadsUsed: number
  chatsUsed: number
  planExpiresAt: string | null
  loading: boolean

  syncPlan: () => Promise<void>
  trackDownload: () => Promise<void>
  trackChat: () => void
  setPlan: (plan: Plan, downloadsUsed: number, planExpiresAt: string | null) => void
  reset: () => void

  // Derived helpers
  canDownload: () => boolean
  canChat: () => boolean
  chatsLeft: () => number | typeof Infinity
  needsWatermark: () => boolean
  hasAccess: (templateId: number, type: 'resume' | 'cl') => boolean
  downloadsLeft: () => number
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      downloadsUsed: 0,
      chatsUsed: 0,
      planExpiresAt: null,
      loading: false,

      syncPlan: async () => {
        set({ loading: true })
        try {
          const res = await apiFetch(`${API_BASE}/api/payment/status`)
          if (!res.ok) return
          const data = await res.json()
          set({
            plan: data.plan,
            downloadsUsed: data.downloadsUsed ?? 0,
            planExpiresAt: data.planExpiresAt ?? null,
            loading: false,
          })
        } catch {
          set({ loading: false })
        }
      },

      trackDownload: async () => {
        set(s => ({ downloadsUsed: s.downloadsUsed + 1 }))
        try {
          await apiFetch(`${API_BASE}/api/payment/track-download`, { method: 'POST' })
        } catch {}
      },

      trackChat: () => set(s => ({ chatsUsed: s.chatsUsed + 1 })),

      setPlan: (plan, downloadsUsed, planExpiresAt) =>
        set({ plan, downloadsUsed, planExpiresAt }),

      reset: () => set({ plan: 'free', downloadsUsed: 0, chatsUsed: 0, planExpiresAt: null }),

      // Free users can always download — first 3 are clean, after that watermarked
      canDownload: () => {
        const { plan, downloadsUsed } = get()
        if (plan === 'free') return true  // never block, just watermark after limit
        const limit = PLAN_LIMITS[plan].downloads
        return downloadsUsed < limit
      },

      canChat: () => {
        const { plan, chatsUsed } = get()
        const limit = CHAT_LIMITS[plan]
        return limit === Infinity || chatsUsed < limit
      },

      chatsLeft: () => {
        const { plan, chatsUsed } = get()
        const limit = CHAT_LIMITS[plan]
        return limit === Infinity ? Infinity : Math.max(0, limit - chatsUsed)
      },

      // Watermark if: free plan AND used up the 3 clean downloads, OR pro/lifetime never
      needsWatermark: () => {
        const { plan, downloadsUsed } = get()
        if (plan === 'pro' || plan === 'lifetime') return false
        return downloadsUsed >= PLAN_LIMITS.free.downloads
      },

      hasAccess: (templateId, type) => {
        const { plan } = get()
        if (plan === 'pro' || plan === 'lifetime') return true
        if (type === 'resume') return FREE_RESUME_TEMPLATES.includes(templateId)
        return FREE_CL_TEMPLATES.includes(templateId)
      },

      downloadsLeft: () => {
        const { plan, downloadsUsed } = get()
        const limit = PLAN_LIMITS[plan].downloads
        return limit === Infinity ? Infinity : Math.max(0, limit - downloadsUsed)
      },
    }),
    { name: 'sv-plan' }
  )
)
