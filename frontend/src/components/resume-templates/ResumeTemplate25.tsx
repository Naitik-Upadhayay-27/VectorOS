// @ts-nocheck
// Template 25: Navy Sidebar CV — circular photo, dark navy left sidebar, clean white right
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, LanguageItem, VolunteerItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import PhotoUploadOverlay from '@/components/resume-editor/PhotoUploadOverlay'

const NAVY = '#2b3a52'

const ResumeTemplate25 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
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

  const contact = data.personalInfo?.contact ?? {}

  return (
    <div style={{ fontFamily, fontSize: `${fontSize}pt`, width: 794, minHeight: 1123, background: '#fff', display: 'flex' }}>

      {/* ── LEFT NAVY SIDEBAR ── */}
      <div style={{ width: 230, background: NAVY, flexShrink: 0, padding: '36px 20px 36px' }}>

        {/* Circular photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ borderRadius: '50%', overflow: 'hidden', width: 120, height: 120, border: '3px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
            <PhotoUploadOverlay size={120} style={{ borderRadius: '50%' }} />
          </div>
        </div>

        {/* Contact */}
        <SideSection label="Contact">
          {contact.email && (
            <SideContactRow icon="✉">
              <EditableText value={contact.email} onSave={v => setContact('email', v)} />
            </SideContactRow>
          )}
          {contact.phone && (
            <SideContactRow icon="📞">
              <EditableText value={contact.phone} onSave={v => setContact('phone', v)} />
            </SideContactRow>
          )}
          {contact.location && (
            <SideContactRow icon="📍">
              <EditableText value={contact.location} onSave={v => setContact('location', v)} />
            </SideContactRow>
          )}
          {contact.linkedin && (
            <SideContactRow icon="🌐">
              <EditableText value={contact.linkedin} onSave={v => setContact('linkedin', v)} />
            </SideContactRow>
          )}
        </SideSection>

        {/* Education */}
        {data.education?.length > 0 && (
          <SideSection label="Education">
            {data.education.map((edu: EducationItem) => (
              <div key={edu.id} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                </p>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', margin: '2px 0 1px', lineHeight: 1.3 }}>
                  <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                </p>
                <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                </p>
              </div>
            ))}
          </SideSection>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <SideSection label="Skills">
            <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
              {data.skills.flatMap((cat: SkillCategory) => cat.skills).map((s: string, i: number) => (
                <li key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 5, lineHeight: 1.4 }}>{s}</li>
              ))}
            </ul>
          </SideSection>
        )}

        {/* Languages */}
        {data.languages?.length > 0 && (
          <SideSection label="Language">
            {data.languages.map((l: LanguageItem) => (
              <p key={l.id} style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', margin: '0 0 6px' }}>{l.language}</p>
            ))}
          </SideSection>
        )}
      </div>

      {/* ── RIGHT MAIN ── */}
      <div style={{ flex: 1, minWidth: 0, padding: '36px 32px 32px' }}>

        {/* Name + title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.05, letterSpacing: '-0.5px' }}>
            <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
          </h1>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#555', margin: '6px 0 0', letterSpacing: '0.02em', lineHeight: 1.3 }}>
            <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
          </p>
        </div>

        {/* About Me */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <RightHeading>About Me</RightHeading>
            <p style={{ fontSize: 10.5, color: '#444', lineHeight: 1.7, margin: '10px 0 0', textAlign: 'justify' }}>
              <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
            </p>
          </div>
        )}

        {/* Work Experience */}
        {data.experience?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightHeading>Work Experience</RightHeading>
            {data.experience.map((exp: ExperienceItem) => (
              <div key={exp.id} style={{ marginTop: 14 }}>
                <p style={{ fontSize: 9.5, color: '#999', margin: 0 }}>
                  <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} />
                  {' - '}
                  <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                </p>
                <p style={{ fontSize: 10, color: '#777', margin: '1px 0 2px' }}>
                  <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
                  <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                </p>
                {exp.description?.map((d: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 3 }}>
                    <span style={{ color: '#555', marginTop: 2, flexShrink: 0 }}>•</span>
                    <p style={{ fontSize: 10.5, color: '#555', margin: 0, lineHeight: 1.6 }}>
                      <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline as="span" />
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {data.volunteer?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightHeading>References</RightHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginTop: 12 }}>
              {data.volunteer.map((v: VolunteerItem) => (
                <div key={v.id}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: '#111', margin: 0 }}>{v.role}</p>
                  <p style={{ fontSize: 10, color: '#666', margin: '2px 0 4px' }}>{v.organization}</p>
                  {v.description && (
                    <div style={{ fontSize: 9.5, color: '#555', lineHeight: 1.6 }}>
                      {v.description.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: '1px 0' }}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '0.02em' }}>{label}</p>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: 10 }} />
      {children}
    </div>
  )
}

function SideContactRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
      <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ wordBreak: 'break-all' }}>{children}</span>
    </div>
  )
}

function RightHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.01em' }}>{children}</p>
      <div style={{ borderBottom: '1.5px solid #ccc', marginTop: 5 }} />
    </div>
  )
}

export default ResumeTemplate25
