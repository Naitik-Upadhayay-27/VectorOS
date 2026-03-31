// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'

const ResumeTemplate16 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const layout = store.layout
  const marginTB = `${((layout?.marginTopBottom ?? 40) / 100).toFixed(2)}in`
  const marginLR = `${((layout?.marginLeftRight ?? 75) / 100).toFixed(2)}in`
  const fontFamily = layout?.fontFamily ?? "'Times New Roman', Times, serif"

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
  const setProj = (id: string, f: string, v: string) => store.updateProject(id, { [f]: v })
  const setProjBullet = (id: string, i: number, v: string) => {
    const proj = data.projects?.find(p => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[i] = v; store.updateProject(id, { description: desc })
  }

  // Section heading style — bold, uppercase, underlined with full border
  const SectionHead = ({ title }: { title: string }) => (
    <div style={{
      fontWeight: 700,
      fontSize: '11pt',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1.5px solid #000',
      paddingBottom: '1px',
      marginTop: '10px',
      marginBottom: '4px',
    }}>
      {title}
    </div>
  )

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <SectionHead title="Summary" />
        <p style={{ fontSize: '10pt', lineHeight: '1.4', textAlign: 'justify', margin: 0 }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        <SectionHead title="Professional Experience" />
        {data.experience.map((exp, ei) => (
          <div key={exp.id} style={{ marginBottom: ei < data.experience.length - 1 ? '6px' : 0 }}>
            {/* Title + Company + Date row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                {exp.company && (
                  <span style={{ fontWeight: 700 }}>
                    {', '}
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} />
                {exp.endDate && <> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} /></>}
              </div>
            </div>
            {exp.location && (
              <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
                <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} />
              </div>
            )}
            {exp.description?.length > 0 && (
              <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                {exp.description.map((d, i) => (
                  <li key={i} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
                    <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <div key="education">
        <SectionHead title="Education" />
        {data.education.map(edu => (
          <div key={edu.id} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                {edu.institution && (
                  <span style={{ fontWeight: 400 }}>
                    {' ('}
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                    {')'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              </div>
            </div>
            {edu.gpa && (
              <div style={{ fontSize: '10pt' }}>GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></div>
            )}
          </div>
        ))}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <SectionHead title="Projects" />
        {data.projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
              </div>
              {(proj.startDate || proj.date) && (
                <div style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {proj.startDate
                    ? <><EditableText value={proj.startDate} onSave={v => setProj(proj.id, 'startDate', v)} />{proj.endDate && <> – <EditableText value={proj.endDate} onSave={v => setProj(proj.id, 'endDate', v)} /></>}</>
                    : proj.date}
                </div>
              )}
            </div>
            {proj.description && (
              Array.isArray(proj.description) ? proj.description.length > 0 && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {proj.description.map((d, i) => (
                    <li key={i} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
                      <EditableText value={d} onSave={v => setProjBullet(proj.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '10pt', margin: '2px 0 0 0' }}>
                  <EditableText value={proj.description} onSave={v => setProj(proj.id, 'description', v)} multiline />
                </p>
              )
            )}
            {proj.technologies?.length > 0 && (
              <p style={{ fontSize: '9.5pt', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                <EditableText value={proj.technologies.join(', ')} onSave={v => store.updateProject(proj.id, { technologies: v.split(',').map(s => s.trim()).filter(Boolean) })} />
              </p>
            )}
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <SectionHead title="Skills" />
        <p style={{ fontSize: '10pt', margin: 0, lineHeight: '1.4' }}>
          {data.skills.map((cat, i) => (
            <span key={cat.id}>
              <EditableText value={cat.skills.join(', ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(',').map(s => s.trim()).filter(Boolean) })} />
              {i < data.skills.length - 1 && ', '}
            </span>
          ))}
        </p>
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <SectionHead title="Certification" />
        {data.certificates.map(cert => (
          <div key={cert.id} style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{cert.name}</span>
            {cert.issuer && <span style={{ fontSize: '10pt' }}> : {cert.issuer}</span>}
            {cert.date && <span style={{ fontSize: '10pt' }}> ({cert.date})</span>}
          </div>
        ))}
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        <SectionHead title="Awards & Achievements" />
        <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          {data.awards.map(award => (
            <li key={award.id} style={{ fontSize: '10pt', lineHeight: '1.35', marginBottom: '1px' }}>
              <span style={{ fontWeight: 700 }}>{award.title}</span>
              {award.description && <span> – {award.description}</span>}
              {award.date && <span> ({award.date})</span>}
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
        <SectionHead title="Volunteering & Leadership" />
        {data.volunteer.map(v => (
          <div key={v.id} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{v.role}, {v.organization}</span>
              <span style={{ fontSize: '10pt' }}>{v.startDate} – {v.endDate}</span>
            </div>
            {v.description && <p style={{ fontSize: '10pt', margin: '1px 0 0 0' }}>{v.description}</p>}
          </div>
        ))}
      </div>
    ) : null,
  }

  const pi = data.personalInfo
  const contact = pi?.contact
  const contactParts = [
    pi?.name && contact?.email ? `${pi.name.includes('IIM') ? pi.name : ''}` : '',
    contact?.phone,
    contact?.email,
    contact?.linkedin,
    contact?.github,
    contact?.website,
    contact?.location,
  ].filter(Boolean)

  return (
    <div className="resume-page bg-white" style={{
      fontFamily,
      padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})`,
      color: '#000',
      fontSize: '10pt',
      lineHeight: '1.3',
    }}>
      {/* Header — centered name + contact */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '20pt', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: '1.1' }}>
          <EditableText value={pi?.name || 'YOUR NAME'} onSave={v => setPI('name', v)} />
        </div>
        {/* Contact line */}
        <div style={{ fontSize: '9.5pt', marginTop: '3px', lineHeight: '1.4' }}>
          {[
            contact?.phone,
            contact?.email,
            contact?.linkedin,
            contact?.github,
            contact?.website,
            contact?.location,
          ].filter(Boolean).map((item, i, arr) => (
            <span key={i}>
              <EditableText value={item} onSave={v => {
                if (item === contact?.phone) setContact('phone', v)
                else if (item === contact?.email) setContact('email', v)
                else if (item === contact?.linkedin) setContact('linkedin', v)
                else if (item === contact?.github) setContact('github', v)
                else if (item === contact?.website) setContact('website', v)
                else if (item === contact?.location) setContact('location', v)
              }} />
              {i < arr.length - 1 && <span style={{ margin: '0 4px' }}>|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Sections in order */}
      {sectionOrder.map(key => sectionRenderers[key]?.())}
    </div>
  )
}

export default ResumeTemplate16


