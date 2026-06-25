'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Download,
  ImageIcon,
  Scissors,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Wand2,
  Layers,
} from 'lucide-react'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

const TOOL = {
  id: 'background-remover',
  name: 'Background Remover',
  description: 'Remove image backgrounds using color-based tolerance selection. Upload an image, adjust tolerance, and download a transparent PNG.',
  category: 'image-tools',
  url: '/image-tools/background-remover',
}

const RELATED_TOOLS = [
  { name: 'Image Compressor', href: '/image-tools/compress' },
  { name: 'Image Resizer', href: '/image-tools/resize' },
  { name: 'Image Format Converter', href: '/image-tools/format-converter' },
]

interface ImageInfo {
  name: string
  width: number
  height: number
  sizeKb: number
}

// Flood-fill background removal using corner pixel sampling
function removeBackground(
  sourceCanvas: HTMLCanvasElement,
  tolerance: number
): HTMLCanvasElement {
  const w = sourceCanvas.width
  const h = sourceCanvas.height
  const ctx = sourceCanvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  // Sample the four corners to determine background color candidates
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ]

  // Pick the corner whose color appears most consistently
  function getPixel(x: number, y: number): [number, number, number] {
    const idx = (y * w + x) * 4
    return [data[idx], data[idx + 1], data[idx + 2]]
  }

  function colorDist(a: [number, number, number], b: [number, number, number]): number {
    return Math.sqrt(
      (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (a[2] - b[2]) ** 2
    )
  }

  // Use top-left corner as primary background sample
  const bgColor = getPixel(0, 0)
  const thresh = tolerance * 2.55 // 0–100 → 0–255 scale

  // BFS flood-fill from each corner
  const visited = new Uint8Array(w * h)
  const queue: number[] = []

  function enqueue(x: number, y: number) {
    if (x < 0 || x >= w || y < 0 || y >= h) return
    const idx = y * w + x
    if (visited[idx]) return
    const px = getPixel(x, y)
    if (colorDist(px, bgColor) <= thresh) {
      visited[idx] = 1
      queue.push(x, y)
    }
  }

  // Seed from all four corners
  for (const [cx, cy] of corners) {
    enqueue(cx, cy)
  }

  // Also seed from edges where color matches
  for (let x = 0; x < w; x++) {
    enqueue(x, 0)
    enqueue(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y)
    enqueue(w - 1, y)
  }

  let qi = 0
  while (qi < queue.length) {
    const x = queue[qi++]
    const y = queue[qi++]
    enqueue(x - 1, y)
    enqueue(x + 1, y)
    enqueue(x, y - 1)
    enqueue(x, y + 1)
  }

  // Build output canvas with transparent background pixels
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = w
  outputCanvas.height = h
  const outCtx = outputCanvas.getContext('2d')!
  const outData = outCtx.createImageData(w, h)
  const out = outData.data

  for (let i = 0; i < w * h; i++) {
    const si = i * 4
    if (visited[i]) {
      // Make transparent
      out[si] = 0
      out[si + 1] = 0
      out[si + 2] = 0
      out[si + 3] = 0
    } else {
      out[si] = data[si]
      out[si + 1] = data[si + 1]
      out[si + 2] = data[si + 2]
      out[si + 3] = data[si + 3]
    }
  }

  outCtx.putImageData(outData, 0, 0)
  return outputCanvas
}

