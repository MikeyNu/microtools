'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  Info,
  CheckCircle,
  X,
  FileSpreadsheet,
  FileCode,
  AlignLeft,
  ArrowRight,
} from 'lucide-react'
import { escapeHtml } from '@/lib/pdf-text-extractor'
import { extractPdfTextPages } from '@/lib/pdfjs-text'

// ── Tool metadata ────────────────────────────────────────────────────────────

const TOOL = {
  id: 'pdf-converter',
  name: 'PDF Converter',
  description: 'Convert readable PDF text into TXT, DOC, XLS, or HTML files.',
  category: 'pdf-tools',
  url: '/pdf-tools/convert',
}

const RELATED_TOOLS = [
  { name: 'PDF to Word', href: '/pdf-tools/pdf-to-word' },
  { name: 'PDF to Excel', href: '/pdf-tools/pdf-to-excel' },
  { name: 'PDF Compressor', href: '/pdf-tools/compress' },
]

// ── Format definitions ───────────────────────────────────────────────────────

type FormatId = 'txt' | 'doc' | 'xls' | 'html'

interface OutputFormat {
  id: FormatId
  label: string
  ext: string
  mime: string
  icon: React.ReactNode
  description: string
}

const FORMATS: OutputFormat[] = [
  {
    id: 'txt',
    label: 'Plain Text',
    ext: '.txt',
    mime: 'text/plain',
    icon: <AlignLeft className="h-4 w-4" />,
    description: 'Extracts readable text from text-based PDFs.',
  },
  {
    id: 'doc',
    label: 'Word-readable Document',
    ext: '.doc',
    mime: 'application/msword',
    icon: <FileText className="h-4 w-4" />,
    description: 'Creates a Word-readable document from extracted PDF text.',
  },
  {
    id: 'xls',
    label: 'Excel-compatible Table',
    ext: '.xls',
    mime: 'application/vnd.ms-excel',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    description: 'Creates a simple Excel-compatible table from extracted PDF text rows.',
  },
  {
    id: 'html',
    label: 'HTML',
    ext: '.html',
    mime: 'text/html',
    icon: <FileCode className="h-4 w-4" />,
    description: 'Creates a clean HTML document from extracted PDF text.',
  },
]

// ── Utilities ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function textToParagraphHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

function textToRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes('\t')) return line.split('\t').map((cell) => cell.trim()).filter(Boolean)
      if (line.includes('|')) return line.split('|').map((cell) => cell.trim()).filter(Boolean)
      if (/\s{2,}/.test(line)) return line.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean)
      if ((line.match(/,/g) ?? []).length >= 2) return line.split(',').map((cell) => cell.trim()).filter(Boolean)
      return [line]
    })
}

