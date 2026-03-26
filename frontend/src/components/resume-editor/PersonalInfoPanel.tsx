import { useState } from 'react'
import { ChevronDown, ChevronUp, Upload, Lightbulb } from 'lucide-react'
import Input from '@/components/ui/Input'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

export default function PersonalInfoPanel() {
  const [open, setOpen] = useState(true)
  const [tipsOpen, setTipsOpen] = useState(false)
  const { data, setPersonalInfo, setContact } = useTemplateResumeStore()
  const info = data.personalInfo ?? {}
  const contact = info.contact ?? {}

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Personal Information</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">

          {/* Restart / Upload new resume banner */}
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="w-full flex items-center justify-between py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb size={12} className="text-yellow-500" />
              Tips and Recommendations
            </span>
            {tipsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {tipsOpen && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
              Use a professional email and include your LinkedIn URL to increase recruiter response rates.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="Your name"
              value={info.name ?? ''}
              onChange={(e) => setPersonalInfo({ name: e.target.value })}
            />
            <Input
              label="Job Title"
              placeholder="Software Engineer"
              value={info.title ?? ''}
              onChange={(e) => setPersonalInfo({ title: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              value={contact.email ?? ''}
              onChange={(e) => setContact({ email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              value={contact.phone ?? ''}
              onChange={(e) => setContact({ phone: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="New York, NY"
              value={contact.location ?? ''}
              onChange={(e) => setContact({ location: e.target.value })}
            />
            <Input
              label="LinkedIn"
              placeholder="linkedin.com/in/you"
              value={contact.linkedin ?? ''}
              onChange={(e) => setContact({ linkedin: e.target.value })}
            />
          </div>

          <Input
            label="GitHub"
            placeholder="github.com/you"
            value={contact.github ?? ''}
            onChange={(e) => setContact({ github: e.target.value })}
          />

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Profile Photo</label>
            <button className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors w-full">
              <Upload size={13} />
              Upload Photo
            </button>
            <p className="text-xs text-gray-400 mt-1">Optional. Not recommended for US/Canada resumes.</p>
          </div>
        </div>
      )}
    </div>
  )
}

