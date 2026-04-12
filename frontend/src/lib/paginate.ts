/**
 * Pagination — MS Word style.
 *
 * A4 at 96 dpi:  794 × 1123 px
 *
 * Each page has:
 *   - PAGE_MARGIN_TOP  : white space at the top  (page 2+ only — page 1 uses template's own header)
 *   - PAGE_MARGIN_BOTTOM: white space at the bottom of every page
 *
 * The algorithm cuts content so that nothing ever falls inside those margin zones.
 * The preview then renders each page as a full PAGE_H box, shifting content by
 * -offset + PAGE_MARGIN_TOP (for pages 2+), so the margins appear as real white
 * space — content is never hidden or clipped, it simply isn't placed there.
 */

export const PAGE_W  = 794
export const PAGE_H  = 1123

/** Bottom white-space margin on every page (px). ~0.5in */
export const PAGE_MARGIN_BOTTOM = 48
/** Top white-space margin on pages 2+ (px). ~0.5in */
export const PAGE_MARGIN_TOP    = 48

/** Usable content height on page 1 (no top margin — template header fills it) */
export const USABLE_H_FIRST = PAGE_H - PAGE_MARGIN_BOTTOM
/** Usable content height on pages 2+ */
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

/** Bottom of the content block owned by `heading` (stops at next same/higher heading). */
function blockBottom(heading: HTMLElement, container: HTMLElement): number {
  const level = parseInt(heading.tagName[1], 10)
  let node: Element | null = heading.nextElementSibling
  let bottom = absTop(heading, container) + heading.offsetHeight
  while (node) {
    if (node instanceof HTMLElement) {
      if (HEADING_TAGS.has(node.tagName) && parseInt(node.tagName[1], 10) <= level) break
      const nb = absTop(node, container) + node.offsetHeight
      if (nb > bottom) bottom = nb
    }
    node = node.nextElementSibling
  }
  return bottom
}

/**
 * Returns an array of content-scroll offsets where each new page starts.
 * offset[0] = 0 always.
 * offset[i] = the px position in the full rendered content where page i begins.
 *
 * The algorithm guarantees:
 *  - No content falls in the bottom margin zone of any page.
 *  - No content falls in the top margin zone of pages 2+.
 *  - Headings are never orphaned (heading + its block stay together).
 */
export function computePageOffsets(container: HTMLElement, totalHeight: number): number[] {
  const offsets: number[] = [0]

  // cutLimit = the content-scroll Y that must not be exceeded for this page
  let cutLimit = USABLE_H_FIRST

  while (cutLimit < totalHeight) {
    const els = Array.from(
      container.querySelectorAll<HTMLElement>(
        'p, li, h1, h2, h3, h4, h5, h6, div[style], section'
      )
    ).map(el => {
      const top = absTop(el, container)
      return { el, top, bottom: top + el.offsetHeight }
    })

    // 1. Best natural cut — element bottom closest to (but ≤) cutLimit
    let bestY = cutLimit
    let bestDelta = Infinity
    for (const { bottom } of els) {
      if (bottom <= cutLimit && bottom > cutLimit - 200) {
        const d = cutLimit - bottom
        if (d < bestDelta) { bestDelta = d; bestY = bottom }
      }
    }

    // 2. If a heading starts right after the cut, pull the cut up before it
    const afterCut = els.find(({ top }) => top >= bestY && top < bestY + 60)
    if (afterCut && HEADING_TAGS.has(afterCut.el.tagName)) {
      const before = els
        .filter(({ bottom }) => bottom <= afterCut.top)
        .sort((a, b) => b.bottom - a.bottom)[0]
      if (before && before.bottom > bestY - 200) bestY = before.bottom
    }

    // 3. If a heading's block straddles the cut, pull the cut up before the heading
    const headingsBefore = els.filter(
      ({ el, top }) => HEADING_TAGS.has(el.tagName) && top < bestY && top > bestY - 300
    )
    for (const { el: h, top: ht } of headingsBefore) {
      if (blockBottom(h, container) > bestY + 10) {
        const before = els
          .filter(({ bottom }) => bottom <= ht)
          .sort((a, b) => b.bottom - a.bottom)[0]
        if (before && before.bottom > bestY - 300) bestY = before.bottom
        break
      }
    }

    // Safety: never go backwards
    const last = offsets[offsets.length - 1]
    if (bestY <= last) bestY = last + USABLE_H_REST

    offsets.push(bestY)
    // Next page: content starts at bestY, usable height is USABLE_H_REST
    cutLimit = bestY + USABLE_H_REST
  }

  return offsets
}
