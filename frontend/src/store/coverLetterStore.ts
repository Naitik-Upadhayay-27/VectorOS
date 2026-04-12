import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CoverLetterTone = 'professional' | 'creative' | 'entry-level' | 'career-switcher'

export interface CoverLetterData {
  // Sender info
  name: string
  address: string
  city: string
  email: string
  phone: string
  linkedin?: string
  date: string
  photo?: string  // base64 data URL
  // Recipient info
  hiringManager: string
  companyName: string
  companyAddress: string
  companyCity: string
  jobTitle: string
  // Body
  body: string
}

export const DEFAULT_COVER_LETTER_DATA: CoverLetterData = {
  name: '',
  address: '',
  city: '',
  email: '',
  phone: '',
  linkedin: '',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  photo: '',
  hiringManager: 'Hiring Manager',
  companyName: '',
  companyAddress: '',
  companyCity: '',
  jobTitle: '',
  body: '',
}

interface CoverLetterState {
  data: CoverLetterData
  templateId: number // 1-4
  generating: boolean
  jobDescription: string

  setData: (data: Partial<CoverLetterData>) => void
  setTemplate: (id: number) => void
  setGenerating: (v: boolean) => void
  setJobDescription: (jd: string) => void
  reset: () => void
}

export const useCoverLetterStore = create<CoverLetterState>()(
  persist(
    (set) => ({
      data: { ...DEFAULT_COVER_LETTER_DATA },
      templateId: 1,
      generating: false,
      jobDescription: '',

      setData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
      setTemplate: (id) => set({ templateId: id }),
      setGenerating: (v) => set({ generating: v }),
      setJobDescription: (jd) => set({ jobDescription: jd }),
      reset: () => set({ data: { ...DEFAULT_COVER_LETTER_DATA }, jobDescription: '' }),
    }),
    { name: 'cover-letter-store' }
  )
)
