"use client"

import { useState, useRef, useCallback } from "react"
import { ImageIcon, Download, UploadCloud, ArrowRightLeft, FileImage, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolLayout } from "@/components/tool-layout"
import { FavoriteButton, ShareButton } from "@/components/user-engagement"

const toolObj = {
  id: "image-converter",
  name: "Image Format Converter",
  description: "Convert images between JPEG, PNG, WebP, and BMP formats instantly in your browser.",
  category: "converters",
  url: "/converters/image",
}

const relatedTools = [
  { name: "File Size Converter", href: "/converters/file-size" },
  { name: "Color Converter", href: "/converters/color" },
  { name: "WebP Converter", href: "/image-tools/webp-converter" },
]

interface OutputFormat {
  value: string
  label: string
  mime: string
  ext: string
}

const OUTPUT_FORMATS: OutputFormat[] = [
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  { value: "png", label: "PNG", mime: "image/png", ext: "png" },
  { value: "webp", label: "WebP", mime: "image/webp", ext: "webp" },
  { value: "bmp", label: "BMP", mime: "image/bmp", ext: "bmp" },
]

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFormatFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/bmp": "BMP",
    "image/gif": "GIF",
    "image/tiff": "TIFF",
    "image/svg+xml": "SVG",
    "image/avif": "AVIF",
  }
  return map[mime] || mime.replace("image/", "").toUpperCase()
}

interface ImageInfo {
  name: string
  size: number
  format: string
  width: number
  height: number
  dataUrl: string
}

interface ConversionResult {
  dataUrl: string
  size: number
  format: string
  ext: string
  filename: string
}

export default function ImageConverterPage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [outputFormat, setOutputFormat] = useState<string>("webp")
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setResult(null)

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP, BMP, etc.).")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 20 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        setImageInfo({
          name: file.name,
          size: file.size,
          format: getFormatFromMime(file.type),
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataUrl,
        })
      }
      img.onerror = () => {
        setError("Could not read the image. The file may be corrupted or in an unsupported format.")
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.")
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so re-uploading same file triggers onChange
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleConvert = () => {
    if (!imageInfo || !canvasRef.current) return

    setIsConverting(true)
    setError(null)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setError("Canvas context unavailable. Please try a different browser.")
      setIsConverting(false)
      return
    }

    const img = new window.Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      // For JPEG and BMP, fill white background (no transparency support)
      const fmt = OUTPUT_FORMATS.find((f) => f.value === outputFormat)!
      if (fmt.mime === "image/jpeg" || fmt.mime === "image/bmp") {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      try {
        const quality = fmt.mime === "image/jpeg" ? 0.92 : undefined
        const convertedDataUrl = quality !== undefined
          ? canvas.toDataURL(fmt.mime, quality)
          : canvas.toDataURL(fmt.mime)

        // Estimate output size from base64 length
        const base64 = convertedDataUrl.split(",")[1] || ""
        const estimatedSize = Math.round((base64.length * 3) / 4)

        const originalBaseName = imageInfo.name.replace(/\.[^.]+$/, "")
        const filename = `${originalBaseName}.${fmt.ext}`

        setResult({
          dataUrl: convertedDataUrl,
          size: estimatedSize,
          format: fmt.label,
          ext: fmt.ext,
          filename,
        })
      } catch (err) {
        setError("Conversion failed. Your browser may not support converting to this format. Try a different output format.")
      }

      setIsConverting(false)
    }
    img.onerror = () => {
      setError("Failed to load the image for conversion.")
      setIsConverting(false)
    }
    img.src = imageInfo.dataUrl
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a")
    link.href = result.dataUrl
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedFormat = OUTPUT_FORMATS.find((f) => f.value === outputFormat)

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between JPEG, PNG, WebP, and BMP formats instantly in your browser — no upload to a server."
      category="Converters"
      categoryHref="/converters"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement bar */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="image-converter" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="size-4 text-accent" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Drag and drop an image here, or click to browse. Supports JPEG, PNG, WebP, BMP, GIF, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload image"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={[
                "relative flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-6 py-10 cursor-pointer transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isDragging
                  ? "border-accent bg-accent/5"
                  : "border-border/60 hover:border-accent/60 hover:bg-muted/40",
              ].join(" ")}
            >
              <FileImage className={["size-10 transition-colors", isDragging ? "text-accent" : "text-muted-foreground"].join(" ")} />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Drop to upload" : "Drop an image here"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">or click to browse · max 20 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleInputChange}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>

            {/* Loaded image preview + info */}
            {imageInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Preview */}
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[140px]">
                  <img
                    src={imageInfo.dataUrl}
                    alt="Uploaded image preview"
                    className="max-h-48 max-w-full object-contain rounded"
                    style={{ imageRendering: "auto" }}
                  />
                </div>

                {/* Original info */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Original</p>
                  <InfoRow label="Name" value={imageInfo.name} truncate />
                  <InfoRow label="Format" value={<Badge variant="secondary">{imageInfo.format}</Badge>} />
                  <InfoRow label="Size" value={formatBytes(imageInfo.size)} />
                  <InfoRow label="Dimensions" value={`${imageInfo.width} × ${imageInfo.height} px`} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-accent" />
              Conversion Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="output-format">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger id="output-format" className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTPUT_FORMATS.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleConvert}
                disabled={!imageInfo || isConverting}
                className="sm:w-auto w-full"
              >
                <ImageIcon className="size-4" />
                {isConverting ? "Converting…" : "Convert Image"}
              </Button>
            </div>

            {/* Format notes */}
            {selectedFormat && (
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                {selectedFormat.value === "jpeg" && "JPEG is best for photographs. Transparent areas will become white. Lossy compression — ideal for small file sizes."}
                {selectedFormat.value === "png" && "PNG preserves transparency and uses lossless compression. Best for graphics, screenshots, and images with text."}
                {selectedFormat.value === "webp" && "WebP offers superior compression for both photos and graphics. Supports transparency. Widely supported in modern browsers."}
                {selectedFormat.value === "bmp" && "BMP is an uncompressed format producing large files. Transparent areas become white. Compatible with legacy Windows software."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Converted Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Result preview */}
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[140px]">
                  <img
                    src={result.dataUrl}
                    alt="Converted image preview"
                    className="max-h-48 max-w-full object-contain rounded"
                  />
                </div>

                {/* Output info */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Output</p>
                  <InfoRow label="Filename" value={result.filename} truncate />
                  <InfoRow label="Format" value={<Badge variant="secondary">{result.format}</Badge>} />
                  <InfoRow label="Est. size" value={formatBytes(result.size)} />
                  {imageInfo && (
                    <InfoRow
                      label="Size change"
                      value={
                        <span className={result.size < imageInfo.size ? "text-success" : "text-warning"}>
                          {result.size < imageInfo.size
                            ? `${Math.round((1 - result.size / imageInfo.size) * 100)}% smaller`
                            : `${Math.round((result.size / imageInfo.size - 1) * 100)}% larger`}
                        </span>
                      }
                    />
                  )}
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full sm:w-auto">
                <Download className="size-4" />
                Download {result.format} file
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hidden canvas for conversion */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>
    </ToolLayout>
  )
}

// Small helper for key-value rows inside info panels
function InfoRow({
  label,
  value,
  truncate,
}: {
  label: string
  value: React.ReactNode
  truncate?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={["font-medium text-right", truncate ? "truncate max-w-[160px]" : ""].join(" ")}>
        {value}
      </span>
    </div>
  )
}
