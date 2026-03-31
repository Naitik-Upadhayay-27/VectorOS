// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate12Props {
    data: TemplateResumeData;
}

// Clean Minimal - Simple & Elegant ATS-Perfect Template
const ResumeTemplate12 = ({ data }: ResumeTemplate12Props) => {
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
    const setProj = (id: string, field: string, val: string) => store.updateProject(id, { [field]: val })

    const sectionRenderers: Record<string, () => React.ReactNode> = {
        summary: () => data.summary ? (
            <section key="summary" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Summary</h2>
                <p className="text-[12px] leading-[1.8] text-gray-700 text-center max-w-[6in] mx-auto">
                    <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                </p>
            </section>
        ) : null,

        experience: () => data.experience?.length > 0 ? (
            <section key="experience" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-4 text-center">Experience</h2>
                {data.experience.map((exp) => (
                    <div key={exp.id} className="mb-5">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-[14px] font-semibold text-gray-900">
                                <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                            </h3>
                            <p className="text-[11px] text-gray-500 italic">
                                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                            </p>
                        </div>
                        <p className="text-[12px] text-gray-600 mb-2">
                            <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                            {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                        </p>
                        {exp.description && exp.description.length > 0 && (
                            <ul className="space-y-1">
                                {exp.description.map((desc, i) => (
                                    <li key={i} className="text-[11px] text-gray-600 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">
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
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Education</h2>
                {data.education.map((edu) => (
                    <div key={edu.id} className="mb-3 text-center">
                        <h3 className="text-[13px] font-semibold text-gray-900">
                            <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                        </h3>
                        <p className="text-[12px] text-gray-600">
                            <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                        </p>
                        <p className="text-[11px] text-gray-500">
                            <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        skills: () => data.skills?.length > 0 ? (
            <section key="skills" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Expertise</h2>
                {data.skills.map((cat) => (
                    <div key={cat.id} className="mb-2 text-center">
                        <p className="text-[11px] text-gray-600">
                            <EditableText value={cat.skills.join(' • ')} onSave={v => store.updateSkillCategory(cat.id, { skills: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        projects: () => data.projects?.length > 0 ? (
            <section key="projects" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-4 text-center">Projects</h2>
                {data.projects.map((proj) => (
                    <div key={proj.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-[13px] font-semibold text-gray-900">
                                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                            </h3>
                            {proj.date && <span className="text-[10px] text-gray-500 italic">{proj.date}</span>}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">
                            {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        certificates: () => data.certificates?.length > 0 ? (
            <section key="certificates" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Certifications</h2>
                <div className="flex justify-center flex-wrap gap-4">
                    {data.certificates.map((cert) => (
                        <span key={cert.id} className="text-[11px] text-gray-600">
                            {cert.name} <span className="text-gray-400">({cert.issuer}, {cert.date})</span>
                        </span>
                    ))}
                </div>
            </section>
        ) : null,

        awards: () => data.awards?.length > 0 ? (
            <section key="awards" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Awards &amp; Honors</h2>
                <div className="flex justify-center flex-wrap gap-4">
                    {data.awards.map((award) => (
                        <div key={award.id} className="text-center">
                            <p className="text-[12px] font-semibold text-gray-800">{award.title}</p>
                            <p className="text-[11px] text-gray-500">{award.date}</p>
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        languages: () => data.languages?.length > 0 ? (
            <section key="languages" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Languages</h2>
                <div className="flex justify-center flex-wrap gap-6">
                    {data.languages.map((lang) => (
                        <div key={lang.id} className="text-center">
                            <span className="text-[12px] font-semibold text-gray-800">{lang.language}</span>
                            <span className="text-[11px] text-gray-500"> — {lang.proficiency}</span>
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        volunteer: () => data.volunteer?.length > 0 ? (
            <section key="volunteer" className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400 mb-3 text-center">Volunteering &amp; Leadership</h2>
                {data.volunteer.map((vol) => (
                    <div key={vol.id} className="mb-3 text-center">
                        <p className="text-[12px] font-semibold text-gray-800">{vol.role}</p>
                        <p className="text-[11px] text-gray-600">{vol.organization}</p>
                        <p className="text-[11px] text-gray-500">{vol.startDate} – {vol.endDate}</p>
                        {vol.description && <p className="text-[11px] text-gray-600 mt-1">{vol.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,
    }

    return (
        <div className="resume-page bg-white" style={{ fontFamily, fontSize: `${fontSize}pt`, padding: `calc(0.5in + ${marginTB}) calc(0.55in + ${marginLR})` }}>
            {/* Header - Clean Centered */}
            <header className="text-center mb-8 pb-6 border-b border-gray-200">
                <h1 className="text-[32px] font-normal tracking-wide text-gray-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                    <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
                </h1>
                <p className="text-[14px] text-gray-600 tracking-widest uppercase mb-4">
                    <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                </p>

                {/* Contact - Single Line */}
                <div className="flex justify-center items-center gap-4 text-[11px] text-gray-500 flex-wrap">
                    {data.personalInfo?.contact?.email && (
                        <span><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></span>
                    )}
                    {data.personalInfo?.contact?.phone && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></span>
                        </>
                    )}
                    {data.personalInfo?.contact?.location && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></span>
                        </>
                    )}
                    {data.personalInfo?.contact?.linkedin && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></span>
                        </>
                    )}
                </div>
            </header>

            {/* Sections in user-defined order */}
            {sectionOrder.map(key => sectionRenderers[key]?.())}
        </div>
    );
};

export default ResumeTemplate12;

