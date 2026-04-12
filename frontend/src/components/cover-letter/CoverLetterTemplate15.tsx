// Template 15: Grey Black & White Modern — grey left sidebar with circular photo + contact, white right with large name + body
import { useContext } from 'react'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import CLSignOff from './CLSignOff'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate15({ data, accentColor = '#444444', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'row' }} className="w-full bg-white">

      {/* ── Left grey sidebar ── */}
      <div style={{ width: 220, flexShrink: 0, backgroundColor: '#e8e8e8', display: 'flex', flexDirection: 'column', padding: '36px 20px 36px', gap: 0 }}>

        {/* Circular photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ borderRadius: '50%', overflow: 'hidden', width: 110, height: 110, border: '3px solid #bbb' }}>
            <CLPhotoUpload photo={data.photo} size={110} borderColor="transparent" bgColor="#ccc" />
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 4, borderBottom: '1px solid #bbb', paddingBottom: 4 }}>
            // <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '8pt', color: '#333' }}>
          {data.phone && (
            <div>
              <div style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>PHONE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={10} color="#555" />
                <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
              </div>
            </div>
          )}
          {data.email && (
            <div>
              <div style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>EMAIL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={10} color="#555" />
                <EditableText value={data.email} onSave={v => setData({ email: v })} />
              </div>
            </div>
          )}
          {data.address && (
            <div>
              <div style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>LOCATION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={10} color="#555" />
                <EditableText value={data.address} onSave={v => setData({ address: v })} />
              </div>
            </div>
          )}
          {data.linkedin && (
            <div>
              <div style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>WEBSITE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={10} color="#555" />
                <EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right white content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 44px 36px' }}>

        {/* ── Top grey bar ── */}
        <div style={{ backgroundColor: '#555', height: 8, width: '100%', marginBottom: 24, flexShrink: 0 }} />

        {/* Name + title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '26pt', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.05, color: '#111' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          {data.jobTitle && (
            <div style={{ fontSize: '9.5pt', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666', marginTop: 6 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>

        {/* Salutation */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
        </div>

        {/* Body */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.8, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* Sign-off */}
        <CLSignOff data={data} salutation="Sincerely," nameStyle={{ fontFamily: "'Georgia', serif", fontSize: '13pt', fontStyle: 'italic', color: '#333' }} />

        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
