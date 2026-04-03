import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { API_BASE } from '@/lib/config'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  hasOnboarded: boolean
  login: (user: User, token: string, refreshToken?: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  markOnboarded: () => void
  resetOnboarding: () => void
  refreshAccessToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      hasOnboarded: false,
      login: (user, token, refreshToken) => {
        // Clear all previous user's data before setting new session
        import('@/store/chatStore').then(({ useChatStore }) => useChatStore.getState().clearMessages())
        import('@/store/templateResumeStore').then(({ useTemplateResumeStore }) =>
          useTemplateResumeStore.getState().resetData({
            personalInfo: { name: '', title: '', contact: {} },
            summary: '', experience: [], education: [], skills: [], projects: [],
          })
        )
        import('@/store/draftStore').then(({ useDraftStore }) => {
          useDraftStore.getState().loadForUser(user.id)
        })
        import('@/store/atsStore').then(({ useAtsStore }) => useAtsStore.getState().clearResult())
        set({ user, token, refreshToken: refreshToken ?? null })
      },
      logout: () => {
        // Clear all user-specific state on logout but preserve hasOnboarded
        import('@/store/chatStore').then(({ useChatStore }) => useChatStore.getState().clearMessages())
        import('@/store/templateResumeStore').then(({ useTemplateResumeStore }) =>
          useTemplateResumeStore.getState().resetData({
            personalInfo: { name: '', title: '', contact: {} },
            summary: '', experience: [], education: [], skills: [], projects: [],
          })
        )
        import('@/store/onboardingStore').then(({ useOnboardingStore }) => useOnboardingStore.getState().reset())
        import('@/store/draftStore').then(({ useDraftStore }) => useDraftStore.getState().setActiveDraft(null))
        // Keep hasOnboarded so returning users skip onboarding on next login
        set((s) => ({ user: null, token: null, refreshToken: null, hasOnboarded: s.hasOnboarded }))
      },
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      markOnboarded: () => set({ hasOnboarded: true }),
      resetOnboarding: () => set({ hasOnboarded: false }),
      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
          if (!res.ok) return false
          const data = await res.json()
          set({ token: data.token })
          return true
        } catch {
          return false
        }
      },
    }),
    { name: 'jobos-auth' }
  )
)

