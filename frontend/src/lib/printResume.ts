/**
 * Opens a print-only window containing just the resume template HTML.
 * Grabs all <style> and <link rel="stylesheet"> from the current document
 * so Tailwind classes render correctly in the print window.
 */
export function printResume(resumeEl: HTMLElement, filename = 'resume') {
  const styles = Array.from(document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  ${styles}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    @page { size: A4; margin: 0; }
    @media print {
      html, body { width: 210mm; }
    }
  </style>
</head>
<body>
  ${resumeEl.outerHTML}
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()

  // Wait for fonts/images to load then print
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.close()
    }, 400)
  }
}
