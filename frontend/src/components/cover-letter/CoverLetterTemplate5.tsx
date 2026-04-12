// Template 5: Minimal — bold monospace name, horizontal rule, full A4
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate5({ data, accentColor = '#111111', fontFamily = "'Arial', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 56px 48px' }}>

        {/* ── Header: name left, date right ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <h1 style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: '26pt', letterSpacing: '0.03em', margin: 0, lineHeight: 1 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </h1>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: '9.5pt', fontWeight: 700, color: '#555' }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
        </div>

        {/* ── Address / contact ── */}
        <div style={{ fontSize: '9pt', color: '#666', marginBottom: 4 }}>
          {data.address && <div><EditableText value={data.address} onSave={v => setData({ address: v })} /></div>}
          {data.city && <div><EditableText value={data.city} onSave={v => setData({ city: v })} /></div>}
          <div>
            {data.phone && <EditableText value={data.phone} onSave={v => setData({ phone: v })} />}
            {data.phone && data.email && <span> • </span>}
            {data.email && <EditableText value={data.email} onSave={v => setData({ email: v })} />}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid #ccc', margin: '18px 0' }} />

        {/* ── Recipient ── */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
        </div>

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />:
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
        <CLSignOff data={data} salutation="Sincerely," nameStyle={{ fontFamily: "'Courier New', monospace", fontWeight: 700 }} />

        {/* ── Bottom spacer ── */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
