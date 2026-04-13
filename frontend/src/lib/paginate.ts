/**
 * Pagination — MS Word style.
 * A4 at 96 dpi: 794 × 1123 px
 */

export const PAGE_W  = 794
export const PAGE_H  = 1123

export const PAGE_MARGIN_BOTTOM = 48
export const PAGE_MARGIN_TOP    = 48

export const USABLE_H_FIRST = PAGE_H - PAGE_MARGIN_BOTTOM
export const USABLE_H_REST  = PAGE_H - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])

function absTop(el: HTMLElement, container: HTMLElement): number {
  let top = 0
  let node: HTMLElement | null = el
  while (node && node !== container) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

/**
 * Returns the bottom of the content block that belongs to a heading.
 * Walks next siblings and also looks inside <ul>/<ol> to get the first item's bottom,
 * ensuring the heading + its first content item are always kept together.
 */
function blockBottom(heading: HTMLElement, container: HTMLElement): number {
  const level = parseInt(heading.tagName[1] || '0', 10) || 7
  const isSectionHead = heading.classList.contains('resume-section-head')
  let node: Element | null = heading.nextElementSibling
  let bottom = absTop(heading, container) + heading.offsetHeight
  let count = 0

  while (node && node instanceof HTMLElement) {
    // Stop at next heading of same/higher level
    if (HEADING_TAGS.has(node.tagName)) {
      const nextLevel = parseInt(node.tagName[1] || '0', 10) || 7
      if (nextLevel <= level) break
    }
    // Stop at next section head div (for non-h* headings)
    if (isSectionHead && node.classList.contains('resume-section-head')) break

    // For list containers, look at the first item inside to get a real bottom
    if ((node.tagName === 'UL' || node.tagName === 'OL') && node.children.length > 0) {
      const firstItem = node.children[0] as HTMLElement
      const itemBottom = absTop(firstItem, container) + firstItem.offsetHeight
      if (itemBottom > bottom) bottom = itemBottom
    } else {
      const nb = absTop(node, container) + node.offsetHeight
      if (nb > bottom) bottom = nb
    }

    node = node.nextElementSibling
    count++
    if (count >= 3) break
  }
  return bottom
}

export function computePageOffsets(container: HTMLElement, totalHeight: number): number[] {
  const offsets: number[] = [0]
  let cutLimit = USABLE_H_FIRST

  while (cutLimit < totalHeight - 20) {
    // Collect all leaf-level elements with their positions
    const allEls = Array.from(
      container.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, h4, h5, h6, tr, .resume-section-head')
    ).filter(el => el.offsetHeight > 2)

    const els = allEls.map(el => {
      const top = absTop(el, container)
      return { el, top, bottom: top + el.offsetHeight }
    })

    const last = offsets[offsets.length - 1]
    const usable = offsets.length === 1 ? USABLE_H_FIRST : USABLE_H_REST

    // Start with the last element that fits completely before the cut limit
    const fitting = els.filter(e => e.bottom <= cutLimit && e.top >= last)
    let bestY = fitting.length > 0
      ? fitting[fitting.length - 1].bottom  // bottom of last fully-fitting element
      : cutLimit

    // Check if anything straddles the cut — if so, cut before it
    const straddling = els.filter(e => e.top < cutLimit && e.bottom > cutLimit)
    if (straddling.length > 0) {
      // Find the last element that ends BEFORE the first straddler starts
      const firstStraddlerTop = Math.min(...straddling.map(e => e.top))
      const beforeStraddler = els.filter(e => e.bottom <= firstStraddlerTop)
      if (beforeStraddler.length > 0) {
        bestY = beforeStraddler[beforeStraddler.length - 1].bottom
      } else {
        bestY = Math.max(0, firstStraddlerTop - 2)
      }
    }

    // Prevent orphaned headings: if a heading is near the cut and its block
    // extends past it, pull the cut up to before the heading
    const headingsNear = els.filter(
      e => (HEADING_TAGS.has(e.el.tagName) || e.el.classList.contains('resume-section-head'))
        && e.top < bestY && e.top >= last
    ).reverse() // check closest to cut first

    for (const { el: h, top: ht } of headingsNear) {
      const bb = blockBottom(h, container)
      if (bb > bestY + 4) {
        // Heading's block extends past the cut — move cut to before this heading
        const beforeHeading = els.filter(e => e.bottom <= ht && e.top >= last)
        if (beforeHeading.length > 0) {
          bestY = beforeHeading[beforeHeading.length - 1].bottom
        } else {
          bestY = Math.max(last, ht - 4)
        }
        break
      }
    }

    // Prevent orphaned label+list: <p> label whose <ul>/<ol> starts after cut
    const labels = els.filter(
      e => e.el.tagName === 'P' && e.bottom <= bestY && e.bottom > bestY - 100
    ).reverse()

    for (const { el: labelEl, top: labelTop } of labels) {
      const next = labelEl.nextElementSibling
      if (next && (next.tagName === 'UL' || next.tagName === 'OL')) {
        const nextTop = absTop(next as HTMLElement, container)
        if (nextTop >= bestY) {
          const beforeLabel = els.filter(e => e.bottom <= labelTop && e.top >= last)
          if (beforeLabel.length > 0) {
            bestY = beforeLabel[beforeLabel.length - 1].bottom
          }
          break
        }
      }
    }

    // Safety: never go backwards or get stuck
    if (bestY <= last + 40) {
      bestY = last + usable
    }

    offsets.push(bestY)
    cutLimit = bestY + USABLE_H_REST
  }

  return offsets
}
