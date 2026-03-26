import { create } from 'zustand'

interface ResumeUploadState {
  resumeText: string
  setResumeText: (text: string) => void
  clearResumeText: () => void
}

export const useResumeUploadStore = create<ResumeUploadState>((set) => ({
  resumeText: '',
  setResumeText: (text) => set({ resumeText: text }),
  clearResumeText: () => set({ resumeText: '' }),
}))
