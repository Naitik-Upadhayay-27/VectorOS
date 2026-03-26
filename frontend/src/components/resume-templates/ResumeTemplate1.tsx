// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore } from '@/store/templateResumeStore';

interface ResumeTemplate1Props {
  data: TemplateResumeData;
}

const ResumeTemplate1 = ({ data }: ResumeTemplate1Props) => {
  const store = useTemplateResumeStore()

  const setPI = (field: string, val: string) =>
    store.setPersonalInfo({ [field]: val })
  const setContact = (field: string, val: string) =>
    store.setContact({ [field]: val })
  const setExp = (id: string, field: string, val: string) =>
    store.updateExperience(id, { [field]: val })
  const setExpBullet = (id: string, idx: number, val: string) => {
    const exp = data.experience?.find((e: ExperienceItem) => e.id === id)
    if (!exp) return
    const desc = [...(exp.description ?? [])]
    desc[idx] = val
    store.updateExperience(id, { description: desc })
  }
  const setEdu = (id: string, field: string, val: string) =>
    store.updateEducation(id, { [field]: val })
  const setEduBullet = (id: string, idx: number, val: string) => {
    const edu = data.education?.find((e: EducationItem) => e.id === id)
    if (!edu) return
    const desc = [...(edu.description ?? [])]
    desc[idx] = val
    store.updateEducation(id, { description: desc })
  }
  const setSkill = (id: string, field: string, val: string) =>
    store.updateSkillCategory(id, { [field]: val })
  const setProj = (id: string, field: string, val: string) =>
    store.updateProject(id, { [field]: val })
  const setProjBullet = (id: string, idx: number, val: string) => {
    const proj = data.projects?.find((p: ProjectItem) => p.id === id)
    if (!proj) return
    const desc = Array.isArray(proj.description) ? [...proj.description] : [proj.description ?? '']
    desc[idx] = val
    store.updateProject(id, { description: desc })
  }

  return (
    <div className="resume-page p-[0.6in] bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="pb-4 border-b-2 border-gray-400 mb-6">
        <div className="flex items-center gap-6 mb-3">
          {data.personalInfo?.image && (
            <div className="flex-shrink-0">
              <img src={data.personalInfo.image} alt={data.personalInfo?.name || 'Profile'}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-[32px] font-bold text-gray-900 leading-tight mb-1">
              <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
            </h1>
            <p className="text-[16px] text-blue-600 font-semibold">
              <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-700">
          {data.personalInfo?.contact?.email && (
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
            </span>
          )}
          {data.personalInfo?.contact?.phone && (
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
            </span>
          )}
          {data.personalInfo?.contact?.location && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} />
            </span>
          )}
          {data.personalInfo?.contact?.linkedin && (
            <span className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
            </span>
          )}
          {data.personalInfo?.contact?.github && (
            <span className="flex items-center gap-2">
              <Github className="w-4 h-4 text-blue-600" />
              <EditableText value={data.personalInfo.contact.github} onSave={v => setContact('github', v)} />
            </span>
          )}
        </div>
      </header>

      {data.summary && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Professional Summary
          </h2>
          <p className="text-[13px] leading-relaxed text-gray-700">
            <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
          </p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Professional Experience
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">
                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                  </h3>
                  <p className="text-[13px] text-blue-600 font-semibold">
                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                    {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                  </p>
                </div>
                <p className="text-[12px] text-gray-600 font-medium text-right">
                  <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                </p>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12px] text-gray-700 leading-relaxed space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i}>
                      <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Technical Skills
          </h2>
          {data.skills.map((cat) => (
            <div key={cat.id} className="mb-3">
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">
                <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
              </h3>
              <p className="text-[12px] text-gray-700">
                <EditableText value={cat.skills.join(' • ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
              </p>
            </div>
          ))}
        </section>
      )}

      {data.certificates && data.certificates.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Certifications
          </h2>
          {data.certificates.map((cert) => (
            <div key={cert.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[13px] font-bold text-gray-900">{cert.name}</h3>
                <span className="text-[12px] text-gray-600">{cert.date}</span>
              </div>
              <p className="text-[12px] text-gray-600">{cert.issuer}</p>
            </div>
          ))}
        </section>
      )}

      {data.awards && data.awards.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Awards & Accomplishments
          </h2>
          {data.awards.map((award) => (
            <div key={award.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[13px] font-bold text-gray-900">{award.title}</h3>
                <span className="text-[12px] text-gray-600">{award.date}</span>
              </div>
              {award.description && <p className="text-[12px] text-gray-700 mt-1">{award.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.languages && data.languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Languages
          </h2>
          <div className="space-y-2">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-900">{lang.language}</span>
                <span className="text-[12px] text-gray-600">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">
                    <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                  </h3>
                  <p className="text-[13px] text-gray-600 font-medium">
                    <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                    {edu.location && <>, <EditableText value={edu.location} onSave={v => setEdu(edu.id, 'location', v)} /></>}
                  </p>
                  {edu.gpa && <p className="text-[12px] text-gray-500">GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></p>}
                </div>
                <p className="text-[12px] text-gray-600">
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
      )}

      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-400 pb-1">
            Projects
          </h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">
                    <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                  </h3>
                  {proj.role && <p className="text-[13px] text-blue-600 font-semibold"><EditableText value={proj.role} onSave={v => setProj(proj.id, 'role', v)} /></p>}
                  {proj.link && <p className="text-[11px] text-blue-600"><EditableText value={proj.link} onSave={v => setProj(proj.id, 'link', v)} /></p>}
                </div>
                <p className="text-[12px] text-gray-600 text-right">
                  {proj.startDate && proj.endDate
                    ? <><EditableText value={proj.startDate} onSave={v => setProj(proj.id, 'startDate', v)} /> – <EditableText value={proj.endDate} onSave={v => setProj(proj.id, 'endDate', v)} /></>
                    : proj.date}
                </p>
              </div>
              {proj.description && (
                Array.isArray(proj.description) ? (
                  proj.description.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-[12px] text-gray-700 leading-relaxed space-y-1">
                      {proj.description.map((desc, i) => (
                        <li key={i}><EditableText value={desc} onSave={v => setProjBullet(proj.id, i, v)} multiline /></li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p className="text-[12px] text-gray-700 mt-1">
                    <EditableText value={proj.description} onSave={v => setProj(proj.id, 'description', v)} multiline />
                  </p>
                )
              )}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-[11px] text-blue-500 mt-2 font-medium">
                  <EditableText value={proj.technologies.join(' • ')} onSave={v => store.updateProject(proj.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ResumeTemplate1;

