// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate9Props {
  data: TemplateResumeData;
}

const ResumeTemplate9 = ({ data }: ResumeTemplate9Props) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const accentColor = "#0d9488";

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

  const mainSectionHeader = (label: string) => (
    <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a', marginBottom: '8px', marginTop: '14px', paddingBottom: '3px', borderBottom: `2px solid ${accentColor}` }}>
      {label}
    </div>
  )

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        {mainSectionHeader('Profile')}
        <div style={{ fontSize: '9pt', color: '#4b5563', lineHeight: '1.5' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </div>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        {mainSectionHeader('Experience')}
        {data.experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: '10px' }}>
            <div style={{ marginBottom: '3px' }}>
              <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
                <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
              </div>
              <div style={{ fontSize: '9pt', color: accentColor, fontWeight: 500 }}>
                <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
              </div>
            </div>
            <div style={{ fontSize: '7.5pt', color: '#6b7280', marginBottom: '4px' }}>
              <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – {exp.current ? 'Present' : <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />}
              {exp.location && <> | <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{ paddingLeft: '12px', margin: '0' }}>
                {exp.description.map((desc, i) => (
                  <li key={i} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                    <span style={{ position: 'absolute', left: '0', color: accentColor, fontWeight: 'bold' }}>•</span>
                    <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
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
        {mainSectionHeader('Education')}
        {data.education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
              <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
            </div>
            <div style={{ fontSize: '9pt', color: accentColor, fontWeight: 500 }}>
              <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
            </div>
            <div style={{ fontSize: '7.5pt', color: '#6b7280' }}>
              <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              {edu.gpa && <> • GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></>}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        {mainSectionHeader('Skills')}
        {data.skills.map((skillGroup) => (
          <div key={skillGroup.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '8pt', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
              <EditableText value={skillGroup.category} onSave={v => setSkill(skillGroup.id, 'category', v)} />
            </div>
            <div style={{ fontSize: '7pt', color: '#4b5563', lineHeight: '1.5' }}>
              <EditableText value={skillGroup.skills.join(' • ')} onSave={v => store.updateSkillCategory(skillGroup.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
            </div>
          </div>
        ))}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        {mainSectionHeader('Projects')}
        {data.projects.map((project) => (
          <div key={project.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
              <EditableText value={project.name} onSave={v => setProj(project.id, 'name', v)} />
            </div>
            {project.description && (
              Array.isArray(project.description) ? (
                project.description.length > 0 && (
                  <ul style={{ paddingLeft: '12px', margin: '4px 0' }}>
                    {project.description.map((desc, i) => (
                      <li key={i} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                        <span style={{ position: 'absolute', left: '0', color: accentColor, fontWeight: 'bold' }}>•</span>
                        <EditableText value={desc} onSave={v => setProjBullet(project.id, i, v)} multiline />
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <div style={{ fontSize: '8pt', color: '#4b5563', marginTop: '2px' }}>
                  <EditableText value={project.description} onSave={v => setProj(project.id, 'description', v)} multiline as="span" />
                </div>
              )
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ fontSize: '7pt', color: accentColor, marginTop: '2px' }}>
                <EditableText value={project.technologies.join(' • ')} onSave={v => store.updateProject(project.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        {mainSectionHeader('Certifications')}
        {data.certificates.map((cert) => (
          <div key={cert.id} style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '8pt', fontWeight: 600, color: '#111827' }}>{cert.name}</div>
            <div style={{ fontSize: '7pt', color: '#6b7280' }}>{cert.issuer}, {cert.date}</div>
          </div>
        ))}
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        {mainSectionHeader('Achievements')}
        <ul style={{ paddingLeft: '12px', margin: '0' }}>
          {data.awards.map((achievement) => (
            <li key={achievement.id} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
              <span style={{ position: 'absolute', left: '0', color: accentColor, fontWeight: 'bold' }}>•</span>
              {achievement.title}
              {achievement.date && ` (${achievement.date})`}
              {achievement.description && ` - ${achievement.description}`}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <div key="languages">
        {mainSectionHeader('Languages')}
        {data.languages.map((lang) => (
          <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', marginBottom: '3px' }}>
            <span>{lang.language}</span>
            <span style={{ color: '#6b7280' }}>{lang.proficiency}</span>
          </div>
        ))}
      </div>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <div key="volunteer">
        {mainSectionHeader('Volunteering & Leadership')}
        {data.volunteer.map((vol) => (
          <div key={vol.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '9pt', color: '#111827' }}>{vol.role}</div>
                <div style={{ fontSize: '8pt', color: accentColor }}>{vol.organization}</div>
              </div>
              <div style={{ fontSize: '7.5pt', color: '#6b7280' }}>{vol.startDate} – {vol.endDate}</div>
            </div>
            {vol.description && <div style={{ fontSize: '8pt', color: '#4b5563', marginTop: '2px' }}>{vol.description}</div>}
          </div>
        ))}
      </div>
    ) : null,
  }

  return (
    <div className="w-[850px] min-h-[1100px] bg-white overflow-hidden flex"
         style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '9pt', lineHeight: '1.4', color: '#1f2937', boxSizing: 'border-box' }}>

      {/* Sidebar — contact info only */}
      <div style={{ width: '240px', backgroundColor: '#0f172a', color: '#f8fafc', padding: '0.4in 0.3in' }}>
        <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: '3px', color: '#ffffff' }}>
          <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {data.personalInfo?.title && (
          <div style={{ fontSize: '9pt', color: accentColor, marginBottom: '15px', fontWeight: 500 }}>
            <EditableText value={data.personalInfo.title} onSave={v => setPI('title', v)} />
          </div>
        )}

        {/* Contact */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accentColor, marginBottom: '6px' }}>
            Contact
          </div>
          {data.personalInfo?.contact?.email && (
            <div style={{ fontSize: '7.5pt', marginBottom: '4px', color: '#cbd5e1', wordBreak: 'break-word' }}>
              <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
            </div>
          )}
          {data.personalInfo?.contact?.phone && (
            <div style={{ fontSize: '7.5pt', marginBottom: '4px', color: '#cbd5e1', wordBreak: 'break-word' }}>
              <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
            </div>
          )}
          {data.personalInfo?.contact?.location && (
            <div style={{ fontSize: '7.5pt', marginBottom: '4px', color: '#cbd5e1', wordBreak: 'break-word' }}>
              <EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} />
            </div>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <div style={{ fontSize: '7.5pt', marginBottom: '4px', color: '#cbd5e1', wordBreak: 'break-word' }}>
              <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
            </div>
          )}
          {data.personalInfo?.contact?.website && (
            <div style={{ fontSize: '7.5pt', marginBottom: '4px', color: '#cbd5e1', wordBreak: 'break-word' }}>
              {data.personalInfo.contact.website}
            </div>
          )}
        </div>
      </div>

      {/* Main Content — driven by sectionOrder */}
      <div style={{ flex: 1, padding: '0.4in 0.5in' }}>
        {sectionOrder.map(key => sectionRenderers[key]?.())}
      </div>
    </div>
  );
};

export default ResumeTemplate9;
