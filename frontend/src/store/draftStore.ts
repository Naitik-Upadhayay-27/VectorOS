import { create } from 'zustand'
import type { TemplateResumeData } from '@/types/resume'
import type { ChatMessage } from '@/types'
import type { EditLogEntry } from './chatStore'
import type { ATSResult } from './atsStore'
import type { SectionKey, LayoutSettings } from './templateResumeStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

export interface ResumeDraft {
  id: string
  name: string
  templateId: number
  resumeData: TemplateResumeData
  sectionOrder: SectionKey[]
  layout: LayoutSettings
  chatMessages: ChatMessage[]
  editLog: EditLogEntry[]
  atsResult?: ATSResult | null
  savedAt: string
}

interface DraftState {
  drafts: ResumeDraft[]
  activeDraftId: string | null
  loading: boolean
  // Actions
  loadDrafts: () => Promise<void>
  saveDraft: (draft: Omit<ResumeDraft, 'savedAt'>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
  renameDraft: (id: string, name: string) => Promise<void>
  setActiveDraft: (id: string | null) => void
  clearDrafts: () => void
}

// Convert backend resume doc → frontend ResumeDraft
function docToDraft(doc: any): ResumeDraft {
  const { _id, name, templateId, chatMessages, editLog, atsResult, sectionOrder, layout, updatedAt, ...rest } = doc
  const resumeData: TemplateResumeData = {
    personalInfo: rest.personalInfo,
    summary: rest.summary,
    experience: rest.experience ?? [],
    education: rest.education ?? [],
    skills: rest.skills ?? [],
    projects: rest.projects ?? [],
    certificates: rest.certificates,
    awards: rest.awards,
    languages: rest.languages,
    volunteer: rest.volunteer,
  }
  return {
    id: _id,
    name: name ?? 'Untitled Resume',
    templateId: templateId ?? 1,
    resumeData,
    sectionOrder: sectionOrder ?? [],
    layout: layout ?? {},
    chatMessages: chatMessages ?? [],
    editLog: editLog ?? [],
    atsResult: atsResult ?? null,
    savedAt: updatedAt ?? new Date().toISOString(),
  }
}

// Convert frontend ResumeDraft → backend payload
function draftToPayload(draft: Omit<ResumeDraft, 'savedAt'>) {
  return {
    name: draft.name,
    templateId: draft.templateId,
    sectionOrder: draft.sectionOrder,
    layout: draft.layout,
    chatMessages: draft.chatMessages,
    editLog: draft.editLog,
    atsResult: draft.atsResult ?? null,
    ...draft.resumeData,
  }
}

export const useDraftStore = create<DraftState>()((set) => ({
  drafts: [],
  activeDraftId: null,
  loading: false,

  loadDrafts: async () => {
    set({ loading: true })
    try {
      const res = await apiFetch(`${API_BASE}/api/resumes`)
      const data = await res.json()
      const drafts: ResumeDraft[] = (data.resumes ?? []).map(docToDraft)
      set({ drafts, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  saveDraft: async (draft) => {
    const payload = draftToPayload(draft)
    try {
      // If id looks like a MongoDB ObjectId (24 hex chars), update; otherwise create
      const isNew = !draft.id || draft.id.length !== 24
      let saved: any
      if (isNew) {
        const res = await apiFetch(`${API_BASE}/api/resumes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        saved = docToDraft(data.resume)
      } else {
        const res = await apiFetch(`${API_BASE}/api/resumes/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        saved = docToDraft(data.resume)
      }
      set((state) => {
        const existing = state.drafts.findIndex((d) => d.id === saved.id || d.id === draft.id)
        if (existing >= 0) {
          const updated = [...state.drafts]
          updated[existing] = saved
          return { drafts: updated, activeDraftId: saved.id }
        }
        return { drafts: [saved, ...state.drafts], activeDraftId: saved.id }
      })
    } catch (e) {
      console.error('Failed to save draft:', e)
    }
  },

  deleteDraft: async (id) => {
    try {
      await apiFetch(`${API_BASE}/api/resumes/${id}`, { method: 'DELETE' })
      set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id),
        activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
      }))
    } catch (e) {
      console.error('Failed to delete draft:', e)
    }
  },

  renameDraft: async (id, name) => {
    try {
      await apiFetch(`${API_BASE}/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      set((state) => ({
        drafts: state.drafts.map((d) => d.id === id ? { ...d, name } : d),
      }))
    } catch (e) {
      console.error('Failed to rename draft:', e)
    }
  },

  setActiveDraft: (id) => set({ activeDraftId: id }),

  clearDrafts: () => set({ drafts: [], activeDraftId: null }),
}))
