import { create } from 'zustand'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import type { CoverLetterData } from './coverLetterStore'

export interface CoverLetterDraft {
  id: string
  name: string
  templateId: number
  data: CoverLetterData
  savedAt: string
}

function docToDraft(doc: any): CoverLetterDraft {
  return {
    id: doc._id,
    name: doc.name ?? 'Untitled Cover Letter',
    templateId: doc.templateId ?? 1,
    data: doc.data ?? {},
    savedAt: doc.updatedAt ?? new Date().toISOString(),
  }
}

interface CLDraftState {
  drafts: CoverLetterDraft[]
  loading: boolean
  saving: boolean

  loadDrafts: () => Promise<void>
  saveDraft: (draft: Omit<CoverLetterDraft, 'savedAt'>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
  clearDrafts: () => void
}

export const useCoverLetterDraftStore = create<CLDraftState>()((set) => ({
  drafts: [],
  loading: false,
  saving: false,

  loadDrafts: async () => {
    set({ loading: true })
    try {
      const res = await apiFetch(`${API_BASE}/api/cover-letters`)
      const data = await res.json()
      set({ drafts: (data.coverLetters ?? []).map(docToDraft), loading: false })
    } catch {
      set({ loading: false })
    }
  },

  saveDraft: async (draft) => {
    set({ saving: true })
    try {
      const payload = { name: draft.name, templateId: draft.templateId, data: draft.data }
      const isNew = !draft.id || draft.id.length !== 24
      let saved: CoverLetterDraft
      if (isNew) {
        const res = await apiFetch(`${API_BASE}/api/cover-letters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        saved = docToDraft(json.coverLetter)
      } else {
        const res = await apiFetch(`${API_BASE}/api/cover-letters/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        saved = docToDraft(json.coverLetter)
      }
      set((s) => {
        const idx = s.drafts.findIndex((d) => d.id === saved.id || d.id === draft.id)
        if (idx >= 0) {
          const updated = [...s.drafts]; updated[idx] = saved
          return { drafts: updated, saving: false }
        }
        return { drafts: [saved, ...s.drafts], saving: false }
      })
    } catch (e) {
      console.error('Failed to save cover letter draft:', e)
      set({ saving: false })
    }
  },

  deleteDraft: async (id) => {
    try {
      await apiFetch(`${API_BASE}/api/cover-letters/${id}`, { method: 'DELETE' })
      set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }))
    } catch (e) {
      console.error('Failed to delete cover letter draft:', e)
    }
  },

  clearDrafts: () => set({ drafts: [] }),
}))
