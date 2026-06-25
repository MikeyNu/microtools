export type BrowserImageFormat = 'jpeg' | 'png' | 'webp'

export interface LoadedImage {
  image: HTMLImageElement
  width: number
  height: number
}

export function extensionForImageFormat(format: BrowserImageFormat): string {
  if (format === 'jpeg') return '.jpg'
  return `.${format}`
}

export function mimeForImageFormat(format: BrowserImageFormat): string {
  if (format === 'jpeg') return 'image/jpeg'
  if (format === 'png') return 'image/png'
  return 'image/webp'
}

export function getImageFormat(file: File): BrowserImageFormat | 'unknown' {
  const type = file.type.toLowerCase()
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg'
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  return 'unknown'
}

export function replaceFileExtension(fileName: string, extension: string): string {
  return /\.[^/.]+$/.test(fileName)
    ? fileName.replace(/\.[^/.]+$/, extension)
    : `${fileName}${extension}`
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Unable to decode ${file.name}.`))
      img.src = url
    })

    return {
      image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Unable to export image from canvas.'))
      },
      mimeType,
      quality
    )
  })
}

export async function renderImageToBlob(
  file: File,
  options: {
    width?: number
    height?: number
    mode?: 'fit' | 'fill' | 'stretch'
    format: BrowserImageFormat
    quality?: number
  }
): Promise<{ blob: Blob; width: number; height: number; sourceWidth: number; sourceHeight: number }> {
  const loaded = await loadImageFile(file)
  const targetWidth = Math.max(1, Math.round(options.width ?? loaded.width))
  const targetHeight = Math.max(1, Math.round(options.height ?? loaded.height))
  const mode = options.mode ?? 'stretch'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')

  canvas.width = targetWidth
  canvas.height = targetHeight
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (options.format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetWidth, targetHeight)
  }

  let drawWidth = targetWidth
  let drawHeight = targetHeight
  let drawX = 0
  let drawY = 0

  if (mode !== 'stretch') {
    const scale =
      mode === 'fill'
        ? Math.max(targetWidth / loaded.width, targetHeight / loaded.height)
        : Math.min(targetWidth / loaded.width, targetHeight / loaded.height)
    drawWidth = Math.round(loaded.width * scale)
    drawHeight = Math.round(loaded.height * scale)
    drawX = Math.round((targetWidth - drawWidth) / 2)
    drawY = Math.round((targetHeight - drawHeight) / 2)
  }

  ctx.drawImage(loaded.image, drawX, drawY, drawWidth, drawHeight)
  const blob = await canvasToBlob(canvas, mimeForImageFormat(options.format), options.quality)

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    sourceWidth: loaded.width,
    sourceHeight: loaded.height,
  }
}
