'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import {
  Crop,
  Upload,
  Download,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Square,
  Monitor,
  Camera,
} from 'lucide-react'

const TOOL_OBJ = {
  id: 'image-cropper',
  name: 'Image Cropper',
  description: 'Crop images to any size or aspect ratio with live preview.',
  category: 'image-tools',
  url: '/image-tools/crop',
}

const RELATED_TOOLS = [
  { name: 'Image Resizer', href: '/image-tools/resize' },
  { name: 'Image Compressor', href: '/image-tools/compress' },
  { name: 'WebP Converter', href: '/image-tools/webp-converter' },
]

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:2'
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ReactNode }[] = [
  { label: 'Free', value: 'free', icon: <Crop className="h-3.5 w-3.5" /> },
  { label: '1 : 1', value: '1:1', icon: <Square className="h-3.5 w-3.5" /> },
  { label: '16 : 9', value: '16:9', icon: <Monitor className="h-3.5 w-3.5" /> },
  { label: '4 : 3', value: '4:3', icon: <Camera className="h-3.5 w-3.5" /> },
  { label: '3 : 2', value: '3:2', icon: <ImageIcon className="h-3.5 w-3.5" /> },
]

function getAspectMultiplier(ratio: AspectRatio): number | null {
  switch (ratio) {
    case '1:1': return 1
    case '16:9': return 16 / 9
    case '4:3': return 4 / 3
    case '3:2': return 3 / 2
    default: return null
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function formatPx(n: number) {
  return Math.round(n).toLocaleString() + ' px'
}

export default function ImageCropperPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [cropRegion, setCropRegion] = useState<CropRegion>({ x: 0, y: 0, width: 100, height: 100 })
  const [cropDone, setCropDone] = useState(false)
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null)

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // When an image loads, initialise crop region to full image
  const handleImageLoad = useCallback((src: string) => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      setCropRegion({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight })
      setCropDone(false)
      setCroppedUrl(null)
    }
    img.src = src
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, GIF, BMP).')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File is too large. Maximum size is 20 MB.')
      return
    }
    setError(null)
    setCropDone(false)
    setCroppedUrl(null)
    setOriginalFile(file)
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    handleImageLoad(url)
  }, [handleImageLoad])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  // Constrain crop region whenever aspect ratio changes
  useEffect(() => {
    if (!naturalSize) return
    const multiplier = getAspectMultiplier(aspectRatio)
    if (multiplier === null) return
    setCropRegion(prev => {
      const newH = Math.round(prev.width / multiplier)
      const clampedH = clamp(newH, 1, naturalSize.h - prev.y)
      const clampedW = Math.round(clampedH * multiplier)
      return {
        ...prev,
        width: clamp(clampedW, 1, naturalSize.w - prev.x),
        height: clampedH,
      }
    })
  }, [aspectRatio, naturalSize])

  // Draw live preview on canvas whenever crop region changes
  useEffect(() => {
    const canvas = previewCanvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !naturalSize) return

    const maxW = 480
    const maxH = 260
    const cw = cropRegion.width
    const ch = cropRegion.height
    if (cw <= 0 || ch <= 0) return

    const scale = Math.min(maxW / cw, maxH / ch, 1)
    const dw = Math.round(cw * scale)
    const dh = Math.round(ch * scale)
    canvas.width = dw
    canvas.height = dh

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, dw, dh)
    ctx.drawImage(img, cropRegion.x, cropRegion.y, cw, ch, 0, 0, dw, dh)
  }, [cropRegion, naturalSize, imageSrc])

  const handleCropFieldChange = (field: keyof CropRegion, raw: string) => {
    if (!naturalSize) return
    const val = parseInt(raw, 10)
    if (isNaN(val)) return
    const multiplier = getAspectMultiplier(aspectRatio)

    setCropRegion(prev => {
      let next = { ...prev, [field]: val }

      // Clamp position
      next.x = clamp(next.x, 0, naturalSize.w - 1)
      next.y = clamp(next.y, 0, naturalSize.h - 1)

      // Clamp size
      next.width = clamp(next.width, 1, naturalSize.w - next.x)
      next.height = clamp(next.height, 1, naturalSize.h - next.y)

      // If locked aspect ratio, recalculate the other dimension
      if (multiplier !== null) {
        if (field === 'width') {
          next.height = clamp(Math.round(next.width / multiplier), 1, naturalSize.h - next.y)
        } else if (field === 'height') {
          next.width = clamp(Math.round(next.height * multiplier), 1, naturalSize.w - next.x)
        }
      }

      return next
    })
  }

  const handleCropAndDownload = () => {
    const img = imgRef.current
    if (!img || !naturalSize) return

    const { x, y, width, height } = cropRegion
    if (width <= 0 || height <= 0) {
      setError('Crop region has zero size. Adjust Width or Height.')
      return
    }

    const canvas = outputCanvasRef.current!
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/jpeg' ? 'jpg' : 'webp'
    const quality = outputFormat === 'image/png' ? undefined : 0.92

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Failed to generate cropped image.')
          return
        }
        const url = URL.createObjectURL(blob)
        const baseName = originalFile?.name.replace(/\.[^/.]+$/, '') ?? 'cropped'
        const a = document.createElement('a')
        a.href = url
        a.download = `${baseName}_cropped.${ext}`
        a.click()
        setCroppedUrl(url)
        setCropDone(true)
        setError(null)
      },
      outputFormat,
      quality,
    )
  }

  const handleReset = () => {
    setImageSrc(null)
    setOriginalFile(null)
    setNaturalSize(null)
    setCropRegion({ x: 0, y: 0, width: 100, height: 100 })
    setCropDone(false)
    setCroppedUrl(null)
    setError(null)
    imgRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const setFullImage = () => {
    if (!naturalSize) return
    const multiplier = getAspectMultiplier(aspectRatio)
    if (multiplier === null) {
      setCropRegion({ x: 0, y: 0, width: naturalSize.w, height: naturalSize.h })
    } else {
      const h = Math.round(naturalSize.w / multiplier)
      if (h <= naturalSize.h) {
        setCropRegion({ x: 0, y: 0, width: naturalSize.w, height: h })
      } else {
        const w = Math.round(naturalSize.h * multiplier)
        setCropRegion({ x: 0, y: 0, width: w, height: naturalSize.h })
      }
    }
  }

  const outputExtLabel = outputFormat === 'image/png' ? 'PNG' : outputFormat === 'image/jpeg' ? 'JPEG' : 'WebP'

  return (
    <ToolLayout
      title="Image Cropper"
      description="Crop any image to a precise region. Set X, Y, Width and Height in pixels, choose a preset aspect ratio, preview the result live, then download."
      category="Image Tools"
      categoryHref="/image-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="image-cropper" />
          <ShareButton tool={TOOL_OBJ} />
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload */}
        {!imageSrc && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Drop an image file here or click to browse. Supports JPEG, PNG, WebP, GIF, BMP. Max 20 MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors select-none',
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50 hover:bg-muted/40',
                ].join(' ')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-base font-medium text-muted-foreground mb-1">
                  {isDragging ? 'Release to upload' : 'Drop image here or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">JPEG · PNG · WebP · GIF · BMP</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main tool interface — shown once an image is loaded */}
        {imageSrc && naturalSize && (
          <>
            {/* Aspect ratio + format controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crop className="h-5 w-5" />
                  Crop Settings
                </CardTitle>
                <CardDescription>
                  Choose a preset ratio to lock proportions, or leave on Free for full control.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Aspect ratio pills */}
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                    Aspect Ratio
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map(({ label, value, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAspectRatio(value)}
                        className={[
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-sm font-medium transition-colors',
                          aspectRatio === value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border text-muted-foreground hover:border-accent/50 hover:text-foreground',
                        ].join(' ')}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop coordinate inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-x">X (left)</Label>
                    <Input
                      id="crop-x"
                      type="number"
                      min={0}
                      max={naturalSize.w - 1}
                      value={cropRegion.x}
                      onChange={(e) => handleCropFieldChange('x', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-y">Y (top)</Label>
                    <Input
                      id="crop-y"
                      type="number"
                      min={0}
                      max={naturalSize.h - 1}
                      value={cropRegion.y}
                      onChange={(e) => handleCropFieldChange('y', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-w">Width</Label>
                    <Input
                      id="crop-w"
                      type="number"
                      min={1}
                      max={naturalSize.w}
                      value={cropRegion.width}
                      onChange={(e) => handleCropFieldChange('width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-h">Height</Label>
                    <Input
                      id="crop-h"
                      type="number"
                      min={1}
                      max={naturalSize.h}
                      value={cropRegion.height}
                      onChange={(e) => handleCropFieldChange('height', e.target.value)}
                    />
                  </div>
                </div>

                {/* Output format */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select
                      value={outputFormat}
                      onValueChange={(v) => setOutputFormat(v as OutputFormat)}
                    >
                      <SelectTrigger id="output-format" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/png">PNG</SelectItem>
                        <SelectItem value="image/jpeg">JPEG</SelectItem>
                        <SelectItem value="image/webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={setFullImage}
                    className="gap-1.5"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Full Image
                  </Button>
                </div>

              </CardContent>
            </Card>

            {/* Dimension info badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Original:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {naturalSize.w.toLocaleString()} × {naturalSize.h.toLocaleString()} px
              </Badge>
              <span className="text-xs uppercase tracking-wide text-muted-foreground ml-2">Crop:</span>
              <Badge variant="outline" className="font-mono text-xs text-accent border-accent/30">
                {Math.round(cropRegion.width).toLocaleString()} × {Math.round(cropRegion.height).toLocaleString()} px
              </Badge>
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                at ({Math.round(cropRegion.x)}, {Math.round(cropRegion.y)})
              </Badge>
            </div>

            {/* Live preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Updates instantly as you adjust the crop region above.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[180px] overflow-hidden">
                  <canvas
                    ref={previewCanvasRef}
                    style={{ maxWidth: '100%', maxHeight: '260px', display: 'block', imageRendering: 'auto' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Preview is scaled to fit — the downloaded file will be at full pixel dimensions.
                </p>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCropAndDownload} className="gap-2 flex-1 sm:flex-none">
                <Download className="h-4 w-4" />
                Crop &amp; Download {outputExtLabel}
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New Image
              </Button>
            </div>

            {/* Success confirmation */}
            {cropDone && (
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  Cropped image downloaded — {Math.round(cropRegion.width).toLocaleString()} × {Math.round(cropRegion.height).toLocaleString()} px as {outputExtLabel}.
                </AlertDescription>
              </Alert>
            )}

            {/* Original image reference (hidden, used by canvas) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="source"
              style={{ display: 'none' }}
              onLoad={() => handleImageLoad(imageSrc)}
            />
          </>
        )}

        {/* Hidden output canvas — used only for export */}
        <canvas ref={outputCanvasRef} style={{ display: 'none' }} />

        {/* Tips card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-0.5">1. Upload your image</p>
                  <p>Drop any JPEG, PNG, WebP, GIF or BMP file onto the upload area, or click to browse.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">2. Choose an aspect ratio</p>
                  <p>Pick Free for arbitrary crops, or a preset like 1:1 or 16:9 to lock the proportions — Width and Height stay in sync automatically.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-0.5">3. Adjust the crop region</p>
                  <p>Enter pixel values for X (left offset), Y (top offset), Width and Height. The live preview updates as you type.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">4. Crop &amp; Download</p>
                  <p>Choose PNG, JPEG or WebP as output format, then click Crop &amp; Download. Everything runs in your browser — no upload to a server.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
