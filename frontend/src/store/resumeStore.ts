import { create } from 'zustand'
import type { Resume, PersonalInfo, ResumeSection } from '@/types'

const defaultResume: Resume = {
  id: 'resume-1',
  name: 'My Resume',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  score: 72,
  personalInfo: {
    name: 'your name',
    jobTitle: 'Bank President',
    email: '',
    phone: '',
    city: '',
    linkedin: '',
    portfolio: '',
  },
  sections: [
    { id: 'exp', type: 'experience', title: 'Work Experience', items: [] },
    { id: 'edu', type: 'education', title: 'Education', items: [] },
    { id: 'vol', type: 'volunteering', title: 'Volunteering & Leadership', items: [] },
    { id: 'cert', type: 'certifications', title: 'Certifications', items: [] },
    { id: 'lang', type: 'languages', title: 'Languages', items: [] },
    { id: 'skills', type: 'skills', title: 'Skills', items: [] },
    { id: 'proj', type: 'projects', title: 'Projects', items: [] },
  ],
}

interface ResumeState {
  resumes: Resume[]
  activeResume: Resume
  zoom: number
  setActiveResume: (resume: Resume) => void
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateSection: (sectionId: string, updates: Partial<ResumeSection>) => void
  addItemToSection: (sectionId: string, item: Record<string, string>) => void
  removeItemFromSection: (sectionId: string, itemId: string) => void
  setZoom: (zoom: number) => void
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [defaultResume],
  activeResume: defaultResume,
  zoom: 80,

  setActiveResume: (resume) => set({ activeResume: resume }),

  updatePersonalInfo: (info) =>
    set((state) => ({
      activeResume: {
        ...state.activeResume,
        personalInfo: { ...state.activeResume.personalInfo, ...info },
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSection: (sectionId, updates) =>
    set((state) => ({
      activeResume: {
        ...state.activeResume,
        sections: state.activeResume.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      },
    })),

  addItemToSection: (sectionId, item) =>
    set((state) => ({
      activeResume: {
        ...state.activeResume,
        sections: state.activeResume.sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: [...s.items, { id: crypto.randomUUID(), ...item }] }
            : s
        ),
      },
    })),

  removeItemFromSection: (sectionId, itemId) =>
    set((state) => ({
      activeResume: {
        ...state.activeResume,
        sections: state.activeResume.sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
            : s
        ),
      },
    })),

  setZoom: (zoom) => set({ zoom }),
}))

