export interface TemplateResumeData {
  personalInfo?: {
    name?: string
    title?: string
    image?: string
    contact?: {
      email?: string
      phone?: string
      location?: string
      linkedin?: string
      github?: string
      website?: string
    }
  }
  summary?: string
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skills?: SkillCategory[]
  projects?: ProjectItem[]
  certificates?: CertificateItem[]
  awards?: AwardItem[]
  languages?: LanguageItem[]
  publications?: PublicationItem[]
  memberships?: MembershipItem[]
  volunteer?: VolunteerItem[]
}

export interface ExperienceItem {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate: string
  description: string[]
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  location?: string
  graduationDate: string
  gpa?: string
  description?: string[]
}

export interface SkillCategory {
  id: string
  category: string
  skills: string[]
}

export interface ProjectItem {
  id: string
  name: string
  role?: string
  link?: string
  date?: string
  startDate?: string
  endDate?: string
  description?: string | string[]
  technologies?: string[]
}

export interface CertificateItem {
  id: string
  name: string
  issuer: string
  date: string
}

export interface AwardItem {
  id: string
  title: string
  date: string
  description?: string
}

export interface LanguageItem {
  id: string
  language: string
  proficiency: string
}

export interface PublicationItem {
  id: string
  title: string
  authors: string
  journal: string
  date: string
  url?: string
}

export interface MembershipItem {
  id: string
  organization: string
  role?: string
  startDate: string
  endDate: string
}

export interface VolunteerItem {
  id: string
  role: string
  organization: string
  startDate: string
  endDate: string
  description?: string
}

