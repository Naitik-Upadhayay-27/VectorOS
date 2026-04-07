import { create } from 'zustand'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

export interface SavedJob {
  _id: string
  jobTitle: string
  company: string
  location: string
  jobUrl: string
  jobDescription: string
  status: string
  createdAt: string
}

interface SavedJobsState {
  saved: SavedJob[]
  savedUrls: Set<string>   // fast O(1) lookup
  loading: boolean
  load: () => Promise<void>
  save: (job: { jobId: string; title: string; company: string; location: string; url: string; description: string }) => Promise<void>
  unsave: (url: string) => Promise<void>
  isSaved: (url: string) => boolean
}

export const useSavedJobsStore = create<SavedJobsState>()((set, get) => ({
  saved:     [],
  savedUrls: new Set(),
  loading:   false,

  load: async () => {
    set({ loading: true })
    try {
      const res  = await apiFetch(`${API_BASE}/api/jobs/saved`)
      const data = await res.json()
      const jobs: SavedJob[] = data.jobs ?? []
      set({ saved: jobs, savedUrls: new Set(jobs.map(j => j.jobUrl)), loading: false })
    } catch { set({ loading: false }) }
  },

  save: async (job) => {
    try {
      await apiFetch(`${API_BASE}/api/jobs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      })
      set(s => ({ savedUrls: new Set([...s.savedUrls, job.url]) }))
      get().load()
    } catch (e) { console.error('Save failed', e) }
  },

  unsave: async (url) => {
    try {
      await apiFetch(`${API_BASE}/api/jobs/save`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      set(s => {
        const next = new Set(s.savedUrls)
        next.delete(url)
        return { savedUrls: next, saved: s.saved.filter(j => j.jobUrl !== url) }
      })
    } catch (e) { console.error('Unsave failed', e) }
  },

  isSaved: (url) => get().savedUrls.has(url),
}))
