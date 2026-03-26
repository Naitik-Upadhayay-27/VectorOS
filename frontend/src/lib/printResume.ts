export function printResume(resumeEl: HTMLElement) {
  const templateRoot = resumeEl.firstElementChild as HTMLElement | null
  const html = templateRoot ? templateRoot.outerHTML : resumeEl.innerHTML

  document.getElementById('__rp__')?.remove()
  document.getElementById('__rs__')?.remove()

  const root = document.createElement('div')
  root.id = '__rp__'
  root.innerHTML = html

  const style = document.createElement('style')
  style.id = '__rs__'
  style.textContent = `
    @media screen { #__rp__ { display: none !important; } }
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; }
      body > *:not(#__rp__) { display: none !important; }
      #__rp__ {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        width: 794px !important;
        background: #fff !important;
        z-index: 999999 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #__rp__ * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(root)

  requestAnimationFrame(() => {
    window.print()
    setTimeout(() => {
      document.getElementById('__rp__')?.remove()
      document.getElementById('__rs__')?.remove()
    }, 1000)
  })
}
