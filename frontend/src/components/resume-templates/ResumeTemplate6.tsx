// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate6Props {
  data: TemplateResumeData;
}

const ResumeTemplate6 = ({ data }: ResumeTemplate6Props) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER

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

  const divider = <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' }} />

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px' }}>About</div>
        <div style={{ fontSize: '10pt', color: '#4b5563', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '12px' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </div>
        {divider}
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Experience</div>
        {data.experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '11pt', color: '#111827' }}>
                <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
              </div>
              <div style={{ fontSize: '8pt', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> — {exp.current ? 'Present' : <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />}
              </div>
            </div>
            <div style={{ fontSize: '10pt', color: '#6b7280', marginBottom: '8px' }}>
              <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
              {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '10px 0 0 0' }}>
                {exp.description.map((desc, idx) => (
                  <li key={idx} style={{ marginBottom: '5px', fontSize: '9pt', color: '#4b5563', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0', color: '#d1d5db' }}>—</span>
                    <EditableText value={desc} onSave={v => setExpBullet(exp.id, idx, v)} multiline />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {divider}
      </div>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <div key="education">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Education</div>
        {data.education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '11pt', color: '#111827' }}>
                <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
              </div>
              <div style={{ fontSize: '8pt', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              </div>
            </div>
            <div style={{ fontSize: '10pt', color: '#6b7280' }}>
              <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
            </div>
            {edu.gpa && (
              <div style={{ fontSize: '8pt', color: '#9ca3af' }}>GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></div>
            )}
          </div>
        ))}
        {divider}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Expertise</div>
        {data.skills.map((skillGroup) => (
          <div key={skillGroup.id} style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '9pt', fontWeight: 600, color: '#374151', marginRight: '8px' }}>
              <EditableText value={skillGroup.category} onSave={v => setSkill(skillGroup.id, 'category', v)} />:
            </span>
            <span style={{ fontSize: '9pt', color: '#4b5563' }}>
              <EditableText value={skillGroup.skills.join(', ')} onSave={v => store.updateSkillCategory(skillGroup.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
            </span>
          </div>
        ))}
        {divider}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Projects</div>
        {data.projects.map((project) => (
          <div key={project.id} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '11pt', color: '#111827' }}>
              <EditableText value={project.name} onSave={v => setProj(project.id, 'name', v)} />
            </div>
            {Array.isArray(project.description) ? (
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '8px 0 0 0' }}>
                {project.description.map((desc, idx) => (
                  <li key={idx} style={{ marginBottom: '3px', fontSize: '9pt', color: '#4b5563', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0', color: '#d1d5db' }}>—</span>
                    <EditableText value={desc} onSave={v => setProjBullet(project.id, idx, v)} multiline />
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '9pt', color: '#4b5563' }}>
                <EditableText value={project.description ?? ''} onSave={v => setProj(project.id, 'description', v)} multiline as="span" />
              </div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ fontSize: '8pt', color: '#9ca3af', marginTop: '4px' }}>
                <EditableText value={project.technologies.join(' · ')} onSave={v => store.updateProject(project.id, { technologies: v.split(/\s*[•,·]\s*/).filter(Boolean) })} />
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Certifications</div>
        {data.certificates.map((cert) => (
          <div key={cert.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '9pt', fontWeight: 600, color: '#374151' }}>{cert.name}</div>
            <div style={{ fontSize: '8pt', color: '#6b7280' }}>{cert.issuer} · {cert.date}</div>
          </div>
        ))}
        {divider}
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        {divider}
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Achievements</div>
        <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '10px 0 0 0' }}>
          {data.awards.map((achievement) => (
            <li key={achievement.id} style={{ marginBottom: '5px', fontSize: '9pt', color: '#4b5563', paddingLeft: '12px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0', color: '#d1d5db' }}>—</span>
              {achievement.title} {achievement.date && `(${achievement.date})`}
              {achievement.description && ` - ${achievement.description}`}
            </li>
          ))}
        </ul>
      </div>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <div key="languages">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Languages</div>
        {data.languages.map((lang) => (
          <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '9pt', color: '#374151' }}>{lang.language}</span>
            <span style={{ fontSize: '8pt', color: '#9ca3af' }}>{lang.proficiency}</span>
          </div>
        ))}
        {divider}
      </div>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <div key="volunteer">
        <div style={{ fontSize: '8pt', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Volunteering &amp; Leadership</div>
        {data.volunteer.map((vol) => (
          <div key={vol.id} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 600, fontSize: '11pt', color: '#111827' }}>{vol.role}</div>
            <div style={{ fontSize: '10pt', color: '#6b7280' }}>{vol.organization}</div>
            <div style={{ fontSize: '8pt', color: '#9ca3af' }}>{vol.startDate} – {vol.endDate}</div>
            {vol.description && <div style={{ fontSize: '9pt', color: '#4b5563', marginTop: '4px' }}>{vol.description}</div>}
          </div>
        ))}
        {divider}
      </div>
    ) : null,
  }

  return (
    <div className="w-[850px] min-h-[1100px] bg-white overflow-hidden"
         style={{
           fontFamily: "'Inter', 'Segoe UI', sans-serif",
           fontSize: '10pt',
           lineHeight: '1.5',
           color: '#374151',
           padding: '12mm 16mm',
           boxSizing: 'border-box'
         }}>

      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '24pt', fontWeight: 300, color: '#111827', letterSpacing: '-1px', marginBottom: '1px' }}>
          <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {data.personalInfo?.title && (
          <div style={{ fontSize: '11pt', color: '#6b7280', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase' }}>
            <EditableText value={data.personalInfo.title} onSave={v => setPI('title', v)} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '9pt', color: '#6b7280', flexWrap: 'wrap' }}>
          {data.personalInfo?.contact?.email && (
            <span><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></span>
          )}
          {data.personalInfo?.contact?.phone && (
            <span><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></span>
          )}
          {data.personalInfo?.contact?.location && (
            <span><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></span>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <span><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></span>
          )}
          {data.personalInfo?.contact?.website && (
            <span>{data.personalInfo.contact.website}</span>
          )}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '12px 0' }} />

      {/* Sections in user-defined order */}
      {sectionOrder.map(key => sectionRenderers[key]?.())}
    </div>
  );
};

export default ResumeTemplate6;
