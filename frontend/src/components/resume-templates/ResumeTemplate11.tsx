// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate11Props {
    data: TemplateResumeData;
}

// Modern Gradient - Creative Tech Template
const ResumeTemplate11 = ({ data }: ResumeTemplate11Props) => {
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

    const sectionRenderers: Record<string, () => React.ReactNode> = {
        summary: () => data.summary ? (
            <section key="summary" className="mb-6 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-xl border-l-4 border-violet-600">
                <p className="text-[12px] leading-[1.7] text-gray-700">
                    <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                </p>
            </section>
        ) : null,

        experience: () => data.experience?.length > 0 ? (
            <section key="experience" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Experience
                </h2>
                {data.experience.map((exp) => (
                    <div key={exp.id} className="mb-5 relative pl-4 border-l-2 border-gray-200">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">
                                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                                </h3>
                                <p className="text-[12px] text-violet-600 font-semibold">
                                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                            </p>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {exp.description.map((desc, i) => (
                                    <li key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-2">
                                        <span className="text-violet-400 mt-0.5">›</span>
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
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Education
                </h2>
                {data.education.map((edu) => (
                    <div key={edu.id} className="mb-3">
                        <h3 className="text-[12px] font-bold text-gray-900">
                            <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                        </h3>
                        <p className="text-[11px] text-gray-600">
                            <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                        </p>
                        <p className="text-[10px] text-gray-400">
                            <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        skills: () => data.skills?.length > 0 ? (
            <section key="skills" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Skills
                </h2>
                {data.skills.map((cat) => (
                    <div key={cat.id} className="mb-3">
                        <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-wide mb-1.5">
                            <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {cat.skills.map((skill, i) => (
                                <span key={i} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
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
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Projects
                </h2>
                {data.projects.map((proj) => (
                    <div key={proj.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                            <h3 className="text-[13px] font-bold text-gray-900">
                                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                            </h3>
                            {proj.link && <Globe className="w-3.5 h-3.5 text-violet-600" />}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">
                            {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                        </p>
                        {proj.technologies && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {proj.technologies.map((tech, i) => (
                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </section>
        ) : null,

        certificates: () => data.certificates?.length > 0 ? (
            <section key="certificates" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Certifications
                </h2>
                {data.certificates.map((cert) => (
                    <div key={cert.id} className="mb-2 p-2 bg-violet-50 rounded">
                        <p className="text-[11px] font-semibold text-gray-800">{cert.name}</p>
                        <p className="text-[10px] text-gray-500">{cert.issuer}</p>
                    </div>
                ))}
            </section>
        ) : null,

        awards: () => data.awards?.length > 0 ? (
            <section key="awards" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Awards &amp; Honors
                </h2>
                {data.awards.map((award) => (
                    <div key={award.id} className="mb-2">
                        <p className="text-[12px] font-semibold text-gray-800">{award.title}</p>
                        <p className="text-[11px] text-gray-500">{award.date}</p>
                        {award.description && <p className="text-[11px] text-gray-600 mt-1">{award.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,

        languages: () => data.languages?.length > 0 ? (
            <section key="languages" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Languages
                </h2>
                {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-[11px] mb-1.5">
                        <span className="font-medium text-gray-700">{lang.language}</span>
                        <span className="text-violet-600">{lang.proficiency}</span>
                    </div>
                ))}
            </section>
        ) : null,

        volunteer: () => data.volunteer?.length > 0 ? (
            <section key="volunteer" className="mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Volunteering &amp; Leadership
                </h2>
                {data.volunteer.map((vol) => (
                    <div key={vol.id} className="mb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[12px] font-semibold text-gray-800">{vol.role}</p>
                                <p className="text-[11px] text-gray-600">{vol.organization}</p>
                            </div>
                            <p className="text-[11px] text-gray-500">{vol.startDate} – {vol.endDate}</p>
                        </div>
                        {vol.description && <p className="text-[11px] text-gray-600 mt-1">{vol.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,
    }

    return (
        <div className="resume-page bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header with gradient accent */}
            <div className="h-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />

            <div className="px-10 py-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-6">
                        {data.personalInfo?.image && (
                            <img
                                src={data.personalInfo.image}
                                alt={data.personalInfo?.name || 'Profile'}
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-[32px] font-bold text-gray-900 leading-none mb-1">
                                <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
                            </h1>
                            <p className="text-[16px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                                <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-gray-600">
                        {data.personalInfo?.contact?.email && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Mail className="w-3.5 h-3.5 text-violet-600" /> <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
                            </span>
                        )}
                        {data.personalInfo?.contact?.phone && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Phone className="w-3.5 h-3.5 text-violet-600" /> <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
                            </span>
                        )}
                        {data.personalInfo?.contact?.location && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                <MapPin className="w-3.5 h-3.5 text-violet-600" /> <EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} />
                            </span>
                        )}
                        {data.personalInfo?.contact?.linkedin && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Linkedin className="w-3.5 h-3.5 text-violet-600" /> <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
                            </span>
                        )}
                        {data.personalInfo?.contact?.github && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Github className="w-3.5 h-3.5 text-violet-600" /> <EditableText value={data.personalInfo.contact.github} onSave={v => setContact('github', v)} />
                            </span>
                        )}
                    </div>
                </header>

                {/* Sections in user-defined order */}
                {sectionOrder.map(key => sectionRenderers[key]?.())}
            </div>
        </div>
    );
};

export default ResumeTemplate11;
