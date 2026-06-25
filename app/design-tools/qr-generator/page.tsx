'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { QrCode, Download, Copy, Link, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'

const toolObj = {
  id: 'qr-generator-design',
  name: 'QR Code Generator',
  description: 'Generate QR codes for URLs, text, and more with custom sizes and colors',
  category: 'design-tools',
  url: '/design-tools/qr-generator',
}

const relatedTools = [
  { name: 'QR Generator', href: '/web-tools/qr-generator' },
  { name: 'Favicon Generator', href: '/design-tools/favicon-generator' },
  { name: 'Color Contrast Checker', href: '/design-tools/contrast-checker' },
]

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
type QRSize = '128' | '256' | '512'

const ERROR_LEVEL_LABELS: Record<ErrorCorrectionLevel, { label: string; description: string }> = {
  L: { label: 'Low (7%)', description: 'Smaller QR code, less damage tolerance' },
  M: { label: 'Medium (15%)', description: 'Good balance for most uses' },
  Q: { label: 'Quartile (25%)', description: 'Better for printed materials' },
  H: { label: 'High (30%)', description: 'Best for logos overlaid on QR code' },
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value)
}

export default function QRGeneratorPage() {
  const [content, setContent] = useState('https://example.com')
  const [size, setSize] = useState<QRSize>('256')
  const [fgColor, setFgColor] = useState('#171310')
  const [bgColor, setBgColor] = useState('#FFFEFA')
  const [ecc, setEcc] = useState<ErrorCorrectionLevel>('M')
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    const generate = async () => {
      if (!content.trim() || !isHexColor(fgColor) || !isHexColor(bgColor)) {
        setQrUrl('')
        return
      }

      try {
        const dataUrl = await QRCode.toDataURL(content.trim(), {
          width: parseInt(size, 10),
          margin: 1,
          errorCorrectionLevel: ecc,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        })
        if (!cancelled) setQrUrl(dataUrl)
      } catch {
        if (!cancelled) setQrUrl('')
      }
    }

    void generate()
    return () => {
      cancelled = true
    }
  }, [content, size, fgColor, bgColor, ecc])

  const handleDownload = useCallback(async () => {
    if (!qrUrl) return
    setIsDownloading(true)
    try {
      const anchor = document.createElement('a')
      anchor.href = qrUrl
      const safeName = content.trim().replace(/[^a-z0-9]/gi, '-').slice(0, 40) || 'qr-code'
      anchor.download = `${safeName}-qr.png`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    } catch {
      // The browser can block downloads from data URLs in some hardened contexts.
    } finally {
      setIsDownloading(false)
    }
  }, [qrUrl, content])

  const handleCopyUrl = useCallback(async () => {
    if (!qrUrl) return
    await navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [qrUrl])

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for any URL, text, or data with custom size, colors, and error correction."
      category="Design Tools"
      categoryHref="/design-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="qr-generator-design" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Configuration + Preview grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: controls */}
          <div className="lg:col-span-3 space-y-5">

            {/* Content input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-accent" />
                  Content
                </CardTitle>
                <CardDescription>Enter a URL, plain text, phone number, or any other data to encode.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-content">Text or URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setContent('')}
                      title="Clear content"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  {content.trim().length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {content.trim().length} character{content.trim().length !== 1 ? 's' : ''} encoded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="13.5" cy="6.5" r="2.5" />
                    <circle cx="6.5" cy="13.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                    <path d="M10.5 13.5a3 3 0 0 1 3 3M13.5 9a3 3 0 0 1-3 3" />
                  </svg>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div className="space-y-2">
                    <Label htmlFor="qr-size">Size</Label>
                    <Select value={size} onValueChange={(v) => setSize(v as QRSize)}>
                      <SelectTrigger id="qr-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128 × 128 px — small</SelectItem>
                        <SelectItem value="256">256 × 256 px — medium</SelectItem>
                        <SelectItem value="512">512 × 512 px — large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-ecc">Error Correction</Label>
                    <Select value={ecc} onValueChange={(v) => setEcc(v as ErrorCorrectionLevel)}>
                      <SelectTrigger id="qr-ecc">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ERROR_LEVEL_LABELS) as ErrorCorrectionLevel[]).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level} — {ERROR_LEVEL_LABELS[level].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {ERROR_LEVEL_LABELS[ecc].description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-fg">Foreground color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-fg"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-9 w-10 rounded border border-border bg-card cursor-pointer p-0.5"
                      />
                      <Input
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        placeholder="#171310"
                        className="font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-bg">Background color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-bg"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-10 rounded border border-border bg-card cursor-pointer p-0.5"
                      />
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#FFFEFA"
                        className="font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right: preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-accent" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrUrl ? (
                  <>
                    <div className="flex justify-center">
                      <div
                        className="rounded-md border border-border p-3 inline-flex"
                        style={{ backgroundColor: bgColor }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt={`QR code for: ${content}`}
                          width={parseInt(size)}
                          height={parseInt(size)}
                          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading ? 'Downloading…' : 'Download PNG'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Image Data'}
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Image Data URL</p>
                      <div className="bg-muted rounded-lg p-3 overflow-x-auto">
                        <code className="text-xs break-all text-foreground font-mono leading-relaxed">
                          {qrUrl}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This data URL contains the generated PNG image.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <QrCode className="h-12 w-12 opacity-25" />
                    <p className="text-sm text-center">Enter content above to generate a QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Error correction explainer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Error Correction Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(ERROR_LEVEL_LABELS) as ErrorCorrectionLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEcc(level)}
                  className={`text-left rounded-lg border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    ecc === level
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-card hover:border-accent/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge
                      variant={ecc === level ? 'default' : 'secondary'}
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      {level}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium">{ERROR_LEVEL_LABELS[level].label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {ERROR_LEVEL_LABELS[level].description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Local generation notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            QR codes are generated locally in your browser. Nothing is sent to an external QR API.
            Avoid putting passwords or private keys in QR codes unless you understand where they
            will be stored or scanned.
          </AlertDescription>
        </Alert>

      </div>
    </ToolLayout>
  )
}
