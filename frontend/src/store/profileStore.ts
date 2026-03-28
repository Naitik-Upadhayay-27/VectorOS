import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  // Personal
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  website: string
  avatar: string
  summary: string
  // Career
  currentCompany: string
  yearsOfExperience: string
  employmentType: string
  currentSalary: string
  expectedSalary: string
  // Target
  targetRoles: string[]
  targetDomains: string[]
  targetLocations: string[]
  openToRemote: boolean
  // Skills (auto-filled from resume)
  topSkills: string[]
  // Meta
  profileCompleteness: number
}

const defaultProfile: UserProfile = {
  fullName: '', jobTitle: '', email: '', phone: '', location: '',
  linkedin: '', github: '', website: '', avatar: '', summary: '',
  currentCompany: '', yearsOfExperience: '', employmentType: 'full-time',
  currentSalary: '', expectedSalary: '',
  targetRoles: [], targetDomains: [], targetLocations: [],
  openToRemote: true, topSkills: [], profileCompleteness: 0,
}

function calcCompleteness(p: UserProfile): number {
  const fields = [p.fullName, p.jobTitle, p.email, p.phone, p.location,
    p.summary, p.currentCompany, p.yearsOfExperience,
    p.targetRoles.length > 0 ? 'x' : '', p.topSkills.length > 0 ? 'x' : '']
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

interface ProfileState {
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  fillFromOnboarding: (data: Partial<UserProfile>) => void
  fillFromResume: (data: Partial<UserProfile>) => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (p) => set((s) => {
        const updated = { ...s.profile, ...p }
        return { profile: { ...updated, profileCompleteness: calcCompleteness(updated) } }
      }),
      fillFromOnboarding: (data) => set((s) => {
        const updated = { ...s.profile, ...data }
        return { profile: { ...updated, profileCompleteness: calcCompleteness(updated) } }
      }),
      fillFromResume: (data) => set((s) => {
        // Only fill empty fields from resume — don't overwrite user edits
        const merged: UserProfile = { ...s.profile }
        for (const [k, v] of Object.entries(data)) {
          const key = k as keyof UserProfile
          const cur = s.profile[key]
          if (!cur || (Array.isArray(cur) && cur.length === 0)) {
            (merged as any)[key] = v
          }
        }
        return { profile: { ...merged, profileCompleteness: calcCompleteness(merged) } }
      }),
      reset: () => set({ profile: defaultProfile }),
    }),
    { name: 'vectoros-profile' }
  )
)
