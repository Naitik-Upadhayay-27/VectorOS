// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate2Props {
  data: TemplateResumeData;
}

const ResumeTemplate2 = ({ data }: ResumeTemplate2Props) => {
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
  const setEduBullet = (id: string, idx: number, val: string) => {
    const edu = data.education?.find((e: ExperienceItem) => e.id === id)
    if (!edu) return
    const desc = [...(edu.description ?? [])]
    desc[idx] = val
    store.updateEducation(id, { description: desc })
  }
  const setSkill = (id: string, field: string, val: string) => store.updateSkillCategory(id, { [field]: val })
  const setProj = (id: string, field: string, val: string) => store.updateProject(id, { [field]: val })
  const setProjBullet = (id: string, idx: number, val: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = val
    store.updateProject(id, { description: desc })
  }

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Professional Summary
        </h2>
        <p className="text-[13px] leading-relaxed text-gray-700">
          <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
        </p>
      </section>
    ) : null,

    experience: () => data.experience?.length > 0 ? (
      <section key="experience" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Professional Experience
        </h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                </h3>
                <p className="text-[13px] text-rose-600 font-medium">
                  <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                  {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                </p>
              </div>
              <p className="text-[12px] text-gray-500 font-medium">
                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
              </p>
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul className="list-disc list-outside ml-4 text-[12px] text-gray-700 leading-relaxed space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i}><EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline /></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    ) : null,

    education: () => data.education?.length > 0 ? (
      <section key="education" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Education
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">
                  <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                </h3>
                <p className="text-[12px] text-gray-600 font-medium">
                  <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                </p>
                {edu.gpa && (
                  <p className="text-[11px] text-gray-500">GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></p>
                )}
              </div>
              <p className="text-[12px] text-gray-500 font-medium">
                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
              </p>
            </div>
            {edu.description && edu.description.length > 0 && (
              <ul className="list-disc list-outside ml-4 text-[12px] text-gray-700 leading-relaxed space-y-1">
                {edu.description.map((desc, i) => (
                  <li key={i}><EditableText value={desc} onSave={v => setEduBullet(edu.id, i, v)} multiline /></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    ) : null,

    skills: () => data.skills?.length > 0 ? (
      <section key="skills" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Technical Skills
        </h2>
        {data.skills.map((cat) => (
          <div key={cat.id} className="mb-4">
            <h3 className="text-[13px] font-semibold text-gray-800 mb-2">
              <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, i) => (
                <span key={i} className="text-[11px] px-2 py-1 bg-rose-50 text-gray-700 rounded border border-rose-200 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    ) : null,

    projects: () => data.projects?.length > 0 ? (
      <section key="projects" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Key Projects
        </h2>
        {data.projects.map((proj) => (
          <div key={proj.id} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">
                  <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                </h3>
                {proj.role && (
                  <p className="text-[12px] text-rose-600 font-medium">
                    <EditableText value={proj.role} onSave={v => setProj(proj.id, 'role', v)} />
                  </p>
                )}
                {proj.link && (
                  <p className="text-[11px] text-rose-600">
                    <EditableText value={proj.link} onSave={v => setProj(proj.id, 'link', v)} />
                  </p>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {proj.startDate && proj.endDate
                  ? <><EditableText value={proj.startDate} onSave={v => setProj(proj.id, 'startDate', v)} /> – <EditableText value={proj.endDate} onSave={v => setProj(proj.id, 'endDate', v)} /></>
                  : proj.date}
              </p>
            </div>
            {proj.description && (
              Array.isArray(proj.description) ? (
                proj.description.length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-[12px] text-gray-600 leading-relaxed space-y-1">
                    {proj.description.map((desc, i) => (
                      <li key={i}><EditableText value={desc} onSave={v => setProjBullet(proj.id, i, v)} multiline /></li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-[12px] text-gray-600 mt-1">
                  <EditableText value={proj.description} onSave={v => setProj(proj.id, 'description', v)} multiline as="span" />
                </p>
              )
            )}
            {proj.technologies && proj.technologies.length > 0 && (
              <p className="text-[11px] text-rose-500 mt-2 font-medium">
                <EditableText value={proj.technologies.join(' • ')} onSave={v => store.updateProject(proj.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
              </p>
            )}
          </div>
        ))}
      </section>
    ) : null,

    certificates: () => data.certificates?.length > 0 ? (
      <section key="certificates" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Certifications
        </h2>
        {data.certificates.map((cert) => (
          <div key={cert.id} className="mb-3">
            <p className="text-[12px] font-semibold text-gray-800">{cert.name}</p>
            <p className="text-[11px] text-gray-600">{cert.issuer}</p>
            <p className="text-[10px] text-gray-500">{cert.date}</p>
          </div>
        ))}
      </section>
    ) : null,

    awards: () => data.awards?.length > 0 ? (
      <section key="awards" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Awards
        </h2>
        {data.awards.map((award) => (
          <div key={award.id} className="mb-3">
            <p className="text-[12px] font-semibold text-gray-800">{award.title}</p>
            <p className="text-[10px] text-gray-500">{award.date}</p>
            {award.description && (
              <p className="text-[11px] text-gray-600 mt-1">{award.description}</p>
            )}
          </div>
        ))}
      </section>
    ) : null,

    languages: () => data.languages?.length > 0 ? (
      <section key="languages" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Languages
        </h2>
        {data.languages.map((lang) => (
          <div key={lang.id} className="mb-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-gray-800">{lang.language}</span>
              <span className="text-[11px] text-gray-600">{lang.proficiency}</span>
            </div>
          </div>
        ))}
      </section>
    ) : null,

    volunteer: () => data.volunteer?.length > 0 ? (
      <section key="volunteer" className="mb-6">
        <h2 className="text-[18px] font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-3">
          <span className="w-12 h-1 bg-rose-500 rounded"></span> Volunteer Experience
        </h2>
        {data.volunteer.map((vol) => (
          <div key={vol.id} className="mb-3">
            <p className="text-[12px] font-semibold text-gray-800">{vol.role}</p>
            <p className="text-[11px] text-gray-600">{vol.organization}</p>
            <p className="text-[10px] text-gray-500">{vol.startDate} – {vol.endDate}</p>
            {vol.description && (
              <p className="text-[11px] text-gray-600 mt-1">{vol.description}</p>
            )}
          </div>
        ))}
      </section>
    ) : null,
  }

  return (
    <div className="resume-page p-0 bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-8">
        <div className="flex items-center gap-6">
          {data.personalInfo?.image && (
            <div className="flex-shrink-0">
              <img
                src={data.personalInfo.image}
                alt={data.personalInfo?.name || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-[32px] font-bold leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
            </h1>
            <p className="text-[18px] text-rose-100 font-medium">
              <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.personalInfo?.contact?.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-200" />
              <span className="text-[13px]"><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></span>
            </div>
          )}
          {data.personalInfo?.contact?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-200" />
              <span className="text-[13px]"><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></span>
            </div>
          )}
          {data.personalInfo?.contact?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-200" />
              <span className="text-[13px]"><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></span>
            </div>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-rose-200" />
              <span className="text-[13px]"><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content — single column driven by sectionOrder */}
      <div className="p-8">
        {sectionOrder.map(key => sectionRenderers[key]?.())}
      </div>
    </div>
  );
};

export default ResumeTemplate2;
