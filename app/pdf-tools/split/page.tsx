'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Scissors,
  Upload,
  FileText,
  X,
  Info,
  ChevronRight,
  Layers,
  Hash,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { bytesToArrayBuffer } from '@/lib/blob-utils'

const toolObj = {
  id: 'pdf-splitter',
  name: 'PDF Splitter',
  description: 'Split a PDF into multiple files by page range, interval, or specific page selection.',
  category: 'pdf-tools',
  url: '/pdf-tools/split',
}

const relatedTools = [
  { name: 'PDF Merge', href: '/pdf-tools/merge' },
  { name: 'PDF Compressor', href: '/pdf-tools/compress' },
  { name: 'PDF Converter', href: '/pdf-tools/convert' },
]

type SplitMode = 'ranges' | 'interval' | 'pages'

interface SplitSegment {
  label: string
  pages: number[]
  fileName: string
}

interface SplitOutput extends SplitSegment {
  downloadUrl: string
  size: number
}

function parsePageRanges(input: string, totalPages: number): { segments: SplitSegment[]; error: string | null } {
  const trimmed = input.trim()
  if (!trimmed) return { segments: [], error: 'Please enter at least one page range.' }

  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
  const segments: SplitSegment[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
    const singleMatch = part.match(/^(\d+)$/)

    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      if (start < 1 || end < 1) return { segments: [], error: `Page numbers must be 1 or greater (got "${part}").` }
      if (start > end) return { segments: [], error: `Start page must not exceed end page in "${part}".` }
      if (end > totalPages) return { segments: [], error: `Page ${end} exceeds document length (${totalPages} pages).` }
      const pages: number[] = []
      for (let p = start; p <= end; p++) pages.push(p)
      segments.push({ label: `Pages ${start}–${end}`, pages, fileName: `split_${i + 1}_pages_${start}-${end}.pdf` })
    } else if (singleMatch) {
      const page = parseInt(singleMatch[1], 10)
      if (page < 1) return { segments: [], error: `Page numbers must be 1 or greater (got "${part}").` }
      if (page > totalPages) return { segments: [], error: `Page ${page} exceeds document length (${totalPages} pages).` }
      segments.push({ label: `Page ${page}`, pages: [page], fileName: `split_${i + 1}_page_${page}.pdf` })
    } else {
      return { segments: [], error: `"${part}" is not a valid page range. Use formats like 1-3 or 5.` }
    }
  }

  return { segments, error: null }
}

function parseInterval(input: string, totalPages: number): { segments: SplitSegment[]; error: string | null } {
  const n = parseInt(input, 10)
  if (!input.trim() || isNaN(n) || n < 1) return { segments: [], error: 'Enter a positive whole number.' }
  if (n >= totalPages) return { segments: [], error: `Interval must be less than the total page count (${totalPages}).` }

  const segments: SplitSegment[] = []
  let start = 1
  let idx = 1
  while (start <= totalPages) {
    const end = Math.min(start + n - 1, totalPages)
    const pages: number[] = []
    for (let p = start; p <= end; p++) pages.push(p)
    segments.push({ label: `Pages ${start}–${end}`, pages, fileName: `split_${idx}_pages_${start}-${end}.pdf` })
    start += n
    idx++
  }
  return { segments, error: null }
}

