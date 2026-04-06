import { create } from 'zustand'
import type { TemplateResumeData } from '@/types/resume'

export interface Snapshot {
  id: string
  resumeData: TemplateResumeData
  label: string
  timestamp: string
}

interface SnapshotState {
  snapshots: Record<string, Snapshot> // keyed by msgId
  push: (msgId: string, label: string, data: TemplateResumeData) => void
  remove: (msgId: string) => void
  clear: () => void
}

export const useSnapshotStore = create<SnapshotState>()((set) => ({
  snapshots: {},
  push: (msgId, label, data) =>
    set((s) => ({
      snapshots: {
        ...s.snapshots,
        [msgId]: { id: msgId, resumeData: data, label, timestamp: new Date().toISOString() },
      },
    })),
  remove: (msgId) =>
    set((s) => {
      const n = { ...s.snapshots }
      delete n[msgId]
      return { snapshots: n }
    }),
  clear: () => set({ snapshots: {} }),
}))
