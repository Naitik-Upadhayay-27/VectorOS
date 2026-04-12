// Template 13: Black & White Modern Professional — black top bar, orange diagonal accent, large name, job reference line
import { useContext } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate13({ data, accentColor = '#e07b2a', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }} className="w-full bg-white">

      {/* ── Top black bar ── */}
      <div style={{ backgroundColor: '#111', height: 10, width: '100%', flexShrink: 0 }} />

      {/* ── Orange diagonal accent top-right ── */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 120px 120px 0',
        borderColor: `transparent ${accentColor} transparent transparent`,
        zIndex: 1,
      }} />

      {/* ── Header ── */}
      <div style={{ padding: '32px 52px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        {/* Name + job title */}
        <div>
          <div style={{ fontSize: '32pt', fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#111' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          {data.jobTitle && (
            <div style={{ fontSize: '10pt', color: '#555', marginTop: 4, letterSpacing: '0.02em' }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>

        {/* Contact info */}
        <div style={{ fontSize: '8.5pt', color: '#444', lineHeight: 2, textAlign: 'right', marginTop: 4 }}>
          {data.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <Mail size={11} color="#555" />
              <EditableText value={data.email} onSave={v => setData({ email: v })} />
            </div>
          )}
          {data.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <Phone size={11} color="#555" />
              <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
            </div>
          )}
          {data.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <MapPin size={11} color="#555" />
              <EditableText value={data.address} onSave={v => setData({ address: v })} />
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ margin: '0 52px', borderTop: '2px solid #111', flexShrink: 0 }} />

      {/* ── Body area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 52px 0' }}>

        {/* Date */}
        <div style={{ textAlign: 'right', fontSize: '9pt', fontStyle: 'italic', color: '#555', marginBottom: 20 }}>
          <EditableText value={data.date} onSave={v => setData({ date: v })} />
        </div>

        {/* Recipient block */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 600 }}><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} /></div>
          {data.companyName && <div style={{ fontWeight: 600 }}><EditableText value={data.companyName} onSave={v => setData({ companyName: v })} /></div>}
          {data.phone && <div style={{ fontStyle: 'italic' }}><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></div>}
          {data.email && <div style={{ fontStyle: 'italic' }}><EditableText value={data.email} onSave={v => setData({ email: v })} /></div>}
          {data.companyAddress && <div style={{ fontStyle: 'italic' }}><EditableText value={data.companyAddress} onSave={v => setData({ companyAddress: v })} /></div>}
        </div>

        {/* Job reference */}
        {data.jobTitle && (
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 12 }}>
            <div style={{ fontSize: '9pt', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#111' }}>
              JOB REFERENCE: <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          </div>
        )}

        {/* Salutation */}
        <div style={{ marginBottom: 16, fontSize: '9.5pt' }}>
          Dear <EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,
        </div>

        {/* Body */}
        <div style={{ fontSize: '9.5pt', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          <EditableText
            value={data.body || 'Click "Generate Cover Letter" to write your letter with AI, or type here directly.'}
            onSave={v => setData({ body: v })}
            multiline as="div"
          />
        </div>

        {/* Sign-off */}
        <div style={{ marginTop: 32, fontSize: '9.5pt' }}>
          <div style={{ marginBottom: 40 }}>Sincerely,</div>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: '13pt', fontStyle: 'italic', color: '#333', marginBottom: 4 }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          <div style={{ fontSize: '9pt', color: '#555' }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
        </div>

        <div style={{ flex: 1 }} />
      </div>

      {/* ── Bottom black bar with orange diagonal accent ── */}
      <div style={{ position: 'relative', height: 10, backgroundColor: '#111', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: `0 0 60px 120px`,
          borderColor: `transparent transparent ${accentColor} transparent`,
        }} />
      </div>
    </div>
  )
}
