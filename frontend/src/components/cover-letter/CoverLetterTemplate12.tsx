// Template 12: Geometric — dark top bar, blue shapes top-left & bottom-right, large serif name top-right
import { useContext } from 'react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import EditableText from '@/components/resume-editor/EditableText'
import type { CoverLetterData } from '@/store/coverLetterStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'

import CLSignOff from './CLSignOff'

interface Props { data: CoverLetterData; accentColor?: string; fontFamily?: string }

export default function CoverLetterTemplate12({ data, accentColor = '#1a2744', fontFamily = "'Inter', sans-serif" }: Props) {
  const { setData } = useCoverLetterStore()
  useContext(EditableContext)

  // Derive two blue shades from accentColor for the geometric shapes
  const shapeLight = '#4a6fa5'
  const shapeMid   = '#2d4f82'

  return (
    <div style={{ fontFamily, color: '#1a1a1a', lineHeight: 1.65, fontSize: '10.5pt', minHeight: 1123, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }} className="w-full bg-white">

      {/* ── Top dark bar ── */}
      <div style={{ backgroundColor: accentColor, height: 10, width: '100%', flexShrink: 0 }} />

      {/* ── Top geometric shapes (top-left) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 220, height: 180, pointerEvents: 'none', zIndex: 0 }}>
        {/* Large back parallelogram */}
        <div style={{
          position: 'absolute', top: 10, left: -30,
          width: 160, height: 130,
          backgroundColor: shapeLight,
          opacity: 0.55,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
        {/* Mid parallelogram */}
        <div style={{
          position: 'absolute', top: 10, left: 20,
          width: 110, height: 130,
          backgroundColor: shapeMid,
          opacity: 0.75,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
        {/* Front dark strip */}
        <div style={{
          position: 'absolute', top: 10, left: 60,
          width: 60, height: 130,
          backgroundColor: accentColor,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
      </div>

      {/* ── Bottom geometric shapes (bottom-right) ── */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 260, height: 200, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', bottom: 0, right: -20,
          width: 180, height: 160,
          backgroundColor: shapeLight,
          opacity: 0.45,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 30,
          width: 130, height: 160,
          backgroundColor: shapeMid,
          opacity: 0.7,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 80,
          width: 70, height: 160,
          backgroundColor: accentColor,
          transform: 'skewX(-12deg)',
          borderRadius: 2,
        }} />
      </div>

      {/* ── Header row: contact left, name right ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 24px 200px' }}>

        {/* Contact info — left (sits beside the shapes) */}
        <div style={{ fontSize: '9pt', color: '#444', lineHeight: 1.8 }}>
          {data.address && <div><EditableText value={data.address} onSave={v => setData({ address: v })} /></div>}
          {data.email && <div><EditableText value={data.email} onSave={v => setData({ email: v })} /></div>}
          {data.phone && <div><EditableText value={data.phone} onSave={v => setData({ phone: v })} /></div>}
        </div>

        {/* Name + job title — right, large serif */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Georgia', serif",
            fontSize: '26pt',
            fontWeight: 400,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            color: accentColor,
          }}>
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
          {data.jobTitle && (
            <div style={{ fontSize: '9pt', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#555', marginTop: 6, fontWeight: 400 }}>
              <EditableText value={data.jobTitle} onSave={v => setData({ jobTitle: v })} />
            </div>
          )}
        </div>
      </div>

      {/* ── Body area ── */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 52px 48px' }}>

        {/* Salutation */}
        <div style={{ marginBottom: 20, fontSize: '9.5pt' }}>
          <div>Dear</div>
          <div><EditableText value={data.hiringManager} onSave={v => setData({ hiringManager: v })} />,</div>
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
        <CLSignOff data={data} salutation="Best Regards," nameStyle={{ fontWeight: 600 }} />

        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}
