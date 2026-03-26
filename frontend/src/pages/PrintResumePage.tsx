import { useEffect } from 'react'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { TEMPLATES } from '@/components/resume-templates'

export default function PrintResumePage() {
  const { data, activeTemplateId } = useTemplateResumeStore()
  const template = TEMPLATES.find((t) => t.id === activeTemplateId) ?? TEMPLATES[0]
  const TemplateComponent = template.component

  useEffect(() => {
    // Auto-trigger print dialog once the page is ready
    const t = setTimeout(() => window.print(), 800)
    return () => clearTimeout(t)
  }, [])

  return <TemplateComponent data={data} />
}
