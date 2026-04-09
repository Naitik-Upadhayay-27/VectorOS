// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

const ResumeTemplate22 = ({ data }: { data: TemplateResumeData }) => {
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
  const setEduBullet = (id: string, idx: number, v: string) => {
    const edu = data.education?.find((e: EducationItem) => e.id === id)
    if (!edu) return
    const desc = [...(edu.description ?? [])]; desc[idx] = v
    store.updateEducation(id, { description: desc })
  }
  const setProj = (id: string, f: string, v: string) => store.updateProject(id, { [f]: v })
  const setProjBullet = (id: string, idx: number, v: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = v; store.updateProject(id, { description: desc })
  }

  const contact = data.personalInfo?.contact ?? {}
  const contactLine = [contact.location, contact.email, contact.website || contact.linkedin].filter(Boolean).join(' | ')

  return (
    <div style={{ fontFamily, fontSize: `${fontSize}pt`, width: 794, minHeight: 1123, background: '#fff', padding: `${marginTB} ${marginLR}` }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '36px 48px 20px' }}>
        <div style={{ flexShrink: 0 }}>
          {data.personalInfo?.image ? (
            <img src={data.personalInfo.image} alt="Profile"
              style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }} />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, color: '#9ca3af' }}>👤</span>
            </div>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
          </h1>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#555', margin: '5px 0 0', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1.5px solid #111', margin: '0 48px 10px' }} />

      <div style={{ padding: '6px 48px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 10.5, color: '#444', margin: 0 }}>{contactLine || 'City, Country | email@example.com | www.yoursite.com'}</p>
      </div>

      <div style={{ borderTop: '1px solid #ccc', margin: '0 48px 20px' }} />

      <div style={{ padding: '0 48px 40px' }}>

        {data.summary && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#333', lineHeight: 1.65, margin: 0, textAlign: 'justify' }}>
              <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
            </p>
          </div>
        )}

        {data.skills?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>SKILLS</SectionHeading>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 40px', marginTop: 6 }}>
              {data.skills.flatMap((cat: SkillCategory) => cat.skills).map((s: string, i: number) => (
                <span key={i} style={{ fontSize: 10.5, color: '#333' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.awards?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>KEY ACHIEVEMENTS</SectionHeading>
            {data.awards.map((award: any) => (
              <div key={award.id} style={{ marginBottom: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: 0 }}>{award.title}</p>
                {award.description && <p style={{ fontSize: 10.5, color: '#444', margin: '2px 0 0', lineHeight: 1.5 }}>{award.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.experience?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>PROFESSIONAL EXPERIENCE</SectionHeading>
            {data.experience.map((exp: ExperienceItem) => (
              <div key={exp.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: '#111', margin: 0 }}>
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                    {exp.company && <>, <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} /></>}
                  </p>
                  <p style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                  </p>
                </div>
                {exp.description?.length > 0 && (
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                    {exp.description.map((d: string, i: number) => (
                      <li key={i} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.6, marginBottom: 2 }}>
                        <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>EDUCATION</SectionHeading>
            {data.education.map((edu: EducationItem) => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: '#111', margin: 0 }}>
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </p>
                  <p style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                  </p>
                </div>
                <p style={{ fontSize: 10.5, color: '#555', margin: '2px 0 0' }}>
                  <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                </p>
                {edu.description?.map((d: string, i: number) => (
                  <p key={i} style={{ fontSize: 10.5, color: '#666', margin: '2px 0 0', lineHeight: 1.5 }}>
                    <EditableText value={d} onSave={v => setEduBullet(edu.id, i, v)} multiline as="span" />
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {(data.languages?.length > 0 || data.certificates?.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>ADDITIONAL INFO</SectionHeading>
            {data.languages?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Languages: </span>
                <span style={{ fontSize: 10.5, color: '#444' }}>{data.languages.map((l: any) => `${l.language} – ${l.proficiency}`).join(', ')}.</span>
              </div>
            )}
            {data.certificates?.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Certifications: </span>
                <span style={{ fontSize: 10.5, color: '#444' }}>{data.certificates.map((c: any) => c.name).join(', ')}.</span>
              </div>
            )}
          </div>
        )}

        {data.projects?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>PROJECTS</SectionHeading>
            {data.projects.map((proj: ProjectItem) => (
              <div key={proj.id} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: '#111', margin: 0 }}>
                  <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                </p>
                {Array.isArray(proj.description) && proj.description.length > 0 && (
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                    {proj.description.map((d: string, i: number) => (
                      <li key={i} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.6 }}>
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
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1.5px solid #111', marginBottom: 8, paddingBottom: 3 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.06em' }}>{children}</p>
    </div>
  )
}

export default ResumeTemplate22
