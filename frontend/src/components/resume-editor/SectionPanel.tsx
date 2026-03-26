import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Lightbulb, GripVertical, ChevronRight, Sparkles } from 'lucide-react'
import Input from '@/components/ui/Input'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'

export type SectionType =
  | 'experience' | 'education' | 'skills' | 'projects'
  | 'certifications' | 'languages' | 'volunteering' | 'awards'

interface SectionPanelProps {
  type: SectionType
  title: string
  tip?: string
}

const defaultTips: Record<SectionType, string> = {
  experience: 'Use strong action verbs (Led, Built, Increased) and quantify results with numbers.',
  education: 'Include GPA if above 3.5. Add relevant coursework or honors.',
  skills: 'Group skills by category. List most relevant skills first.',
  projects: 'Include live links and tech stack. Quantify impact where possible.',
  certifications: 'List the most recent and relevant certifications first.',
  languages: 'Be honest about proficiency levels — recruiters may test you.',
  volunteering: 'Highlight leadership roles and measurable community impact.',
  awards: 'Include the awarding body and year for credibility.',
}

export default function SectionPanel({ type, title, tip }: SectionPanelProps) {
  const [open, setOpen] = useState(true)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const store = useTemplateResumeStore()

  const items = (() => {
    switch (type) {
      case 'experience':     return store.data.experience ?? []
      case 'education':      return store.data.education ?? []
      case 'skills':         return store.data.skills ?? []
      case 'projects':       return store.data.projects ?? []
      case 'certifications': return store.data.certificates ?? []
      case 'languages':      return store.data.languages ?? []
      case 'volunteering':   return store.data.volunteer ?? []
      case 'awards':         return store.data.awards ?? []
      default:               return []
    }
  })()

  const handleAdd = (fields: Record<string, string>) => {
    switch (type) {
      case 'experience':
        store.addExperience({
          title: fields.title, company: fields.company, location: fields.location,
          startDate: fields.startDate, endDate: fields.endDate,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
        }); break
      case 'education':
        store.addEducation({
          degree: fields.degree, institution: fields.institution,
          location: fields.location, graduationDate: fields.graduationDate,
          gpa: fields.gpa,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
        }); break
      case 'skills':
        store.addSkillCategory({
          category: fields.category,
          skills: fields.skills ? fields.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }); break
      case 'projects':
        store.addProject({
          name: fields.name, role: fields.role, link: fields.link,
          startDate: fields.startDate, endDate: fields.endDate,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
          technologies: fields.technologies ? fields.technologies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }); break
      case 'certifications':
        store.addCertificate({ name: fields.name, issuer: fields.issuer, date: fields.date }); break
      case 'languages':
        store.addLanguage({ language: fields.language, proficiency: fields.proficiency }); break
      case 'volunteering':
        store.addVolunteer({
          role: fields.role, organization: fields.organization,
          startDate: fields.startDate, endDate: fields.endDate, description: fields.description,
        }); break
      case 'awards':
        store.addAward({ title: fields.title, date: fields.date, description: fields.description }); break
    }
    setAddingNew(false)
  }

  const handleRemove = (id: string) => {
    switch (type) {
      case 'experience':     store.removeExperience(id); break
      case 'education':      store.removeEducation(id); break
      case 'skills':         store.removeSkillCategory(id); break
      case 'projects':       store.removeProject(id); break
      case 'certifications': store.removeCertificate(id); break
      case 'languages':      store.removeLanguage(id); break
      case 'volunteering':   store.removeVolunteer(id); break
      case 'awards':         store.removeAward(id); break
    }
  }

  const handleUpdate = (id: string, fields: Record<string, string>) => {
    switch (type) {
      case 'experience':
        store.updateExperience(id, {
          title: fields.title, company: fields.company, location: fields.location,
          startDate: fields.startDate, endDate: fields.endDate,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
        }); break
      case 'education':
        store.updateEducation(id, {
          degree: fields.degree, institution: fields.institution,
          location: fields.location, graduationDate: fields.graduationDate, gpa: fields.gpa,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
        }); break
      case 'skills':
        store.updateSkillCategory(id, {
          category: fields.category,
          skills: fields.skills ? fields.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }); break
      case 'projects':
        store.updateProject(id, {
          name: fields.name, role: fields.role, link: fields.link,
          startDate: fields.startDate, endDate: fields.endDate,
          description: fields.description ? fields.description.split('\n').filter(Boolean) : [],
          technologies: fields.technologies ? fields.technologies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }); break
    }
  }

  const getItemLabel = (item: Record<string, unknown>) =>
    (item.title || item.name || item.degree || item.category || item.language || item.role || item.organization || 'Entry') as string

  const getItemSub = (item: Record<string, unknown>) =>
    (item.company || item.institution || item.issuer || item.organization || '') as string

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-card overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {items.length > 0 && (
            <span className="text-xs bg-brand-50 text-brand-500 px-1.5 py-0.5 rounded-full font-medium">
              {items.length}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {/* Tips */}
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="w-full flex items-center justify-between py-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb size={12} className="text-yellow-400" />
              Tips and Recommendations
            </span>
            {tipsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {tipsOpen && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 leading-relaxed">
              {tip ?? defaultTips[type]}
            </div>
          )}

          {/* Existing items — each expandable for editing */}
          {(items as unknown as Array<Record<string, unknown>>).map((item) => (
            <ItemCard
              key={item.id as string}
              item={item}
              type={type}
              label={getItemLabel(item)}
              sub={getItemSub(item)}
              onRemove={() => handleRemove(item.id as string)}
              onUpdate={(fields) => handleUpdate(item.id as string, fields)}
            />
          ))}

          {/* New item form */}
          {addingNew && (
            <ItemForm
              type={type}
              onSave={handleAdd}
              onCancel={() => setAddingNew(false)}
              isNew
            />
          )}

          {/* Add more button — always visible */}
          {!addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 border-2 border-dashed border-gray-200 rounded-xl text-xs text-brand-500 hover:border-brand-300 hover:bg-brand-50/50 font-medium transition-all"
            >
              <Plus size={14} />
              Add {singularLabel(title)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Item card with expand-to-edit ──────────────────────────────────────────

function ItemCard({
  item, type, label, sub, onRemove, onUpdate,
}: {
  item: Record<string, unknown>
  type: SectionType
  label: string
  sub: string
  onRemove: () => void
  onUpdate: (fields: Record<string, string>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [improving, setImproving] = useState(false)
  const [improveChanges, setImproveChanges] = useState<string[] | null>(null)
  const { data: onboardingData } = useOnboardingStore()
  const { data: resumeData } = useTemplateResumeStore()

  const handleImprove = async () => {
    setImproving(true)
    setImproveChanges(null)
    try {
      const fields = itemToFields(item, type)
      const content = fields.description || fields.skills || JSON.stringify(fields)
      const res = await apiFetch(`${API_BASE}/api/ai/improve-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: type,
          content,
          targetRole: onboardingData.jobTitle,
          targetDomains: onboardingData.targetDomains,
          currentRole: resumeData.personalInfo?.title || onboardingData.jobTitle,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Apply improved content back
      if (data.improved) {
        const updated = { ...fields }
        if (type === 'experience' || type === 'education' || type === 'projects') {
          updated.description = Array.isArray(data.improved)
            ? data.improved.join('\n')
            : data.improved
        } else if (type === 'skills') {
          updated.skills = Array.isArray(data.improved)
            ? data.improved.join(', ')
            : data.improved
        } else {
          updated.description = typeof data.improved === 'string'
            ? data.improved
            : JSON.stringify(data.improved)
        }
        onUpdate(updated)
      }
      if (data.changes?.length) setImproveChanges(data.changes)
    } catch (e: any) {
      setImproveChanges([`Error: ${e.message}`])
    } finally {
      setImproving(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <GripVertical size={13} className="text-gray-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
          {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
        </div>
        <button
          onClick={handleImprove}
          disabled={improving}
          title="Improve with AI"
          className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-brand-500 transition-colors disabled:opacity-40"
        >
          {improving
            ? <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            : <Sparkles size={13} />}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-brand-500 transition-colors"
        >
          <ChevronRight size={13} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <button onClick={onRemove} className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* AI improvement summary */}
      {improveChanges && (
        <div className="px-3 py-2 bg-brand-50 border-t border-brand-100">
          <p className="text-xs font-semibold text-brand-600 mb-1 flex items-center gap-1">
            <Sparkles size={11} /> AI improvements applied
          </p>
          <ul className="space-y-0.5">
            {improveChanges.map((c, i) => (
              <li key={i} className="text-xs text-brand-700 flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>{c}
              </li>
            ))}
          </ul>
          <button onClick={() => setImproveChanges(null)} className="text-xs text-brand-400 hover:text-brand-600 mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <div className="p-3 border-t border-gray-100 bg-white">
          <ItemForm
            type={type}
            initialValues={itemToFields(item, type)}
            onSave={(fields) => { onUpdate(fields); setExpanded(false) }}
            onCancel={() => setExpanded(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Convert stored item back to flat string fields for the form ────────────

function itemToFields(item: Record<string, unknown>, type: SectionType): Record<string, string> {
  const str = (v: unknown) => (v as string) ?? ''
  const arr = (v: unknown) => Array.isArray(v) ? (v as string[]).join('\n') : str(v)
  const csv = (v: unknown) => Array.isArray(v) ? (v as string[]).join(', ') : str(v)

  switch (type) {
    case 'experience':
      return { title: str(item.title), company: str(item.company), location: str(item.location), startDate: str(item.startDate), endDate: str(item.endDate), description: arr(item.description) }
    case 'education':
      return { degree: str(item.degree), institution: str(item.institution), location: str(item.location), graduationDate: str(item.graduationDate), gpa: str(item.gpa), description: arr(item.description) }
    case 'skills':
      return { category: str(item.category), skills: csv(item.skills) }
    case 'projects':
      return { name: str(item.name), role: str(item.role), link: str(item.link), startDate: str(item.startDate), endDate: str(item.endDate), technologies: csv(item.technologies), description: arr(item.description) }
    case 'certifications':
      return { name: str(item.name), issuer: str(item.issuer), date: str(item.date) }
    case 'languages':
      return { language: str(item.language), proficiency: str(item.proficiency) }
    case 'volunteering':
      return { role: str(item.role), organization: str(item.organization), startDate: str(item.startDate), endDate: str(item.endDate), description: str(item.description) }
    case 'awards':
      return { title: str(item.title), date: str(item.date), description: str(item.description) }
    default:
      return {}
  }
}

// ── Reusable form for add / edit ───────────────────────────────────────────

function ItemForm({
  type, initialValues = {}, onSave, onCancel, isNew = false,
}: {
  type: SectionType
  initialValues?: Record<string, string>
  onSave: (f: Record<string, string>) => void
  onCancel: () => void
  isNew?: boolean
}) {
  const [fields, setFields] = useState<Record<string, string>>(initialValues)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  // Helper renderers — plain functions returning JSX, NOT components (no useState/hooks)
  const field = (label: string, k: string, placeholder = '', half = false) => (
    <div className={half ? '' : 'col-span-2'}>
      <Input label={label} placeholder={placeholder} value={fields[k] ?? ''} onChange={set(k)} />
    </div>
  )
  const textarea = (label: string, k: string, placeholder = '', rows = 3) => (
    <div className="col-span-2 flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={fields[k] ?? ''}
        onChange={set(k)}
        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-gray-400"
      />
    </div>
  )

  const formFields: Record<SectionType, React.ReactNode> = {
    experience: (
      <>
        {field('Job Title *',    'title',       'Senior Software Engineer')}
        {field('Company *',      'company',     'Acme Inc.')}
        {field('Location',       'location',    'New York, NY / Remote')}
        {field('Start Date',     'startDate',   'Jan 2022',  true)}
        {field('End Date',       'endDate',     'Present',   true)}
        {textarea('Bullet Points (one per line)', 'description', 'Led a team of 5 engineers...\nReduced load time by 40%...', 4)}
      </>
    ),
    education: (
      <>
        {field('Degree *',         'degree',         'B.S. Computer Science')}
        {field('Institution *',    'institution',    'MIT')}
        {field('Location',         'location',       'Cambridge, MA')}
        {field('Graduation Date',  'graduationDate', 'May 2024',    true)}
        {field('GPA',              'gpa',            '3.8 / 4.0',  true)}
        {textarea("Honors / Coursework (one per line)", 'description', "Dean's List 2022–2024\nRelevant: Algorithms, ML...", 3)}
      </>
    ),
    skills: (
      <>
        {field('Category *', 'category', 'Frontend / Backend / Tools')}
        {textarea('Skills (comma separated)', 'skills', 'React, TypeScript, Node.js, PostgreSQL', 2)}
      </>
    ),
    projects: (
      <>
        {field('Project Name *',   'name',         'My SaaS App')}
        {field('Your Role',        'role',         'Lead Developer')}
        {field('Live Link / Repo', 'link',         'github.com/you/project')}
        {field('Start Date',       'startDate',    'Jan 2024', true)}
        {field('End Date',         'endDate',      'Present',  true)}
        {textarea('Technologies (comma separated)', 'technologies', 'React, Node.js, PostgreSQL, AWS', 2)}
        {textarea('Description (one bullet per line)', 'description', 'Built X feature that increased Y by Z%...\nIntegrated payment system...', 4)}
      </>
    ),
    certifications: (
      <>
        {field('Certificate Name *', 'name',         'AWS Solutions Architect')}
        {field('Issuing Body *',      'issuer',       'Amazon Web Services')}
        {field('Date Issued',         'date',         'Mar 2024',    true)}
        {field('Credential ID',       'credentialId', 'ABC-12345',   true)}
      </>
    ),
    languages: (
      <>
        {field('Language *',    'language',    'Spanish',                   true)}
        {field('Proficiency *', 'proficiency', 'Native / Fluent / B2 / A2', true)}
      </>
    ),
    volunteering: (
      <>
        {field('Role *',         'role',         'Technical Mentor')}
        {field('Organization *', 'organization', 'Code.org')}
        {field('Location',       'location',     'Remote')}
        {field('Start Date',     'startDate',    'Sep 2022', true)}
        {field('End Date',       'endDate',      'Present',  true)}
        {textarea('Description', 'description', 'Mentored 10+ students in web development...', 3)}
      </>
    ),
    awards: (
      <>
        {field('Award Title *', 'title', 'Engineer of the Year')}
        {field('Issuing Body',  'issuer', 'Company / Organization')}
        {field('Date',          'date',   'Dec 2023', true)}
        {textarea('Description', 'description', 'Recognized for outstanding contributions to...', 2)}
      </>
    ),
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {formFields[type]}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(fields)}
          className="flex-1 py-2 bg-brand-500 text-white text-xs font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          {isNew ? 'Add' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function singularLabel(title: string) {
  const map: Record<string, string> = {
    'Work Experience': 'Experience',
    'Education': 'Education',
    'Skills': 'Skill Category',
    'Projects': 'Project',
    'Certifications': 'Certification',
    'Languages': 'Language',
    'Volunteering & Leadership': 'Entry',
    'Awards': 'Award',
  }
  return map[title] ?? title.replace(/s$/, '')
}

