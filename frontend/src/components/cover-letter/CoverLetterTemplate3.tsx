// Template 3: Graduate — left accent bar, full A4
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate3({ data, accentColor = '#16a34a', fontFamily = "'Georgia', serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex' }} className="w-full bg-white">
      {/* Left accent bar */}
      <div style={{ backgroundColor: accentColor, width: 6, flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 52px 48px' }}>

        {/* ── Header ── */}
        <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: 14, marginBottom: 24 }}>
          <div style={{ fontSize: '20pt', fontWeight: 700 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 10px', fontSize: '9pt', color: '#666', marginTop: 4 }}>
            {data.email && <EditableText value={data.email} onSave={v => setData({ email: v })} />}
            {data.phone && <><span>·</span><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></>}
            {data.linkedin && <><span>·</span><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></>}
          </div>
          <div style={{ fontSize: '9pt', color: '#999', marginTop: 3 }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
        </div>

        {/* ── Recipient ── */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
          {data.companyAddress && <div><EditableText value={data.companyAddress} onSave={v => setData({ companyAddress: v })} /></div>}
        </div>

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
        <CLSignOff data={data} salutation="Sincerely," nameStyle={{ color: accentColor, fontWeight: 700 }} />

        {/* ── Bottom spacer ── */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
