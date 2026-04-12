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
  signatureHeight: 60,
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
  templateId: number
  generating: boolean
  jobDescription: string
  activeDraftId: string | null
  setData: (data: Partial<CoverLetterData>) => void
  setTemplate: (id: number) => void
  setGenerating: (v: boolean) => void
  setJobDescription: (jd: string) => void
  setActiveDraftId: (id: string | null) => void
  reset: () => void
}

export const useCoverLetterStore = create<CoverLetterState>()(
  persist(
    (set) => ({
      data: { ...DEFAULT_COVER_LETTER_DATA },
      templateId: 1,
      generating: false,
      jobDescription: '',
      activeDraftId: null,

      setData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
      setTemplate: (id) => set({ templateId: id }),
      setGenerating: (v) => set({ generating: v }),
      setJobDescription: (jd) => set({ jobDescription: jd }),
      setActiveDraftId: (id) => set({ activeDraftId: id }),
      reset: () => set({ data: { ...DEFAULT_COVER_LETTER_DATA }, jobDescription: '', activeDraftId: null }),
    }),
    { name: 'cover-letter-store' }
  )
)
