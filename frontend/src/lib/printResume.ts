import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { PAGE_W, PAGE_H, PAGE_MARGIN_TOP, PAGE_MARGIN_BOTTOM, USABLE_H_FIRST, computePageOffsets } from './paginate'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { applyWatermark } from './watermark'

/**
 * Capture a single PDF page by cloning the preview's exact rendering approach:
 *  - A PAGE_W × PAGE_H container (white background)
 *  - Content shifted by -offset (+ PAGE_MARGIN_TOP for pages 2+)
 *  - Clipped to the content window (sliceH tall, starting at contentTop)
 *
 * This is pixel-identical to what TemplateLivePreview shows.
 */
async function capturePageCanvas(
  sourceEl: HTMLDivElement,
  offset: number,
  sliceH: number,
  isFirst: boolean,
  sharedStyles: Record<string, string>,
): Promise<HTMLCanvasElement> {
  const contentTop = isFirst ? 0 : PAGE_MARGIN_TOP
  const shift = -offset

  // Build a temporary off-screen container that mirrors the preview page exactly
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: -${PAGE_W + 100}px;
    width: ${PAGE_W}px;
    height: ${PAGE_H}px;
    overflow: hidden;
    background: #ffffff;
    z-index: -9999;
  `

  // Content window — same as preview's inner clip div
  const window_ = document.createElement('div')
  window_.style.cssText = `
    position: absolute;
    top: ${contentTop}px;
    left: 0;
    width: ${PAGE_W}px;
    height: ${sliceH}px;
    overflow: hidden;
  `

  // Content shifter — clone of the source element, shifted
  const shifter = document.createElement('div')
  shifter.style.cssText = `
    margin-top: ${shift}px;
    width: ${PAGE_W}px;
  `
  // Apply shared styles (font, size, etc.)
  Object.assign(shifter.style, sharedStyles)

  // Deep clone the source element's content
  shifter.innerHTML = sourceEl.innerHTML

  window_.appendChild(shifter)
  container.appendChild(window_)
  document.body.appendChild(container)

  await document.fonts.ready
  await new Promise(r => requestAnimationFrame(r))
  await new Promise(r => requestAnimationFrame(r))

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: PAGE_W,
    height: PAGE_H,
    windowWidth: PAGE_W,
    logging: false,
  })

  document.body.removeChild(container)
  return canvas
}

// ── Resume PDF ────────────────────────────────────────────────────────────────
export async function printResume(el: HTMLDivElement, filename = 'resume', watermark = false): Promise<void> {
  await document.fonts.ready

  const store = useTemplateResumeStore.getState()
  const layout = store.layout

  const sharedStyles: Record<string, string> = {
    fontFamily: layout.fontFamily ?? "'Inter', sans-serif",
    fontSize: `${layout.fontSize ?? 11}pt`,
    lineHeight: String(layout.lineHeight ?? 1.5),
  }

  // Use offsets from the live preview (already computed from the hidden measureRef)
  // Fall back to recomputing only if not available
  const totalH = store.pageTotalH > 0 ? store.pageTotalH : el.scrollHeight
  const offsets = (store.pageOffsets?.length ?? 0) > 0
    ? store.pageOffsets
    : (totalH <= USABLE_H_FIRST ? [0] : computePageOffsets(el, totalH))

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm = pdf.internal.pageSize.getWidth()
  const pageHmm = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < offsets.length; i++) {
    if (i > 0) pdf.addPage()

    const offset  = offsets[i]
    const nextY   = offsets[i + 1] ?? totalH
    const sliceH  = nextY - offset
    const isFirst = i === 0

    const pageCanvas = await capturePageCanvas(el, offset, sliceH, isFirst, sharedStyles)
    if (watermark) await applyWatermark(pageCanvas)
    pdf.addImage(pageCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pageWmm, pageHmm, undefined, 'FAST')
  }

  pdf.save(`${filename}.pdf`)
}

// ── Cover Letter PDF ──────────────────────────────────────────────────────────
export async function printCoverLetter(el: HTMLDivElement, filename = 'cover-letter', watermark = false): Promise<void> {
  await document.fonts.ready

  // Make element temporarily visible for measurement
  const prevVis = el.style.visibility
  const prevPos = el.style.position
  el.style.visibility = 'visible'
  el.style.position = 'absolute'
  await new Promise(r => requestAnimationFrame(r))
  const totalH = el.scrollHeight
  el.style.visibility = prevVis
  el.style.position = prevPos

  const offsets = totalH <= PAGE_H ? [0] : computePageOffsets(el, totalH)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm = pdf.internal.pageSize.getWidth()
  const pageHmm = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < offsets.length; i++) {
    if (i > 0) pdf.addPage()

    const offset  = offsets[i]
    const nextY   = offsets[i + 1] ?? totalH
    const sliceH  = nextY - offset
    const isFirst = i === 0

    const pageCanvas = await capturePageCanvas(el, offset, sliceH, isFirst, {})
    if (watermark) await applyWatermark(pageCanvas)
    pdf.addImage(pageCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pageWmm, pageHmm, undefined, 'FAST')
  }

  pdf.save(`${filename}.pdf`)
}

// ── Word Export (.doc) ────────────────────────────────────────────────────────
async function exportToWord(el: HTMLDivElement, filename: string) {
  let styles = ''
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i]
      for (let j = 0; j < sheet.cssRules.length; j++) {
        styles += sheet.cssRules[j].cssText + '\n'
      }
    } catch { /* ignore cross-origin */ }
  }

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        @page { size: A4; margin: 0in; }
        body { margin: 0; padding: 0; }
        ${styles}
        .resume-page { width: 100% !important; margin: 0 !important; }
      </style>
    </head>
    <body>${el.innerHTML}</body>
    </html>
  `

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function printResumeWord(el: HTMLDivElement, filename = 'resume') {
  await exportToWord(el, filename)
}

export async function printCoverLetterWord(el: HTMLDivElement, filename = 'cover-letter') {
  await exportToWord(el, filename)
}
