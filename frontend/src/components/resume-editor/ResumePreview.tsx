import { useResumeStore } from '@/store/resumeStore'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

export default function ResumePreview() {
  const { activeResume, zoom } = useResumeStore()
  const { personalInfo, sections } = activeResume

  return (
    <div className="flex-1 bg-surface-100 overflow-auto flex items-start justify-center p-8">
      <div
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', width: '794px' }}
        className="bg-white shadow-2xl rounded-sm min-h-[1123px] p-12 font-sans"
      >
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase">
            {personalInfo.name || 'Your Name'}
          </h1>
          {personalInfo.jobTitle && (
            <p className="text-sm text-gray-600 mt-1 font-medium">{personalInfo.jobTitle}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
            {personalInfo.email && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Mail size={11} /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Phone size={11} /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.city && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} /> {personalInfo.city}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Linkedin size={11} /> {personalInfo.linkedin}
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Globe size={11} /> {personalInfo.portfolio}
              </span>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) =>
          section.items.length === 0 ? null : (
            <div key={section.id} className="mb-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
                {section.title}
              </h2>
              {section.items.map((item) => (
                <div key={item.id} className="mb-3">
                  <p className="text-sm font-semibold text-gray-800">{item.title || item.name}</p>
                  {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                  {item.description && <p className="text-xs text-gray-600 mt-1">{item.description}</p>}
                </div>
              ))}
            </div>
          )
        )}

        {/* Empty state hint */}
        {sections.every((s) => s.items.length === 0) && (
          <div className="text-center py-16 text-gray-300">
            <p className="text-sm">Fill in your details on the left to see your resume here</p>
          </div>
        )}
      </div>
    </div>
  )
}

