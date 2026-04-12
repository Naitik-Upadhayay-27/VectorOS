// Template 8: Clean Letterhead — name top-left, address top-right, contact icons at bottom
import { useContext } from 'react'
import { Phone, Mail, Globe } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate8({ data, accentColor = '#111111', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div
      style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }}
      className="w-full bg-white"
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 56px 48px' }}>

        {/* ── Header: name top-left, address top-right ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
          {/* Name — bold, stacked two lines */}
          <div style={{ fontSize: '18pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.1 }}>
            {(() => {
              const parts = data.name.trim().split(' ')
              const first = parts[0] || ''
              const rest  = parts.slice(1).join(' ') || ''
              return (
                <>
                  <div><EditableText value={first} onSave={v => setData({ name: rest ? `${v} ${rest}` : v })} /></div>
                  {rest && <div><EditableText value={rest} onSave={v => setData({ name: v ? `${first} ${v}` : first })} /></div>}
                </>
              )
            })()}
          </div>

          {/* Address block — right aligned */}
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#555', lineHeight: 1.7 }}>
            {data.address && <div><EditableText value={data.address} onSave={v => setData({ address: v })} /></div>}
            {data.city && <div><EditableText value={data.city} onSave={v => setData({ city: v })} /></div>}
          </div>
        </div>

        {/* ── Date ── */}
        <div style={{ fontWeight: 700, fontSize: '9.5pt', marginBottom: 6 }}>
          <EditableText value={data.date} onSave={v => setData({ date: v })} />
        </div>

        {/* ── Subject ── */}
        {data.jobTitle && (
          <div style={{ fontStyle: 'italic', fontSize: '9.5pt', marginBottom: 24, color: '#444' }}>
            Subject: <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
          </div>
        )}

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          To whom it may concern,
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
        <CLSignOff data={data} salutation="Kind regards," nameStyle={{ fontWeight: 600, fontSize: '9.5pt' }} />

        {/* ── Bottom spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Contact icons row at bottom ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', paddingTop: 20, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
          {data.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '8.5pt', color: '#555' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={11} color="#555" />
              </div>
              <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
            </div>
          )}
          {data.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '8.5pt', color: '#555' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={11} color="#555" />
              </div>
              <EditableText value={data.email} onSave={v => setData({ email: v })} />
            </div>
          )}
          {data.linkedin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '8.5pt', color: '#555' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={11} color="#555" />
              </div>
              <EditableText value={data.linkedin} onSave={v => setData({ linkedin: v })} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
