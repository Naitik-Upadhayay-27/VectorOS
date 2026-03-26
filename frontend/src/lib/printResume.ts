export function printResume(resumeEl: HTMLElement) {
  const templateRoot = resumeEl.firstElementChild as HTMLElement | null
  const html = templateRoot ? templateRoot.outerHTML : resumeEl.innerHTML

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
    html, body { margin: 0; padding: 0; background: #fff; }
    @page { size: A4 portrait; margin: 0; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body > div { width: 794px; }
  </style>
</head>
<body><div>${html}</div></body>
</html>`

  const win = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000')
  if (!win) { alert('Allow popups for this site to download PDF.'); return }

  win.document.open()
  win.document.write(doc)
  win.document.close()

  win.addEventListener('load', () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.close()
    }, 500)
  })
}
