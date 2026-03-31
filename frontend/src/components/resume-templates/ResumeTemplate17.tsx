// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'

const ACCENT = '#2d7d7d'

const ResumeTemplate17 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const layout = store.layout
  const marginTB = `${((layout?.marginTopBottom ?? 60) / 100).toFixed(2)}in`
  const marginLR = `${((layout?.marginLeftRight ?? 75) / 100).toFixed(2)}in`
  const fontFamily = layout?.fontFamily ?? "'Calibri', 'Segoe UI', Arial, sans-serif"

  const setPI = (f: string, v: string) => store.setPersonalInfo({ [f]: v })
  const setContact = (f: string, v: string) => store.setContact({ [f]: v })
  const setExp = (id: string, f: string, v: string) => store.updateExperience(id, { [f]: v })
  const setExpBullet = (id: string, i: number, v: string) => {
    const exp = data.experience?.find(e => e.id === id)
    if (!exp) return
    const desc = [...(exp.description ?? [])]; desc[i] = v
    store.updateExperience(id, { description: desc })
  }
  const setEdu = (id: string, f: string, v: string) => store.updateEducation(id, { [f]: v })
  const setSkill = (id: string, f: string, v: string) => store.updateSkillCategory(id, { [f]: v })

  // Colored section header with bottom border
  const SectionHead = ({ title }: { title: string }) => (
    <div style={{
      color: ACCENT,
      fontWeight: 700,
      fontSize: '11pt',
      fontVariant: 'small-caps',
      letterSpacing: '0.5px',
      borderBottom: `1.5px solid ${ACCENT}`,
      paddingBottom: '1px',
      marginTop: '8px',
      marginBottom: '4px',
      textTransform: 'capitalize',
    }}>
      {title}
    </div>
  )

  // Render a single experience entry
  const ExpEntry = ({ exp }: { exp: ExperienceItem }) => (
    <div style={{ marginBottom: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: '10.5pt' }}>
          <span style={{ fontWeight: 700 }}>
            <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
          </span>
          {exp.title && (
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
              {' | '}
              <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
            </span>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
          <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} />
          {exp.endDate && <> — <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} /></>}
        </div>
      </div>
      {exp.description?.length > 0 && (
        <ul style={{ margin: '1px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
          {exp.description.map((d, i) => (
            <li key={i} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
              <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const pi = data.personalInfo
  const contact = pi?.contact

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <SectionHead title="Summary" />
        <p style={{ fontSize: '10pt', lineHeight: '1.4', margin: 0 }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        {/* Split into full-time and internship if possible, else show all under one header */}
        {(() => {
          const fullTime = data.experience.filter(e =>
            !e.title?.toLowerCase().includes('intern') &&
            !e.title?.toLowerCase().includes('freelance') &&
            !e.title?.toLowerCase().includes('contributor') &&
            !e.title?.toLowerCase().includes('open source')
          )
          const internship = data.experience.filter(e =>
            e.title?.toLowerCase().includes('intern') ||
            e.title?.toLowerCase().includes('freelance') ||
            e.title?.toLowerCase().includes('contributor') ||
            e.title?.toLowerCase().includes('open source')
          )
          return (
            <>
              {fullTime.length > 0 && (
                <>
                  <SectionHead title="Experience (Full Time)" />
                  {fullTime.map(exp => <ExpEntry key={exp.id} exp={exp} />)}
                </>
              )}
              {internship.length > 0 && (
                <>
                  <SectionHead title="Experience (Internship/Freelance)" />
                  {internship.map(exp => <ExpEntry key={exp.id} exp={exp} />)}
                </>
              )}
              {fullTime.length === 0 && internship.length === 0 && (
                <>
                  <SectionHead title="Experience" />
                  {data.experience.map(exp => <ExpEntry key={exp.id} exp={exp} />)}
                </>
              )}
            </>
          )
        })()}
      </div>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <div key="education">
        <SectionHead title="Education" />
        {data.education.map(edu => (
          <div key={edu.id} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
              </div>
              <div style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
              <div>
                <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                {edu.gpa && <span style={{ color: '#444' }}>, CGPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></span>}
              </div>
              {edu.location && (
                <div style={{ color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  <EditableText value={edu.location} onSave={v => setEdu(edu.id, 'location', v)} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <SectionHead title="Technical Skills" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <tbody>
            {data.skills.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 700, paddingRight: '12px', whiteSpace: 'nowrap', verticalAlign: 'top', paddingBottom: '1px' }}>
                  <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                </td>
                <td style={{ verticalAlign: 'top', paddingBottom: '1px' }}>
                  <EditableText value={cat.skills.join(', ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(',').map(s => s.trim()).filter(Boolean) })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <SectionHead title="Projects" />
        {data.projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={proj.name} onSave={v => store.updateProject(proj.id, { name: v })} />
              </span>
              {(proj.startDate || proj.date) && (
                <span style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {proj.startDate || proj.date}
                </span>
              )}
            </div>
            {proj.description && (
              Array.isArray(proj.description) ? (
                <ul style={{ margin: '1px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {proj.description.map((d, i) => (
                    <li key={i} style={{ fontSize: '10pt', lineHeight: '1.35' }}>
                      <EditableText value={d} onSave={v => { const desc = [...proj.description as string[]]; desc[i] = v; store.updateProject(proj.id, { description: desc }) }} multiline />
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '10pt', margin: '1px 0 0 0' }}>
                  <EditableText value={proj.description} onSave={v => store.updateProject(proj.id, { description: v })} multiline />
                </p>
              )
            )}
            {proj.technologies?.length > 0 && (
              <p style={{ fontSize: '9.5pt', margin: '1px 0 0 0', color: '#555' }}>
                {proj.technologies.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <SectionHead title="Certifications" />
        <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
          {data.certificates.map(cert => (
            <li key={cert.id} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
              <span style={{ fontWeight: 700 }}>{cert.name}</span>
              {cert.issuer && <span> — {cert.issuer}</span>}
              {cert.date && <span> ({cert.date})</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        <SectionHead title={`Achievements (Winner of ${data.awards.length}+ Competitions)`} />
        <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
          {data.awards.map(award => (
            <li key={award.id} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
              <span style={{ fontWeight: 700 }}>{award.title}</span>
              {award.description && <span> – {award.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <div key="languages">
        <SectionHead title="Languages" />
        <p style={{ fontSize: '10pt', margin: 0 }}>
          {data.languages.map((l, i) => (
            <span key={l.id}>{l.language} ({l.proficiency}){i < data.languages.length - 1 ? ', ' : ''}</span>
          ))}
        </p>
      </div>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <div key="volunteer">
        <SectionHead title="Volunteering" />
        {data.volunteer.map(v => (
          <div key={v.id} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{v.role}, {v.organization}</span>
              <span style={{ fontSize: '10pt' }}>{v.startDate} — {v.endDate}</span>
            </div>
            {v.description && <p style={{ fontSize: '10pt', margin: '1px 0 0 0' }}>{v.description}</p>}
          </div>
        ))}
      </div>
    ) : null,
  }

  return (
    <div className="resume-page bg-white" style={{
      fontFamily,
      padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})`,
      color: '#000',
      fontSize: '10pt',
      lineHeight: '1.3',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        {/* Name — large, title case, bold */}
        <div style={{ fontSize: '22pt', fontWeight: 700, lineHeight: '1.1', letterSpacing: '0.5px' }}>
          <EditableText value={pi?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {/* Contact row with icons */}
        <div style={{ fontSize: '9.5pt', marginTop: '4px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 6px' }}>
          {contact?.phone && (
            <span>
              <span style={{ marginRight: '2px' }}>📞</span>
              <EditableText value={contact.phone} onSave={v => setContact('phone', v)} />
            </span>
          )}
          {contact?.phone && (contact?.email || contact?.linkedin || contact?.github) && <span style={{ color: '#888' }}>|</span>}
          {contact?.email && (
            <span>
              <span style={{ marginRight: '2px' }}>✉</span>
              <EditableText value={contact.email} onSave={v => setContact('email', v)} />
            </span>
          )}
          {contact?.email && (contact?.linkedin || contact?.github) && <span style={{ color: '#888' }}>|</span>}
          {contact?.linkedin && (
            <span>
              <span style={{ marginRight: '2px', color: ACCENT }}>in</span>
              <EditableText value={contact.linkedin} onSave={v => setContact('linkedin', v)} />
            </span>
          )}
          {contact?.linkedin && contact?.github && <span style={{ color: '#888' }}>|</span>}
          {contact?.github && (
            <span>
              <span style={{ marginRight: '2px' }}>⌥</span>
              <EditableText value={contact.github} onSave={v => setContact('github', v)} />
            </span>
          )}
          {contact?.location && (
            <>
              <span style={{ color: '#888' }}>|</span>
              <span><EditableText value={contact.location} onSave={v => setContact('location', v)} /></span>
            </>
          )}
        </div>
      </div>

      {/* Sections */}
      {sectionOrder.map(key => sectionRenderers[key]?.())}
    </div>
  )
}

export default ResumeTemplate17


