import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem } from '@/types/resume'

export type SectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'awards' | 'languages' | 'volunteer'

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'summary', 'experience', 'education', 'skills', 'projects', 'certificates', 'awards', 'languages', 'volunteer',
]

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certificates: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
  volunteer: 'Volunteering & Leadership',
}

export interface LayoutSettings {
  marginTopBottom: number   // inches * 100
  marginLeftRight: number   // inches * 100
  fontSize: number          // base font size in pt (8-14)
  fontFamily: string        // font family key
  lineHeight: number        // line height multiplier (1.0 - 2.0)
  accentColor: string       // hex color for headings/accents
}

export const ACCENT_COLORS = [
  { label: 'Black',   value: '#111111' },
  { label: 'Navy',    value: '#1e3a5f' },
  { label: 'Slate',   value: '#475569' },
  { label: 'Indigo',  value: '#4338ca' },
  { label: 'Purple',  value: '#7c3aed' },
  { label: 'Teal',    value: '#0d9488' },
  { label: 'Green',   value: '#16a34a' },
  { label: 'Red',     value: '#dc2626' },
  { label: 'Orange',  value: '#ea580c' },
  { label: 'Brown',   value: '#78350f' },
]

export const DEFAULT_LAYOUT: LayoutSettings = {
  marginTopBottom: 0,
  marginLeftRight: 0,
  fontSize: 11,
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  accentColor: '#111111',
}

