// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, ProjectItem } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'

const ResumeTemplate18 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const layout = store.layout
  const marginTB = `${((layout?.marginTopBottom ?? 60) / 100).toFixed(2)}in`
  const marginLR = `${((layout?.marginLeftRight ?? 75) / 100).toFixed(2)}in`
  const fontFamily = layout?.fontFamily ?? "'Computer Modern', 'Latin Modern', Georgia, 'Times New Roman', serif"

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

  // Section header — small-caps style with bottom rule
  const SectionHead = ({ title }: { title: string }) => (
    <div style={{
      fontVariant: 'small-caps',
      fontWeight: 400,
      fontSize: '12pt',
      letterSpacing: '0.5px',
      borderBottom: '0.8px solid #000',
      paddingBottom: '1px',
      marginTop: '10px',
      marginBottom: '5px',
    }}>
      {title}
    </div>
  )

  const pi = data.personalInfo
  const contact = pi?.contact

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <SectionHead title="Summary" />
        <p style={{ fontSize: '10.5pt', lineHeight: '1.5', margin: '0 0 0 12px', textAlign: 'justify' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </div>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <div key="education">
        <SectionHead title="Education" />
        <div style={{ marginLeft: '4px' }}>
          {data.education.map((edu, i) => (
            <div key={edu.id} style={{ marginBottom: i < data.education.length - 1 ? '6px' : 0 }}>
              {/* Row 1: bold institution left, location right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                  <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                </div>
                <div style={{ fontSize: '10.5pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  <EditableText value={edu.location || ''} onSave={v => setEdu(edu.id, 'location', v)} />
                </div>
              </div>
              {/* Row 2: italic degree left, italic year right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontStyle: 'italic', fontSize: '10.5pt' }}>
                  <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  {edu.gpa && <span style={{ fontStyle: 'normal' }}>, CGPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></span>}
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '10.5pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        <SectionHead title="Experience" />
        <div style={{ marginLeft: '4px' }}>
          {data.experience.map((exp, ei) => (
            <div key={exp.id} style={{ marginBottom: ei < data.experience.length - 1 ? '8px' : 0 }}>
              {/* Row 1: bold company left, date right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                  <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                </div>
                <div style={{ fontSize: '10.5pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} />
                  {exp.endDate && <> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} /></>}
                </div>
              </div>
              {/* Row 2: italic role left, location right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontStyle: 'italic', fontSize: '10.5pt' }}>
                  <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                </div>
                {exp.location && (
                  <div style={{ fontStyle: 'italic', fontSize: '10.5pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} />
                  </div>
                )}
              </div>
              {/* Bullets */}
              {exp.description?.length > 0 && (
                <ul style={{ margin: '3px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                  {exp.description.map((d, i) => (
                    <li key={i} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2px' }}>
                      <EditableText value={d} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <SectionHead title="Projects" />
        <div style={{ marginLeft: '4px' }}>
          {data.projects.map((proj, pi_i) => (
            <div key={proj.id} style={{ marginBottom: pi_i < data.projects.length - 1 ? '10px' : 0 }}>
              {/* bold name | italic subtitle */}
              <div style={{ fontSize: '10.5pt', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700 }}>
                  <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                </span>
                {proj.role && (
                  <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
                    {' | '}
                    <EditableText value={proj.role} onSave={v => setProj(proj.id, 'role', v)} />
                  </span>
                )}
              </div>
              {proj.description && (
                Array.isArray(proj.description) ? proj.description.length > 0 && (
                  <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                    {proj.description.map((d, i) => (
                      <li key={i} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2px' }}>
                        <EditableText value={d} onSave={v => setProjBullet(proj.id, i, v)} multiline />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '10.5pt', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                    <EditableText value={proj.description} onSave={v => setProj(proj.id, 'description', v)} multiline />
                  </p>
                )
              )}
              {proj.technologies?.length > 0 && (
                <p style={{ fontSize: '10pt', margin: '2px 0 0 0', fontStyle: 'italic', color: '#333' }}>
                  {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <SectionHead title="Technical Skills" />
        <div style={{ marginLeft: '12px' }}>
          {data.skills.map(cat => (
            <p key={cat.id} style={{ fontSize: '10.5pt', margin: '0 0 3px 0', lineHeight: '1.4' }}>
              <span style={{ fontWeight: 700 }}>
                <EditableText value={cat.category} onSave={v => store.updateSkillCategory(cat.id, { category: v })} />
              </span>
              {': '}
              <EditableText value={cat.skills.join(', ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(',').map(s => s.trim()).filter(Boolean) })} />
            </p>
          ))}
        </div>
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <SectionHead title="Certifications" />
        <ul style={{ margin: '2px 0 0 4px', paddingLeft: '16px', listStyleType: 'disc' }}>
          {data.certificates.map(cert => (
            <li key={cert.id} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2px' }}>
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
        <SectionHead title="Achievements" />
        <ul style={{ margin: '2px 0 0 4px', paddingLeft: '16px', listStyleType: 'disc' }}>
          {data.awards.map(award => (
            <li key={award.id} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2px' }}>
              {award.title}
              {award.description && <span> – {award.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <div key="languages">
        <SectionHead title="Languages" />
        <p style={{ fontSize: '10.5pt', margin: '0 0 0 12px' }}>
          {data.languages.map((l, i) => (
            <span key={l.id}>{l.language} ({l.proficiency}){i < data.languages.length - 1 ? ', ' : ''}</span>
          ))}
        </p>
      </div>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <div key="volunteer">
        <SectionHead title="Volunteering" />
        <div style={{ marginLeft: '4px' }}>
          {data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{v.role}, {v.organization}</span>
                <span style={{ fontSize: '10.5pt' }}>{v.startDate} – {v.endDate}</span>
              </div>
              {v.description && <p style={{ fontSize: '10.5pt', margin: '1px 0 0 0' }}>{v.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  }

  return (
    <div className="resume-page bg-white" style={{
      fontFamily,
      padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})`,
      color: '#000',
      fontSize: '10.5pt',
      lineHeight: '1.3',
    }}>
      {/* Header — large small-caps name, centered */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{
          fontSize: '26pt',
          fontVariant: 'small-caps',
          fontWeight: 400,
          letterSpacing: '1px',
          lineHeight: '1.1',
        }}>
          <EditableText value={pi?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {/* Contact line */}
        <div style={{ fontSize: '10pt', marginTop: '4px', lineHeight: '1.5' }}>
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
              {i < arr.length - 1 && <span style={{ margin: '0 5px', color: '#555' }}>|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      {sectionOrder.map(key => sectionRenderers[key]?.())}
    </div>
  )
}

export default ResumeTemplate18


