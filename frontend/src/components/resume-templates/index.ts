import ResumeTemplate2 from './ResumeTemplate2'
import ResumeTemplate3 from './ResumeTemplate3'
import ResumeTemplate10 from './ResumeTemplate10'
import ResumeTemplate11 from './ResumeTemplate11'
import ResumeTemplate14 from './ResumeTemplate14'
import ResumeTemplate15 from './ResumeTemplate15'
import ResumeTemplate16 from './ResumeTemplate16'
import ResumeTemplate17 from './ResumeTemplate17'
import ResumeTemplate18 from './ResumeTemplate18'
import ResumeTemplate19 from './ResumeTemplate19'
import ResumeTemplate20 from './ResumeTemplate20'
import ResumeTemplate21 from './ResumeTemplate21'
import ResumeTemplate22 from './ResumeTemplate22'
import ResumeTemplate23 from './ResumeTemplate23'
import ResumeTemplate24 from './ResumeTemplate24'
import ResumeTemplate25 from './ResumeTemplate25'
import type { TemplateResumeData } from '@/types/resume'
import type { ComponentType } from 'react'

export interface TemplateConfig {
  id: number
  name: string
  component: ComponentType<{ data: TemplateResumeData }>
  thumbnail: string
  category: string
}

export const TEMPLATE_CATEGORIES = [
  { key: 'all',      label: 'All' },
  { key: 'tech',     label: 'Tech' },
  { key: 'finance',  label: 'Finance' },
  { key: 'business', label: 'Business' },
  { key: 'creative', label: 'Creative' },
  { key: 'general',  label: 'General' },
]

export const TEMPLATES: TemplateConfig[] = [
  // Tech
  { id: 21, name: 'Tech Resume 1',    component: ResumeTemplate21, thumbnail: '#111111', category: 'tech' },
  { id: 17, name: 'Tech Modern',      component: ResumeTemplate17, thumbnail: '#2d7d7d', category: 'tech' },
  { id: 19, name: 'Startup Green',    component: ResumeTemplate19, thumbnail: '#2e7d32', category: 'tech' },
  { id: 11, name: 'Template 11',      component: ResumeTemplate11, thumbnail: '#14b8a6', category: 'tech' },
  // Finance
  { id: 20, name: 'Fintech Pro',      component: ResumeTemplate20, thumbnail: '#1a1a2e', category: 'finance' },
  { id: 23, name: 'Accountant',       component: ResumeTemplate23, thumbnail: '#333333', category: 'finance' },
  // Business
  { id: 18, name: 'PM Classic',       component: ResumeTemplate18, thumbnail: '#2c2c2c', category: 'business' },
  { id: 15, name: 'Corporate Elite',  component: ResumeTemplate15, thumbnail: '#0ea5e9', category: 'business' },
  { id: 16, name: 'IIM Classic',      component: ResumeTemplate16, thumbnail: '#1a1a1a', category: 'business' },
  { id: 24, name: 'Blue Pro CV',      component: ResumeTemplate24, thumbnail: '#2c3e6b', category: 'business' },
  // Creative
  { id: 2,  name: 'Rose Modern',      component: ResumeTemplate2,  thumbnail: '#f43f5e', category: 'creative' },
  { id: 10, name: 'Template 10',      component: ResumeTemplate10, thumbnail: '#ec4899', category: 'creative' },
  { id: 14, name: 'Template 14',      component: ResumeTemplate14, thumbnail: '#a855f7', category: 'creative' },
  { id: 22, name: 'Creative Pro',     component: ResumeTemplate22, thumbnail: '#374151', category: 'creative' },
  { id: 25, name: 'Dark Sidebar CV',  component: ResumeTemplate25, thumbnail: '#2b2d42', category: 'creative' },
  // General
  { id: 3,  name: 'Slate Pro',        component: ResumeTemplate3,  thumbnail: '#475569', category: 'general' },
]
