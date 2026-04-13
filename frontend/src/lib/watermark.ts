/**
 * Adds a watermark to a canvas element for free-tier PDF downloads.
 * Draws the logo tiled diagonally across the page at visible opacity.
 */
export async function applyWatermark(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = canvas

  // Try logo image first
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = reject
      // Use absolute URL to avoid CORS issues with html2canvas off-screen rendering
      image.src = window.location.origin + '/logo.png'
    })

    const logoW = Math.round(width * 0.28)
    const logoH = Math.round(logoW * (img.naturalHeight / img.naturalWidth))
    const spacingX = Math.round(width * 0.45)
    const spacingY = Math.round(height * 0.22)

    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.translate(width / 2, height / 2)
    ctx.rotate(-Math.PI / 6)

    // Tile across the rotated canvas
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const x = col * spacingX - logoW / 2
        const y = row * spacingY - logoH / 2
        ctx.drawImage(img, x, y, logoW, logoH)
      }
    }
    ctx.restore()
  } catch {
    // Fallback: text watermark
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate(-Math.PI / 6)
    ctx.font = `bold ${Math.round(width * 0.04)}px Arial`
    ctx.fillStyle = 'rgba(100, 100, 100, 0.22)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const spacingX = Math.round(width * 0.45)
    const spacingY = Math.round(height * 0.18)
    for (let row = -4; row <= 4; row++) {
      for (let col = -3; col <= 3; col++) {
        ctx.fillText('skillvector.in', col * spacingX, row * spacingY)
      }
    }
    ctx.restore()
  }
}
