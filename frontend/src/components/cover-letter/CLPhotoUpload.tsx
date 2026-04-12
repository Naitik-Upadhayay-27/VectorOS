// Clickable photo circle — works in both edit and preview mode
// In edit mode: click to upload. In preview: shows image or placeholder.
import { useRef, useContext } from 'react'
import { Camera } from 'lucide-react'
import { EditableContext } from '@/components/resume-editor/EditableContext'
import { useCoverLetterStore } from '@/store/coverLetterStore'

interface Props {
  photo?: string
  size?: number
  borderColor?: string
  bgColor?: string
}

export default function CLPhotoUpload({ photo, size = 130, borderColor = '#9ca3af', bgColor = '#e5e7eb' }: Props) {
  const { editMode } = useContext(EditableContext)
  const { setData } = useCoverLetterStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setData({ photo: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      onClick={() => editMode && inputRef.current?.click()}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${borderColor}`,
        backgroundColor: photo ? 'transparent' : bgColor,
        overflow: 'hidden',
        cursor: editMode ? 'pointer' : 'default',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {photo ? (
        <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%' }} className="flex flex-col items-center justify-center gap-1">
          <Camera size={size * 0.18} className="text-gray-400" />
          {editMode && <span style={{ fontSize: size * 0.09 }} className="text-gray-400 font-medium">Add Photo</span>}
        </div>
      )}

      {/* Hover overlay in edit mode */}
      {editMode && (
        <div
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }}
          className="flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
        >
          <Camera size={size * 0.18} className="text-white" />
          <span style={{ fontSize: size * 0.09 }} className="text-white font-semibold">
            {photo ? 'Change' : 'Upload'}
          </span>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
