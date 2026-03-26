// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore } from '@/store/templateResumeStore';

interface ResumeTemplate7Props {
  data: TemplateResumeData;
}

const ResumeTemplate7 = ({ data }: ResumeTemplate7Props) => {
  const store = useTemplateResumeStore()

  const setPI = (field: string, val: string) => store.setPersonalInfo({ [field]: val })
  const setContact = (field: string, val: string) => store.setContact({ [field]: val })
  const setExp = (id: string, field: string, val: string) => store.updateExperience(id, { [field]: val })
  const setExpBullet = (id: string, idx: number, val: string) => {
    const exp = data.experience?.find((e: ExperienceItem) => e.id === id)
    if (!exp) return
    const desc = [...(exp.description ?? [])]
    desc[idx] = val
    store.updateExperience(id, { description: desc })
  }
  const setEdu = (id: string, field: string, val: string) => store.updateEducation(id, { [field]: val })
  const setSkill = (id: string, field: string, val: string) => store.updateSkillCategory(id, { [field]: val })
  const setProj = (id: string, field: string, val: string) => store.updateProject(id, { [field]: val })
  const setProjBullet = (id: string, idx: number, val: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = val
    store.updateProject(id, { description: desc })
  }

  const sectionTitleStyle = {
    fontSize: '10pt', fontWeight: 700, color: '#1e3a5f',
    borderBottom: '1px solid #e2e8f0', paddingBottom: '3px',
    marginTop: '12px', marginBottom: '6px',
    textTransform: 'uppercase' as const, letterSpacing: '0.5px'
  }

  return (
    <div className="w-[850px] min-h-[1100px] bg-white overflow-hidden"
         style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '9pt', lineHeight: '1.4', color: '#1a1a2e', padding: '0.5in 0.6in', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px solid #1e3a5f', paddingBottom: '10px' }}>
        <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1e3a5f', marginBottom: '2px', letterSpacing: '0.5px' }}>
          <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {data.personalInfo?.title && (
          <div style={{ fontSize: '10pt', color: '#4a5568', marginBottom: '6px' }}>
            <EditableText value={data.personalInfo.title} onSave={v => setPI('title', v)} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '8pt', color: '#4a5568' }}>
          {data.personalInfo?.contact?.email && (
            <span><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></span>
          )}
          {data.personalInfo?.contact?.phone && (
            <><span>•</span><span><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></span></>
          )}
          {data.personalInfo?.contact?.location && (
            <><span>•</span><span><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></span></>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <><span>•</span><span><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></span></>
          )}
          {data.personalInfo?.contact?.website && (
            <><span>•</span><span>{data.personalInfo.contact.website}</span></>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <div style={sectionTitleStyle}>Professional Summary</div>
          <div style={{ fontSize: '9pt', color: '#4a5568', lineHeight: '1.5' }}>
            <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Professional Experience</div>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '9.5pt', color: '#1a1a2e' }}>
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                  </div>
                  <div style={{ fontSize: '9pt', color: '#4a5568' }}>
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                  </div>
                </div>
                <div style={{ fontSize: '8pt', color: '#718096', textAlign: 'right' }}>
                  <div><EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – {exp.current ? 'Present' : <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />}</div>
                  {exp.location && <div><EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></div>}
                </div>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul style={{ paddingLeft: '14px', margin: '4px 0' }}>
                  {exp.description.map((desc, i) => (
                    <li key={i} style={{ marginBottom: '2px', fontSize: '8.5pt', color: '#4a5568', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                      <span style={{ position: 'absolute', left: '0', color: '#1e3a5f', fontWeight: 'bold' }}>•</span>
                      <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '9.5pt', color: '#1a1a2e' }}>
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </div>
                  <div style={{ fontSize: '9pt', color: '#4a5568' }}>
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                  </div>
                </div>
                <div style={{ fontSize: '8pt', color: '#718096', textAlign: 'right' }}>
                  <div><EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} /></div>
                  {edu.gpa && <div>GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Skills</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {data.skills.map((skillGroup) => (
              <div key={skillGroup.id} style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '8.5pt', color: '#1e3a5f' }}>
                  <EditableText value={skillGroup.category} onSave={v => setSkill(skillGroup.id, 'category', v)} />:
                </span>
                <span style={{ fontSize: '8pt', color: '#4a5568', marginLeft: '4px' }}>
                  <EditableText value={skillGroup.skills.join(', ')} onSave={v => store.updateSkillCategory(skillGroup.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Projects</div>
          {data.projects.map((project) => (
            <div key={project.id} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '9pt' }}>
                <EditableText value={project.name} onSave={v => setProj(project.id, 'name', v)} />
                {project.link && (
                  <span style={{ fontWeight: 400, fontSize: '8pt', color: '#718096', marginLeft: '4px' }}>
                    | <EditableText value={project.link} onSave={v => setProj(project.id, 'link', v)} />
                  </span>
                )}
              </div>
              {project.description && (
                Array.isArray(project.description) ? (
                  project.description.length > 0 && (
                    <ul style={{ paddingLeft: '14px', margin: '4px 0' }}>
                      {project.description.map((desc, i) => (
                        <li key={i} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4a5568', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                          <span style={{ position: 'absolute', left: '0', color: '#1e3a5f', fontWeight: 'bold' }}>•</span>
                          <EditableText value={desc} onSave={v => setProjBullet(project.id, i, v)} multiline />
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div style={{ fontSize: '8pt', color: '#4a5568' }}>
                    <EditableText value={project.description} onSave={v => setProj(project.id, 'description', v)} multiline as="span" />
                  </div>
                )
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ fontSize: '7.5pt', color: '#718096', marginTop: '2px' }}>
                  Tech: <EditableText value={project.technologies.join(', ')} onSave={v => store.updateProject(project.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certificates && data.certificates.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Certifications</div>
          {data.certificates.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '8.5pt' }}>{cert.name}</span>
              <span style={{ color: '#718096', fontSize: '8pt' }}> – {cert.issuer}, {cert.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Awards/Achievements */}
      {data.awards && data.awards.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Achievements</div>
          <ul style={{ paddingLeft: '14px', margin: '4px 0' }}>
            {data.awards.map((achievement) => (
              <li key={achievement.id} style={{ marginBottom: '2px', fontSize: '8.5pt', color: '#4a5568', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                <span style={{ position: 'absolute', left: '0', color: '#1e3a5f', fontWeight: 'bold' }}>•</span>
                {achievement.title}
                {achievement.date && ` (${achievement.date})`}
                {achievement.description && ` - ${achievement.description}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Languages</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {data.languages.map((lang) => (
              <span key={lang.id} style={{ fontSize: '8.5pt' }}>
                <span style={{ fontWeight: 600 }}>{lang.language}</span>
                <span style={{ color: '#718096' }}> ({lang.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <>
          {data.customSections.map((section) => (
            <div key={section.id}>
              <div style={sectionTitleStyle}>{section.title}</div>
              {section.items.map((item) => (
                <div key={item.id} style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '9pt', color: '#1a1a2e' }}>
                    {item.title}
                    {item.date && (
                      <span style={{ fontWeight: 400, fontSize: '8pt', color: '#718096', marginLeft: '8px' }}>
                        ({item.date})
                      </span>
                    )}
                  </div>
                  {item.subtitle && <div style={{ fontSize: '8pt', color: '#4a5568' }}>{item.subtitle}</div>}
                  {item.description && item.description.length > 0 && (
                    <ul style={{ paddingLeft: '14px', margin: '4px 0' }}>
                      {item.description.map((desc, idx) => (
                        <li key={idx} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4a5568', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                          <span style={{ position: 'absolute', left: '0', color: '#1e3a5f', fontWeight: 'bold' }}>•</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ResumeTemplate7;

