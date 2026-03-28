// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate14Props {
    data: TemplateResumeData;
}

// Coral Creative - Bold & Modern for Creative Professionals
const ResumeTemplate14 = ({ data }: ResumeTemplate14Props) => {
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
            <section key="summary" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    About Me
                </h2>
                <p className="text-[11px] leading-[1.8] text-gray-600">
                    <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                </p>
            </section>
        ) : null,

        experience: () => data.experience?.length > 0 ? (
            <section key="experience" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Work Experience
                </h2>
                {data.experience.map((exp) => (
                    <div key={exp.id} className="mb-5 relative pl-5 border-l-2 border-rose-200">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500" />
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="text-[13px] font-bold text-gray-900">
                                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                                </h3>
                                <p className="text-[11px] text-rose-500 font-semibold">
                                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                            </p>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {exp.description.map((desc, i) => (
                                    <li key={i} className="text-[10px] text-gray-600 leading-relaxed">
                                        • <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
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
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Education
                </h2>
                {data.education.map((edu) => (
                    <div key={edu.id} className="mb-3 flex justify-between items-start">
                        <div>
                            <h3 className="text-[12px] font-bold text-gray-900">
                                <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                            </h3>
                            <p className="text-[11px] text-gray-600">
                                <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                            </p>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        skills: () => data.skills?.length > 0 ? (
            <section key="skills" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Expertise
                </h2>
                {data.skills.map((cat) => (
                    <div key={cat.id} className="mb-3">
                        <h3 className="text-[11px] text-rose-500 font-medium mb-1.5">
                            <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {cat.skills.map((skill, i) => (
                                <span key={i} className="text-[9px] px-2 py-1 bg-rose-50 rounded-full text-gray-700">
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
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Projects
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {data.projects.map((proj) => (
                        <div key={proj.id} className="bg-rose-50 p-3 rounded-lg">
                            <h3 className="text-[11px] font-bold text-gray-900">
                                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                            </h3>
                            <p className="text-[9px] text-gray-600 mt-1">
                                {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        certificates: () => data.certificates?.length > 0 ? (
            <section key="certificates" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Certifications
                </h2>
                {data.certificates.map((cert) => (
                    <div key={cert.id} className="mb-2">
                        <p className="text-[11px] font-medium text-gray-900">{cert.name}</p>
                        <p className="text-[10px] text-rose-400">{cert.issuer} • {cert.date}</p>
                    </div>
                ))}
            </section>
        ) : null,

        awards: () => data.awards?.length > 0 ? (
            <section key="awards" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Awards &amp; Honors
                </h2>
                {data.awards.map((award) => (
                    <div key={award.id} className="mb-2">
                        <p className="text-[11px] font-medium text-gray-900">{award.title}</p>
                        <p className="text-[10px] text-gray-400">{award.date}</p>
                        {award.description && <p className="text-[10px] text-gray-600 mt-0.5">{award.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,

        languages: () => data.languages?.length > 0 ? (
            <section key="languages" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Languages
                </h2>
                {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-gray-800">{lang.language}</span>
                        <span className="text-rose-400">{lang.proficiency}</span>
                    </div>
                ))}
            </section>
        ) : null,

        volunteer: () => data.volunteer?.length > 0 ? (
            <section key="volunteer" className="mb-6">
                <h2 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded" />
                    Volunteering &amp; Leadership
                </h2>
                {data.volunteer.map((vol) => (
                    <div key={vol.id} className="mb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-semibold text-gray-900">{vol.role}</p>
                                <p className="text-[10px] text-rose-500">{vol.organization}</p>
                            </div>
                            <p className="text-[10px] text-gray-400">{vol.startDate} – {vol.endDate}</p>
                        </div>
                        {vol.description && <p className="text-[10px] text-gray-600 mt-1">{vol.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,
    }

    return (
        <div className="resume-page bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex">
                {/* Left - Coral Sidebar (contact only) */}
                <div className="w-[2.8in] bg-gradient-to-b from-rose-500 to-orange-500 p-8 text-white min-h-full">
                    {/* Profile */}
                    <div className="text-center mb-8">
                        {data.personalInfo?.image && (
                            <img
                                src={data.personalInfo.image}
                                alt={data.personalInfo?.name || 'Profile'}
                                className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 shadow-lg"
                            />
                        )}
                        <h1 className="text-[24px] font-bold leading-tight">
                            <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
                        </h1>
                        <p className="text-[13px] text-rose-100 font-medium mt-1">
                            <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                        </p>
                    </div>

                    {/* Contact */}
                    <section className="mb-8">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-3 border-b border-white/20 pb-2">
                            Contact
                        </h2>
                        <div className="space-y-2 text-[10px]">
                            {data.personalInfo?.contact?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-rose-200" />
                                    <span><EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} /></span>
                                </div>
                            )}
                            {data.personalInfo?.contact?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-rose-200" />
                                    <span><EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} /></span>
                                </div>
                            )}
                            {data.personalInfo?.contact?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-rose-200" />
                                    <span><EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} /></span>
                                </div>
                            )}
                            {data.personalInfo?.contact?.linkedin && (
                                <div className="flex items-center gap-2">
                                    <Linkedin className="w-3.5 h-3.5 text-rose-200" />
                                    <span><EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} /></span>
                                </div>
                            )}
                            {data.personalInfo?.contact?.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-rose-200" />
                                    <span>{data.personalInfo.contact.website}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right - Main Content driven by sectionOrder */}
                <div className="flex-1 p-8">
                    {sectionOrder.map(key => sectionRenderers[key]?.())}
                </div>
            </div>
        </div>
    );
};

export default ResumeTemplate14;
