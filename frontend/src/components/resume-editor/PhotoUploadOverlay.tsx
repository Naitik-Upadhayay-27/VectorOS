import { useRef } from 'react'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

interface Props {
  size: number
  style?: React.CSSProperties
}

export default function PhotoUploadOverlay({ size, style }: Props) {
  const { setPersonalInfo, data } = useTemplateResumeStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPersonalInfo({ image: reader.result as string })
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const image = data.personalInfo?.image
  const fontSize = Math.round(size * 0.13)

  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="resume-photo-upload"
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Image or placeholder */}
      {image ? (
        <img
          src={image}
          alt="Profile"
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: size * 0.28, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>+</span>
          <span style={{ fontSize: fontSize, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.2, padding: '0 6px' }}>
            Click to add photo
          </span>
        </div>
      )}

      {/* Hover overlay — shows on existing image to allow change */}
      {image && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(0,0,0,0)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'rgba(0,0,0,0.45)'
            el.querySelectorAll('span').forEach(s => (s as HTMLElement).style.opacity = '1')
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'rgba(0,0,0,0)'
            el.querySelectorAll('span').forEach(s => (s as HTMLElement).style.opacity = '0')
          }}
        >
          <span style={{ fontSize: size * 0.28, color: '#fff', lineHeight: 1, opacity: 0, transition: 'opacity 0.15s' }}>+</span>
          <span style={{ fontSize: fontSize, color: '#fff', textAlign: 'center', lineHeight: 1.2, padding: '0 6px', opacity: 0, transition: 'opacity 0.15s' }}>
            Change photo
          </span>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}
