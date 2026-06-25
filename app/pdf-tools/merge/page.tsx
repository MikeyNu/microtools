'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Download,
  X,
  ChevronUp,
  ChevronDown,
  Layers,
  Info,
  GripVertical,
  FilePlus2,
  BookOpen,
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { bytesToArrayBuffer } from '@/lib/blob-utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PDFEntry {
  id: string
  file: File
  pageCount: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function uid(): string {
  return crypto.randomUUID()
}

async function estimatePageCount(file: File): Promise<number | null> {
  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
    return pdf.getPageCount()
  } catch {
    return null
  }
}

// ─── Tool metadata ─────────────────────────────────────────────────────────────

const TOOL = {
  id: 'pdf-merger',
  name: 'PDF Merger',
  description: 'Arrange and preview multiple PDF files before merging them into one document.',
  category: 'pdf-tools',
  url: '/pdf-tools/merge',
}

const RELATED_TOOLS = [
  { name: 'PDF Split', href: '/pdf-tools/split' },
  { name: 'PDF Compressor', href: '/pdf-tools/compress' },
  { name: 'PDF Converter', href: '/pdf-tools/convert' },
]

// ─── Page Component ────────────────────────────────────────────────────────────

export default function PDFMergerPage() {
  const [entries, setEntries] = useState<PDFEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File ingestion ──────────────────────────────────────────────────────────

  const ingestFiles = useCallback(async (rawFiles: FileList | File[]) => {
    const pdfs = Array.from(rawFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    if (pdfs.length === 0) return

    const newEntries: PDFEntry[] = await Promise.all(
      pdfs.map(async (file) => {
        const pageCount = await estimatePageCount(file)
        return { id: uid(), file, pageCount }
      })
    )

    setEntries((prev) => [...prev, ...newEntries])
    setPreviewVisible(false)
    setMergeError(null)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) ingestFiles(e.target.files)
    // Reset so the same file can be re-added after removal
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) ingestFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  // ── Ordering ────────────────────────────────────────────────────────────────

  const moveUp = (index: number) => {
    if (index === 0) return
    setEntries((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
    setPreviewVisible(false)
  }

  const moveDown = (index: number) => {
    setEntries((prev) => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
    setPreviewVisible(false)
  }

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setPreviewVisible(false)
  }

  const clearAll = () => {
    setEntries([])
    setPreviewVisible(false)
    setMergeError(null)
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalBytes = entries.reduce((sum, e) => sum + e.file.size, 0)
  const totalPages = entries.reduce((sum, e) => sum + (e.pageCount ?? 0), 0)
  const allPagesKnown = entries.length > 0 && entries.every((e) => e.pageCount !== null)

  // ── Preview generation ──────────────────────────────────────────────────────

  const handlePreview = () => {
    if (entries.length < 2) return
    setPreviewVisible(true)
  }

  const handleMergeDownload = async () => {
    if (entries.length < 2) return

    setIsMerging(true)
    setMergeError(null)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const entry of entries) {
        const bytes = await entry.file.arrayBuffer()
        const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedBytes = await mergedPdf.save({ useObjectStreams: true })
      const blob = new Blob([bytesToArrayBuffer(mergedBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `merged-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setPreviewVisible(true)
    } catch (err) {
      setMergeError(
        'Unable to merge these PDFs. One file may be encrypted, damaged, or use a PDF feature this browser-based merger cannot read.'
      )
    } finally {
      setIsMerging(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine multiple PDF files into a single document. Add files, arrange their order, then preview the merge sequence."
      category="PDF Tools"
      categoryHref="/pdf-tools"
      relatedTools={RELATED_TOOLS}
    >
      {/* Engagement bar */}
      <div className="flex justify-end gap-2 mb-6">
        <FavoriteButton toolId={TOOL.id} />
        <ShareButton tool={TOOL} />
      </div>

      <div className="space-y-6">

        {/* ── Drop zone ──────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-accent" />
              Add PDF Files
            </CardTitle>
            <CardDescription>
              Drop files anywhere in this zone, or click to browse. Add as many PDFs as you need — then arrange their order below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop PDF files here or click to choose"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              className={[
                'relative flex flex-col items-center justify-center gap-3',
                'rounded-md border-2 border-dashed px-6 py-12',
                'cursor-pointer select-none transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                dragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30',
              ].join(' ')}
            >
              <Upload
                className={[
                  'h-10 w-10 transition-colors',
                  dragOver ? 'text-accent' : 'text-muted-foreground/50',
                ].join(' ')}
              />
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {dragOver ? 'Release to add files' : 'Drag PDF files here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-accent underline underline-offset-2">click to browse</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Accepts .pdf files only</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="sr-only"
              onChange={handleInputChange}
              aria-hidden="true"
            />
          </CardContent>
        </Card>

        {/* ── File list ──────────────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-accent" />
                    Merge Order
                    <Badge variant="secondary" className="ml-1 font-mono text-xs">
                      {entries.length} {entries.length === 1 ? 'file' : 'files'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Use the arrows to reorder. The merged PDF will follow this sequence top to bottom.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="shrink-0 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Clear all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5"
                >
                  {/* Drag handle icon (decorative) */}
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />

                  {/* PDF icon with sequence number */}
                  <div className="relative shrink-0">
                    <FileText className="h-8 w-8 text-accent/80" />
                    <span
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground tabular-nums"
                      aria-label={`File ${idx + 1}`}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-foreground"
                      title={entry.file.name}
                    >
                      {entry.file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {formatBytes(entry.file.size)}
                      {entry.pageCount !== null && (
                        <span className="ml-2 inline-flex items-center gap-0.5">
                          <BookOpen className="h-3 w-3" />
                          {entry.pageCount} {entry.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                      )}
                      {entry.pageCount === null && (
                        <span className="ml-2 text-muted-foreground/60">page count unavailable</span>
                      )}
                    </p>
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      aria-label="Move file up"
                      className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === entries.length - 1}
                      aria-label="Move file down"
                      className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => remove(entry.id)}
                    aria-label={`Remove ${entry.file.name}`}
                    className="shrink-0 rounded p-1 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Totals row */}
              <div className="mt-4 flex items-center justify-between rounded-md bg-muted px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Total size</span>
                <span className="font-medium tabular-nums text-foreground">{formatBytes(totalBytes)}</span>
                {allPagesKnown && (
                  <>
                    <span className="text-muted-foreground">Total pages</span>
                    <span className="font-medium tabular-nums text-foreground">{totalPages}</span>
                  </>
                )}
              </div>

              {/* Action row */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={entries.length < 2 || isMerging}
                  onClick={handleMergeDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isMerging ? 'Merging...' : 'Download Merged PDF'}
                </Button>
                <Button
                  variant="outline"
                  disabled={entries.length < 2}
                  onClick={handlePreview}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Preview Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Add More Files
                </Button>
              </div>

              {mergeError && (
                <Alert variant="destructive" className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{mergeError}</AlertDescription>
                </Alert>
              )}

              {entries.length < 2 && (
                <p className="text-center text-xs text-muted-foreground">
                  Add at least 2 PDF files to merge.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Server-side notice ──────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Private local merge:</strong> Files are combined in your browser with{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">pdf-lib</code>.
              Nothing is uploaded. Password-protected or damaged PDFs may fail to merge.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Merge preview ──────────────────────────────────────────────────── */}
        {previewVisible && entries.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Merge Preview
              </CardTitle>
              <CardDescription>
                This is a structural preview of how your files will be combined — pages are listed in order. No files have been modified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Visual merge sequence */}
              <div className="space-y-1 overflow-x-auto">
                {entries.map((entry, fileIdx) => {
                  const pages = entry.pageCount ?? 1
                  const startPage =
                    entries
                      .slice(0, fileIdx)
                      .reduce((sum, e) => sum + (e.pageCount ?? 1), 0) + 1
                  const endPage = startPage + pages - 1

                  return (
                    <div key={entry.id}>
                      {/* File header row */}
                      <div className="flex items-center gap-2 rounded-t-md bg-muted/60 px-4 py-2 border border-border">
                        <FileText className="h-4 w-4 shrink-0 text-accent/80" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {entry.file.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {formatBytes(entry.file.size)}
                        </span>
                        <Badge variant="outline" className="shrink-0 font-mono text-xs tabular-nums">
                          {entry.pageCount !== null
                            ? `pp. ${startPage}–${endPage}`
                            : `from p. ${startPage}`}
                        </Badge>
                      </div>

                      {/* Page tiles */}
                      <div className="flex flex-wrap gap-1 rounded-b-md border-x border-b border-border bg-card/50 px-4 py-2">
                        {Array.from({ length: Math.min(pages, 24) }).map((_, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex h-8 w-6 flex-col items-center justify-center rounded-sm border border-border/70 bg-card shadow-[0_1px_2px_rgba(23,19,16,0.06)]"
                            title={`Page ${startPage + pIdx}`}
                          >
                            <div className="h-0.5 w-3.5 rounded-full bg-muted-foreground/20" />
                            <div className="mt-0.5 h-0.5 w-3 rounded-full bg-muted-foreground/15" />
                            <div className="mt-0.5 h-0.5 w-3.5 rounded-full bg-muted-foreground/20" />
                            <span className="mt-0.5 text-[7px] tabular-nums text-muted-foreground/60 leading-none">
                              {startPage + pIdx}
                            </span>
                          </div>
                        ))}
                        {pages > 24 && (
                          <div className="flex h-8 items-center px-1 text-xs text-muted-foreground">
                            +{pages - 24} more
                          </div>
                        )}
                      </div>

                      {/* Connector arrow between files */}
                      {fileIdx < entries.length - 1 && (
                        <div className="flex items-center justify-center py-1" aria-hidden="true">
                          <div className="h-4 w-px bg-border" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="mt-5 rounded-md bg-muted px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    <span className="text-muted-foreground">Files: </span>
                    <span className="font-medium tabular-nums">{entries.length}</span>
                  </span>
                  {allPagesKnown && (
                    <span>
                      <span className="text-muted-foreground">Total pages: </span>
                      <span className="font-medium tabular-nums">{totalPages}</span>
                    </span>
                  )}
                  <span>
                    <span className="text-muted-foreground">Combined size: </span>
                    <span className="font-medium tabular-nums">{formatBytes(totalBytes)}</span>
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Use Download Merged PDF when the order looks right. The output is generated locally in this browser.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {entries.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">1</span>
                  <span>Upload two or more PDF files using the drop zone above.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">2</span>
                  <span>Drag them into the order you want using the up and down arrows.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">3</span>
                  <span>Click <strong>Preview Order</strong> to inspect the combined page sequence before merging.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">4</span>
                  <span>Download the merged PDF. The final file is produced locally in your browser.</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

      </div>
    </ToolLayout>
  )
}
