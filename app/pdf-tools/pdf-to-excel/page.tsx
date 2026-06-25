'use client'

import { useState, useCallback, useRef } from 'react'
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
import {
  Upload,
  FileText,
  Table,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Lightbulb,
  ScanText,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { escapeHtml } from '@/lib/pdf-text-extractor'
import { extractPdfTextPages } from '@/lib/pdfjs-text'

const toolObj = {
  id: 'pdf-to-excel',
  name: 'PDF to Excel Converter',
  description: 'Extract tables and data from PDF files into Excel or CSV spreadsheets',
  category: 'pdf-tools',
  url: '/pdf-tools/pdf-to-excel',
}

const relatedTools = [
  { name: 'PDF to Word', href: '/pdf-tools/pdf-to-word' },
  { name: 'PDF Compressor', href: '/pdf-tools/compress' },
  { name: 'CSV to JSON', href: '/data-tools/csv-to-json' },
]

type PageSelection = 'all' | 'range'
type OutputFormat = 'xls' | 'csv'

interface UploadedFile {
  file: File
  name: string
  size: number
  pageCount: number
}

interface ExtractionResult {
  fileName: string
  downloadUrl: string
  rows: string[][]
  rowCount: number
  columnCount: number
  format: OutputFormat
  selectedPages: number[]
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`
}

function parseSelectedPages(selection: PageSelection, range: string, pageCount: number): { pages: number[]; error: string } {
  if (selection === 'all') {
    return { pages: Array.from({ length: pageCount }, (_, index) => index + 1), error: '' }
  }

  const trimmed = range.trim()
  if (!trimmed) return { pages: [], error: 'Enter a range such as 1-3 or 1,3,5.' }
  if (!/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/.test(trimmed)) {
    return { pages: [], error: 'Use format: 1-3 or 1,3,5-7.' }
  }

  const pages = new Set<number>()
  for (const part of trimmed.split(',').map((value) => value.trim())) {
    const [startRaw, endRaw] = part.split('-')
    const start = Number(startRaw)
    const end = endRaw ? Number(endRaw) : start
    if (start < 1 || end < 1 || start > end) return { pages: [], error: `Invalid page range "${part}".` }
    if (end > pageCount) return { pages: [], error: `Page ${end} exceeds the document length (${pageCount} pages).` }
    for (let page = start; page <= end; page++) pages.add(page)
  }

  return { pages: Array.from(pages).sort((a, b) => a - b), error: '' }
}

function lineToCells(line: string): string[] {
  const trimmed = line.trim()
  if (!trimmed) return []
  if (trimmed.includes('\t')) return trimmed.split('\t').map((cell) => cell.trim()).filter(Boolean)
  if (trimmed.includes('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
  if (/\s{2,}/.test(trimmed)) return trimmed.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean)
  if ((trimmed.match(/,/g) ?? []).length >= 2) return trimmed.split(',').map((cell) => cell.trim()).filter(Boolean)
  return [trimmed]
}

function rowsToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell.replace(/"/g, '""')
          return /[",\n\r]/.test(value) ? `"${value}"` : value
        })
        .join(',')
    )
    .join('\r\n')
}

function rowsToExcelHtml(rows: string[][]): string {
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('\n')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; }
    td { border: 1px solid #b8afa4; padding: 4px 8px; font-family: Georgia, 'Times New Roman', serif; }
  </style>
</head>
<body>
<table>
${body}
</table>
</body>
</html>`
}

export default function PDFToExcelPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [pageSelection, setPageSelection] = useState<PageSelection>('all')
  const [pageRange, setPageRange] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('xls')
  const [pageRangeError, setPageRangeError] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [conversionError, setConversionError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const revokeResult = (current: ExtractionResult | null) => {
    if (current) URL.revokeObjectURL(current.downloadUrl)
  }

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setConversionError('Only PDF files are supported.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setConversionError('PDF files must be 50 MB or smaller.')
      return
    }

    setConversionError('')
    setPageRangeError('')
    revokeResult(result)
    setResult(null)

    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
      setUploadedFile({
        file,
        name: file.name,
        size: file.size,
        pageCount: pdf.getPageCount(),
      })
      setPageRange('')
    } catch (err) {
      setUploadedFile(null)
      setConversionError('Unable to read this PDF. It may be encrypted, damaged, or unsupported by browser-based parsing.')
    }
  }, [result])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) void processFile(file)
    },
    [processFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void processFile(file)
    },
    [processFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const removeFile = () => {
    setUploadedFile(null)
    setPageRange('')
    setPageRangeError('')
    setConversionError('')
    revokeResult(result)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validatePageRange = (value: string) => {
    setPageRange(value)
    if (!value.trim()) {
      setPageRangeError('Enter a range such as 1-3 or 1,3,5')
      return
    }
    if (!uploadedFile) return
    const { error } = parseSelectedPages('range', value, uploadedFile.pageCount)
    setPageRangeError(error)
  }

  const canConvert =
    uploadedFile !== null &&
    (pageSelection === 'all' || (pageSelection === 'range' && pageRange.trim() && !pageRangeError))

  const handleConvert = async () => {
    if (!uploadedFile) return

    const selected = parseSelectedPages(pageSelection, pageRange, uploadedFile.pageCount)
    if (selected.error) {
      setPageRangeError(selected.error)
      return
    }

    setIsConverting(true)
    setConversionError('')
    revokeResult(result)
    setResult(null)

    try {
      const pages = await extractPdfTextPages(uploadedFile.file)
      const selectedPages = pages.filter((page) => selected.pages.includes(page.pageNumber))
      const rows = selectedPages
        .flatMap((page) => page.lines.map(lineToCells))
        .filter((row) => row.length > 0)

      if (!rows.length) {
        throw new Error('No readable text rows were found in the selected pages.')
      }

      const baseName = uploadedFile.name.replace(/\.pdf$/i, '')
      const fileName = `${baseName}.${outputFormat}`
      const blob =
        outputFormat === 'csv'
          ? new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8' })
          : new Blob([rowsToExcelHtml(rows)], { type: 'application/vnd.ms-excel;charset=utf-8' })

      setResult({
        fileName,
        downloadUrl: URL.createObjectURL(blob),
        rows,
        rowCount: rows.length,
        columnCount: rows.reduce((max, row) => Math.max(max, row.length), 0),
        format: outputFormat,
        selectedPages: selected.pages,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to extract data from this PDF.'
      setConversionError(`${message} Scanned PDFs need OCR before browser-only table extraction can work.`)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <ToolLayout
      title="PDF to Excel Converter"
      description="Extract tables and structured data from PDF files into Excel spreadsheets or CSV files."
      category="PDF Tools"
      categoryHref="/pdf-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="pdf-to-excel" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF
            </CardTitle>
            <CardDescription>
              Select a PDF file containing tables or structured data you want to extract.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
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
                className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isDragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/60 hover:bg-muted/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={handleFileInput}
                />
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                  <FileSpreadsheet className="h-10 w-10 text-accent/60" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isDragOver ? 'Drop your PDF here' : 'Drop a PDF here, or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">PDF files only — max 50 MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.size)} &middot; {uploadedFile.pageCount} page
                      {uploadedFile.pageCount !== 1 ? 's' : ''} detected
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive ml-4"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Extraction Options
            </CardTitle>
            <CardDescription>Configure which pages to extract and the output format.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Page selection */}
              <div className="space-y-3">
                <Label htmlFor="page-selection">Pages to Extract</Label>
                <Select
                  value={pageSelection}
                  onValueChange={(v) => {
                    setPageSelection(v as PageSelection)
                    setPageRange('')
                    setPageRangeError('')
                  }}
                >
                  <SelectTrigger id="page-selection" className="w-full">
                    <SelectValue placeholder="Select pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All pages</SelectItem>
                    <SelectItem value="range">Custom range</SelectItem>
                  </SelectContent>
                </Select>

                {pageSelection === 'range' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="page-range" className="text-xs text-muted-foreground">
                      Page range (e.g. 1-3 or 1,3,5-7)
                    </Label>
                    <Input
                      id="page-range"
                      placeholder="1-3"
                      value={pageRange}
                      onChange={(e) => validatePageRange(e.target.value)}
                      className={pageRangeError ? 'border-destructive' : ''}
                    />
                    {pageRangeError && (
                      <p className="text-xs text-destructive">{pageRangeError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Output format */}
              <div className="space-y-3">
                <Label htmlFor="output-format">Output Format</Label>
                <Select
                  value={outputFormat}
                  onValueChange={(v) => setOutputFormat(v as OutputFormat)}
                >
                  <SelectTrigger id="output-format" className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xls">
                      Excel-compatible (.xls)
                    </SelectItem>
                    <SelectItem value="csv">
                      CSV (.csv)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {outputFormat === 'xls'
                    ? 'Opens directly in Excel as a simple table workbook.'
                    : 'Plain text format; one sheet per file, universally compatible.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleConvert} disabled={!canConvert || isConverting} className="flex-1 sm:flex-none sm:min-w-[180px]">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {isConverting
                  ? 'Extracting...'
                  : uploadedFile
                  ? `Convert to ${outputFormat.toUpperCase()}`
                  : 'Upload a PDF first'}
              </Button>
              {uploadedFile && (
                <Button variant="outline" onClick={removeFile}>
                  Clear
                </Button>
              )}
            </div>

            {conversionError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{conversionError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Processing notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Browser-only extraction:</span>{' '}
            This tool reads the PDF text layer in your browser and infers rows from spacing,
            tabs, pipes, and comma-delimited lines. Scanned or image-only PDFs need OCR before
            table extraction can work.
          </AlertDescription>
        </Alert>

        {/* Output preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Extracted Output
            </CardTitle>
            <CardDescription>
              Preview rows from the uploaded PDF after extraction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{result.rowCount} rows</Badge>
                  <Badge variant="outline">{result.columnCount} columns max</Badge>
                  <span className="text-xs text-muted-foreground">
                    Pages {result.selectedPages.join(', ')}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <tbody>
                      {result.rows.slice(0, 12).map((row, ri) => (
                        <tr key={ri} className={ri % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                          {Array.from({ length: result.columnCount }).map((_, ci) => (
                            <td
                              key={ci}
                              className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground"
                            >
                              {row[ci] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.rowCount > 12 && (
                  <p className="text-xs text-muted-foreground">
                    Showing 12 of {result.rowCount} extracted rows.
                  </p>
                )}
                <Button asChild>
                  <a href={result.downloadUrl} download={result.fileName}>
                    <Download className="h-4 w-4 mr-2" />
                    Download {result.fileName}
                  </a>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                Upload a text-based PDF and run the extraction to preview its rows here.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              When to Use This Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Financial reports</p>
                    <p className="text-xs text-muted-foreground">
                      Extract income statements, balance sheets, or invoice line items into a
                      workable spreadsheet.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Research data tables</p>
                    <p className="text-xs text-muted-foreground">
                      Pull tabular data from academic papers, government PDFs, or statistical
                      publications for further analysis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Catalogues and price lists</p>
                    <p className="text-xs text-muted-foreground">
                      Convert supplier catalogues with structured rows into a sortable, filterable
                      Excel file.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <ScanText className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Scanned documents</p>
                    <p className="text-xs text-muted-foreground">
                      Scanned PDFs need OCR before this browser-only extractor can read their
                      table text.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Complex merged cells</p>
                    <p className="text-xs text-muted-foreground">
                      Tables with heavily merged or nested cells may need manual cleanup after
                      conversion. CSV and Excel-compatible output preserve the extracted row order.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Text-heavy PDFs</p>
                    <p className="text-xs text-muted-foreground">
                      PDFs that are mostly paragraphs with little tabular structure are better
                      converted using the PDF to Word tool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              How the Conversion Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                  Step 1
                </p>
                <p className="text-sm font-medium text-foreground mb-1">Parse structure</p>
                <p className="text-xs text-muted-foreground">
                  The PDF is analysed to detect text-layer tables (digitally-created PDFs) or
                  readable text lines in digitally-created PDFs.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                  Step 2
                </p>
                <p className="text-sm font-medium text-foreground mb-1">Extract data</p>
                <p className="text-xs text-muted-foreground">
                  Rows are inferred from PDF line positions, repeated spacing, tabs, pipes, and
                  comma-delimited text.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                  Step 3
                </p>
                <p className="text-sm font-medium text-foreground mb-1">Export spreadsheet</p>
                <p className="text-xs text-muted-foreground">
                  Extracted rows are written to an Excel-compatible table or CSV file, ready to open
                  in Excel, Google Sheets, or any compatible tool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