function createHtmlDocument(title: string, body: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.5; color: #171310; }
    p { margin: 0 0 12pt; }
    table { border-collapse: collapse; }
    td { border: 1px solid #b8afa4; padding: 4px 8px; }
  </style>
</head>
<body>
${body}
</body>
</html>`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PDFConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [formatId, setFormatId] = useState<FormatId>('txt')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedFormat = FORMATS.find((f) => f.id === formatId) ?? FORMATS[4]

  const resetResult = () => {
    setExtractedText(null)
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    setDownloadName('')
    setError(null)
  }

  const handleFile = useCallback(
    (incoming: File | null) => {
      if (!incoming) return
      if (incoming.type !== 'application/pdf' && !incoming.name.endsWith('.pdf')) {
        setError('Please upload a valid PDF file.')
        return
      }
      if (incoming.size > 100 * 1024 * 1024) {
        setError('File exceeds the 100 MB limit.')
        return
      }
      setFile(incoming)
      resetResult()
      setError(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [downloadUrl]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleRemoveFile = () => {
    setFile(null)
    resetResult()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConvert = async () => {
    if (!file) return
    setIsConverting(true)
    setError(null)
    resetResult()

    try {
      const pages = await extractPdfTextPages(file)
      const text = pages.map((page) => page.text.trim()).filter(Boolean).join('\n\n')

      if (!text) {
        setError(
          'No readable text was found in this PDF. The file may be scanned, image-based, or use an unsupported encoding. Use OCR first, then try again.'
        )
        return
      }

      const baseName = file.name.replace(/\.pdf$/i, '')
      let blob: Blob

      if (selectedFormat.id === 'txt') {
        blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      } else if (selectedFormat.id === 'doc') {
        blob = new Blob([createHtmlDocument(file.name, textToParagraphHtml(text))], {
          type: 'application/msword;charset=utf-8',
        })
      } else if (selectedFormat.id === 'xls') {
        const rows = textToRows(text)
        const table = rows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
          .join('\n')
        blob = new Blob([createHtmlDocument(file.name, `<table>\n${table}\n</table>`)], {
          type: 'application/vnd.ms-excel;charset=utf-8',
        })
      } else {
        blob = new Blob([createHtmlDocument(file.name, textToParagraphHtml(text))], {
          type: 'text/html;charset=utf-8',
        })
      }

      setExtractedText(text)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadName(`${baseName}${selectedFormat.ext}`)
    } catch (err) {
      setError('Something went wrong reading the PDF. It may be encrypted, damaged, or unsupported by browser-based extraction.')
    } finally {
      setIsConverting(false)
    }
  }

  const hasResult = downloadUrl !== null

  return (
    <ToolLayout
      title="PDF Converter"
      description="Convert readable PDF text into TXT, DOC, XLS, or HTML files."
      category="PDF Tools"
      categoryHref="/pdf-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={TOOL.id} />
          <ShareButton tool={TOOL} />
        </div>

        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF
            </CardTitle>
            <CardDescription>
              Select or drag a PDF file to convert. Maximum file size: 100 MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                className={[
                  'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isDragOver
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30',
                ].join(' ')}
              >
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {isDragOver ? 'Drop the PDF here' : 'Click to browse or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">PDF files only · up to 100 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleInputChange}
                  aria-label="Upload PDF file"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Format selection card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Output Format
            </CardTitle>
            <CardDescription>
              Choose the file format to convert your PDF into.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="format-select">Convert to</Label>
              <Select
                value={formatId}
                onValueChange={(val) => {
                  setFormatId(val as FormatId)
                  resetResult()
                }}
              >
                <SelectTrigger id="format-select" className="w-full sm:w-72">
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((fmt) => (
                    <SelectItem key={fmt.id} value={fmt.id}>
                      <span className="flex items-center gap-2">
                        {fmt.icon}
                        {fmt.label}
                        <span className="text-muted-foreground text-xs">{fmt.ext}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format description */}
            <div className="flex gap-3 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
              <span>{selectedFormat.description}</span>
            </div>

            {/* Format grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    setFormatId(fmt.id)
                    resetResult()
                  }}
                  className={[
                    'flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    formatId === fmt.id
                      ? 'border-accent bg-accent/5 text-foreground'
                      : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30 text-muted-foreground',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex items-center gap-1.5 text-xs font-medium',
                      formatId === fmt.id ? 'text-accent' : '',
                    ].join(' ')}
                  >
                    {fmt.icon}
                    {fmt.ext}
                  </span>
                  <span className="text-xs leading-tight">{fmt.label}</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 mt-0.5">
                    In-browser
                  </Badge>
                </button>
              ))}
            </div>

            {/* Convert button */}
            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
              className="w-full sm:w-auto"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Convert to {selectedFormat.label}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result: plain text extraction */}
        {hasResult && extractedText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Conversion Complete
              </CardTitle>
              <CardDescription>
                {extractedText.length.toLocaleString()} characters extracted from{' '}
                <span className="font-medium text-foreground">{file?.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <pre className="bg-muted rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed">
                  {extractedText}
                </pre>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={downloadUrl!} download={downloadName}>
                    <Download className="h-4 w-4 mr-2" />
                    Download {downloadName}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText)
                  }}
                >
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRemoveFile()
                  }}
                >
                  Convert Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How Conversion Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Local text extraction</p>
                <p>
                  Your PDF never leaves your device. The page reads text layers locally with
                  a browser PDF parser. Text-based PDFs work best; scanned documents need OCR first.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Generated files</p>
                <p>
                  TXT, DOC, XLS, and HTML downloads are generated from extracted text. Complex
                  layout, images, and scanned content are not reconstructed by this browser-only tool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
