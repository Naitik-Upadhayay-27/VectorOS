// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, Linkedin, Github, Globe, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore, DEFAULT_SECTION_ORDER } from '@/store/templateResumeStore';

interface ResumeTemplate13Props {
    data: TemplateResumeData;
}

// Tech Modern - Developer/Tech Professional Template
const ResumeTemplate13 = ({ data }: ResumeTemplate13Props) => {
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
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-2">
                    <span className="text-emerald-400">{'//'}</span> About
                </h2>
                <p className="text-[11px] leading-[1.7] text-gray-600">
                    <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                </p>
            </section>
        ) : null,

        experience: () => data.experience?.length > 0 ? (
            <section key="experience" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Experience
                </h2>
                {data.experience.map((exp) => (
                    <div key={exp.id} className="mb-4 pl-4 border-l-2 border-emerald-200">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="text-[13px] font-bold text-gray-900">
                                    <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                                </h3>
                                <p className="text-[11px] text-emerald-600 font-semibold">
                                    <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                                </p>
                            </div>
                            <span className="text-[9px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> → <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                            </span>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {exp.description.map((desc, i) => (
                                    <li key={i} className="text-[10px] text-gray-600 leading-relaxed flex gap-2">
                                        <span className="text-emerald-400 font-mono">→</span>
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
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" /> Education
                </h2>
                {data.education.map((edu) => (
                    <div key={edu.id} className="mb-3">
                        <h3 className="text-[12px] font-bold text-gray-900">
                            <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                        </h3>
                        <p className="text-[11px] text-emerald-600">
                            <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                        </p>
                        <p className="text-[10px] text-gray-500">
                            <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                        </p>
                    </div>
                ))}
            </section>
        ) : null,

        skills: () => data.skills?.length > 0 ? (
            <section key="skills" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <span className="text-emerald-400">{'<'}</span> Tech Stack <span className="text-emerald-400">{'/>'}</span>
                </h2>
                {data.skills.map((cat) => (
                    <div key={cat.id} className="mb-3">
                        <h3 className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
                            <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {cat.skills.map((skill, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono border border-emerald-200">
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
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" /> Projects
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {data.projects.map((proj) => (
                        <div key={proj.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <h3 className="text-[12px] font-bold text-gray-900 mb-1">
                                <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                            </h3>
                            <p className="text-[10px] text-gray-600 mb-2">
                                {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                            </p>
                            {proj.technologies && (
                                <div className="flex flex-wrap gap-1">
                                    {proj.technologies.slice(0, 4).map((tech, i) => (
                                        <span key={i} className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-mono">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        ) : null,

        certificates: () => data.certificates?.length > 0 ? (
            <section key="certificates" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" /> Certifications
                </h2>
                {data.certificates.map((cert) => (
                    <div key={cert.id} className="mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-900">{cert.name}</p>
                        <p className="text-[10px] text-gray-500">{cert.issuer}</p>
                    </div>
                ))}
            </section>
        ) : null,

        awards: () => data.awards?.length > 0 ? (
            <section key="awards" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" /> Awards &amp; Honors
                </h2>
                {data.awards.map((award) => (
                    <div key={award.id} className="mb-2">
                        <p className="text-[11px] font-semibold text-gray-900">{award.title}</p>
                        <p className="text-[10px] text-gray-500">{award.date}</p>
                        {award.description && <p className="text-[10px] text-gray-600 mt-0.5">{award.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,

        languages: () => data.languages?.length > 0 ? (
            <section key="languages" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3">
                    Languages
                </h2>
                {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-gray-800">{lang.language}</span>
                        <span className="text-gray-500">{lang.proficiency}</span>
                    </div>
                ))}
            </section>
        ) : null,

        volunteer: () => data.volunteer?.length > 0 ? (
            <section key="volunteer" className="mb-6">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-3">
                    Volunteering &amp; Leadership
                </h2>
                {data.volunteer.map((vol) => (
                    <div key={vol.id} className="mb-3 pl-4 border-l-2 border-emerald-200">
                        <p className="text-[11px] font-bold text-gray-900">{vol.role}</p>
                        <p className="text-[10px] text-emerald-600">{vol.organization}</p>
                        <p className="text-[9px] text-gray-500">{vol.startDate} – {vol.endDate}</p>
                        {vol.description && <p className="text-[10px] text-gray-600 mt-0.5">{vol.description}</p>}
                    </div>
                ))}
            </section>
        ) : null,
    }

    return (
        <div className="resume-page bg-[#0f172a]" style={{ fontFamily, fontSize: `${fontSize}pt`, padding: `${marginTB} ${marginLR}` }}>
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-8">
                <div className="flex items-center gap-6">
                    {data.personalInfo?.image && (
                        <img
                            src={data.personalInfo.image}
                            alt={data.personalInfo?.name || 'Profile'}
                            className="w-20 h-20 rounded-xl object-cover border-4 border-white/20"
                        />
                    )}
                    <div className="text-white">
                        <h1 className="text-[28px] font-bold leading-none mb-1">
                            <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
                        </h1>
                        <p className="text-emerald-100 text-[14px] font-medium">
                            <span className="text-emerald-300">{'<'}</span>
                            <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                            <span className="text-emerald-300">{' />'}</span>
                        </p>
                    </div>
                </div>

                {/* Contact */}
                <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-white/80 font-mono">
                    {data.personalInfo?.contact?.email && (
                        <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.phone && (
                        <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.github && (
                        <span className="flex items-center gap-1.5">
                            <Github className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.github} onSave={v => setContact('github', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.linkedin && (
                        <span className="flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5" /> <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.website && (
                        <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> {data.personalInfo.contact.website}
                        </span>
                    )}
                </div>
            </header>

            {/* Main Content — single column driven by sectionOrder */}
            <div className="bg-white p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                {sectionOrder.map(key => sectionRenderers[key]?.())}
            </div>
        </div>
    );
};

export default ResumeTemplate13;
