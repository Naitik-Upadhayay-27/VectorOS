/**
 * Prints just the resume by injecting a print-only overlay into the DOM,
 * triggering window.print(), then removing it. No popups needed.
 */
export function printResume(resumeEl: HTMLElement) {
  // Create a wrapper that will be shown only during print
  const printRoot = document.createElement('div')
  printRoot.id = '__resume_print_root__'
  printRoot.innerHTML = resumeEl.innerHTML

  // Inject print-only styles
  const style = document.createElement('style')
  style.id = '__resume_print_style__'
  style.textContent = `
    @media print {
      body > *:not(#__resume_print_root__) {
        display: none !important;
      }
      #__resume_print_root__ {
        display: block !important;
        position: fixed;
        inset: 0;
        width: 794px;
        background: #fff;
        z-index: 99999;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
    @media screen {
      #__resume_print_root__ {
        display: none;
      }
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(printRoot)

  window.print()

  // Clean up after print dialog closes
  document.head.removeChild(style)
  document.body.removeChild(printRoot)
}
