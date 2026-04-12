// Template 6: Sidebar — full A4, sidebar stretches full height
import { useContext } from 'react'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate6({ data, accentColor = '#4b5563', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex' }} className="w-full bg-white">

      {/* ── Left sidebar — full height ── */}
      <div style={{ backgroundColor: '#e8e8e8', width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '40px 22px 40px' }}>

        {/* Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <CLPhotoUpload photo={data.photo} size={110} borderColor={accentColor} bgColor="#d1d5db" />
        </div>

        {/* Date */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: accentColor, fontWeight: 700, fontSize: '11pt' }}>//</span>
            <span style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>
              <EditableText value={data.date} onSave={v => setData({ date: v })} />
            </span>
          </div>
          <div style={{ height: 1, backgroundColor: accentColor }} />
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.phone && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Phone size={12} style={{ color: accentColor, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888' }}>Phone</div>
                <div style={{ fontSize: '8.5pt', color: '#444' }}><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></div>
              </div>
            </div>
          )}
          {data.email && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Mail size={12} style={{ color: accentColor, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888' }}>Email</div>
                <div style={{ fontSize: '8.5pt', color: '#444', wordBreak: 'break-all' }}><EditableText value={data.email} onSave={v => setData({ email: v })} /></div>
              </div>
            </div>
          )}
          {data.address && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <MapPin size={12} style={{ color: accentColor, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888' }}>Location</div>
                <div style={{ fontSize: '8.5pt', color: '#444' }}><EditableText value={data.address} onSave={v => setData({ address: v })} /></div>
              </div>
            </div>
          )}
          {data.linkedin && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Globe size={12} style={{ color: accentColor, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888' }}>Website</div>
                <div style={{ fontSize: '8.5pt', color: '#444', wordBreak: 'break-all' }}><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 44px 48px' }}>

        {/* Name + title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '22pt', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.1 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          {data.jobTitle && (
            <div style={{ fontSize: '9.5pt', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', fontWeight: 300, marginTop: 4 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>

        {/* Salutation */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
        </div>

        {/* Body */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.75, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* Sign-off */}
        <div style={{ marginTop: 32, fontSize: '9.5pt' }}>
          <div style={{ marginBottom: 10 }}>Sincerely,</div>
          <div style={{ fontWeight: 600 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
