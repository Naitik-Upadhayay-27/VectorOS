// Template 11: Elegant Left Border — thin left line, spaced uppercase name, italic script title
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate11({ data, accentColor = '#111111', fontFamily = "'Georgia', serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex' }} className="w-full bg-white">

      {/* ── Thin left border line ── */}
      <div style={{ width: 3, backgroundColor: '#d1d5db', flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 52px 48px' }}>

        {/* ── Spaced uppercase name ── */}
        <div style={{ fontSize: '22pt', fontWeight: 300, letterSpacing: '0.35em', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 6 }}>
          <EditableText value={data.name} onSave={v => setData({ name: v })} />
        </div>

        {/* ── Italic script job title ── */}
        {data.jobTitle && (
          <div style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: '13pt', color: '#444', marginBottom: 16 }}>
            <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
          </div>
        )}

        {/* ── Contact info ── */}
        <div style={{ fontSize: '9pt', color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
          {data.email && <div><EditableText value={data.email} onSave={v => setData({ email: v })} /></div>}
          {data.phone && <div><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></div>}
        </div>

        {/* ── Horizontal rule ── */}
        <div style={{ height: 1, backgroundColor: '#d1d5db', marginBottom: 28 }} />

        {/* ── Date ── */}
        <div style={{ fontSize: '9.5pt', color: '#555', marginBottom: 10 }}>
          <EditableText value={data.date} onSave={v => setData({ date: v })} />
        </div>

        {/* ── Subject ── */}
        {data.jobTitle && (
          <div style={{ fontWeight: 700, fontSize: '9.5pt', marginBottom: 24 }}>
            Subject: <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* ── Sign-off ── */}
        <CLSignOff data={data} salutation="Kind regards," nameStyle={{ fontWeight: 700 }} />

        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
