// @ts-nocheck
import { TemplateResumeData, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificateItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem, MembershipItem } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import EditableText from '@/components/resume-editor/EditableText';
import { useTemplateResumeStore } from '@/store/templateResumeStore';

interface ResumeTemplate10Props {
    data: TemplateResumeData;
}

// Executive Blue - Premium ATS-Optimized Template
const ResumeTemplate10 = ({ data }: ResumeTemplate10Props) => {
    const store = useTemplateResumeStore()

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

    return (
        <div className="resume-page bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header className="bg-[#1e3a5f] text-white px-10 py-8">
                <div className="flex items-center gap-6">
                    {data.personalInfo?.image && (
                        <img
                            src={data.personalInfo.image}
                            alt={data.personalInfo?.name || 'Profile'}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-[36px] font-bold tracking-tight leading-none mb-2">
                            <EditableText value={data.personalInfo?.name || 'Your Name'} onSave={v => setPI('name', v)} />
                        </h1>
                        <p className="text-[18px] text-blue-200 font-medium tracking-wide">
                            <EditableText value={data.personalInfo?.title || 'Professional Title'} onSave={v => setPI('title', v)} />
                        </p>
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="mt-6 flex flex-wrap gap-6 text-[12px]">
                    {data.personalInfo?.contact?.email && (
                        <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-300" /> <EditableText value={data.personalInfo.contact.email} onSave={v => setContact('email', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.phone && (
                        <span className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-300" /> <EditableText value={data.personalInfo.contact.phone} onSave={v => setContact('phone', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.location && (
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-300" /> <EditableText value={data.personalInfo.contact.location} onSave={v => setContact('location', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.linkedin && (
                        <span className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-blue-300" /> <EditableText value={data.personalInfo.contact.linkedin} onSave={v => setContact('linkedin', v)} />
                        </span>
                    )}
                    {data.personalInfo?.contact?.website && (
                        <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-300" /> {data.personalInfo.contact.website}
                        </span>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="px-10 py-8">
                {/* Summary */}
                {data.summary && (
                    <section className="mb-6">
                        <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                            Professional Summary
                        </h2>
                        <p className="text-[12px] leading-[1.7] text-gray-700">
                            <EditableText value={data.summary} onSave={v => store.setSummary(v)} multiline as="span" />
                        </p>
                    </section>
                )}

                {/* Experience */}
                {data.experience && data.experience.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                            Professional Experience
                        </h2>
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="mb-5">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[14px] font-bold text-gray-900">
                                            <EditableText value={exp.title} onSave={v => setExp(exp.id, 'title', v)} />
                                        </h3>
                                        <p className="text-[12px] text-[#1e3a5f] font-semibold">
                                            <EditableText value={exp.company} onSave={v => setExp(exp.id, 'company', v)} />
                                            {exp.location && <>, <EditableText value={exp.location} onSave={v => setExp(exp.id, 'location', v)} /></>}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                        <EditableText value={exp.startDate} onSave={v => setExp(exp.id, 'startDate', v)} /> – <EditableText value={exp.endDate} onSave={v => setExp(exp.id, 'endDate', v)} />
                                    </p>
                                </div>
                                {exp.description && exp.description.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.description.map((desc, i) => (
                                            <li key={i} className="text-[11px] text-gray-700 leading-relaxed pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-[#1e3a5f]">
                                                <EditableText value={desc} onSave={v => setExpBullet(exp.id, i, v)} multiline />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Two Column Section */}
                <div className="flex gap-8">
                    {/* Left Column */}
                    <div className="flex-1">
                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <section className="mb-6">
                                <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                                    Education
                                </h2>
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="mb-3">
                                        <h3 className="text-[13px] font-bold text-gray-900">
                                            <EditableText value={edu.degree} onSave={v => setEdu(edu.id, 'degree', v)} />
                                        </h3>
                                        <p className="text-[12px] text-gray-600">
                                            <EditableText value={edu.institution} onSave={v => setEdu(edu.id, 'institution', v)} />
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            <EditableText value={edu.graduationDate} onSave={v => setEdu(edu.id, 'graduationDate', v)} />
                                            {edu.gpa && <> • GPA: <EditableText value={edu.gpa} onSave={v => setEdu(edu.id, 'gpa', v)} /></>}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Certifications */}
                        {data.certificates && data.certificates.length > 0 && (
                            <section className="mb-6">
                                <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                                    Certifications
                                </h2>
                                {data.certificates.map((cert) => (
                                    <div key={cert.id} className="mb-2">
                                        <p className="text-[12px] font-semibold text-gray-800">{cert.name}</p>
                                        <p className="text-[11px] text-gray-500">{cert.issuer} • {cert.date}</p>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="w-[2.5in]">
                        {/* Skills */}
                        {data.skills && data.skills.length > 0 && (
                            <section className="mb-6">
                                <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                                    Skills
                                </h2>
                                {data.skills.map((cat) => (
                                    <div key={cat.id} className="mb-3">
                                        <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1">
                                            <EditableText value={cat.category} onSave={v => setSkill(cat.id, 'category', v)} />
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.skills.map((skill, i) => (
                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <section>
                                <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                                    Languages
                                </h2>
                                {data.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-[11px] mb-1">
                                        <span className="font-medium text-gray-700">{lang.language}</span>
                                        <span className="text-gray-500">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>

                {/* Projects */}
                {data.projects && data.projects.length > 0 && (
                    <section className="mt-4">
                        <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]">
                            Key Projects
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="text-[12px] font-bold text-gray-900">
                                        <EditableText value={proj.name} onSave={v => setProj(proj.id, 'name', v)} />
                                    </h3>
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                                    </p>
                                    {proj.technologies && (
                                        <p className="text-[9px] text-[#1e3a5f] mt-2 font-medium">
                                            <EditableText value={proj.technologies.join(' • ')} onSave={v => store.updateProject(proj.id, { technologies: v.split(/\s*[•,]\s*/).filter(Boolean) })} />
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResumeTemplate10;

