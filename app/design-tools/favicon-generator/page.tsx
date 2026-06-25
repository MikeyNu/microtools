'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import {
  ImageIcon,
  Type,
  Download,
  Copy,
  CheckCheck,
  Upload,
  Eye,
  Code2,
  AlertCircle,
} from 'lucide-react'

const TOOL = {
  id: 'favicon-generator',
  name: 'Favicon Generator',
  description: 'Create favicons from text or images, preview at all sizes, and download ready-to-use .ico and PNG files.',
  category: 'design-tools',
  url: '/design-tools/favicon-generator',
}

const RELATED_TOOLS = [
  { name: 'Color Picker', href: '/design-tools/color-picker' },
  { name: 'Color Contrast Checker', href: '/design-tools/contrast-checker' },
  { name: 'QR Generator', href: '/design-tools/qr-generator' },
]

const PREVIEW_SIZES = [16, 32, 48, 64] as const

const FONT_OPTIONS = [
  { label: 'Sans-serif', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: '"Courier New", Courier, monospace' },
  { label: 'Display (Bold)', value: '"Arial Black", "Impact", sans-serif' },
]

function drawTextFavicon(
  canvas: HTMLCanvasElement,
  text: string,
  bgColor: string,
  textColor: string,
  fontSize: number,
  fontFamily: string,
) {
  const size = canvas.width
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, size, size)

  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  // Text
  const displayText = text.slice(0, 2)
  const scaledFontSize = Math.round((fontSize / 64) * size)
  ctx.font = `bold ${scaledFontSize}px ${fontFamily}`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayText, size / 2, size / 2)
}

function drawImageFavicon(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
) {
  const size = canvas.width
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)
}

