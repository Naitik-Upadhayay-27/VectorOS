// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'
import PhotoUploadOverlay from '@/components/resume-editor/PhotoUploadOverlay'

const NAVY = '#2c3e6b'

const ResumeTemplate24 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const layout = store.layout
  const fontFamily = layout?.fontFamily ?? "'Inter', sans-serif"
  const fontSize = layout?.fontSize ?? 11

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
  const setProj = (id: string, f: string, v: string) => store.updateProject(id, { [f]: v })
  const setProjBullet = (id: string, idx: number, v: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = v; store.updateProject(id, { description: desc })
  }

  const contact = data.personalInfo?.contact ?? {}

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary" style={{ marginBottom: 24 }}>
        <MainHeading color={NAVY}>PROFILE</MainHeading>
        <p style={{ fontSize: 11, color: '#444', lineHeight: 1.65, margin: '10px 0 0', textAlign: 'justify' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience" style={{ marginBottom: 24 }}>
        <MainHeading color={NAVY}>WORK EXPERIENCE</MainHeading>
        {data.experience.map((exp: ExperienceItem) => (
          <div key={exp.id} style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${NAVY}`, background: '#fff', flexShrink: 0 }} />
              <div style={{ width: 1, flex: 1, background: '#ddd', marginTop: 4 }} />
            </div>
            <div style={{ flex: 1, paddingBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                  </p>
                  <p style={{ fontSize: 11, color: '#666', margin: '1px 0 0' }}>
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                  </p>
                </div>
                <p style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> - <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                </p>
              </div>
              {exp.description?.length > 0 && (
                <ul style={{ margin: '6px 0 0 14px', padding: 0, listStyleType: 'disc' }}>
                  {exp.description.map((d: string, i: number) => (
                    <li key={i} style={{ fontSize: 10.5, color: '#555', lineHeight: 1.6, marginBottom: 2, textAlign: 'justify' }}>
                      <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <div key="education" style={{ marginBottom: 24 }}>
        <MainHeading color={NAVY}>EDUCATION</MainHeading>
        {data.education.map((edu: EducationItem) => (
          <div key={edu.id} style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${NAVY}`, background: '#fff', flexShrink: 0 }} />
              <div style={{ width: 1, flex: 1, background: '#ddd', marginTop: 4 }} />
            </div>
            <div style={{ flex: 1, paddingBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </p>
                  <p style={{ fontSize: 11, color: '#666', margin: '1px 0 0' }}>
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                  </p>
                  {edu.gpa && <p style={{ fontSize: 10.5, fontWeight: 700, color: '#444', margin: '2px 0 0' }}>GPA: {edu.gpa}</p>}
                </div>
                <p style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects" style={{ marginBottom: 24 }}>
        <MainHeading color={NAVY}>PROJECTS</MainHeading>
        {data.projects.map((proj: ProjectItem) => (
          <div key={proj.id} style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${NAVY}`, background: '#fff', flexShrink: 0 }} />
              <div style={{ width: 1, flex: 1, background: '#ddd', marginTop: 4 }} />
            </div>
            <div style={{ flex: 1, paddingBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>
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
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <SideSection key="skills" label="SKILLS" color={NAVY}>
        {data.skills.flatMap((cat: SkillCategory) => cat.skills).map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#fff' }}>{s}</span>
          </div>
        ))}
      </SideSection>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <SideSection key="languages" label="LANGUAGES" color={NAVY}>
        {data.languages.map((l: any) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#fff' }}>{l.language} ({l.proficiency})</span>
          </div>
        ))}
      </SideSection>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <SideSection key="volunteer" label="REFERENCE" color={NAVY}>
        {data.volunteer.map((v: any) => (
          <div key={v.id} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', margin: 0 }}>{v.role}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>{v.organization}</p>
            {v.description && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '2px 0 0' }}>{v.description}</p>}
          </div>
        ))}
      </SideSection>
    ) : null,
  }

  const mainSections = ['summary', 'experience', 'education', 'projects']
  const sideSections = ['skills', 'languages', 'volunteer']

  return (
    <div style={{ fontFamily, fontSize: `${fontSize}pt`, width: 794, minHeight: 1123, background: '#fff', display: 'flex' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 230, background: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '36px 24px' }}>

        {/* Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, pointerEvents: 'auto' }}>
          <PhotoUploadOverlay size={110} style={{ border: '3px solid rgba(255,255,255,0.3)' }} />
        </div>

        {/* Contact (fixed) */}
        <SideSection label="CONTACT" color={NAVY}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contact.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>📞</span>
                <span style={{ fontSize: 10, color: '#fff' }}><EditableText value={contact.phone} onSave={v => setContact('phone', v)} /></span>
              </div>
            )}
            {contact.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>✉</span>
                <span style={{ fontSize: 10, color: '#fff' }}><EditableText value={contact.email} onSave={v => setContact('email', v)} /></span>
              </div>
            )}
            {contact.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>📍</span>
                <span style={{ fontSize: 10, color: '#fff' }}><EditableText value={contact.location} onSave={v => setContact('location', v)} /></span>
              </div>
            )}
            {(contact.website || contact.linkedin) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>🌐</span>
                <span style={{ fontSize: 10, color: '#fff' }}><EditableText value={contact.website ?? contact.linkedin ?? ''} onSave={v => setContact('website', v)} /></span>
              </div>
            )}
          </div>
        </SideSection>

        {sectionOrder.filter(key => sideSections.includes(key)).map(key => sectionRenderers[key]?.())}
      </div>

      {/* ── RIGHT MAIN ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Name header */}
        <div style={{ background: NAVY, padding: '36px 32px 28px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '5px 0 0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
          </p>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          {sectionOrder.filter(key => mainSections.includes(key)).map(key => sectionRenderers[key]?.())}
        </div>
      </div>
    </div>
  )
}

function SideSection({ label, children, color }: { label: string; children: React.ReactNode; color: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '0.1em' }}>{label}</p>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.25)', marginBottom: 10 }} />
      {children}
    </div>
  )
}

function MainHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 800, color, margin: 0, letterSpacing: '0.08em' }}>{children}</p>
      <div style={{ borderBottom: `2px solid ${color}`, marginTop: 4 }} />
    </div>
  )
}

export default ResumeTemplate24
