// Template 1: Professional — full A4, sign-off pinned to bottom
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate1({ data, accentColor = '#1e3a5f', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div
      style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }}
      className="w-full bg-white"
    >
      {/* Top accent line */}
      <div style={{ backgroundColor: accentColor, height: 4, width: '100%', flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 56px 48px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: accentColor, fontSize: '22pt', fontWeight: 700, marginBottom: 4 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          <div style={{ fontSize: '9.5pt', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
            {data.email && <EditableText value={data.email} onSave={v => setData({ email: v })} />}
            {data.phone && <><span>·</span><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></>}
            {data.linkedin && <><span>·</span><EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} /></>}
            {data.address && <><span>·</span><EditableText value={data.address} onSave={v => setData({ address: v })} /></>}
          </div>
        </div>

        {/* ── Date + Recipient ── */}
        <div style={{ marginBottom: 24, fontSize: '9.5pt' }}>
          <div style={{ color: '#777', marginBottom: 12 }}>
            <EditableText value={data.date} onSave={v => setData({ date: v })} />
          </div>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
          {data.companyAddress && <div><EditableText value={data.companyAddress} onSave={v => setData({ companyAddress: v })} /></div>}
          {data.companyCity && <div><EditableText value={data.companyCity} onSave={v => setData({ companyCity: v })} /></div>}
        </div>

        {/* ── Subject ── */}
        {data.jobTitle && (
          <div style={{ marginBottom: 20, fontWeight: 600, fontSize: '9.5pt' }}>
            Re: Application for <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} /> Position
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
        <CLSignOff data={data} salutation="Sincerely," nameStyle={{ color: accentColor, fontWeight: 700, fontSize: '10pt' }} />

        {/* ── Bottom spacer — keeps A4 height, blank space at bottom ── */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
