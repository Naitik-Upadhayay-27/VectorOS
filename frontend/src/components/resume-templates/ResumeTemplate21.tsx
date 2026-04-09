// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'

const ResumeTemplate21 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const layout = store.layout
  const fontFamily = layout?.fontFamily ?? "'Inter', sans-serif"
  const fontSize = layout?.fontSize ?? 11
  const marginTB = `${((layout?.marginTopBottom ?? 0) / 100).toFixed(2)}in`
  const marginLR = `${((layout?.marginLeftRight ?? 0) / 100).toFixed(2)}in`

  const setPI = (f: string, v: string) => store.setPersonalInfo({ [f]: v })
  const setContact = (f: string, v: string) => store.setContact({ [f]: v })
  const setExp = (id: string, f: string, v: string) => store.updateExperience(id, { [f]: v })
  const setExpBullet = (id: string, idx: number, v: string) => {
    const exp = data.experience?.find((e: ExperienceItem) => e.id === id)
    if (!exp) return
    const desc = [...(exp.description ?? [])]; desc[idx] = v
    store.updateExperience(id, { description: desc })
  }
  const setEdu = (id: string, f: string, v: string) => store.updateEducation(id, { [f]: v })
  const setSkill = (id: string, f: string, v: string) => store.updateSkillCategory(id, { [f]: v })
  const setProj = (id: string, f: string, v: string) => store.updateProject(id, { [f]: v })
  const setProjBullet = (id: string, idx: number, v: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = v; store.updateProject(id, { description: desc })
  }

  const contact = data.personalInfo?.contact ?? {}

  return (
    <div style={{ fontFamily, fontSize: `${fontSize}pt`, width: 794, minHeight: 1123, background: '#fff', padding: `${marginTB} ${marginLR}` }}>

      {/* ── Header ── */}
      <div style={{ padding: '40px 48px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.1 }}>
          <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
        </h1>
        <p style={{ fontSize: 16, fontWeight: 400, color: '#333', margin: '4px 0 0' }}>
          <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
        </p>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'flex', padding: '0 48px 40px', gap: 32 }}>

        {/* ── LEFT MAIN COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Summary */}
          {data.summary && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#444', lineHeight: 1.6, margin: 0 }}>
                <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeading>PROFESSIONAL EXPERIENCE</SectionHeading>
              {data.experience.map((exp: ExperienceItem) => (
                <div key={exp.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>
                        <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                      </p>
                      <p style={{ fontSize: 11, color: '#555', margin: '1px 0 0' }}>
                        <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                        {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                      </p>
                    </div>
                    <p style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> - <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                    </p>
                  </div>
                  {exp.description?.length > 0 && (
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                      {exp.description.map((d: string, i: number) => (
                        <li key={i} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.55, marginBottom: 2 }}>
                          <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {data.skills?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeading>SKILLS</SectionHeading>
              {data.skills.map((cat: SkillCategory) => (
                <div key={cat.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {cat.skills.map((s: string, i: number) => (
                      <span key={i} style={{ fontSize: 10.5, color: '#333' }}>• {s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeading>KEY PROJECTS</SectionHeading>
              {data.projects.map((proj: ProjectItem) => (
                <div key={proj.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>
                    <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                  </p>
                  {proj.role && <p style={{ fontSize: 10.5, color: '#555', margin: '1px 0 0' }}><EditableText value={proj.role} onSave={v => setProj(proj.id, 'role', v)} /></p>}
                  {Array.isArray(proj.description) && proj.description.length > 0 && (
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                      {proj.description.map((d: string, i: number) => (
                        <li key={i} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.55 }}>
                          <EditableText value={d} onSave={v => setProjBullet(proj.id, i, v)} multiline />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ width: 190, flexShrink: 0 }}>

          {/* Contact */}
          <div style={{ marginBottom: 20 }}>
            {contact.phone && <p style={{ fontSize: 10.5, color: '#333', margin: '0 0 3px' }}><EditableText value={contact.phone} onSave={v => setContact('phone', v)} /></p>}
            {contact.email && <p style={{ fontSize: 10.5, color: '#333', margin: '0 0 3px' }}><EditableText value={contact.email} onSave={v => setContact('email', v)} /></p>}
            {contact.linkedin && <p style={{ fontSize: 10.5, color: '#333', margin: '0 0 3px' }}><EditableText value={contact.linkedin} onSave={v => setContact('linkedin', v)} /></p>}
            {contact.location && <p style={{ fontSize: 10.5, color: '#333', margin: '0 0 3px' }}><EditableText value={contact.location} onSave={v => setContact('location', v)} /></p>}
          </div>

          {/* Education */}
          {data.education?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SideHeading>EDUCATION</SideHeading>
              {data.education.map((edu: EducationItem) => (
                <div key={edu.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.3 }}>
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </p>
                  <p style={{ fontSize: 10.5, color: '#555', margin: '2px 0 0' }}>
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                  </p>
                  <p style={{ fontSize: 10, color: '#777', margin: '1px 0 0' }}>
                    <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certificates?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SideHeading>CERTIFICATIONS</SideHeading>
              {data.certificates.map((cert: any) => (
                <div key={cert.id} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.3 }}>{cert.name}</p>
                  <p style={{ fontSize: 10, color: '#666', margin: '1px 0 0' }}>{cert.issuer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SideHeading>LANGUAGES</SideHeading>
              {data.languages.map((lang: any) => (
                <p key={lang.id} style={{ fontSize: 10.5, color: '#333', margin: '0 0 3px' }}>{lang.language} — {lang.proficiency}</p>
              ))}
            </div>
          )}

          {/* Volunteer / Associations */}
          {data.volunteer?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SideHeading>ASSOCIATIONS</SideHeading>
              {data.volunteer.map((vol: any) => (
                <p key={vol.id} style={{ fontSize: 10.5, color: '#333', margin: '0 0 4px', lineHeight: 1.4 }}>{vol.role}{vol.organization ? `, ${vol.organization}` : ''}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Black footer bar ── */}

    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1.5px solid #111', marginBottom: 8, paddingBottom: 2 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '0.05em' }}>{children}</p>
    </div>
  )
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{children}</p>
  )
}

export default ResumeTemplate21
