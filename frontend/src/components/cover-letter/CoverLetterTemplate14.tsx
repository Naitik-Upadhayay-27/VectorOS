// Template 14: Black & White Simple Modern — photo top-left, spaced name top-right, horizontal rule, subject line, body
import { useContext } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import CLPhotoUpload from './CLPhotoUpload'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate14({ data, accentColor = '#111111', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column' }} className="w-full bg-white">

      {/* ── Header: photo left, name+contact right ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '36px 52px 0', gap: 32 }}>

        {/* Photo */}
        <div style={{ flexShrink: 0 }}>
          <CLPhotoUpload photo={data.photo} size={130} borderColor="transparent" bgColor="#e5e7eb" />
        </div>

        {/* Name + title + contact */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '22pt',
            fontWeight: 400,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            color: '#111',
          }}>
            <EditableText value={data.name} onSave={v => setData({ name: v })} />
          </div>
          {data.jobTitle && (
            <div style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: '10.5pt', color: '#555', marginTop: 6 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: '8.5pt', color: '#444', lineHeight: 1.9 }}>
            {data.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mail size={11} color="#555" />
                <EditableText value={data.email} onSave={v => setData({ email: v })} />
              </div>
            )}
            {data.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Phone size={11} color="#555" />
                <EditableText value={data.phone} onSave={v => setData({ phone: v })} />
              </div>
            )}
            {data.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MapPin size={11} color="#555" />
                <EditableText value={data.address} onSave={v => setData({ address: v })} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Horizontal rule ── */}
      <div style={{ margin: '24px 52px 0', borderTop: '1.5px solid #111' }} />

      {/* ── Body area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 52px 0' }}>

        {/* Date */}
        <div style={{ fontSize: '9pt', color: '#555', marginBottom: 20 }}>
          <EditableText value={data.date} onSave={v => setData({ date: v })} />
        </div>

        {/* Subject line */}
        {data.jobTitle && (
          <div style={{ marginBottom: 20, fontSize: '9.5pt', fontWeight: 700 }}>
            Subject: Job application
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
        <CLSignOff data={data} salutation="Kind regards," nameStyle={{ fontFamily: "'Georgia', serif", fontSize: '13pt', fontStyle: 'italic', color: '#333' }} />

        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
