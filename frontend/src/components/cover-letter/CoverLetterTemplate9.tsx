// Template 9: Dark Header Photo — navy header with square photo, recommendation style
import { useContext } from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate9({ data, accentColor = '#1a2e44', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">

      {/* ── Dark navy header with square photo ── */}
      <div style={{ backgroundColor: accentColor, display: 'flex', alignItems: 'stretch', flexShrink: 0, minHeight: 160 }}>
        {/* Square photo */}
        <div style={{ width: 160, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
          <CLPhotoUpload photo={data.photo} size={160} borderColor="transparent" bgColor="#2d4a6b" />
        </div>
        {/* Name + title */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 40px' }}>
          <div style={{ color: '#fff', fontSize: '26pt', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          {data.jobTitle && (
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10pt', fontWeight: 400, marginTop: 6 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>
      </div>

      {/* ── Body area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 52px 0' }}>

        {/* ── "Letter of Recommendation" heading ── */}
        <div style={{ color: accentColor, fontSize: '18pt', fontWeight: 700, marginBottom: 28 }}>
          {data.jobTitle ? (
            <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
          ) : (
            'Letter of Recommendation'
          )}
        </div>

        {/* ── Salutation + Date on same line ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>
            To Whom It May Concern:
          </div>
          <div style={{ fontSize: '9.5pt', color: '#555' }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.8, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* ── Sign-off ── */}
        <div style={{ marginTop: 36, fontSize: '9.5pt' }}>
          <div style={{ marginBottom: 8 }}>Sincerely,</div>
          <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        <div style={{ flex: 1 }} />
      </div>

      {/* ── Footer contact bar ── */}
      <div style={{ backgroundColor: accentColor, padding: '14px 52px', display: 'flex', alignItems: 'center', gap: 32, flexShrink: 0, flexWrap: 'wrap' }}>
        {data.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: '8.5pt' }}>
            <Phone size={13} color="rgba(255,255,255,0.8)" />
            <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
          </div>
        )}
        {data.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: '8.5pt' }}>
            <Mail size={13} color="rgba(255,255,255,0.8)" />
            <EditableText value={data.email} onSave={v => setData({ email: v })} />
          </div>
        )}
        {data.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: '8.5pt' }}>
            <MapPin size={13} color="rgba(255,255,255,0.8)" />
            <EditableText value={data.address} onSave={v => setData({ address: v })} />
          </div>
        )}
      </div>
    </div>
  )
}
