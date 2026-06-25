'use client'

import { useState, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  FileJson,
  FileText,
  FileCode2,
  FileType,
  Copy,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  Hash,
  Layers,
  List,
  Braces,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ── Types ─────────────────────────────────────────────────────────────────────

type FormatType = 'json' | 'csv' | 'xml' | 'yaml'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  formatted: string
  stats: Record<string, string | number>
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function validateJSON(input: string): ValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { isValid: false, errors: ['Input is empty.'], formatted: '', stats: {} }
  }

  try {
    const parsed = JSON.parse(trimmed)

    let keys = 0
    let objects = 0
    let arrays = 0
    let maxDepth = 0

    const walk = (node: unknown, depth: number): void => {
      if (depth > maxDepth) maxDepth = depth
      if (Array.isArray(node)) {
        arrays++
        node.forEach((item) => walk(item, depth + 1))
      } else if (node !== null && typeof node === 'object') {
        objects++
        const k = Object.keys(node as object)
        keys += k.length
        k.forEach((key) => walk((node as Record<string, unknown>)[key], depth + 1))
      }
    }
    walk(parsed, 0)

    const formatted = JSON.stringify(parsed, null, 2)

    return {
      isValid: true,
      errors: [],
      formatted,
      stats: {
        'Keys (total)': keys,
        'Objects': objects,
        'Arrays': arrays,
        'Max depth': maxDepth,
        'Size': `${(trimmed.length / 1024).toFixed(2)} KB`,
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown parse error'
    return { isValid: false, errors: [msg], formatted: '', stats: {} }
  }
}

function validateCSV(input: string): ValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { isValid: false, errors: ['Input is empty.'], formatted: '', stats: {} }
  }

  const lines = trimmed.split(/\r?\n/)
  if (lines.length === 0) {
    return { isValid: false, errors: ['No lines found.'], formatted: '', stats: {} }
  }

  const errors: string[] = []

  // Parse a CSV line respecting quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }

  const header = parseLine(lines[0])
  const colCount = header.length
  const dataRows = lines.slice(1).filter((l) => l.trim() !== '')

  const inconsistentRows: number[] = []
  dataRows.forEach((line, idx) => {
    const cols = parseLine(line)
    if (cols.length !== colCount) {
      inconsistentRows.push(idx + 2) // 1-based, skipping header
    }
  })

  if (inconsistentRows.length > 0) {
    errors.push(
      `Inconsistent column count on row${inconsistentRows.length > 1 ? 's' : ''}: ${inconsistentRows.slice(0, 5).join(', ')}${inconsistentRows.length > 5 ? ` … and ${inconsistentRows.length - 5} more` : ''}`
    )
  }

  // Build preview table (first 5 data rows)
  const preview = dataRows.slice(0, 5).map((r) => parseLine(r))

  // Format: simple aligned text table for the "formatted" output
  const allRows = [header, ...preview]
  const colWidths = header.map((_, ci) =>
    Math.max(...allRows.map((r) => (r[ci] ?? '').length))
  )

  const formatRow = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(colWidths[i] ?? 0)).join(' | ')

  const separator = colWidths.map((w) => '-'.repeat(w)).join('-+-')
  const tableLines = [
    formatRow(header),
    separator,
    ...preview.map((l) => formatRow(l)),
  ]
  if (dataRows.length > 5) {
    tableLines.push(`… ${dataRows.length - 5} more rows`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    formatted: tableLines.join('\n'),
    stats: {
      'Rows (data)': dataRows.length,
      'Columns': colCount,
      'Header fields': header.map((h) => h.trim()).join(', '),
      'Preview rows': Math.min(5, dataRows.length),
    },
  }
}