export const FONT_OPTIONS = [
  { label: 'Inter',            value: "'Inter', sans-serif" },
  { label: 'Georgia',          value: "'Georgia', serif" },
  { label: 'Times New Roman',  value: "'Times New Roman', serif" },
  { label: 'Garamond',         value: "'Garamond', serif" },
  { label: 'Arial',            value: "'Arial', sans-serif" },
  { label: 'Helvetica',        value: "'Helvetica Neue', sans-serif" },
  { label: 'Merriweather',     value: "'Merriweather', serif" },
  { label: 'Lato',             value: "'Lato', sans-serif" },
  { label: 'Roboto',           value: "'Roboto', sans-serif" },
  { label: 'Open Sans',        value: "'Open Sans', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Source Sans Pro',  value: "'Source Sans 3', sans-serif" },
]

interface TemplateResumeState {
  data: TemplateResumeData
  activeTemplateId: number
  sectionOrder: SectionKey[]
  layout: LayoutSettings

  // Published by TemplateLivePreview so PDF export can reuse exact same offsets
  pageOffsets: number[]
  pageTotalH: number
  setPageLayout: (offsets: number[], totalH: number) => void

  setTemplate: (id: number) => void
  resetData: (data: TemplateResumeData) => void
  setPersonalInfo: (info: Partial<NonNullable<TemplateResumeData['personalInfo']>>) => void
  setContact: (contact: Partial<NonNullable<NonNullable<TemplateResumeData['personalInfo']>['contact']>>) => void
  setSummary: (summary: string) => void
  setSectionOrder: (order: SectionKey[]) => void
  setLayout: (layout: Partial<LayoutSettings>) => void

  addExperience: (item: Omit<ExperienceItem, 'id'>) => void
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void

  addEducation: (item: Omit<EducationItem, 'id'>) => void
  updateEducation: (id: string, item: Partial<EducationItem>) => void
  removeEducation: (id: string) => void

  addSkillCategory: (item: Omit<SkillCategory, 'id'>) => void
  updateSkillCategory: (id: string, item: Partial<SkillCategory>) => void
  removeSkillCategory: (id: string) => void

  addProject: (item: Omit<ProjectItem, 'id'>) => void
  updateProject: (id: string, item: Partial<ProjectItem>) => void
  removeProject: (id: string) => void

  addCertificate: (item: Omit<CertificateItem, 'id'>) => void
  removeCertificate: (id: string) => void

  addAward: (item: Omit<AwardItem, 'id'>) => void
  removeAward: (id: string) => void

  addLanguage: (item: Omit<LanguageItem, 'id'>) => void
  removeLanguage: (id: string) => void

  addVolunteer: (item: Omit<VolunteerItem, 'id'>) => void
  removeVolunteer: (id: string) => void
}

const uid = () => crypto.randomUUID()

const skeletonData: TemplateResumeData = {
  personalInfo: {
    name: 'Your Name',
    title: 'Your Job Title',
    contact: {
      email: 'your.email@example.com',
      phone: '+1 (555) 000-0000',
      location: 'City, State',
      linkedin: 'linkedin.com/in/yourprofile',
      github: 'github.com/yourusername',
    },
  },
  summary:
    'A results-driven professional with experience in... Edit this summary to describe your background, key skills, and career goals.',
  experience: [
    {
      id: uid(),
      title: 'Job Title',
      company: 'Company Name',
      location: 'City, State',
      startDate: 'Mon Year',
      endDate: 'Present',
      description: [
        'Describe your key responsibility or achievement here',
        'Quantify your impact where possible (e.g. increased X by Y%)',
        'Use strong action verbs to start each bullet point',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      degree: 'Bachelor of Science in Your Major',
      institution: 'University Name',
      location: 'City, State',
      graduationDate: 'Month Year',
      gpa: '3.X / 4.0',
      description: ['Relevant coursework, honors, or activities'],
    },
  ],
  skills: [
    { id: uid(), category: 'Technical Skills', skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'] },
    { id: uid(), category: 'Tools & Platforms', skills: ['Tool 1', 'Tool 2', 'Tool 3'] },
  ],
  projects: [
    {
      id: uid(),
      name: 'Project Name',
      role: 'Your Role',
      link: 'github.com/you/project',
      startDate: 'Mon Year',
      endDate: 'Present',
      description: ['Brief description of what you built and its impact'],
      technologies: ['Tech 1', 'Tech 2', 'Tech 3'],
    },
  ],
  certificates: [
    { id: uid(), name: 'Certification Name', issuer: 'Issuing Organization', date: 'Month Year' },
  ],
  awards: [
    { id: uid(), title: 'Award Title', date: 'Year', description: 'Brief description of the award' },
  ],
  languages: [
    { id: uid(), language: 'English', proficiency: 'Native' },
    { id: uid(), language: 'Language 2', proficiency: 'Proficiency Level' },
  ],
  volunteer: [
    {
      id: uid(),
      role: 'Volunteer Role',
      organization: 'Organization Name',
      startDate: 'Mon Year',
      endDate: 'Present',
      description: 'Brief description of your volunteer work',
    },
  ],
}

export const useTemplateResumeStore = create<TemplateResumeState>()(
  persist(
    (set) => ({
      activeTemplateId: 1,
      data: skeletonData,
      sectionOrder: DEFAULT_SECTION_ORDER,
      layout: DEFAULT_LAYOUT,
      pageOffsets: [0],
      pageTotalH: 0,

      setPageLayout: (offsets, totalH) => set({ pageOffsets: offsets, pageTotalH: totalH }),
      setTemplate: (id) => set({ activeTemplateId: id }),
      resetData: (data) => set({ data }),
      setSectionOrder: (order) => set({ sectionOrder: order }),
      setLayout: (layout) => set((s) => ({ layout: { ...s.layout, ...layout } })),

  setPersonalInfo: (info) =>
    set((s) => ({
      data: { ...s.data, personalInfo: { ...s.data.personalInfo, ...info } },
    })),

  setContact: (contact) =>
    set((s) => ({
      data: {
        ...s.data,
        personalInfo: {
          ...s.data.personalInfo,
          contact: { ...s.data.personalInfo?.contact, ...contact },
        },
      },
    })),

  setSummary: (summary) => set((s) => ({ data: { ...s.data, summary } })),

  addExperience: (item) =>
    set((s) => ({ data: { ...s.data, experience: [...(s.data.experience ?? []), { id: uid(), ...item }] } })),
  updateExperience: (id, item) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: s.data.experience?.map((e) => e.id === id ? {
          ...e, ...item,
          ...(item.description ? { description: item.description.filter((d) => d.replace(/<[^>]*>/g, '').trim() !== '') } : {}),
        } : e),
      },
    })),
  removeExperience: (id) =>
    set((s) => ({ data: { ...s.data, experience: s.data.experience?.filter((e) => e.id !== id) } })),

  addEducation: (item) =>
    set((s) => ({ data: { ...s.data, education: [...(s.data.education ?? []), { id: uid(), ...item }] } })),
  updateEducation: (id, item) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education?.map((e) => e.id === id ? {
          ...e, ...item,
          ...(item.description ? { description: item.description.filter((d) => d.replace(/<[^>]*>/g, '').trim() !== '') } : {}),
        } : e),
      },
    })),
  removeEducation: (id) =>
    set((s) => ({ data: { ...s.data, education: s.data.education?.filter((e) => e.id !== id) } })),

  addSkillCategory: (item) =>
    set((s) => ({ data: { ...s.data, skills: [...(s.data.skills ?? []), { id: uid(), ...item }] } })),
  updateSkillCategory: (id, item) =>
    set((s) => ({ data: { ...s.data, skills: s.data.skills?.map((e) => e.id === id ? { ...e, ...item } : e) } })),
  removeSkillCategory: (id) =>
    set((s) => ({ data: { ...s.data, skills: s.data.skills?.filter((e) => e.id !== id) } })),

  addProject: (item) =>
    set((s) => ({ data: { ...s.data, projects: [...(s.data.projects ?? []), { id: uid(), ...item }] } })),
  updateProject: (id, item) =>
    set((s) => ({
      data: {
        ...s.data,
        projects: s.data.projects?.map((e) => e.id === id ? {
          ...e, ...item,
          ...(Array.isArray(item.description) ? { description: item.description.filter((d) => d.replace(/<[^>]*>/g, '').trim() !== '') } : {}),
        } : e),
      },
    })),
  removeProject: (id) =>
    set((s) => ({ data: { ...s.data, projects: s.data.projects?.filter((e) => e.id !== id) } })),

  addCertificate: (item) =>
    set((s) => ({ data: { ...s.data, certificates: [...(s.data.certificates ?? []), { id: uid(), ...item }] } })),
  removeCertificate: (id) =>
    set((s) => ({ data: { ...s.data, certificates: s.data.certificates?.filter((e) => e.id !== id) } })),

  addAward: (item) =>
    set((s) => ({ data: { ...s.data, awards: [...(s.data.awards ?? []), { id: uid(), ...item }] } })),
  removeAward: (id) =>
    set((s) => ({ data: { ...s.data, awards: s.data.awards?.filter((e) => e.id !== id) } })),

  addLanguage: (item) =>
    set((s) => ({ data: { ...s.data, languages: [...(s.data.languages ?? []), { id: uid(), ...item }] } })),
  removeLanguage: (id) =>
    set((s) => ({ data: { ...s.data, languages: s.data.languages?.filter((e) => e.id !== id) } })),

  addVolunteer: (item) =>
    set((s) => ({ data: { ...s.data, volunteer: [...(s.data.volunteer ?? []), { id: uid(), ...item }] } })),
  removeVolunteer: (id) =>
    set((s) => ({ data: { ...s.data, volunteer: s.data.volunteer?.filter((e) => e.id !== id) } })),
}),
    { name: 'vectoros-template-resume' }
  )
)

