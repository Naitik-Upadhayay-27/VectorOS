// Template 2: Creative — full A4
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate2({ data, accentColor = '#7c3aed', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">
      {/* Thick top bar */}
      <div style={{ backgroundColor: accentColor, height: 8, flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 56px 48px' }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ color: accentColor, fontSize: '24pt', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
              <EditableText value={data.name} onSave={v => setData({ name: v })} />
            </div>
            {data.jobTitle && (
              <div style={{ fontSize: '9pt', color: '#888', marginTop: 4 }}>
                Applying for: <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#777', lineHeight: 1.7 }}>
            <div><EditableText value={data.date} onSave={v => setData({ date: v })} /></div>
            {data.email && <div><EditableText value={data.email} onSave={v => setData({ email: v })} /></div>}
            {data.phone && <div><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></div>}
            {data.linkedin && <div><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></div>}
          </div>
        </div>

        {/* ── Recipient ── */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
        </div>

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt', fontWeight: 600 }}>
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
          <div style={{ color: '#555', marginBottom: 10 }}>Best regards,</div>
          <div style={{ color: accentColor, fontWeight: 700, fontSize: '11pt' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        {/* ── Bottom spacer ── */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
