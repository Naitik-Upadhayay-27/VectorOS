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
  signature?: string // base64 data URL — transparent-bg signature image
  signatureWidth?: number  // px width on the cover letter (default 160)
  signatureHeight?: number // px height on the cover letter (default auto/proportional)
  signatureX?: number      // px offset from left in sign-off area (default 0)
  signatureY?: number      // px offset from top of sign-off area (default 0)
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
  signature: '',
  signatureWidth: 160,
  signatureHeight: 80,
  signatureX: 0,
  signatureY: 0,
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
