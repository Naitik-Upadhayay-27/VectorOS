// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate15Props {
    data: TemplateResumeData;
}

// Corporate Elite - Traditional Corporate Template
const ResumeTemplate15 = ({ data }: ResumeTemplate15Props) => {
    const store = useTemplateResumeStore()
    const sectionOrder = store.sectionOrder ?? DEFAULT_SECTION_ORDER
    const layout = store.layout
    const marginTB = `${((layout?.marginTopBottom ?? 50) / 100).toFixed(2)}in`
    const marginLR = `${((layout?.marginLeftRight ?? 50) / 100).toFixed(2)}in`
    const fontFamily = layout?.fontFamily ?? "'Inter', sans-serif"
    const fontSize = layout?.fontSize ?? 11

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

    const sectionRenderers: Record<string, () => React.ReactNode> = {
        summary: () => data.summary ? (
            <section key="summary" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Professional Summary
                </h2>
                <p className="text-[11px] leading-[1.8] text-gray-700 text-justify">
                    <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                </p>
            </section>
        ) : null,

        experience: () => data.experience?.length > 0 ? (
            <section key="experience" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-3 border-b border-gray-300 pb-1">
                    Professional Experience
                </h2>
                {data.experience.map((exp) => (
                    <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <div>
                                <h3 className="text-[13px] font-bold text-gray-900">
                                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                                </h3>
                                <p className="text-[12px] text-gray-700">
                                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                                    {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                                </p>
                            </div>
                            <p className="text-[11px] text-gray-600 italic">
                                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                            </p>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 space-y-0.5">
                                {exp.description.map((desc, i) => (
                                    <li key={i} className="text-[10px] text-gray-700 leading-relaxed pl-4 relative before:content-['▪'] before:absolute before:left-0 before:text-gray-500">
                                        <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </section>
        ) : null,

        education: () => data.education?.length > 0 ? (
            <section key="education" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Education
                </h2>
                {data.education.map((edu) => (
                    <div key={edu.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-[12px] font-bold text-gray-900">
                                <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                            </h3>
                            <p className="text-[10px] text-gray-600 italic">
                                <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                            </p>
                        </div>
                        <p className="text-[11px] text-gray-600">
                            <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                        </p>
                        {edu.gpa && <p className="text-[10px] text-gray-500">GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></p>}
                    </div>
                ))}
            </section>
        ) : null,

        skills: () => data.skills?.length > 0 ? (
            <section key="skills" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Core Competencies
                </h2>
                {data.skills.map((cat) => (
                    <div key={cat.id} className="mb-3">
                        <h3 className="text-[10px] font-bold text-gray-700 uppercase mb-1">
                            <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                        </h3>
                        <p className="text-[10px] text-gray-600">
                            <EditableText value={cat.skills.join(' • ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        projects: () => data.projects?.length > 0 ? (
            <section key="projects" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Key Projects
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {data.projects.map((proj) => (
                        <div key={proj.id}>
                            <p className="text-[11px] font-semibold text-gray-800">{proj.name}</p>
                            <p className="text-[10px] text-gray-600">{Array.isArray(proj.description) ? proj.description[0] : proj.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        certificates: () => data.certificates?.length > 0 ? (
            <section key="certificates" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Certifications
                </h2>
                {data.certificates.map((cert) => (
                    <div key={cert.id} className="mb-2">
                        <p className="text-[11px] font-semibold text-gray-800">{cert.name}</p>
                        <p className="text-[10px] text-gray-600">{cert.issuer}, {cert.date}</p>
                    </div>
                ))}
            </section>
        ) : null,

        awards: () => data.awards?.length > 0 ? (
            <section key="awards" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Awards &amp; Honors
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {data.awards.map((award) => (
                        <div key={award.id}>
                            <p className="text-[11px] font-semibold text-gray-800">{award.title}</p>
                            <p className="text-[10px] text-gray-600">{award.date}</p>
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        languages: () => data.languages?.length > 0 ? (
            <section key="languages" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Languages
                </h2>
                {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-700">{lang.language}</span>
                        <span className="text-gray-500">{lang.proficiency}</span>
                    </div>
                ))}
            </section>
        ) : null,

        volunteer: () => data.volunteer?.length > 0 ? (
            <section key="volunteer" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Volunteering &amp; Leadership
                </h2>
                {data.volunteer.map((vol) => (
                    <div key={vol.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <p className="text-[11px] font-semibold text-gray-800">{vol.role}</p>
                            <p className="text-[10px] text-gray-600 italic">{vol.startDate} – {vol.endDate}</p>
                        </div>
                        <p className="text-[10px] text-gray-600">{vol.organization}</p>
                        {vol.description && <p className="text-[10px] text-gray-600 mt-1">{vol.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,
    }

    return (
        <div className="resume-page bg-white" style={{ fontFamily, fontSize: `${fontSize}pt`, padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})` }}>
            {/* Header */}
            <header className="border-b-4 border-double border-gray-900 pb-4 mb-6">
                <h1 className="text-[28px] font-bold text-center text-gray-900 tracking-wide mb-1">
                    <EditableText value={data.personalInfo?.name?.toUpperCase() || 'YOUR NAME'} onSave={v => setPI('name', v)} />
                </h1>
                <p className="text-[14px] text-center text-gray-600 mb-3">
                    <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                </p>

                {/* Contact - Centered Single Line */}
                <div className="flex justify-center items-center gap-4 text-[11px] text-gray-600 flex-wrap">
                    {data.personalInfo?.contact?.email && (
                        <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.linkedin && (
                        <span className="flex items-center gap-1">
                            <Linkedin className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
                        </span>
                    )}
                </div>
            </header>

            {/* Sections in user-defined order */}
            {sectionOrder.map(key => sectionRenderers[key]?.())}
        </div>
    );
};

export default ResumeTemplate15;

