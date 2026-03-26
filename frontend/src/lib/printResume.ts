/**
 * Prints just the resume using a print-only overlay.
 * resumeEl should be the measurement div that contains the full template render.
 */
export function printResume(resumeEl: HTMLElement) {
  // The measureRef contains one child — the template root element
  const templateRoot = resumeEl.firstElementChild as HTMLElement | null
  const html = templateRoot ? templateRoot.outerHTML : resumeEl.innerHTML

  // Remove any existing print artifacts
  document.getElementById('__resume_print_root__')?.remove()
  document.getElementById('__resume_print_style__')?.remove()

  const printRoot = document.createElement('div')
  printRoot.id = '__resume_print_root__'
  printRoot.innerHTML = html

  const style = document.createElement('style')
  style.id = '__resume_print_style__'
  style.textContent = `
    @media print {
      body > *:not(#__resume_print_root__) {
        display: none !important;
        visibility: hidden !important;
      }
      #__resume_print_root__ {
        display: block !important;
        visibility: visible !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 794px !important;
        min-height: 1123px !important;
        background: #fff !important;
        z-index: 999999 !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      #__resume_print_root__ * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      @page {
        size: A4;
        margin: 0mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
    }
    @media screen {
      #__resume_print_root__ {
        display: none !important;
      }
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(printRoot)

  requestAnimationFrame(() => {
    window.print()
    // Clean up after dialog closes
    setTimeout(() => {
      document.getElementById('__resume_print_root__')?.remove()
      document.getElementById('__resume_print_style__')?.remove()
    }, 1000)
  })
}
