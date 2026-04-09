// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

const ResumeTemplate23 = ({ data }: { data: TemplateResumeData }) => {
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
    <div style={{ fontFamily, fontSize: `${fontSize}pt`, width: 794, minHeight: 1123, background: '#fff' }}>

      {/* ── Gray header ── */}
      <div style={{ background: '#f3f3f3', padding: '36px 48px 28px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
          <EditableText value={data.personalInfo?.name ?? 'Your Name'} onSave={v => setPI('name', v)} />
        </h1>
        <p style={{ fontSize: 14, fontWeight: 400, color: '#555', margin: '4px 0 0' }}>
          <EditableText value={data.personalInfo?.title ?? 'Your Title'} onSave={v => setPI('title', v)} />
        </p>
      </div>

      {/* ── About Me ── */}
      {data.summary && (
        <div style={{ padding: '24px 48px 0' }}>
          <SectionHeading>ABOUT ME</SectionHeading>
          <p style={{ fontSize: 11, color: '#444', lineHeight: 1.65, margin: '8px 0 0' }}>
            <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
          </p>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div style={{ display: 'flex', padding: '24px 48px 40px', gap: 32 }}>

        {/* LEFT — Education + Experience */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {data.education?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeading>EDUCATION</SectionHeading>
              {data.education.map((edu: EducationItem) => (
                <div key={edu.id} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 10.5, color: '#888', margin: '8px 0 2px' }}>
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                    {edu.graduationDate && <> | <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} /></>}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </p>
                  {edu.description?.map((d: string, i: number) => (
                    <p key={i} style={{ fontSize: 10.5, color: '#555', margin: 0, lineHeight: 1.6 }}>
                      <EditableText value={d} onSave={v => { const desc = [...(edu.description ?? [])]; desc[i] = v; store.updateEducation(edu.id, { description: desc }) }} multiline as="span" />
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {data.experience?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeading>WORK EXPERIENCE</SectionHeading>
              {data.experience.map((exp: ExperienceItem) => (
                <div key={exp.id} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 10.5, color: '#888', margin: '8px 0 2px' }}>
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                    {(exp.startDate || exp.endDate) && <> | <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> - <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} /></>}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                  </p>
                  {exp.description?.map((d: string, i: number) => (
                    <p key={i} style={{ fontSize: 10.5, color: '#555', margin: 0, lineHeight: 1.6 }}>
                      <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline as="span" />
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />

        {/* RIGHT — Contact, Skills, Languages */}
        <div style={{ width: 200, flexShrink: 0 }}>

          <div style={{ marginBottom: 20 }}>
            <SectionHeading>CONTACT</SectionHeading>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {contact.phone && <p style={{ fontSize: 10.5, color: '#333', margin: 0 }}><EditableText value={contact.phone} onSave={v => setContact('phone', v)} /></p>}
              {contact.email && <p style={{ fontSize: 10.5, color: '#333', margin: 0 }}><EditableText value={contact.email} onSave={v => setContact('email', v)} /></p>}
              {contact.location && <p style={{ fontSize: 10.5, color: '#333', margin: 0 }}><EditableText value={contact.location} onSave={v => setContact('location', v)} /></p>}
              {(contact.website || contact.linkedin) && <p style={{ fontSize: 10.5, color: '#333', margin: 0 }}><EditableText value={contact.website ?? contact.linkedin ?? ''} onSave={v => setContact('website', v)} /></p>}
            </div>
          </div>

          {data.skills?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeading>SKILLS</SectionHeading>
              {data.skills.map((cat: SkillCategory) => (
                <div key={cat.id} style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>{cat.category}</p>
                  {cat.skills.map((s: string, i: number) => (
                    <p key={i} style={{ fontSize: 10.5, color: '#444', margin: '0 0 2px' }}>{s}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {data.languages?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeading>LANGUAGES</SectionHeading>
              <ul style={{ margin: '8px 0 0 14px', padding: 0 }}>
                {data.languages.map((l: any) => (
                  <li key={l.id} style={{ fontSize: 10.5, color: '#444', marginBottom: 3 }}>{l.language} – {l.proficiency}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1.5px solid #111', paddingBottom: 4 }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.08em' }}>{children}</p>
    </div>
  )
}

export default ResumeTemplate23
