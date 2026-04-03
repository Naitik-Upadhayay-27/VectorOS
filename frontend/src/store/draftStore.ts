import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TemplateResumeData } from '@/types/resume'
import type { ChatMessage } from '@/types'
import type { EditLogEntry } from './chatStore'
import type { ATSResult } from './atsStore'

export interface ResumeDraft {
  id: string
  name: string
  templateId: number
  resumeData: TemplateResumeData
  chatMessages: ChatMessage[]
  editLog: EditLogEntry[]
  atsResult?: ATSResult | null
  savedAt: string
}

interface DraftState {
  drafts: ResumeDraft[]
  activeDraftId: string | null
  currentUserId: string | null
  saveDraft: (draft: Omit<ResumeDraft, 'savedAt'>) => void
  deleteDraft: (id: string) => void
  renameDraft: (id: string, name: string) => void
  setActiveDraft: (id: string | null) => void
  loadForUser: (userId: string) => void
}

// Per-user draft storage in localStorage
const getUserDrafts = (userId: string): ResumeDraft[] => {
  try {
    return JSON.parse(localStorage.getItem(`vectoros-drafts-${userId}`) ?? '[]')
  } catch { return [] }
}

const saveUserDrafts = (userId: string, drafts: ResumeDraft[]) => {
  localStorage.setItem(`vectoros-drafts-${userId}`, JSON.stringify(drafts))
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: [],
      activeDraftId: null,
      currentUserId: null,

      loadForUser: (userId: string) => {
        const drafts = getUserDrafts(userId)
        set({ drafts, activeDraftId: null, currentUserId: userId })
      },

      saveDraft: (draft) =>
        set((state) => {
          const existing = state.drafts.findIndex((d) => d.id === draft.id)
          const entry: ResumeDraft = { ...draft, savedAt: new Date().toISOString() }
          let updated: ResumeDraft[]
          if (existing >= 0) {
            updated = [...state.drafts]
            updated[existing] = entry
          } else {
            updated = [entry, ...state.drafts]
          }
          if (state.currentUserId) saveUserDrafts(state.currentUserId, updated)
          return { drafts: updated, activeDraftId: draft.id }
        }),

      deleteDraft: (id) =>
        set((state) => {
          const updated = state.drafts.filter((d) => d.id !== id)
          if (state.currentUserId) saveUserDrafts(state.currentUserId, updated)
          return {
            drafts: updated,
            activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
          }
        }),

      renameDraft: (id, name) =>
        set((state) => {
          const updated = state.drafts.map((d) => d.id === id ? { ...d, name } : d)
          if (state.currentUserId) saveUserDrafts(state.currentUserId, updated)
          return { drafts: updated }
        }),

      setActiveDraft: (id) => set({ activeDraftId: id }),
    }),
    { name: 'vectoros-drafts-meta', partialize: (s) => ({ currentUserId: s.currentUserId, activeDraftId: s.activeDraftId }) }
  )
)

