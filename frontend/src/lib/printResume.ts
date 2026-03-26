/**
 * Prints the resume by opening a dedicated window with only the resume HTML.
 * This is the only reliable way to get @page margin: 0 to work cross-browser.
 */
export function printResume(resumeEl: HTMLElement) {
  const templateRoot = resumeEl.firstElementChild as HTMLElement | null
  const resumeHTML = templateRoot ? templateRoot.outerHTML : resumeEl.innerHTML

  // Grab all Tailwind/app styles from the current page
  const styles = [
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(
      (el) => `<link rel="stylesheet" href="${el.href}" />`
    ),
    ...Array.from(document.querySelectorAll<HTMLStyleElement>('style')).map(
      (el) => `<style>${el.textContent}</style>`
    ),
  ].join('\n')

  const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume</title>
  ${styles}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff;
    }
    body > div {
      width: 794px;
    }
    @page {
      size: A4 portrait;
      margin: 0mm !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  </style>
</head>
<body>
  <div>${resumeHTML}</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Please allow popups for this site to download the PDF.')
    return
  }

  win.document.open()
  win.document.write(doc)
  win.document.close()

  // Wait for stylesheets to load before printing
  win.addEventListener('load', () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.close()
    }, 600)
  })
}
