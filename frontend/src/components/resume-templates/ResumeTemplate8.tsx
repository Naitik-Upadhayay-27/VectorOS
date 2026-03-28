// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate8Props {
  data: TemplateResumeData;
}

const ResumeTemplate8 = ({ data }: ResumeTemplate8Props) => {
  const store = useTemplateResumeStore()
  const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
  const primaryColor = "#166534";
  const lightColor = "#dcfce7";

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
    fontSize: '9pt', fontWeight: 700, color: primaryColor,
    textTransform: 'uppercase' as const, letterSpacing: '1.5px',
    marginTop: '14px', marginBottom: '8px', paddingBottom: '3px',
    borderBottom: `2px solid ${lightColor}`
  }

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary">
        <div style={{ ...sectionTitleStyle, marginTop: 0 }}>Professional Summary</div>
        <div style={{ fontSize: '9pt', color: '#4b5563', lineHeight: '1.5' }}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </div>
      </div>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <div key="experience">
        <div style={sectionTitleStyle}>Work Experience</div>
        {data.experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
                  <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                </div>
                <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: 500 }}>
                  <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '8pt', color: '#6b7280' }}>
                <div><EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – {exp.current ? 'Present' : <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />}</div>
                {exp.location && <div><EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></div>}
              </div>
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{ paddingLeft: '14px', margin: '4px 0 0 0' }}>
                {exp.description.map((desc, i) => (
                  <li key={i} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                    <span style={{ position: 'absolute', left: '0', color: primaryColor, fontWeight: 'bold' }}>•</span>
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
        <div style={sectionTitleStyle}>Education</div>
        {data.education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f9fafb', borderLeft: `2px solid ${primaryColor}` }}>
            <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
              <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
            </div>
            <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: 500 }}>
              <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
            </div>
            <div style={{ fontSize: '7pt', color: '#6b7280' }}>
              <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              {edu.gpa && <> | GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></>}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <div key="skills">
        <div style={sectionTitleStyle}>Technical Skills</div>
        {data.skills.map((skillGroup) => (
          <div key={skillGroup.id} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 600, fontSize: '8pt', color: primaryColor, marginBottom: '4px' }}>
              <EditableText value={skillGroup.category} onSave={v => setSkill(skillGroup.id, 'category', v)} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {skillGroup.skills.map((skill, i) => (
                <span key={i} style={{ backgroundColor: lightColor, color: primaryColor, padding: '2px 6px', fontSize: '7pt', borderRadius: '2px' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <div key="projects">
        <div style={sectionTitleStyle}>Projects</div>
        {data.projects.map((project) => (
          <div key={project.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '5px', height: '5px', backgroundColor: primaryColor, borderRadius: '50%' }} />
              <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#111827' }}>
                <EditableText value={project.name} onSave={v => setProj(project.id, 'name', v)} />
              </span>
            </div>
            {project.description && (
              Array.isArray(project.description) ? (
                project.description.length > 0 && (
                  <ul style={{ paddingLeft: '25px', margin: '4px 0' }}>
                    {project.description.map((desc, i) => (
                      <li key={i} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
                        <span style={{ position: 'absolute', left: '0', color: primaryColor, fontWeight: 'bold' }}>•</span>
                        <EditableText value={desc} onSave={v => setProjBullet(project.id, i, v)} multiline />
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <div style={{ fontSize: '8pt', color: '#4b5563', marginLeft: '11px' }}>
                  <EditableText value={project.description} onSave={v => setProj(project.id, 'description', v)} multiline as="span" />
                </div>
              )
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ fontSize: '7pt', color: primaryColor, marginTop: '2px', marginLeft: '11px' }}>
                <EditableText value={project.technologies.join(' | ')} onSave={v => store.updateProject(project.id, { technologies: v.split(/\s*[|•,]\s*/).filter(Boolean) })} />
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <div key="certificates">
        <div style={sectionTitleStyle}>Certifications</div>
        {data.certificates.map((cert) => (
          <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <div style={{ width: '5px', height: '5px', backgroundColor: primaryColor, borderRadius: '50%' }} />
            <span style={{ fontSize: '8pt' }}>
              <strong>{cert.name}</strong> – {cert.issuer}, {cert.date}
            </span>
          </div>
        ))}
      </div>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <div key="awards">
        <div style={sectionTitleStyle}>Achievements</div>
        <ul style={{ paddingLeft: '14px', margin: '4px 0 0 0' }}>
          {data.awards.map((achievement) => (
            <li key={achievement.id} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563', position: 'relative', paddingLeft: '12px', listStyleType: 'none' }}>
              <span style={{ position: 'absolute', left: '0', color: primaryColor, fontWeight: 'bold' }}>•</span>
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
        <div style={sectionTitleStyle}>Languages</div>
        {data.languages.map((lang) => (
          <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '8pt' }}>
            <span style={{ fontWeight: 500 }}>{lang.language}</span>
            <span style={{ color: '#6b7280' }}>{lang.proficiency}</span>
          </div>
        ))}
      </div>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <div key="volunteer">
        <div style={sectionTitleStyle}>Volunteering &amp; Leadership</div>
        {data.volunteer.map((vol) => (
          <div key={vol.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '9pt', color: '#111827' }}>{vol.role}</div>
                <div style={{ fontSize: '8pt', color: primaryColor }}>{vol.organization}</div>
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
    <div className="w-[850px] min-h-[1100px] bg-white overflow-hidden"
         style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '9pt', lineHeight: '1.4', color: '#1f2937', boxSizing: 'border-box' }}>

      {/* Header Banner */}
      <div style={{ backgroundColor: primaryColor, color: '#ffffff', padding: '0.35in 0.5in 0.3in' }}>
        <div style={{ fontSize: '18pt', fontWeight: 700, marginBottom: '2px' }}>
          <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
        </div>
        {data.personalInfo?.title && (
          <div style={{ fontSize: '10pt', opacity: 0.9, fontWeight: 400 }}>
            <EditableText value={data.personalInfo.title} onSave={v => setPI('title', v)} />
          </div>
        )}
      </div>

      {/* Contact Bar */}
      <div style={{ backgroundColor: '#14532d', padding: '6px 0.5in', display: 'flex', justifyContent: 'center', gap: '18px', fontSize: '8pt', color: '#bbf7d0', flexWrap: 'wrap' }}>
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

      {/* Main Content — single column driven by sectionOrder */}
      <div style={{ padding: '0.4in 0.5in' }}>
        {sectionOrder.map(key => sectionRenderers[key]?.())}
      </div>
    </div>
  );
};

export default ResumeTemplate8;