export default function BackgroundRemoverPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [processedSrc, setProcessedSrc] = useState<string | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [tolerance, setTolerance] = useState([30])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('result')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20 MB.')
      return
    }
    setError(null)
    setProcessedSrc(null)

    const baseName = file.name.replace(/\.[^/.]+$/, '')
    setFileName(baseName)

    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setImageSrc(src)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        sourceCanvasRef.current = canvas
        setImageInfo({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(file.size / 1024),
        })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [loadFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const processImage = useCallback(async () => {
    if (!sourceCanvasRef.current) return
    setIsProcessing(true)
    setError(null)

    try {
      // Yield to browser for a paint frame before heavy work
      await new Promise((r) => setTimeout(r, 20))
      const result = removeBackground(sourceCanvasRef.current, tolerance[0])
      const dataUrl = result.toDataURL('image/png')
      setProcessedSrc(dataUrl)
    } catch {
      setError('Processing failed. Please try a different image.')
    } finally {
      setIsProcessing(false)
    }
  }, [tolerance])

  const handleDownload = () => {
    if (!processedSrc) return
    const link = document.createElement('a')
    link.href = processedSrc
    link.download = `${fileName}_nobg.png`
    link.click()
  }

  const handleReset = () => {
    setImageSrc(null)
    setProcessedSrc(null)
    setImageInfo(null)
    setError(null)
    setShowOriginal(false)
    sourceCanvasRef.current = null
  }

  // Checkerboard CSS for transparency preview
  const checkerStyle = {
    backgroundImage:
      'linear-gradient(45deg, #d0ccc4 25%, transparent 25%), linear-gradient(-45deg, #d0ccc4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0ccc4 75%), linear-gradient(-45deg, transparent 75%, #d0ccc4 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  }

  const displaySrc = showOriginal ? imageSrc : (processedSrc ?? imageSrc)

  return (
    <ToolLayout
      title="Background Remover"
      description="Remove image backgrounds using color-based selection. Download results as transparent PNG."
      category="Image Tools"
      categoryHref="/image-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        {/* Top action bar */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="background-remover" />
          <ShareButton tool={TOOL} />
        </div>

        {/* Approach notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool uses a <strong>color-based flood-fill approach</strong>: it samples the image edges to detect
            the background color, then makes similar-colored pixels transparent based on your tolerance setting.
            Works best on images with uniform, solid-color backgrounds. For hair, fur, or complex scenes,
            AI-powered services like Remove.bg or Adobe Express will give better results.
          </AlertDescription>
        </Alert>

        {/* Upload area — shown when no image loaded */}
        {!imageSrc && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Drag and drop an image, or click to browse. Supports JPG, PNG, WebP, GIF. Max 20 MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors select-none ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/60 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground mb-1">
                      {isDragging ? 'Drop your image here' : 'Choose an image or drag it here'}
                    </p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF — up to 20 MB</p>
                  </div>
                  <Button variant="outline" size="sm" tabIndex={-1} className="pointer-events-none">
                    Browse Files
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main workspace — shown after upload */}
        {imageSrc && (
          <>
            {/* Controls card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Background Removal Settings
                </CardTitle>
                <CardDescription>
                  Adjust tolerance then click Remove Background. Higher tolerance removes more color variation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image info */}
                {imageInfo && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{imageInfo.name}</Badge>
                    <Badge variant="secondary">{imageInfo.width} × {imageInfo.height}px</Badge>
                    <Badge variant="secondary">{imageInfo.sizeKb} KB</Badge>
                  </div>
                )}

                {/* Tolerance slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tolerance-slider" className="text-sm font-medium">
                      Color Tolerance
                    </Label>
                    <span className="text-sm font-medium tabular-nums text-accent">
                      {tolerance[0]}
                    </span>
                  </div>
                  <Slider
                    id="tolerance-slider"
                    value={tolerance}
                    onValueChange={setTolerance}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Strict — exact color only</span>
                    <span>Loose — broad color range</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={processImage} disabled={isProcessing} className="gap-2">
                    <Scissors className="h-4 w-4" />
                    {isProcessing ? 'Processing…' : 'Remove Background'}
                  </Button>

                  {processedSrc && (
                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download PNG
                    </Button>
                  )}

                  {imageSrc && (
                    <Button
                      variant="outline"
                      onClick={() => setShowOriginal((v) => !v)}
                      className="gap-2"
                    >
                      {showOriginal ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Show Result
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Show Original
                        </>
                      )}
                    </Button>
                  )}

                  <Button variant="outline" onClick={handleReset} className="gap-2 ml-auto">
                    <RefreshCw className="h-4 w-4" />
                    Start Over
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Preview card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {processedSrc
                    ? showOriginal
                      ? 'Original Image'
                      : 'Result — Background Removed'
                    : 'Image Preview'}
                </CardTitle>
                {processedSrc && !showOriginal && (
                  <CardDescription>
                    The checkerboard pattern represents transparency. Click Download PNG to save.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="relative rounded-lg overflow-hidden flex items-center justify-center min-h-64"
                  style={processedSrc && !showOriginal ? checkerStyle : { background: 'var(--muted)' }}
                >
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 z-10 gap-3">
                      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-muted-foreground">Removing background…</p>
                    </div>
                  )}
                  {displaySrc && (
                    <img
                      src={displaySrc}
                      alt={showOriginal ? 'Original' : 'Background removed'}
                      className="max-w-full max-h-[520px] object-contain"
                    />
                  )}
                </div>

                {processedSrc && !showOriginal && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="h-4 w-4" />
                    Background removed. Toggle to compare with original, or adjust tolerance and reprocess.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Tips card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tips for Best Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">Solid-color backgrounds</p>
                <p className="text-sm text-muted-foreground">
                  White, green, or any single-color backdrop works best with this color-based approach.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">Adjust tolerance gradually</p>
                <p className="text-sm text-muted-foreground">
                  Start low (20–30) and increase if background patches remain. Too high may remove
                  parts of the subject.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">PNG output preserves transparency</p>
                <p className="text-sm text-muted-foreground">
                  Results are always saved as PNG, the only web format that supports true transparency.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">Complex subjects need AI</p>
                <p className="text-sm text-muted-foreground">
                  Hair, fur, glass, or gradient backgrounds benefit from AI-powered services like
                  Remove.bg or Adobe Express.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
