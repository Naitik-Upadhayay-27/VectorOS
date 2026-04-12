// Template 16: Dark Bold — full dark header with large bold name, contact icons left, photo right, body on white
import { useContext } from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate16({ data, accentColor = '#222222', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">

      {/* ── Dark header ── */}
      <div style={{ backgroundColor: accentColor, padding: '36px 52px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>

        {/* Dark diagonal overlay top-left */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 200, height: '100%',
          background: 'rgba(255,255,255,0.04)',
          transform: 'skewX(-8deg) translateX(-40px)',
          pointerEvents: 'none',
        }} />

        {/* Left: name + contact */}
        <div style={{ zIndex: 1 }}>
          <div style={{
            fontSize: '36pt',
            fontWeight: 900,
            letterSpacing: '-1px',
            lineHeight: 1,
            color: '#fff',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)' }}>
            {data.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={12} color="rgba(255,255,255,0.7)" />
                <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
              </div>
            )}
            {data.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={12} color="rgba(255,255,255,0.7)" />
                <EditableText value={data.email} onSave={v => setData({ email: v })} />
              </div>
            )}
            {data.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={12} color="rgba(255,255,255,0.7)" />
                <EditableText value={data.address} onSave={v => setData({ address: v })} />
              </div>
            )}
          </div>
        </div>

        {/* Right: photo */}
        <div style={{ zIndex: 1, flexShrink: 0 }}>
          <CLPhotoUpload photo={data.photo} size={140} borderColor="transparent" bgColor="#444" />
        </div>
      </div>

      {/* ── Body area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 52px 0' }}>

        {/* Salutation */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
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
        <div style={{ marginTop: 36, fontSize: '9.5pt' }}>
          <div style={{ marginBottom: 40 }}>Best Regards,</div>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: '13pt', fontStyle: 'italic', color: '#333', marginBottom: 4 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        <div style={{ flex: 1 }} />
      </div>

      {/* ── Bottom dark bar ── */}
      <div style={{ backgroundColor: accentColor, height: 10, flexShrink: 0 }} />
    </div>
  )
}
