// Template 10: ATS Friendly — large bold name, gold rule, justified body, italic signature
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate10({ data, accentColor = '#b8960c', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 56px 48px' }}>

        {/* ── Large bold uppercase name ── */}
        <div style={{ fontSize: '28pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6 }}>
          <EditableText value={data.name} onSave={v => setData({ name: v })} />
        </div>

        {/* ── Job title subtitle ── */}
        {data.jobTitle && (
          <div style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#333', marginBottom: 8 }}>
            <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
          </div>
        )}

        {/* ── Contact line ── */}
        <div style={{ fontSize: '8.5pt', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '0 10px', marginBottom: 16 }}>
          {data.address && <span><EditableText value={data.address} onSave={v => setData({ address: v })} /></span>}
          {data.address && data.email && <span style={{ color: '#bbb' }}>|</span>}
          {data.email && <span><EditableText value={data.email} onSave={v => setData({ email: v })} /></span>}
          {data.email && data.linkedin && <span style={{ color: '#bbb' }}>|</span>}
          {data.linkedin && <span><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></span>}
        </div>

        {/* ── Gold horizontal rule ── */}
        <div style={{ height: 3, backgroundColor: accentColor, marginBottom: 28 }} />

        {/* ── Recipient left + Date right ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ fontSize: '9.5pt' }}>
            <div style={{ fontWeight: 700 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
            {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
            {data.companyAddress && <div><EditableText value={data.companyAddress} onSave={v => setData({ companyAddress: v })} /></div>}
          </div>
          <div style={{ fontSize: '9.5pt', color: '#555', textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
        </div>

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 18, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
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
        <CLSignOff data={data} salutation="" nameStyle={{ fontWeight: 700 }} />

        <div style={{ flex: 1 }} />

        {/* ── Bottom gold rule ── */}
        <div style={{ height: 3, backgroundColor: accentColor, marginTop: 24 }} />
      </div>
    </div>
  )
}
