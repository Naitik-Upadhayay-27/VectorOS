import ResumeTemplate1 from './ResumeTemplate1'
import ResumeTemplate2 from './ResumeTemplate2'
import ResumeTemplate3 from './ResumeTemplate3'
import ResumeTemplate4 from './ResumeTemplate4'
import ResumeTemplate6 from './ResumeTemplate6'
import ResumeTemplate7 from './ResumeTemplate7'
import ResumeTemplate8 from './ResumeTemplate8'
import ResumeTemplate9 from './ResumeTemplate9'
import ResumeTemplate10 from './ResumeTemplate10'
import ResumeTemplate11 from './ResumeTemplate11'
import ResumeTemplate12 from './ResumeTemplate12'
import ResumeTemplate13 from './ResumeTemplate13'
import ResumeTemplate14 from './ResumeTemplate14'
import ResumeTemplate15 from './ResumeTemplate15'
import type { TemplateResumeData } from '@/types/resume'
import type { ComponentType } from 'react'

export interface TemplateConfig {
  id: number
  name: string
  component: ComponentType<{ data: TemplateResumeData }>
  thumbnail: string   // color swatch for the picker
}

export const TEMPLATES: TemplateConfig[] = [
  { id: 1,  name: 'Classic Blue',    component: ResumeTemplate1,  thumbnail: '#3b82f6' },
  { id: 2,  name: 'Rose Modern',     component: ResumeTemplate2,  thumbnail: '#f43f5e' },
  { id: 3,  name: 'Slate Pro',       component: ResumeTemplate3,  thumbnail: '#475569' },
  { id: 4,  name: 'Template 4',      component: ResumeTemplate4,  thumbnail: '#8b5cf6' },
  { id: 6,  name: 'Template 6',      component: ResumeTemplate6,  thumbnail: '#10b981' },
  { id: 7,  name: 'Template 7',      component: ResumeTemplate7,  thumbnail: '#f59e0b' },
  { id: 8,  name: 'Template 8',      component: ResumeTemplate8,  thumbnail: '#06b6d4' },
  { id: 9,  name: 'Template 9',      component: ResumeTemplate9,  thumbnail: '#6366f1' },
  { id: 10, name: 'Template 10',     component: ResumeTemplate10, thumbnail: '#ec4899' },
  { id: 11, name: 'Template 11',     component: ResumeTemplate11, thumbnail: '#14b8a6' },
  { id: 12, name: 'Template 12',     component: ResumeTemplate12, thumbnail: '#f97316' },
  { id: 13, name: 'Template 13',     component: ResumeTemplate13, thumbnail: '#84cc16' },
  { id: 14, name: 'Template 14',     component: ResumeTemplate14, thumbnail: '#a855f7' },
  { id: 15, name: 'Template 15',     component: ResumeTemplate15, thumbnail: '#0ea5e9' },
]