export default function FaviconGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text')

  // Text mode state
  const [faviconText, setFaviconText] = useState('MT')
  const [bgColor, setBgColor] = useState('#9F341B')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [fontSize, setFontSize] = useState(36)
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value)

  // Upload mode state
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadError, setUploadError] = useState('')

  // UI state
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  // Canvas refs — one master 64×64 canvas for generation, plus preview canvases
  const masterCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewRefs = useRef<Record<number, HTMLCanvasElement | null>>({})

  const setPreviewRef = useCallback(
    (size: number) => (el: HTMLCanvasElement | null) => {
      previewRefs.current[size] = el
    },
    [],
  )

  // Redraw all canvases whenever relevant state changes
  const redrawAll = useCallback(() => {
    const master = masterCanvasRef.current
    if (!master) return

    if (activeTab === 'text') {
      drawTextFavicon(master, faviconText || '?', bgColor, textColor, fontSize, fontFamily)
    } else if (uploadedImage) {
      drawImageFavicon(master, uploadedImage)
    } else {
      const ctx = master.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 64, 64)
        ctx.fillStyle = '#E8E0D4'
        ctx.fillRect(0, 0, 64, 64)
      }
    }

    // Paint each preview canvas from the master
    PREVIEW_SIZES.forEach((size) => {
      const preview = previewRefs.current[size]
      if (!preview) return
      const ctx = preview.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(master, 0, 0, size, size)
    })
  }, [activeTab, faviconText, bgColor, textColor, fontSize, fontFamily, uploadedImage])

  useEffect(() => {
    redrawAll()
  }, [redrawAll])

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('')
    const file = e.target.files?.[0]
    if (!file) return

    const isValid = file.type === 'image/png' || file.type === 'image/svg+xml'
    if (!isValid) {
      setUploadError('Please upload a PNG or SVG file.')
      return
    }

    setUploadedFileName(file.name)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setUploadedImage(img)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setUploadError('Could not load image. Please try another file.')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  // Download helpers
  const downloadAs = (filename: string) => {
    const master = masterCanvasRef.current
    if (!master) return
    const dataUrl = master.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadIco = () => downloadAs('favicon.ico')
  const downloadPng = () => downloadAs('favicon-64.png')

  const downloadAllSizes = () => {
    PREVIEW_SIZES.forEach((size) => {
      const preview = previewRefs.current[size]
      if (!preview) return
      const dataUrl = preview.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `favicon-${size}x${size}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  const copySnippet = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSnippet(key)
      setTimeout(() => setCopiedSnippet(null), 2000)
    } catch {
      // silently ignore
    }
  }

  const icoSnippet = `<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">`
  const appleSnippet = `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
  const fullSnippet = `${icoSnippet}\n${appleSnippet}\n<link rel="manifest" href="/site.webmanifest">`

  const hasContent =
    activeTab === 'text'
      ? faviconText.trim().length > 0
      : uploadedImage !== null

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Create favicons from text characters or uploaded images. Preview at every standard size and download ready-to-use .ico and PNG files."
      category="Design Tools"
      categoryHref="/design-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={TOOL.id} />
          <ShareButton tool={TOOL} />
        </div>

        {/* Hidden master canvas — 64×64 — used for all generation */}
        <canvas
          ref={masterCanvasRef}
          width={64}
          height={64}
          className="hidden"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: controls */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'text' | 'upload')}
            >
              <TabsList>
                <TabsTrigger value="text">
                  <Type className="h-4 w-4 mr-1.5" />
                  Text Mode
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload Image
                </TabsTrigger>
              </TabsList>

              {/* ── TEXT MODE ── */}
              <TabsContent value="text" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Text Favicon
                    </CardTitle>
                    <CardDescription>
                      Enter 1–2 characters (initials, symbol, or abbreviation) and style them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="favicon-text">Characters (1–2)</Label>
                        <Input
                          id="favicon-text"
                          value={faviconText}
                          onChange={(e) => setFaviconText(e.target.value.slice(0, 2))}
                          placeholder="MT"
                          maxLength={2}
                          className="text-2xl font-bold tracking-tight h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-family">Font style</Label>
                        <select
                          id="font-family"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {FONT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="bg-color">Background color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="bg-color"
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border border-input p-0.5 bg-transparent"
                          />
                          <Input
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="font-mono text-sm"
                            placeholder="#9F341B"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text-color">Text color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border border-input p-0.5 bg-transparent"
                          />
                          <Input
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="font-mono text-sm"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-size">
                          Font size <span className="text-muted-foreground">({fontSize}px)</span>
                        </Label>
                        <div className="flex items-center gap-3 pt-1">
                          <input
                            id="font-size"
                            type="range"
                            min={16}
                            max={52}
                            step={2}
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="flex-1 accent-accent"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sm</span>
                          <span>Lg</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── UPLOAD MODE ── */}
              <TabsContent value="upload" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Upload Image
                    </CardTitle>
                    <CardDescription>
                      Upload a PNG or SVG logo to generate favicon sizes. Square images work best.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Image file (PNG or SVG)</Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Choose file
                        </label>
                        <span className="text-sm text-muted-foreground">
                          {uploadedFileName || 'No file chosen'}
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/png,image/svg+xml"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    {!uploadedImage && !uploadError && (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg h-36 text-muted-foreground gap-2">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <p className="text-sm">Upload a PNG or SVG to preview</p>
                        <p className="text-xs">Square images (1:1 ratio) give the cleanest result</p>
                      </div>
                    )}

                    {uploadedImage && (
                      <div className="bg-muted rounded-lg p-4 flex items-center gap-4">
                        <canvas
                          width={64}
                          height={64}
                          className="rounded border border-border"
                          ref={(el) => {
                            if (el && uploadedImage) {
                              const ctx = el.getContext('2d')
                              ctx?.clearRect(0, 0, 64, 64)
                              ctx?.drawImage(uploadedImage, 0, 0, 64, 64)
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{uploadedFileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Source: {uploadedImage.naturalWidth}&times;{uploadedImage.naturalHeight}px
                          </p>
                          <Badge variant="secondary">Ready to generate</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Download actions */}
            {hasContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={downloadIco}>
                      <Download className="h-4 w-4 mr-2" />
                      Download .ico
                    </Button>
                    <Button variant="outline" onClick={downloadPng}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG (64px)
                    </Button>
                    <Button variant="outline" onClick={downloadAllSizes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download all sizes
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    The .ico file is a PNG renamed — supported by all modern browsers. For true multi-resolution .ico files, use the PNGs with an offline ICO packager.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* HTML snippets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  HTML Snippets
                </CardTitle>
                <CardDescription>
                  Copy these tags into your HTML <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic ICO */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Basic favicon</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copySnippet('ico', icoSnippet)}
                      className="h-7 px-2 text-xs"
                    >
                      {copiedSnippet === 'ico' ? (
                        <CheckCheck className="h-3.5 w-3.5 mr-1 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copiedSnippet === 'ico' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {icoSnippet}
                  </pre>
                </div>

                {/* Apple touch icon */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Apple Touch Icon</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copySnippet('apple', appleSnippet)}
                      className="h-7 px-2 text-xs"
                    >
                      {copiedSnippet === 'apple' ? (
                        <CheckCheck className="h-3.5 w-3.5 mr-1 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copiedSnippet === 'apple' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {appleSnippet}
                  </pre>
                </div>

                {/* Full set */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full recommended set</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copySnippet('full', fullSnippet)}
                      className="h-7 px-2 text-xs"
                    >
                      {copiedSnippet === 'full' ? (
                        <CheckCheck className="h-3.5 w-3.5 mr-1 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copiedSnippet === 'full' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {fullSnippet}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: live preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>Rendered at all standard sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {PREVIEW_SIZES.map((size) => (
                    <div key={size} className="flex items-center gap-4">
                      <canvas
                        ref={setPreviewRef(size)}
                        width={size}
                        height={size}
                        className="border border-border rounded-sm flex-shrink-0"
                        style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                        aria-label={`${size}×${size} favicon preview`}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground tabular-nums">
                          {size}&times;{size}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {size === 16
                            ? 'Browser tab'
                            : size === 32
                            ? 'Standard'
                            : size === 48
                            ? 'Taskbar'
                            : 'High-res'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Context previews */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Browser tab simulation</p>
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2 border border-border">
                    <canvas
                      width={16}
                      height={16}
                      className="border border-border/50 rounded-sm flex-shrink-0"
                      style={{ imageRendering: 'pixelated' }}
                      ref={(el) => {
                        if (el && previewRefs.current[16]) {
                          const ctx = el.getContext('2d')
                          const src = previewRefs.current[16]
                          if (ctx && src) {
                            ctx.clearRect(0, 0, 16, 16)
                            ctx.drawImage(src, 0, 0)
                          }
                        }
                      }}
                    />
                    <span className="text-xs text-foreground truncate">
                      {activeTab === 'text' && faviconText
                        ? `${faviconText} — Your Site`
                        : uploadedFileName
                        ? `${uploadedFileName.replace(/\.[^.]+$/, '')} — Your Site`
                        : 'Your Site'}
                    </span>
                    <div className="ml-auto w-3 h-3 rounded-full bg-border flex-shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">File checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { label: 'favicon.ico', note: '16×32px, browser tabs' },
                  { label: 'favicon-32x32.png', note: 'Standard displays' },
                  { label: 'apple-touch-icon.png', note: '180×180px, iOS' },
                  { label: 'favicon-192x192.png', note: 'Android PWA' },
                  { label: 'site.webmanifest', note: 'PWA manifest' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="mt-0.5 h-4 w-4 rounded-sm border border-border flex-shrink-0 bg-muted" />
                    <div>
                      <span className="font-mono text-xs">{item.label}</span>
                      <span className="text-muted-foreground text-xs"> — {item.note}</span>
                    </div>
                  </div>
                ))}
                <Alert className="mt-3">
                  <AlertDescription className="text-xs leading-relaxed">
                    This tool generates 16, 32, 48, and 64px PNGs. For iOS (180px) and Android (192px) sizes, download the 64px PNG and scale it up in an image editor, or use a dedicated favicon service for full coverage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
