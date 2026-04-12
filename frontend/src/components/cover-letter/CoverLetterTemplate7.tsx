// Template 7: Bold Header — photo + name, pill contact bar, full A4
import { useContext } from 'react'
import { Home, Phone, Mail } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate7({ data, accentColor = '#111111', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  const nameParts = data.name.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName  = nameParts.slice(1).join(' ') || ''

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">

      {/* ── Header: photo + stacked name ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '32px 48px 24px', flexShrink: 0 }}>
        <CLPhotoUpload photo={data.photo} size={110} borderColor="transparent" bgColor="#1a1a1a" />
        <div>
          <h1 style={{ fontSize: '30pt', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
            <EditableText value={firstName} onSave={v => setData({ name: lastName ? `${v} ${lastName}` : v })} />
            {lastName && (
              <><br /><EditableText value={lastName} onSave={v => setData({ name: v ? `${firstName} ${v}` : firstName })} /></>
            )}
          </h1>
          {data.jobTitle && (
            <div style={{ fontSize: '9.5pt', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', color: '#666', marginTop: 6 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>
      </div>

      {/* ── Black pill contact bar ── */}
      <div style={{ backgroundColor: '#111', margin: '0 48px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 20px', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
        {data.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '8.5pt' }}>
            <div style={{ backgroundColor: '#333', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Home size={10} color="#fff" />
            </div>
            <EditableText value={data.address} onSave={v => setData({ address: v })} />
          </div>
        )}
        {data.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '8.5pt' }}>
            <div style={{ backgroundColor: '#333', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={10} color="#fff" />
            </div>
            <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
          </div>
        )}
        {data.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '8.5pt' }}>
            <div style={{ backgroundColor: '#333', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={10} color="#fff" />
            </div>
            <EditableText value={data.email} onSave={v => setData({ email: v })} />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 48px 48px' }}>

        {/* Salutation */}
        <div style={{ marginBottom: 16, fontWeight: 700, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
        </div>

        {/* Body text */}
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
          <div style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
