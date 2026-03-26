import { create } from 'zustand'

export type OnboardingStep =
  | 'start'           // upload or scratch
  | 'template'        // pick template
  | 'personal'        // name, title, location
  | 'career'          // current role, company, salary
  | 'domain'          // target domain / industry
  | 'done'

export interface OnboardingData {
  resumeMode: 'upload' | 'scratch' | null
  templateId: number | null
  // personal
  fullName: string
  jobTitle: string
  location: string
  // career
  currentCompany: string
  currentSalary: string
  expectedSalary: string
  yearsOfExperience: string
  employmentType: string
  // domain
  targetDomains: string[]
}

interface OnboardingState {
  open: boolean
  step: OnboardingStep
  data: OnboardingData
  openOnboarding: () => void
  closeOnboarding: () => void
  setStep: (s: OnboardingStep) => void
  update: (patch: Partial<OnboardingData>) => void
  reset: () => void
}

const defaultData: OnboardingData = {
  resumeMode: null,
  templateId: null,
  fullName: '',
  jobTitle: '',
  location: '',
  currentCompany: '',
  currentSalary: '',
  expectedSalary: '',
  yearsOfExperience: '',
  employmentType: '',
  targetDomains: [],
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  open: false,
  step: 'start',
  data: { ...defaultData },
  openOnboarding: () => set({ open: true, step: 'start' }),
  closeOnboarding: () => set({ open: false }),
  setStep: (step) => set({ step }),
  update: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 'start', data: { ...defaultData } }),
}))
