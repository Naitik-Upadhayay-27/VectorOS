export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  aiTokensLeft: number
}

export interface ResumeSection {
  id: string
  type: 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'volunteering'
  title: string
  items: ResumeItem[]
}

export interface ResumeItem {
  id: string
  [key: string]: string | string[] | undefined
}

export interface Resume {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
  personalInfo: PersonalInfo
  sections: ResumeSection[]
  score?: number
  version: number
}

export interface PersonalInfo {
  name: string
  jobTitle: string
  email: string
  phone: string
  city: string
  linkedin: string
  portfolio: string
  photo?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  url?: string
  extractedSkills: string[]
  extractedKeywords: string[]
  postedAt: string
  savedAt: string
}

export interface Application {
  id: string
  userId: string
  jobId: string
  job: Job
  resumeId: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  appliedAt?: string
  notes: string
  matchScore?: number
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MatchResult {
  score: number
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
}

