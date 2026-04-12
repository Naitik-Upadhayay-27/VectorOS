import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  PAGE_W, PAGE_H,
  PAGE_MARGIN_TOP, PAGE_MARGIN_BOTTOM,
  USABLE_H_FIRST,
  computePageOffsets,
} from './paginate'

// ── Capture the full rendered resume as a canvas ──────────────────────────────
async function captureElement(
  el: HTMLDivElement
): Promise<{ canvas: HTMLCanvasElement; totalHeightPx: number }> {
  const prev = {
    visibility: el.style.visibility,
    zIndex: el.style.zIndex,
    position: el.style.position,
    top: el.style.top,
    left: el.style.left,
    height: el.style.height,
  }

  el.style.visibility = 'visible'
  el.style.zIndex = '-1'
  el.style.position = 'fixed'
  el.style.top = '0'
  el.style.left = '-9999px'
  el.style.height = 'auto'

  await new Promise(r => requestAnimationFrame(r))

  const naturalH = el.scrollHeight

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: PAGE_W,
    height: naturalH,
    windowWidth: PAGE_W,
  })

  el.style.visibility = prev.visibility
  el.style.zIndex = prev.zIndex
  el.style.position = prev.position
  el.style.top = prev.top
  el.style.left = prev.left
  el.style.height = prev.height

  return { canvas, totalHeightPx: canvas.height / 2 }
}

// ── Resume PDF — multi-page, MS Word-style margins ────────────────────────────
export async function printResume(el: HTMLDivElement, filename = 'resume'): Promise<void> {
  const { canvas, totalHeightPx } = await captureElement(el)

  const offsets = totalHeightPx <= USABLE_H_FIRST
    ? [0]
    : computePageOffsets(el, totalHeightPx)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm = pdf.internal.pageSize.getWidth()   // 210 mm
  const pageHmm = pdf.internal.pageSize.getHeight()  // 297 mm

  // mm per logical px
  const mmPerPx = pageWmm / PAGE_W

  for (let i = 0; i < offsets.length; i++) {
    if (i > 0) pdf.addPage()

    const srcY  = offsets[i]
    const nextY = offsets[i + 1] ?? totalHeightPx

    // How much content this page shows
    const contentH = nextY - srcY

    // Page 1: content starts at y=0 in the PDF page (template handles its own top padding)
    // Pages 2+: content starts at PAGE_MARGIN_TOP, leaving white space at top
    const destTopPx = i === 0 ? 0 : PAGE_MARGIN_TOP
    const destTopMm = destTopPx * mmPerPx

    // Full A4 page canvas — white background
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width  = canvas.width          // 2× width
    pageCanvas.height = PAGE_H * 2            // 2× full A4 height
    const ctx = pageCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

    // Draw the content slice at the correct vertical position
    ctx.drawImage(
      canvas,
      0, srcY * 2,      canvas.width, contentH * 2,   // source slice
      0, destTopPx * 2, canvas.width, contentH * 2    // destination (offset by top margin)
    )

    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWmm, pageHmm)
  }

  pdf.save(`${filename}.pdf`)
}

// ── Cover letter PDF ──────────────────────────────────────────────────────────
export async function printCoverLetter(el: HTMLDivElement, filename = 'cover-letter'): Promise<void> {
  const { canvas, totalHeightPx } = await captureElement(el)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm = pdf.internal.pageSize.getWidth()
  const pageHmm = pdf.internal.pageSize.getHeight()
  const mmPerPx  = pageWmm / PAGE_W

  if (totalHeightPx <= PAGE_H) {
    const contentHmm = totalHeightPx * mmPerPx
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWmm, contentHmm)
    pdf.save(`${filename}.pdf`)
    return
  }

  const offsets = computePageOffsets(el, totalHeightPx)

  for (let i = 0; i < offsets.length; i++) {
    if (i > 0) pdf.addPage()

    const srcY     = offsets[i]
    const nextY    = offsets[i + 1] ?? totalHeightPx
    const contentH = nextY - srcY
    const destTopPx = i === 0 ? 0 : PAGE_MARGIN_TOP

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width  = canvas.width
    pageCanvas.height = PAGE_H * 2
    const ctx = pageCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(
      canvas,
      0, srcY * 2,      canvas.width, contentH * 2,
      0, destTopPx * 2, canvas.width, contentH * 2
    )

    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWmm, pageHmm)
  }

  pdf.save(`${filename}.pdf`)
}