function validateXML(input: string): ValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { isValid: false, errors: ['Input is empty.'], formatted: '', stats: {} }
  }

  if (typeof window === 'undefined') {
    return { isValid: false, errors: ['XML validation requires a browser environment.'], formatted: '', stats: {} }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(trimmed, 'application/xml')
  const parseError = doc.querySelector('parsererror')

  if (parseError) {
    const msg = parseError.textContent ?? 'XML parse error'
    // Extract a cleaner first line
    const firstLine = msg.split('\n').find((l) => l.trim()) ?? msg
    return { isValid: false, errors: [firstLine.trim()], formatted: '', stats: {} }
  }

  // Count elements, attributes, text nodes
  let elementCount = 0
  let attrCount = 0
  let textNodes = 0
  let maxDepth = 0

  const walk = (node: Node, depth: number): void => {
    if (depth > maxDepth) maxDepth = depth
    if (node.nodeType === Node.ELEMENT_NODE) {
      elementCount++
      attrCount += (node as Element).attributes.length
      node.childNodes.forEach((child) => walk(child, depth + 1))
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) textNodes++
    }
  }
  walk(doc.documentElement, 0)

  const rootTag = doc.documentElement.tagName

  return {
    isValid: true,
    errors: [],
    formatted: trimmed, // XML pretty-printing is complex; we return as-is
    stats: {
      'Root element': `<${rootTag}>`,
      'Elements': elementCount,
      'Attributes': attrCount,
      'Text nodes': textNodes,
      'Max depth': maxDepth,
    },
  }
}

function validateYAML(input: string): ValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { isValid: false, errors: ['Input is empty.'], formatted: '', stats: {} }
  }

  const errors: string[] = []
  const lines = trimmed.split(/\r?\n/)

  let keyCount = 0
  let listItems = 0
  let maxIndent = 0

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Detect tab characters (YAML disallows tabs for indentation)
    if (/^\t/.test(line)) {
      errors.push(`Line ${lineNum}: YAML does not allow tab indentation.`)
    }

    // Track indent depth
    const indent = line.search(/\S/)
    if (indent > maxIndent) maxIndent = indent

    const stripped = line.trim()
    if (!stripped || stripped.startsWith('#')) return // blank / comment

    // List item
    if (/^-\s/.test(stripped) || stripped === '-') {
      listItems++
      return
    }

    // Key: value
    const colonIdx = stripped.indexOf(':')
    if (colonIdx > 0) {
      const key = stripped.slice(0, colonIdx).trim()
      // Key must not contain unquoted special chars
      if (/^[a-zA-Z0-9_\- .]+$/.test(key)) {
        keyCount++
      } else {
        // Could still be valid YAML (quoted keys etc.), flag only obvious issues
        const colonAfterBracket = /[\[\]{},]/.test(key)
        if (colonAfterBracket) {
          errors.push(`Line ${lineNum}: unexpected character in key "${key}".`)
        } else {
          keyCount++
        }
      }
    } else if (colonIdx === -1 && !stripped.startsWith('-') && !/^['"]/.test(stripped)) {
      // Bare value with no colon — may be multi-line scalar, flag as info only
      // Don't error; YAML scalars can appear without colon as list values etc.
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    formatted: trimmed,
    stats: {
      'Keys detected': keyCount,
      'List items': listItems,
      'Lines': lines.length,
      'Max indent': maxIndent,
    },
  }
}

// ── Samples ───────────────────────────────────────────────────────────────────

