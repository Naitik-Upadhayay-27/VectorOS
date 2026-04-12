// Template 4: Career Switch — colored header, full A4
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate4({ data, accentColor = '#ea580c', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">

      {/* ── Colored header ── */}
      <div style={{ backgroundColor: accentColor, padding: '28px 56px 24px', flexShrink: 0 }}>
        <div style={{ color: '#fff', fontSize: '24pt', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <EditableText value={data.name} onSave={v => setData({ name: v })} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 14px', marginTop: 6, fontSize: '9pt', color: 'rgba(255,255,255,0.85)' }}>
          {data.email && <EditableText value={data.email} onSave={v => setData({ email: v })} />}
          {data.phone && <><span>|</span><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></>}
          {data.linkedin && <><span>|</span><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></>}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 56px 48px' }}>

        {/* ── Date + Recipient ── */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div style={{ color: '#888', marginBottom: 10 }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
          {data.companyAddress && <div><EditableText value={data.companyAddress} onSave={v => setData({ companyAddress: v })} /></div>}
          {data.companyCity && <div><EditableText value={data.companyCity} onSave={v => setData({ companyCity: v })} /></div>}
        </div>

        {/* ── Subject ── */}
        {data.jobTitle && (
          <div style={{ marginBottom: 16, fontWeight: 600, fontSize: '9.5pt', color: accentColor }}>
            Re: <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} /> Position
          </div>
        )}

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
        </div>

        {/* ── Body ── */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* ── Sign-off ── */}
        <div style={{ marginTop: 32, fontSize: '9.5pt' }}>
          <div style={{ marginBottom: 10 }}>Best regards,</div>
          <div style={{ color: accentColor, fontWeight: 700, fontSize: '10.5pt' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        {/* ── Bottom spacer ── */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
