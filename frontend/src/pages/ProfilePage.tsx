import { useState } from 'react'
import { User, Briefcase, Target, Zap, Save, CheckCircle, X, MapPin, Mail, Phone, Linkedin, Github, Globe, GraduationCap, FolderOpen, Award, Heart, ExternalLink, Plus, Trash2, Languages, TrendingUp, Sparkles, ChevronRight, Star, Clock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useProfileStore } from '@/store/profileStore'
import { useAuthStore } from '@/store/authStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useNavigate } from 'react-router-dom'

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
const EXP_OPTIONS = ['0-1 years', '1-2 years', '2-4 years', '4-6 years', '6-10 years', '10+ years']

function stripHtml(s: string) { return s?.replace(/<[^>]*>/g, '') || '' }

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  const add = () => { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput('') }
  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl min-h-[42px] focus-within:border-purple-400">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-lg font-medium">
          {t}<button onClick={() => onChange(tags.filter(x => x !== t))}><X size={10} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        onBlur={add} placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] text-xs outline-none bg-transparent text-gray-700 placeholder-gray-400" />
    </div>
  )
}

function Inp({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className={`px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 w-full bg-white ${className}`} />
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{children}</label>
}

function SecHead({ icon: Icon, title, color = 'text-purple-600', onAdd }: { icon: any; title: string; color?: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
      <div className="flex items-center gap-1.5"><Icon size={13} className={color} /><h3 className="text-xs font-bold text-gray-800">{title}</h3></div>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-lg hover:bg-purple-100 transition-colors"><Plus size={11} /> Add</button>}
    </div>
  )
}

function RightPanel() {
  const store = useTemplateResumeStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()
  const d = store.data

  const totalSkills = d.skills?.flatMap(s => s.skills).length || 0
  const totalExp = d.experience?.length || 0
  const totalProjects = d.projects?.length || 0
  const totalCerts = d.certificates?.length || 0
  const completeness = profile.profileCompleteness
  const latestExp = d.experience?.[0]
  const latestEdu = d.education?.[0]
  const allSkills = d.skills?.flatMap(s => s.skills) || []

  const tips = [
    totalSkills < 5 && 'Add more skills for better job matching',
    !profile.targetRoles.length && 'Set target roles for Magic Job Search',
    !profile.linkedin && 'Add LinkedIn to boost your profile',
    totalProjects < 2 && 'Add projects to showcase your work',
    !profile.expectedSalary && 'Add expected salary for better matches',
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-2.5">
      {/* Profile strength */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-3.5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Star size={11} className="text-yellow-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Profile Strength</p>
          </div>
          <span className="text-2xl font-bold">{completeness}<span className="text-sm text-purple-300">%</span></span>
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-gradient-to-r from-yellow-300 to-green-300 rounded-full transition-all" style={{ width: `${completeness}%` }} />
        </div>
        <p className="text-[10px] text-purple-200">
          {completeness >= 80 ? '🎉 Strong profile!' : completeness >= 50 ? '👍 Keep filling in details.' : '💡 Complete for better matches.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Skills', value: totalSkills, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Exp', value: totalExp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Projects', value: totalProjects, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Certs', value: totalCerts, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-lg p-2 text-center border border-white`}>
            <p className={`text-lg font-bold ${color} leading-none`}>{value}</p>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Current position */}
      {(latestExp || profile.jobTitle) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Current Position</p>
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Briefcase size={12} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{latestExp?.title || profile.jobTitle}</p>
              <p className="text-[11px] text-purple-600 truncate">{latestExp?.company || profile.currentCompany || '—'}</p>
              {latestExp && <p className="text-[10px] text-gray-400">{latestExp.startDate} – {latestExp.endDate}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {latestEdu && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Education</p>
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <GraduationCap size={12} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{latestEdu.degree}</p>
              <p className="text-[11px] text-blue-600 truncate">{latestEdu.institution}</p>
              <p className="text-[10px] text-gray-400">{latestEdu.graduationDate}{latestEdu.gpa ? ` · GPA ${latestEdu.gpa}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top skills */}
      {allSkills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Top Skills</p>
          <div className="flex flex-wrap gap-1">
            {allSkills.slice(0, 10).map(s => (
              <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-md border border-purple-100">{s}</span>
            ))}
            {allSkills.length > 10 && <span className="text-[10px] text-gray-400 self-center">+{allSkills.length - 10} more</span>}
          </div>
        </div>
      )}

      {/* Target roles + domains */}
      {(profile.targetRoles.length > 0 || profile.targetDomains.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Job Targets</p>
          {profile.targetRoles.length > 0 && (
            <div className="mb-1.5">
              <p className="text-[10px] text-gray-400 mb-1">Roles</p>
              <div className="flex flex-wrap gap-1">
                {profile.targetRoles.map(r => <span key={r} className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-medium">{r}</span>)}
              </div>
            </div>
          )}
          {profile.targetDomains.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Industries</p>
              <div className="flex flex-wrap gap-1">
                {profile.targetDomains.map(d => <span key={d} className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 font-medium">{d}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick wins */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} className="text-purple-500" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Quick Wins</p>
          </div>
          <div className="space-y-1.5">
            {tips.slice(0, 4).map(text => (
              <div key={text} className="flex items-start gap-1.5">
                <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <p className="text-[11px] text-gray-500 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button onClick={() => navigate('/jobs')}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-200 transition-all">
        <Sparkles size={12} /> Find Matching Jobs
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile } = useProfileStore()
  const { user } = useAuthStore()
  const store = useTemplateResumeStore()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'personal' | 'career' | 'target' | 'skills'>('personal')
  const p = profile
  const set = (patch: Partial<typeof profile>) => setProfile(patch)
  const d = store.data

  const syncFromResume = () => {
    const pi = d.personalInfo
    setProfile({
      fullName: pi?.name || p.fullName, jobTitle: pi?.title || p.jobTitle,
      email: pi?.contact?.email || p.email, phone: pi?.contact?.phone || p.phone,
      location: pi?.contact?.location || p.location, linkedin: pi?.contact?.linkedin || p.linkedin,
      github: pi?.contact?.github || p.github, summary: stripHtml(d.summary || '') || p.summary,
      topSkills: d.skills?.flatMap(s => s.skills).slice(0, 15) || p.topSkills,
    })
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'career',   label: 'Career',   icon: Briefcase },
    { id: 'target',   label: 'Target',   icon: Target },
    { id: 'skills',   label: 'Skills',   icon: Zap },
  ] as const

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200">
                {(p.fullName || user?.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{p.fullName || user?.name || 'Your Profile'}</h1>
                <p className="text-sm text-gray-500">{p.jobTitle || 'Add your job title'} {p.currentCompany ? `· ${p.currentCompany}` : ''}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${p.profileCompleteness}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{p.profileCompleteness}% complete</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={syncFromResume} className="px-4 py-2 text-xs font-semibold text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors">Sync from Resume</button>
              <button onClick={() => navigate('/resume/resume-1')} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-1.5"><ExternalLink size={12} /> Resume Editor</button>
              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${saved ? 'bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                {saved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> Save</>}
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-6 items-start">

            {/* Left — main content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-5 shadow-sm">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${tab === id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              {/* PERSONAL TAB */}
              {tab === 'personal' && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <SecHead icon={User} title="Personal Information" />
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Full Name</Label><Inp value={p.fullName} onChange={v => { set({ fullName: v }); store.setPersonalInfo({ name: v }) }} placeholder="Your Name" /></div>
                      <div><Label>Job Title</Label><Inp value={p.jobTitle} onChange={v => { set({ jobTitle: v }); store.setPersonalInfo({ title: v }) }} placeholder="Full Stack Developer" /></div>
                      <div><Label>Email</Label><div className="relative"><Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.email} onChange={e => { set({ email: e.target.value }); store.setContact({ email: e.target.value }) }} placeholder="you@example.com" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div><Label>Phone</Label><div className="relative"><Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.phone} onChange={e => { set({ phone: e.target.value }); store.setContact({ phone: e.target.value }) }} placeholder="+91 98765 43210" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div><Label>Location</Label><div className="relative"><MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.location} onChange={e => { set({ location: e.target.value }); store.setContact({ location: e.target.value }) }} placeholder="Gurgaon, India" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div><Label>LinkedIn</Label><div className="relative"><Linkedin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.linkedin} onChange={e => { set({ linkedin: e.target.value }); store.setContact({ linkedin: e.target.value }) }} placeholder="linkedin.com/in/yourprofile" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div><Label>GitHub</Label><div className="relative"><Github size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.github} onChange={e => { set({ github: e.target.value }); store.setContact({ github: e.target.value }) }} placeholder="github.com/yourusername" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div><Label>Website</Label><div className="relative"><Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={p.website} onChange={e => { set({ website: e.target.value }); store.setContact({ website: e.target.value }) }} placeholder="yourportfolio.com" className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 bg-white" /></div></div>
                      <div className="col-span-2"><Label>Professional Summary</Label><textarea value={stripHtml(p.summary)} onChange={e => { set({ summary: e.target.value }); store.setSummary(e.target.value) }} rows={3} placeholder="Brief professional summary..." className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400 resize-none bg-white" /></div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <SecHead icon={Briefcase} title="Work Experience" onAdd={() => store.addExperience({ title: '', company: '', location: '', startDate: '', endDate: '', description: [] })} />
                    {!(d.experience?.length) && <p className="text-xs text-gray-400 text-center py-4">No experience yet — click Add</p>}
                    <div className="space-y-2">
                      {(d.experience || []).map(exp => (
                        <div key={exp.id} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/50 group">
                          {/* Row 1: title + company + dates + delete */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={exp.title} onChange={e => store.updateExperience(exp.id, { title: e.target.value })} placeholder="Job Title"
                              className="flex-1 px-2 py-1 text-xs font-semibold border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 bg-white placeholder-gray-400" />
                            <input value={exp.company} onChange={e => store.updateExperience(exp.id, { company: e.target.value })} placeholder="Company"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700 bg-white placeholder-gray-400" />
                            <button onClick={() => store.removeExperience(exp.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
                          </div>
                          {/* Row 2: location + start + end */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={exp.location || ''} onChange={e => store.updateExperience(exp.id, { location: e.target.value })} placeholder="Location"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-600 bg-white placeholder-gray-400" />
                            <input value={exp.startDate} onChange={e => store.updateExperience(exp.id, { startDate: e.target.value })} placeholder="Start"
                              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-600 bg-white placeholder-gray-400" />
                            <span className="text-gray-300 text-xs">–</span>
                            <input value={exp.endDate} onChange={e => store.updateExperience(exp.id, { endDate: e.target.value })} placeholder="End"
                              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-600 bg-white placeholder-gray-400" />
                          </div>
                          {/* Bullets */}
                          <div className="space-y-1">
                            {(exp.description || []).map((bullet, i) => (
                              <div key={i} className="flex gap-1.5 items-center">
                                <span className="text-purple-300 text-[10px] shrink-0">•</span>
                                <input value={stripHtml(bullet)} onChange={e => { const desc = [...(exp.description || [])]; desc[i] = e.target.value; store.updateExperience(exp.id, { description: desc }) }} placeholder="Achievement..."
                                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-600 bg-white placeholder-gray-400" />
                                <button onClick={() => store.updateExperience(exp.id, { description: exp.description.filter((_, j) => j !== i) })} className="p-0.5 text-gray-300 hover:text-red-400"><X size={11} /></button>
                              </div>
                            ))}
                            <button onClick={() => store.updateExperience(exp.id, { description: [...(exp.description || []), ''] })} className="text-[10px] text-purple-400 hover:text-purple-600 flex items-center gap-0.5 ml-3"><Plus size={10} /> Add bullet</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <SecHead icon={GraduationCap} title="Education" color="text-blue-600" onAdd={() => store.addEducation({ degree: '', institution: '', location: '', graduationDate: '', gpa: '' })} />
                    {!(d.education?.length) && <p className="text-xs text-gray-400 text-center py-4">No education yet</p>}
                    <div className="space-y-2">
                      {(d.education || []).map(edu => (
                        <div key={edu.id} className="border border-gray-100 rounded-lg p-2.5 bg-blue-50/20 group">
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={edu.degree} onChange={e => store.updateEducation(edu.id, { degree: e.target.value })} placeholder="Degree"
                              className="flex-1 px-2 py-1 text-xs font-semibold border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-800 bg-white placeholder-gray-400" />
                            <input value={edu.institution} onChange={e => store.updateEducation(edu.id, { institution: e.target.value })} placeholder="Institution"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-700 bg-white placeholder-gray-400" />
                            <button onClick={() => store.removeEducation(edu.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input value={edu.location || ''} onChange={e => store.updateEducation(edu.id, { location: e.target.value })} placeholder="Location"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-600 bg-white placeholder-gray-400" />
                            <input value={edu.graduationDate} onChange={e => store.updateEducation(edu.id, { graduationDate: e.target.value })} placeholder="Graduation"
                              className="w-28 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-600 bg-white placeholder-gray-400" />
                            <input value={edu.gpa || ''} onChange={e => store.updateEducation(edu.id, { gpa: e.target.value })} placeholder="GPA"
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-600 bg-white placeholder-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <SecHead icon={FolderOpen} title="Projects" color="text-green-600" onAdd={() => store.addProject({ name: '', role: '', link: '', startDate: '', endDate: '', description: [], technologies: [] })} />
                    {!(d.projects?.length) && <p className="text-xs text-gray-400 text-center py-4">No projects yet</p>}
                    <div className="space-y-2">
                      {(d.projects || []).map(proj => (
                        <div key={proj.id} className="border border-gray-100 rounded-lg p-2.5 bg-green-50/20 group">
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={proj.name} onChange={e => store.updateProject(proj.id, { name: e.target.value })} placeholder="Project Name"
                              className="flex-1 px-2 py-1 text-xs font-semibold border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-800 bg-white placeholder-gray-400" />
                            <input value={proj.role || ''} onChange={e => store.updateProject(proj.id, { role: e.target.value })} placeholder="Role"
                              className="w-36 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-700 bg-white placeholder-gray-400" />
                            <button onClick={() => store.removeProject(proj.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={proj.link || ''} onChange={e => store.updateProject(proj.id, { link: e.target.value })} placeholder="github.com/you/project"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-600 bg-white placeholder-gray-400" />
                            <input value={proj.startDate || ''} onChange={e => store.updateProject(proj.id, { startDate: e.target.value })} placeholder="Start"
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-600 bg-white placeholder-gray-400" />
                            <span className="text-gray-300 text-xs">–</span>
                            <input value={proj.endDate || ''} onChange={e => store.updateProject(proj.id, { endDate: e.target.value })} placeholder="End"
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-600 bg-white placeholder-gray-400" />
                          </div>
                          <input value={(proj.technologies || []).join(', ')} onChange={e => store.updateProject(proj.id, { technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Tech: React, Node.js, MongoDB..."
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-600 bg-white placeholder-gray-400 mb-1.5" />
                          <div className="space-y-1">
                            {(Array.isArray(proj.description) ? proj.description : proj.description ? [proj.description] : []).map((b, i) => (
                              <div key={i} className="flex gap-1.5 items-center">
                                <span className="text-green-300 text-[10px] shrink-0">•</span>
                                <input value={stripHtml(b)} onChange={e => { const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description || '']; desc[i] = e.target.value; store.updateProject(proj.id, { description: desc }) }} placeholder="What did you build?"
                                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400 text-gray-600 bg-white placeholder-gray-400" />
                                <button onClick={() => { const desc = Array.isArray(proj.description) ? proj.description.filter((_, j) => j !== i) : []; store.updateProject(proj.id, { description: desc }) }} className="p-0.5 text-gray-300 hover:text-red-400"><X size={11} /></button>
                              </div>
                            ))}
                            <button onClick={() => { const desc = Array.isArray(proj.description) ? [...proj.description, ''] : ['']; store.updateProject(proj.id, { description: desc }) }} className="text-[10px] text-green-400 hover:text-green-600 flex items-center gap-0.5 ml-3"><Plus size={10} /> Add bullet</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <SecHead icon={Zap} title="Skills" color="text-orange-500" onAdd={() => store.addSkillCategory({ category: '', skills: [] })} />
                    {!(d.skills?.length) && <p className="text-xs text-gray-400 text-center py-4">No skills yet</p>}
                    <div className="space-y-2">
                      {(d.skills || []).map(cat => (
                        <div key={cat.id} className="border border-gray-100 rounded-lg p-2.5 bg-orange-50/30 group">
                          <div className="flex items-center gap-2 mb-1.5">
                            <input value={cat.category} onChange={e => store.updateSkillCategory(cat.id, { category: e.target.value })} placeholder="Category (e.g. Frontend)" className="flex-1 px-2 py-1 text-xs font-semibold border border-gray-200 rounded-lg outline-none focus:border-orange-400 text-gray-700 bg-white" />
                            <button onClick={() => store.removeSkillCategory(cat.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                          </div>
                          <TagInput tags={cat.skills} onChange={skills => store.updateSkillCategory(cat.id, { skills })} placeholder="Add skill, press Enter..." />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certs & Languages */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <SecHead icon={Award} title="Certifications" color="text-yellow-600" onAdd={() => store.addCertificate({ name: '', issuer: '', date: '' })} />
                      {!(d.certificates?.length) && <p className="text-xs text-gray-400 text-center py-4">None yet</p>}
                      <div className="space-y-2">
                        {(d.certificates || []).map(cert => (
                          <div key={cert.id} className="flex items-start justify-between p-2.5 bg-yellow-50 rounded-xl border border-yellow-100 group">
                            <div><p className="text-xs font-semibold text-gray-800">{cert.name || 'Certification'}</p><p className="text-[10px] text-gray-500">{cert.issuer} · {cert.date}</p></div>
                            <button onClick={() => store.removeCertificate(cert.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400"><Trash2 size={11} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <SecHead icon={Languages} title="Languages" color="text-teal-600" onAdd={() => store.addLanguage({ language: '', proficiency: '' })} />
                      {!(d.languages?.length) && <p className="text-xs text-gray-400 text-center py-4">None yet</p>}
                      <div className="space-y-2">
                        {(d.languages || []).map(lang => (
                          <div key={lang.id} className="flex items-center gap-2 group">
                            <div className="flex-1 px-3 py-2 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-800">{lang.language || 'Language'}</span>
                              <span className="text-xs text-teal-600 font-medium">{lang.proficiency}</span>
                            </div>
                            <button onClick={() => store.removeLanguage(lang.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'career' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Current Company</Label><Inp value={p.currentCompany} onChange={v => set({ currentCompany: v })} placeholder="Company Name" /></div>
                    <div><Label>Years of Experience</Label><select value={p.yearsOfExperience} onChange={e => set({ yearsOfExperience: e.target.value })} className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-800 bg-white"><option value="">Select...</option>{EXP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                    <div className="col-span-2"><Label>Employment Type</Label><div className="flex flex-wrap gap-2">{EMPLOYMENT_TYPES.map(t => <button key={t} onClick={() => set({ employmentType: t })} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all ${p.employmentType === t ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>{t}</button>)}</div></div>
                    <div><Label>Current Salary</Label><Inp value={p.currentSalary} onChange={v => set({ currentSalary: v })} placeholder="e.g. ₹8 LPA" /></div>
                    <div><Label>Expected Salary</Label><Inp value={p.expectedSalary} onChange={v => set({ expectedSalary: v })} placeholder="e.g. ₹12 LPA" /></div>
                    <div className="col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><input type="checkbox" id="remote" checked={p.openToRemote} onChange={e => set({ openToRemote: e.target.checked })} className="w-4 h-4 accent-purple-600 cursor-pointer" /><label htmlFor="remote" className="text-sm text-gray-700 font-medium cursor-pointer">Open to remote work</label></div>
                  </div>
                </div>
              )}

              {tab === 'target' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  {[{label:'Target Roles',key:'targetRoles' as const,ph:'e.g. Full Stack Developer...'},{label:'Target Industries',key:'targetDomains' as const,ph:'e.g. FinTech, EdTech...'},{label:'Preferred Locations',key:'targetLocations' as const,ph:'e.g. Bangalore, Remote...'}].map(({label,key,ph}) => (
                    <div key={key}><Label>{label}</Label><TagInput tags={p[key]} onChange={v => set({ [key]: v } as any)} placeholder={ph} /></div>
                  ))}
                </div>
              )}

              {tab === 'skills' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div><Label>Top Skills for Job Matching</Label><TagInput tags={p.topSkills} onChange={v => set({ topSkills: v })} placeholder="e.g. React, Node.js, TypeScript..." /></div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><p className="text-xs font-semibold text-purple-700 mb-1">💡 Used for Magic Job Search</p><p className="text-xs text-purple-600">Click "Sync from Resume" to auto-pull skills from your resume.</p></div>
                </div>
              )}
            </div>

            {/* Right panel — sticky */}
            <div className="w-72 shrink-0 sticky top-8 self-start">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}