const SAMPLES: Record<FormatType, string> = {
  json: `{
  "user": {
    "id": 42,
    "name": "Ada Lovelace",
    "roles": ["admin", "editor"],
    "active": true,
    "meta": { "joinedAt": "1843-07-10", "score": 9.8 }
  }
}`,
  csv: `id,name,department,salary,active
1,Ada Lovelace,Engineering,95000,true
2,Charles Babbage,Engineering,88000,true
3,Grace Hopper,Research,102000,false
4,Alan Turing,Research,110000,true`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="b1" lang="en">
    <title>Analytical Engine</title>
    <author>Ada Lovelace</author>
    <year>1843</year>
  </book>
  <book id="b2" lang="en">
    <title>Computing Machinery</title>
    <author>Alan Turing</author>
    <year>1950</year>
  </book>
</catalog>`,
  yaml: `server:
  host: localhost
  port: 8080
  debug: true

database:
  driver: postgres
  host: db.internal
  port: 5432
  name: app_db
  pool_size: 10

features:
  - name: auth
    enabled: true
  - name: analytics
    enabled: false`,
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ isValid }: { isValid: boolean }) {
  return isValid ? (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-transparent bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Valid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-transparent bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
      <XCircle className="h-3.5 w-3.5" />
      Invalid
    </span>
  )
}

function StatGrid({ stats }: { stats: Record<string, string | number> }) {
  const entries = Object.entries(stats)
  if (entries.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {entries.map(([label, value]) => (
        <div key={label} className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-sm font-semibold tabular-nums break-all">{value}</p>
        </div>
      ))}
    </div>
  )
}

interface FormatPanelProps {
  format: FormatType
  icon: React.ReactNode
  placeholder: string
  validate: (s: string) => ValidationResult
}

function FormatPanel({ format, icon, placeholder, validate }: FormatPanelProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleValidate = useCallback(() => {
    setResult(validate(input))
  }, [input, validate])

  const handleSample = () => {
    setInput(SAMPLES[format])
    setResult(null)
  }

  const handleClear = () => {
    setInput('')
    setResult(null)
  }

  const handleCopy = async () => {
    if (!result?.formatted) return
    await navigator.clipboard.writeText(result.formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="space-y-4">
      {/* Input area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            Input
          </CardTitle>
          <CardDescription>Paste your {format.toUpperCase()} data below and press Validate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor={`${format}-input`} className="sr-only">
              {format.toUpperCase()} input
            </Label>
            <Textarea
              id={`${format}-input`}
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[220px] font-mono text-sm resize-y"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleValidate} disabled={!input.trim()}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button variant="outline" onClick={handleSample}>
              Load sample
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={!input}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result area */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Result
              </CardTitle>
              <StatusBadge isValid={result.isValid} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-sm">{e}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats */}
            {Object.keys(result.stats).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statistics</p>
                <StatGrid stats={result.stats} />
              </div>
            )}

            {/* Formatted output */}
            {result.isValid && result.formatted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {format === 'csv' ? 'Preview (first 5 rows)' : 'Formatted'}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!result.formatted}>
                    {copied ? (
                      <><ClipboardCheck className="h-3.5 w-3.5 mr-1.5" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>
                    )}
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed whitespace-pre text-foreground">
                    {result.formatted}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const tool = {
  id: 'data-validator',
  name: 'Data Validator',
  description: 'Validate JSON, CSV, XML, and YAML data with detailed stats and error reporting.',
  category: 'data-tools',
  url: '/data-tools/data-validator',
}

const relatedTools = [
  { name: 'JSON Formatter', href: '/data-tools/json-formatter' },
  { name: 'CSV to JSON', href: '/data-tools/csv-to-json' },
  { name: 'XML Formatter', href: '/data-tools/xml-formatter' },
]

export default function DataValidatorPage() {
  return (
    <ToolLayout
      title="Data Validator"
      description="Validate JSON, CSV, XML, and YAML with instant feedback — error details, structural stats, and a formatted preview."
      category="Data Tools"
      categoryHref="/data-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        <Tabs defaultValue="json" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="json" className="gap-1.5">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-1.5">
              <FileText className="h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="xml" className="gap-1.5">
              <FileCode2 className="h-4 w-4" />
              XML
            </TabsTrigger>
            <TabsTrigger value="yaml" className="gap-1.5">
              <FileType className="h-4 w-4" />
              YAML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json">
            <FormatPanel
              format="json"
              icon={<FileJson className="h-4 w-4 text-muted-foreground" />}
              placeholder='{"key": "value", "count": 42}'
              validate={validateJSON}
            />
          </TabsContent>

          <TabsContent value="csv">
            <FormatPanel
              format="csv"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              placeholder={"id,name,email\n1,Ada,ada@example.com"}
              validate={validateCSV}
            />
          </TabsContent>

          <TabsContent value="xml">
            <FormatPanel
              format="xml"
              icon={<FileCode2 className="h-4 w-4 text-muted-foreground" />}
              placeholder={'<root>\n  <item id="1">Value</item>\n</root>'}
              validate={validateXML}
            />
          </TabsContent>

          <TabsContent value="yaml">
            <FormatPanel
              format="yaml"
              icon={<FileType className="h-4 w-4 text-muted-foreground" />}
              placeholder={"key: value\nlist:\n  - item1\n  - item2"}
              validate={validateYAML}
            />
          </TabsContent>
        </Tabs>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            All validation runs entirely in your browser — no data is sent to any server.
            The YAML validator uses heuristic checks; for full YAML spec compliance use a server-side library.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
