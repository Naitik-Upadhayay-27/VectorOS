import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const PAGE_W_PX = 794
const PAGE_H_PX = 1123

export async function printResume(el: HTMLDivElement, filename = 'resume'): Promise<void> {
  // Temporarily make the hidden measurement div visible so html2canvas can render it
  const prev = {
    visibility: el.style.visibility,
    zIndex: el.style.zIndex,
    position: el.style.position,
    top: el.style.top,
    left: el.style.left,
  }

  el.style.visibility = 'visible'
  el.style.zIndex = '9999'
  el.style.position = 'fixed'
  el.style.top = '0'
  el.style.left = '0'

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: PAGE_W_PX,
      height: el.scrollHeight,
      windowWidth: PAGE_W_PX,
    })

    const imgData = canvas.toDataURL('image/png')
    const totalHeightPx = canvas.height / 2 // canvas is 2x scaled

    // A4 in mm
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageWmm = pdf.internal.pageSize.getWidth()
    const pageHmm = pdf.internal.pageSize.getHeight()

    // How many mm per source pixel
    const mmPerPx = pageWmm / PAGE_W_PX

    const pageHpx = PAGE_H_PX
    const totalPages = Math.ceil(totalHeightPx / pageHpx)

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()

      const srcY = i * pageHpx * 2 // canvas is 2x
      const srcH = Math.min(pageHpx * 2, canvas.height - srcY)

      // Slice the canvas for this page
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = srcH
      const ctx = pageCanvas.getContext('2d')!
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)

      const pageImg = pageCanvas.toDataURL('image/png')
      const sliceHmm = (srcH / 2) * mmPerPx

      pdf.addImage(pageImg, 'PNG', 0, 0, pageWmm, sliceHmm)
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    // Restore original styles
    el.style.visibility = prev.visibility
    el.style.zIndex = prev.zIndex
    el.style.position = prev.position
    el.style.top = prev.top
    el.style.left = prev.left
  }
}
