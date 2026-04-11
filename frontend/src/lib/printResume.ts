import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const PAGE_W_PX = 794
const PAGE_H_PX = 1123
const PAGE_BOTTOM_MARGIN = 80

// Same smart pagination logic as TemplateLivePreview
function computePageOffsets(container: HTMLDivElement, totalHeight: number): number[] {
  const offsets: number[] = [0]
  const usableH = PAGE_H_PX - PAGE_BOTTOM_MARGIN
  let nextCut = usableH

  while (nextCut < totalHeight) {
    const all = Array.from(
      container.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, h4, h5, h6, div[style], section')
    )

    const elPositions = all.map(el => {
      let offsetTop = 0
      let node: HTMLElement | null = el
      while (node && node !== container) {
        offsetTop += node.offsetTop
        node = node.offsetParent as HTMLElement | null
      }
      return { el, top: offsetTop, bottom: offsetTop + el.offsetHeight }
    })

    let bestY = nextCut
    let bestDelta = Infinity

    for (const { bottom } of elPositions) {
      if (bottom <= nextCut && bottom > nextCut - 200) {
        const delta = nextCut - bottom
        if (delta < bestDelta) {
          bestDelta = delta
          bestY = bottom
        }
      }
    }

    // Avoid orphaned headings
    const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])
    const elementAfterCut = elPositions.find(({ top }) => top >= bestY && top < bestY + 40)
    if (elementAfterCut && HEADING_TAGS.has(elementAfterCut.el.tagName)) {
      const beforeHeading = elPositions
        .filter(({ bottom }) => bottom <= elementAfterCut.top)
        .sort((a, b) => b.bottom - a.bottom)[0]
      if (beforeHeading && beforeHeading.bottom > bestY - 150) {
        bestY = beforeHeading.bottom
      }
    }

    offsets.push(bestY)
    nextCut = bestY + usableH
  }

  return offsets
}

export async function printResume(el: HTMLDivElement, filename = 'resume'): Promise<void> {
  const prev = {
    visibility: el.style.visibility,
    zIndex: el.style.zIndex,
    position: el.style.position,
    top: el.style.top,
    left: el.style.left,
  }

  el.style.visibility = 'visible'
  el.style.zIndex = '-1'
  el.style.position = 'fixed'
  el.style.top = '0'
  el.style.left = '-9999px'

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

    const totalHeightPx = canvas.height / 2 // canvas is 2x scaled

    // Use smart offsets so cuts never happen mid-element
    const offsets = totalHeightPx <= PAGE_H_PX
      ? [0]
      : computePageOffsets(el, totalHeightPx)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageWmm = pdf.internal.pageSize.getWidth()
    const pageHmm = pdf.internal.pageSize.getHeight()
    const mmPerPx = pageWmm / PAGE_W_PX

    for (let i = 0; i < offsets.length; i++) {
      if (i > 0) pdf.addPage()

      const srcYpx = offsets[i]
      const nextOffsetPx = offsets[i + 1] ?? totalHeightPx
      // Each page slice is exactly PAGE_H_PX tall (last page may be shorter)
      const srcHpx = Math.min(PAGE_H_PX, nextOffsetPx - srcYpx + PAGE_BOTTOM_MARGIN)

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = srcHpx * 2 // 2x scale
      const ctx = pageCanvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0, srcYpx * 2,           // source x, y (2x)
        canvas.width, srcHpx * 2, // source w, h (2x)
        0, 0,                      // dest x, y
        canvas.width, srcHpx * 2  // dest w, h
      )

      const pageImg = pageCanvas.toDataURL('image/png')
      // Always render as full A4 page height so pages are uniform
      pdf.addImage(pageImg, 'PNG', 0, 0, pageWmm, pageHmm)
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    el.style.visibility = prev.visibility
    el.style.zIndex = prev.zIndex
    el.style.position = prev.position
    el.style.top = prev.top
    el.style.left = prev.left
  }
}
