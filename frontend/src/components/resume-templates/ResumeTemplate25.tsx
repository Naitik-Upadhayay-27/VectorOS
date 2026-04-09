// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

const DARK = '#2b2d42'

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

      {/* ── LEFT DARK SIDEBAR ── */}
      <div style={{ width: 240, background: DARK, flexShrink: 0, padding: '36px 22px' }}>

        {/* Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          {data.personalInfo?.image ? (
            <img src={data.personalInfo.image} alt="Profile"
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }}>👤</span>
            </div>
          )}
        </div>

        {/* Contact */}
        <SideBlock label="Contact">
          {contact.phone && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0 }}>Phone</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '1px 0 0' }}><EditableText value={contact.phone} onSave={v => setContact('phone', v)} /></p>
            </div>
          )}
          {contact.email && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0 }}>Email</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '1px 0 0' }}><EditableText value={contact.email} onSave={v => setContact('email', v)} /></p>
            </div>
          )}
          {contact.location && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0 }}>Address</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '1px 0 0' }}><EditableText value={contact.location} onSave={v => setContact('location', v)} /></p>
            </div>
          )}
        </SideBlock>

        {/* Education */}
        {data.education?.length > 0 && (
          <SideBlock label="Education">
            {data.education.map((edu: EducationItem) => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                </p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', margin: '2px 0 0', lineHeight: 1.3 }}>
                  <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>
                  <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                </p>
              </div>
            ))}
          </SideBlock>
        )}

        {/* Expertise / Skills */}
        {data.skills?.length > 0 && (
          <SideBlock label="Expertise">
            <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
              {data.skills.flatMap((cat: SkillCategory) => cat.skills).map((s: string, i: number) => (
                <li key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{s}</li>
              ))}
            </ul>
          </SideBlock>
        )}

        {/* Languages */}
        {data.languages?.length > 0 && (
          <SideBlock label="Language">
            {data.languages.map((l: any) => (
              <div key={l.id} style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', margin: 0 }}>{l.language}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{l.proficiency}</p>
              </div>
            ))}
          </SideBlock>
        )}
      </div>

      {/* ── RIGHT MAIN ── */}
      <div style={{ flex: 1, minWidth: 0, padding: '36px 32px 32px' }}>

        {/* Name + title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.1 }}>
            <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: '5px 0 0', letterSpacing: '0.18em' }}>
            <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
          </p>
        </div>

        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#555', lineHeight: 1.65, margin: 0, textAlign: 'justify' }}>
              <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightHeading>Experience</RightHeading>
            {data.experience.map((exp: ExperienceItem) => (
              <div key={exp.id} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${DARK}`, background: '#fff', flexShrink: 0 }} />
                  <div style={{ width: 1, flex: 1, background: '#ddd', marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, paddingBottom: 10 }}>
                  <p style={{ fontSize: 10, color: '#999', margin: 0 }}>
                    <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> - <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                  </p>
                  <p style={{ fontSize: 10.5, color: '#666', margin: '1px 0 2px' }}>
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                    {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                  </p>
                  {exp.description?.map((d: string, i: number) => (
                    <p key={i} style={{ fontSize: 10.5, color: '#555', margin: 0, lineHeight: 1.65, textAlign: 'justify' }}>
                      <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline as="span" />
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reference */}
        {data.volunteer?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightHeading>Reference</RightHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              {data.volunteer.map((v: any) => (
                <div key={v.id}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>{v.role}</p>
                  <p style={{ fontSize: 10.5, color: '#666', margin: '2px 0 0' }}>{v.organization}</p>
                  {v.description && <p style={{ fontSize: 10, color: '#888', margin: '2px 0 0' }}>{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SideBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{label}</p>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: 10 }} />
      {children}
    </div>
  )
}

function RightHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>{children}</p>
      <div style={{ borderBottom: '1.5px solid #ccc', marginTop: 4 }} />
    </div>
  )
}

export default ResumeTemplate25
