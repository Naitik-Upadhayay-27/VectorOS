// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore } from '@/store/templateResumeStore';

interface ResumeTemplate4Props {
  data: TemplateResumeData;
}

const ResumeTemplate4 = ({ data }: ResumeTemplate4Props) => {
  const store = useTemplateResumeStore()
  const primaryColor = "#ea580c";

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

  const styles = {
    page: {
      width: "8.5in", minHeight: "11in", padding: "0.4in 0.5in",
      backgroundColor: "#ffffff", fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: "9pt", lineHeight: "1.4", color: "#1f2937", boxSizing: "border-box" as const,
    },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: "15px", paddingBottom: "12px", borderBottom: `2px solid ${primaryColor}`,
    },
    nameBlock: { flex: 1 },
    name: { fontSize: "18pt", fontWeight: 700, color: "#111827", lineHeight: "1.1" },
    title: { fontSize: "10pt", color: primaryColor, fontWeight: 500, marginTop: "3px" },
    contactBlock: { textAlign: "right" as const, fontSize: "8pt", color: "#4b5563" },
    contactItem: { marginBottom: "2px" },
    sectionTitle: {
      fontSize: "10pt", fontWeight: 700, color: primaryColor,
      marginTop: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px",
    },
    sectionLine: { flex: 1, height: "1px", backgroundColor: "#fed7aa" },
    summary: {
      fontSize: "9pt", color: "#4b5563", lineHeight: "1.5",
      backgroundColor: "#fff7ed", padding: "10px", borderLeft: `3px solid ${primaryColor}`,
    },
    experienceItem: { marginBottom: "12px", display: "flex", gap: "15px" },
    timeline: { width: "70px", flexShrink: 0 },
    dateRange: { fontSize: "7.5pt", color: "#6b7280", fontWeight: 500 },
    experienceContent: { flex: 1 },
    jobTitle: { fontWeight: 700, fontSize: "9.5pt", color: "#111827" },
    company: { fontSize: "9pt", color: primaryColor, fontWeight: 500 },
    location: { fontSize: "8pt", color: "#9ca3af" },
    bulletList: { paddingLeft: "12px", margin: "4px 0 0 0", listStyleType: "none" },
    bulletItem: { marginBottom: "2px", fontSize: "8pt", color: "#4b5563", position: "relative" as const, paddingLeft: "12px" },
    skillsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
    skillCard: { backgroundColor: "#f9fafb", padding: "8px 10px", borderRadius: "3px" },
    skillCategory: { fontWeight: 600, fontSize: "8pt", color: primaryColor, marginBottom: "3px" },
    skillItems: { fontSize: "7.5pt", color: "#4b5563" },
    educationGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
    educationCard: { padding: "8px", border: "1px solid #e5e7eb", borderRadius: "3px" },
    certGrid: { display: "flex", flexWrap: "wrap" as const, gap: "6px" },
    certBadge: {
      backgroundColor: "#fff7ed", border: `1px solid ${primaryColor}`,
      padding: "3px 8px", borderRadius: "12px", fontSize: "7pt", color: primaryColor,
    },
  };

  return (
    <div style={styles.page} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.nameBlock}>
          <div style={styles.name}>
            <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
          </div>
          {data.personalInfo?.title && (
            <div style={styles.title}>
              <EditableText value={data.personalInfo.title} onSave={v => setPI('title', v)} />
            </div>
          )}
        </div>
        <div style={styles.contactBlock}>
          {data.personalInfo?.contact?.email && (
            <div style={styles.contactItem}><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></div>
          )}
          {data.personalInfo?.contact?.phone && (
            <div style={styles.contactItem}><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></div>
          )}
          {data.personalInfo?.contact?.location && (
            <div style={styles.contactItem}><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></div>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <div style={styles.contactItem}><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></div>
          )}
          {data.personalInfo?.contact?.website && (
            <div style={styles.contactItem}>{data.personalInfo.contact.website}</div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={styles.summary}>
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            Experience
            <div style={styles.sectionLine} />
          </div>
          {data.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={styles.experienceItem}>
              <div style={styles.timeline}>
                <div style={styles.dateRange}><EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /></div>
                <div style={styles.dateRange}>{exp.current ? 'Present' : <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />}</div>
              </div>
              <div style={styles.experienceContent}>
                <div style={styles.jobTitle}><EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} /></div>
                <div style={styles.company}><EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} /></div>
                {exp.location && <div style={styles.location}><EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></div>}
                {exp.description && exp.description.length > 0 && (
                  <ul style={styles.bulletList}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={styles.bulletItem}>
                        <span style={{ position: "absolute", left: "0", color: primaryColor, fontWeight: "bold" }}>•</span>
                        <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            Skills
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.skillsGrid}>
            {data.skills.map((skill, idx) => (
              <div key={skill.id || idx} style={styles.skillCard}>
                <div style={styles.skillCategory}><EditableText value={skill.category} onSave={v => setSkill(skill.id, 'category', v)} /></div>
                <div style={styles.skillItems}>
                  <EditableText value={skill.skills.join(' • ')} onSave={v => store.updateSkillCategory(skill.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            Education
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.educationGrid}>
            {data.education.map((edu, idx) => (
              <div key={edu.id || idx} style={styles.educationCard}>
                <div style={styles.jobTitle}><EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} /></div>
                <div style={styles.company}><EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} /></div>
                <div style={styles.location}>
                  <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                  {edu.gpa && <> • GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            Projects
            <div style={styles.sectionLine} />
          </div>
          {data.projects.map((project, idx) => (
            <div key={project.id || idx} style={{ marginBottom: "8px" }}>
              <div style={styles.jobTitle}><EditableText value={project.name} onSave={v => setProj(project.id, 'name', v)} /></div>
              {project.description && (
                Array.isArray(project.description) ? (
                  project.description.length > 0 && (
                    <ul style={styles.bulletList}>
                      {project.description.map((desc, i) => (
                        <li key={i} style={styles.bulletItem}>
                          <span style={{ position: "absolute", left: "0", color: primaryColor, fontWeight: "bold" }}>•</span>
                          <EditableText value={desc} onSave={v => setProjBullet(project.id, i, v)} multiline />
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div style={{ fontSize: "8pt", color: "#4b5563" }}>
                    <EditableText value={project.description} onSave={v => setProj(project.id, 'description', v)} multiline as="span" />
                  </div>
                )
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ fontSize: "7pt", color: primaryColor, marginTop: "2px" }}>
                  <EditableText value={project.technologies.join(' • ')} onSave={v => store.updateProject(project.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certificates && data.certificates.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            Certifications
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.certGrid}>
            {data.certificates.map((cert, idx) => (
              <div key={cert.id || idx} style={styles.certBadge}>
                {cert.name} • {cert.date}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages & Awards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "10px" }}>
        {data.languages && data.languages.length > 0 && (
          <div>
            <div style={styles.sectionTitle}>
              Languages
              <div style={styles.sectionLine} />
            </div>
            {data.languages.map((lang, idx) => (
              <div key={lang.id || idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "8pt", fontWeight: 500 }}>{lang.language}</span>
                <span style={{ fontSize: "7pt", color: "#6b7280" }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}
        {data.awards && data.awards.length > 0 && (
          <div>
            <div style={styles.sectionTitle}>
              Achievements
              <div style={styles.sectionLine} />
            </div>
            <ul style={styles.bulletList}>
              {data.awards.map((achievement, idx) => (
                <li key={achievement.id || idx} style={styles.bulletItem}>
                  <span style={{ position: "absolute", left: "0", color: primaryColor, fontWeight: "bold" }}>•</span>
                  {achievement.title}
                  {achievement.date && ` (${achievement.date})`}
                  {achievement.description && ` - ${achievement.description}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <>
          {data.customSections.map((section, idx) => (
            <div key={section.id || idx}>
              <div style={styles.sectionTitle}>
                {section.title}
                <div style={styles.sectionLine} />
              </div>
              {section.items && section.items.length > 0 ? (
                section.items.map((item, itemIdx) => (
                  <div key={item.id || itemIdx} style={{ marginBottom: "8px" }}>
                    <div style={styles.jobTitle}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: "8pt", color: "#4b5563" }}>{item.subtitle}</div>
                    )}
                    {item.description && item.description.length > 0 && (
                      <ul style={styles.bulletList}>
                        {item.description.map((desc, descIdx) => (
                          <li key={descIdx} style={styles.bulletItem}>
                            <span style={{ position: "absolute", left: "0", color: primaryColor, fontWeight: "bold" }}>•</span>
                            {desc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "8pt", color: "#4b5563" }}>No items</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ResumeTemplate4;

