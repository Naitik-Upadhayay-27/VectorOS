// @ts-nocheck
import { TemplateResumeData } from '@/types/resume'
import EditableText from '@/components/resume-editor/EditableText'
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore'

const ResumeTemplate20 = ({ data }: { data: TemplateResumeData }) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const layout = store.layout
  const marginTB = `${((layout?.marginTopBottom ?? 60) / 100).toFixed(2)}in`
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

  // Bold uppercase section header with full black bottom border
  const SectionHead = ({ title }: { title: string }) => (
    <div className="resume-section-head" style={{
      fontWeight: 700, fontSize: '10.5pt', textTransform: 'uppercase',
      letterSpacing: '0.3px', borderBottom: '1px solid #000',
      paddingBottom: '4px', marginTop: '8px', marginBottom: '6px',
    }}>{title}</div>
  )

  const pi = data.personalInfo
  const contact = pi?.contact

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <SectionHead title="Professional Summary" />
        <p style={{ fontSize: '10pt', lineHeight: '1.45', margin: 0, textAlign: 'justify' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        <SectionHead title="Experience" />
        {data.experience.map((exp, ei) => (
          <div key={exp.id} style={{ marginBottom: ei < data.experience.length - 1 ? '6px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                {exp.company && <span style={{ fontWeight: 700 }}>{' | '}<EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} /></span>}
                {exp.location && <span style={{ fontWeight: 400 }}>{' | '}<EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} />
                {exp.endDate && <> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} /></>}
              </div>
            </div>
            {exp.description?.length > 0 && (
              <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                {exp.description.map((d, i) => (
                  <li key={i} style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>
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
                <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                {' |'}
                <span style={{ fontWeight: 400 }}>
                  <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                </span>
              </div>
              <div style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              </div>
            </div>
            {edu.gpa && <div style={{ fontSize: '10pt', color: '#444' }}>CGPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></div>}
          </div>
        ))}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <SectionHead title="Projects &amp; Internships" />
        {data.projects.map((proj, pi_i) => (
          <div key={proj.id} style={{ marginBottom: pi_i < data.projects.length - 1 ? '5px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>
                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                {proj.role && <span style={{ fontWeight: 400 }}>{' | '}<EditableText value={proj.role} onSave={v => setProj(proj.id, 'role', v)} /></span>}
              </div>
              {(proj.startDate || proj.date) && (
                <div style={{ fontSize: '10pt', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {proj.startDate || proj.date}
                </div>
              )}
            </div>
            {proj.description && (
              Array.isArray(proj.description) ? proj.description.length > 0 && (
                <ul style={{ margin: '1px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {proj.description.map((d, i) => (
                    <li key={i} style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>
                      <EditableText value={d} onSave={v => setProjBullet(proj.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '10pt', margin: '1px 0 0 0' }}><EditableText value={proj.description} onSave={v => setProj(proj.id, 'description', v)} multiline /></p>
            )}
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <SectionHead title="Skills" />
        <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
          {data.skills.map(cat => (
            <li key={cat.id} style={{ fontSize: '10pt', lineHeight: '1.45', marginBottom: '2px' }}>
              <span style={{ fontWeight: 700 }}>
                <EditableText value={cat.category} onSave={v => store.updateSkillCategory(cat.id, { category: v })} />
                {': '}
              </span>
              <EditableText value={cat.skills.join(', ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(',').map(s => s.trim()).filter(Boolean) })} />
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <SectionHead title="Certifications and Leadership Achievements" />
        <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
          {data.certificates.map(cert => (
            <li key={cert.id} style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>
              {cert.name}{cert.issuer && ` — ${cert.issuer}`}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        <SectionHead title="Achievements" />
        <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
          {data.awards.map(award => (
            <li key={award.id} style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>
              <span style={{ fontWeight: 700 }}>{award.title}</span>
              {award.description && ` – ${award.description}`}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    languages: () => null,
    volunteer: () => null,
  }

  return (
    <div className="resume-page bg-white" style={{ fontFamily, padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})`, color: '#000', fontSize: '10pt', lineHeight: '1.3' }}>
      {/* Header — centered large bold name */}
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <div style={{ fontSize: '22pt', fontWeight: 700, lineHeight: '1.1' }}>
          <EditableText value={pi?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        <div style={{ fontSize: '9.5pt', marginTop: '3px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 4px' }}>
          {[contact?.phone, contact?.location, contact?.email, contact?.linkedin, contact?.github, contact?.website].filter(Boolean).map((item, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ color: '#555' }}>●</span>}
              <EditableText value={item} onSave={v => {
                if (item === contact?.phone) setContact('phone', v)
                else if (item === contact?.location) setContact('location', v)
                else if (item === contact?.email) setContact('email', v)
                else if (item === contact?.linkedin) setContact('linkedin', v)
                else if (item === contact?.github) setContact('github', v)
                else if (item === contact?.website) setContact('website', v)
              }} />
            </span>
          ))}
        </div>
      </div>
      {sectionOrder.map(key => sectionRenderers[key]?.())}
    </div>
  )
}

export default ResumeTemplate20