function parseSpecificPages(input: string, totalPages: number): { segments: SplitSegment[]; error: string | null } {
  const trimmed = input.trim()
  if (!trimmed) return { segments: [], error: 'Please enter at least one page number.' }

  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
  const pages: number[] = []

  for (const part of parts) {
    const n = parseInt(part, 10)
    if (isNaN(n) || n < 1) return { segments: [], error: `"${part}" is not a valid page number.` }
    if (n > totalPages) return { segments: [], error: `Page ${n} exceeds document length (${totalPages} pages).` }
    if (!pages.includes(n)) pages.push(n)
  }

  pages.sort((a, b) => a - b)
  const segments: SplitSegment[] = pages.map((p, i) => ({
    label: `Page ${p}`,
    pages: [p],
    fileName: `extracted_${i + 1}_page_${p}.pdf`,
  }))
  return { segments, error: null }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`
}

async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  return pdf.getPageCount()
}

export default function PDFSplitterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [splitMode, setSplitMode] = useState<SplitMode>('ranges')
  const [rangeInput, setRangeInput] = useState('1-3, 4-6, 7')
  const [intervalInput, setIntervalInput] = useState('1')
  const [pagesInput, setPagesInput] = useState('1, 3, 5')
  const [totalPages, setTotalPages] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [preview, setPreview] = useState<SplitSegment[]>([])
  const [outputFiles, setOutputFiles] = useState<SplitOutput[]>([])
  const [hasSplit, setHasSplit] = useState(false)
  const [isReadingPdf, setIsReadingPdf] = useState(false)
  const [isSplitting, setIsSplitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearOutputUrls = () => {
    outputFiles.forEach((output) => URL.revokeObjectURL(output.downloadUrl))
    setOutputFiles([])
  }

  const handleFile = async (incoming: File) => {
    if (incoming.type !== 'application/pdf' && !incoming.name.toLowerCase().endsWith('.pdf')) {
      setValidationError('Only PDF files are supported.')
      return
    }
    if (incoming.size > 100 * 1024 * 1024) {
      setValidationError('PDF files must be 100 MB or smaller.')
      return
    }

    setIsReadingPdf(true)
    setValidationError(null)
    setFile(null)
    setHasSplit(false)
    setPreview([])
    clearOutputUrls()

    try {
      const pageCount = await getPdfPageCount(incoming)
      setFile(incoming)
      setTotalPages(pageCount)
      setRangeInput(pageCount >= 3 ? '1-3' : `1-${pageCount}`)
      setIntervalInput(pageCount > 1 ? '1' : String(pageCount))
      setPagesInput(pageCount >= 5 ? '1, 3, 5' : '1')
    } catch (err) {
      setTotalPages(0)
      setValidationError('Unable to read this PDF. It may be encrypted, damaged, or unsupported by browser-based parsing.')
    } finally {
      setIsReadingPdf(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) void handleFile(dropped)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => setIsDragActive(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) void handleFile(selected)
  }

  const removeFile = () => {
    setFile(null)
    setPreview([])
    clearOutputUrls()
    setHasSplit(false)
    setValidationError(null)
    setTotalPages(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const computePreview = (): { segments: SplitSegment[]; error: string | null } => {
    if (splitMode === 'ranges') return parsePageRanges(rangeInput, totalPages)
    if (splitMode === 'interval') return parseInterval(intervalInput, totalPages)
    return parseSpecificPages(pagesInput, totalPages)
  }

  const handleSplit = async () => {
    if (!file) {
      setValidationError('Please upload a PDF file first.')
      return
    }
    const { segments, error } = computePreview()
    if (error) {
      setValidationError(error)
      setPreview([])
      return
    }
    setValidationError(null)
    setIsSplitting(true)
    clearOutputUrls()

    try {
      const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
      const outputs: SplitOutput[] = []

      for (const segment of segments) {
        const outputPdf = await PDFDocument.create()
        const pages = await outputPdf.copyPages(sourcePdf, segment.pages.map((page) => page - 1))
        pages.forEach((page) => outputPdf.addPage(page))
        const bytes = await outputPdf.save({ useObjectStreams: true })
        const blob = new Blob([bytesToArrayBuffer(bytes)], { type: 'application/pdf' })
        outputs.push({
          ...segment,
          size: blob.size,
          downloadUrl: URL.createObjectURL(blob),
        })
      }

      setPreview(segments)
      setOutputFiles(outputs)
      setHasSplit(true)
    } catch (err) {
      setPreview([])
      setOutputFiles([])
      setValidationError('Unable to split this PDF. It may be encrypted, damaged, or unsupported by browser-based parsing.')
    } finally {
      setIsSplitting(false)
    }
  }

  const resetAll = () => {
    setFile(null)
    setPreview([])
    clearOutputUrls()
    setHasSplit(false)
    setValidationError(null)
    setTotalPages(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const livePreview = file ? computePreview() : { segments: [], error: null }

  return (
    <ToolLayout
      title="PDF Splitter"
      description="Split a PDF into multiple files by page range, interval, or specific page selection."
      category="PDF Tools"
      categoryHref="/pdf-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="pdf-splitter" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Browser limitation notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Private local split:</strong> This tool reads and splits PDFs in your browser with{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">pdf-lib</code>. Nothing is uploaded.
            Password-protected or damaged PDFs may fail to open.
          </AlertDescription>
        </Alert>

        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF
            </CardTitle>
            <CardDescription>
              Drop a single PDF file here, or click to browse. Max 100 MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors select-none ${
                  isDragActive
                    ? 'border-accent bg-muted'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={handleInputChange}
                />
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-base font-medium text-muted-foreground mb-1">
                  {isReadingPdf
                    ? 'Reading PDF...'
                    : isDragActive
                      ? 'Release to upload'
                      : 'Drop your PDF here, or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">PDF files only — up to 100 MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}&ensp;&middot;&ensp;
                      <span className="font-medium">{totalPages} pages detected</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive ml-3 shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Split mode configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Split Configuration
            </CardTitle>
            <CardDescription>Choose a split method and configure the parameters below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode selector */}
            <div className="space-y-2">
              <Label>Split method</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: 'ranges' as SplitMode, icon: Layers, label: 'By page ranges', desc: 'Define custom ranges' },
                    { id: 'interval' as SplitMode, icon: Hash, label: 'Every N pages', desc: 'Fixed-size chunks' },
                    { id: 'pages' as SplitMode, icon: ListFilter, label: 'Extract pages', desc: 'Pick individual pages' },
                  ] as { id: SplitMode; icon: React.ElementType; label: string; desc: string }[]
                ).map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSplitMode(id)
                      setValidationError(null)
                      setHasSplit(false)
                      setPreview([])
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      splitMode === id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-muted-foreground/50 hover:bg-muted/40'
                    }`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 w-8 h-8 rounded flex items-center justify-center ${
                        splitMode === id ? 'bg-accent/10' : 'bg-muted'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${splitMode === id ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium leading-tight ${splitMode === id ? 'text-accent' : 'text-foreground'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode-specific input */}
            {splitMode === 'ranges' && (
              <div className="space-y-2">
                <Label htmlFor="range-input">Page ranges</Label>
                <Input
                  id="range-input"
                  value={rangeInput}
                  onChange={e => {
                    setRangeInput(e.target.value)
                    setHasSplit(false)
                    setValidationError(null)
                  }}
                  placeholder="e.g. 1-3, 4-6, 7"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated ranges or single page numbers. Example: <code className="bg-muted px-1 rounded">1-3, 4-6, 7</code> produces three output files.
                </p>
              </div>
            )}

            {splitMode === 'interval' && (
              <div className="space-y-2">
                <Label htmlFor="interval-input">Split every N pages</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="interval-input"
                    type="number"
                    min={1}
                    value={intervalInput}
                    onChange={e => {
                      setIntervalInput(e.target.value)
                      setHasSplit(false)
                      setValidationError(null)
                    }}
                    className="w-32"
                    placeholder="1"
                  />
                  <span className="text-sm text-muted-foreground">pages per output file</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A {totalPages}-page document split every {intervalInput || 'N'} pages will produce{' '}
                  {intervalInput && parseInt(intervalInput) > 0
                    ? Math.ceil(totalPages / parseInt(intervalInput))
                    : '—'}{' '}
                  output files.
                </p>
              </div>
            )}

            {splitMode === 'pages' && (
              <div className="space-y-2">
                <Label htmlFor="pages-input">Page numbers to extract</Label>
                <Input
                  id="pages-input"
                  value={pagesInput}
                  onChange={e => {
                    setPagesInput(e.target.value)
                    setHasSplit(false)
                    setValidationError(null)
                  }}
                  placeholder="e.g. 1, 3, 5, 8"
                />
                <p className="text-xs text-muted-foreground">
                  Each listed page becomes its own single-page PDF file.
                </p>
              </div>
            )}

            {/* Validation error */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Live configuration preview (before splitting) */}
            {file && !hasSplit && livePreview.segments.length > 0 && !validationError && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Configuration preview &mdash; {livePreview.segments.length} output {livePreview.segments.length === 1 ? 'file' : 'files'}
                </p>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {livePreview.segments.map((seg, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-medium shrink-0">{seg.label}</span>
                        <span className="text-muted-foreground truncate">&rarr; {seg.fileName}</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0 font-mono text-xs tabular-nums">
                        {seg.pages.length}p
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={handleSplit} disabled={!file || isSplitting} className="flex-1 sm:flex-none sm:min-w-36">
                <Scissors className="h-4 w-4 mr-2" />
                {isSplitting ? 'Splitting...' : 'Split PDF'}
              </Button>
              {(file || hasSplit) && (
                <Button variant="outline" onClick={resetAll}>
                  Start over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Split results */}
        {hasSplit && preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Split Plan
              </CardTitle>
              <CardDescription>
                {preview.length} output {preview.length === 1 ? 'file' : 'files'} from &ldquo;{file?.name}&rdquo;
                &ensp;&mdash;&ensp;{totalPages} pages total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These downloads were generated locally in this browser. The original PDF was not uploaded.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {outputFiles.map((seg, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{seg.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {seg.label} &middot; {formatFileSize(seg.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                        {seg.pages.length}&nbsp;{seg.pages.length === 1 ? 'page' : 'pages'}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <a href={seg.downloadUrl} download={seg.fileName}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-sm text-muted-foreground border-t border-border">
                <span>
                  Total pages covered:{' '}
                  <strong className="text-foreground tabular-nums">
                    {preview.reduce((acc, s) => acc + s.pages.length, 0)}
                  </strong>{' '}
                  of {totalPages}
                </span>
                <span className="text-muted-foreground">
                  {preview.length} file{preview.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              How to use this tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">By ranges</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter comma-separated ranges like <code className="bg-muted px-1 rounded">1-4, 5-8, 9</code>. Each group becomes one output file — useful for splitting a report into chapters.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Every N pages</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter a number to create equal-sized chunks. A 12-page PDF split every 3 pages gives four 3-page files automatically.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Extract pages</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  List individual pages like <code className="bg-muted px-1 rounded">2, 5, 7</code>. Each page is saved as its own single-page PDF — handy for extracting specific forms or diagrams.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
