import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TemplateResumeData } from '@/types/resume'
import type { ChatMessage } from '@/types'
import type { EditLogEntry } from './chatStore'

export interface ResumeDraft {
  id: string
  name: string
  templateId: number
  resumeData: TemplateResumeData
  chatMessages: ChatMessage[]
  editLog: EditLogEntry[]
  savedAt: string
}

interface DraftState {
  drafts: ResumeDraft[]
  activeDraftId: string | null
  saveDraft: (draft: Omit<ResumeDraft, 'savedAt'>) => void
  deleteDraft: (id: string) => void
  renameDraft: (id: string, name: string) => void
  setActiveDraft: (id: string | null) => void
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: [],
      activeDraftId: null,

      saveDraft: (draft) =>
        set((state) => {
          const existing = state.drafts.findIndex((d) => d.id === draft.id)
          const entry: ResumeDraft = { ...draft, savedAt: new Date().toISOString() }
          if (existing >= 0) {
            const updated = [...state.drafts]
            updated[existing] = entry
            return { drafts: updated, activeDraftId: draft.id }
          }
          return { drafts: [entry, ...state.drafts], activeDraftId: draft.id }
        }),

      deleteDraft: (id) =>
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
          activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
        })),

      renameDraft: (id, name) =>
        set((state) => ({
          drafts: state.drafts.map((d) => d.id === id ? { ...d, name } : d),
        })),

      setActiveDraft: (id) => set({ activeDraftId: id }),
    }),
    { name: 'vectoros-drafts' }
  )
)

