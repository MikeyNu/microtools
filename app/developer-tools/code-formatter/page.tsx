'use client'

import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Code2,
  Copy,
  CheckCheck,
  AlertCircle,
  WandSparkles,
  FileCode,
  Hash,
  Braces,
} from 'lucide-react'

// ─── formatting engines ───────────────────────────────────────────────────────

function formatJSON(code: string): string {
  const parsed = JSON.parse(code)
  return JSON.stringify(parsed, null, 2)
}

function formatHTML(code: string): string {
  const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ])
  // Normalise whitespace between tags
  const normalised = code
    .replace(/>\s+</g, '>\n<')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const lines = normalised.split('\n')
  let indent = 0
  const result: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const isClosing = /^<\//.test(line)
    const isSelfClosing = /\/>$/.test(line) || VOID_TAGS.has((line.match(/^<(\w+)/) || [])[1] ?? '')
    const isOpening = /^<[^/!]/.test(line) && !isSelfClosing

    if (isClosing) indent = Math.max(0, indent - 1)

    result.push('  '.repeat(indent) + line)

    if (isOpening && !isClosing) indent += 1
  }

  return result.join('\n')
}

function formatCSS(code: string): string {
  // Strip existing whitespace structure; rebuild deliberately
  const cleaned = code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m) // preserve comments as-is
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*\}\s*/g, '\n}\n')
    .replace(/\n{3,}/g, '\n\n')

  const lines = cleaned.split('\n')
  let indent = 0
  const result: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      if (result.length && result[result.length - 1] !== '') result.push('')
      continue
    }

    const opensBlock = line.endsWith('{')
    const closesBlock = line === '}'

    if (closesBlock) indent = Math.max(0, indent - 1)
    result.push('  '.repeat(indent) + line)
    if (opensBlock) indent += 1
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AND', 'OR', 'NOT',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
  'ALTER TABLE', 'DROP TABLE', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'BETWEEN',
  'LIKE', 'IS NULL', 'IS NOT NULL', 'EXISTS', 'WITH',
]

// Keywords that should get a newline before them
const NEWLINE_BEFORE = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'GROUP BY', 'ORDER BY',
  'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO',
  'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'WITH',
])

function formatSQL(code: string): string {
  // Uppercase all known keywords
  let result = code
  for (const kw of SQL_KEYWORDS) {
    const re = new RegExp(`\\b${kw}\\b`, 'gi')
    result = result.replace(re, kw)
  }

  // Insert newlines before major keywords
  for (const kw of NEWLINE_BEFORE) {
    const re = new RegExp(`\\s+${kw}\\b`, 'g')
    result = result.replace(re, `\n${kw}`)
  }

  // Align AND / OR inside WHERE / ON
  result = result.replace(/\s+(AND|OR)\s+/g, '\n  $1 ')

  // Clean excess whitespace
  result = result
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return result
}

// ─── types & constants ────────────────────────────────────────────────────────

type Language = 'json' | 'html' | 'css' | 'sql'

const LANGUAGES: { value: Language; label: string; icon: typeof Braces }[] = [
  { value: 'json', label: 'JSON', icon: Braces },
  { value: 'html', label: 'HTML', icon: FileCode },
  { value: 'css',  label: 'CSS',  icon: Hash },
  { value: 'sql',  label: 'SQL',  icon: Code2 },
]

const PLACEHOLDERS: Record<Language, string> = {
  json: '{"name":"value","items":[1,2,3]}',
  html: '<div><p>Paste your HTML here</p></div>',
  css:  'body{margin:0;padding:0;font-size:16px;}',
  sql:  'select id,name from users where active=1 order by name',
}

const TOOL_OBJ = {
  id: 'code-formatter',
  name: 'Code Formatter',
  description: 'Format and beautify JSON, HTML, CSS, and SQL code with proper indentation and structure.',
  category: 'developer-tools',
  url: '/developer-tools/code-formatter',
}

const RELATED_TOOLS = [
  { name: 'JSON Formatter', href: '/developer-tools/json-formatter' },
  { name: 'Regex Tester',   href: '/developer-tools/regex-tester' },
  { name: 'XML Formatter',  href: '/data-tools/xml-formatter' },
]

// ─── component ────────────────────────────────────────────────────────────────

export default function CodeFormatterPage() {
  const [language, setLanguage]   = useState<Language>('json')
  const [input, setInput]         = useState('')
  const [output, setOutput]       = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)
  const [hasFormatted, setHasFormatted] = useState(false)

  const lineCount = output ? output.split('\n').length : 0
  const charCount = output ? output.length : 0

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setError('Paste some code to format.')
      setOutput('')
      setHasFormatted(false)
      return
    }

    try {
      let formatted = ''
      if (language === 'json') formatted = formatJSON(input)
      else if (language === 'html') formatted = formatHTML(input)
      else if (language === 'css')  formatted = formatCSS(input)
      else                          formatted = formatSQL(input)

      setOutput(formatted)
      setError(null)
      setHasFormatted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setOutput('')
      setHasFormatted(false)
    }
  }, [input, language])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — silent fail
    }
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setHasFormatted(false)
  }, [])

  const activeLanguageLabel = LANGUAGES.find(l => l.value === language)?.label ?? language.toUpperCase()

  return (
    <ToolLayout
      title="Code Formatter"
      description="Format and beautify JSON, HTML, CSS, and SQL code with proper indentation and structure."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">

        {/* Top engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="code-formatter" />
          <ShareButton tool={TOOL_OBJ} />
        </div>

        {/* Controls card */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <WandSparkles className="h-4 w-4 text-accent" />
              Formatter Options
            </CardTitle>
            <CardDescription>Choose a language, paste your code, then format.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="language-select" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Language
                </Label>
                <Select value={language} onValueChange={(v) => {
                  setLanguage(v as Language)
                  setOutput('')
                  setError(null)
                  setHasFormatted(false)
                }}>
                  <SelectTrigger id="language-select" className="w-36">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleFormat} className="gap-2">
                  <WandSparkles className="h-4 w-4" />
                  Format {activeLanguageLabel}
                </Button>
                <Button variant="outline" onClick={handleClear} className="text-muted-foreground">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input / Output panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Input */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold font-mono">
                <Code2 className="h-4 w-4 text-accent" />
                Input
              </CardTitle>
              <CardDescription className="text-xs">Paste your unformatted code here</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <Label htmlFor="code-input" className="sr-only">Code input</Label>
              <Textarea
                id="code-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={PLACEHOLDERS[language]}
                className="min-h-72 font-mono text-sm resize-y bg-muted/30 border-border leading-relaxed"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="flex items-center justify-between text-sm font-semibold font-mono">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-accent" />
                  Output
                </div>
                {output && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-7 gap-1.5 text-xs"
                  >
                    {copied
                      ? <><CheckCheck className="h-3.5 w-3.5 text-success" />Copied</>
                      : <><Copy className="h-3.5 w-3.5" />Copy</>
                    }
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="text-xs">Formatted result — read only</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-3">
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted code will appear here after you click Format…"
                className="min-h-72 font-mono text-sm resize-y bg-muted/40 border-border leading-relaxed text-foreground"
                spellCheck={false}
              />

              {hasFormatted && output && (
                <div className="flex items-center gap-3 pt-0.5">
                  <Badge variant="secondary" className="font-mono text-xs gap-1.5 tabular-nums">
                    <span className="text-muted-foreground">lines</span>
                    {lineCount.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs gap-1.5 tabular-nums">
                    <span className="text-muted-foreground">chars</span>
                    {charCount.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs gap-1.5">
                    <span className="text-muted-foreground">lang</span>
                    {activeLanguageLabel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Language notes card */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-accent" />
              Formatting Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">JSON</p>
                <ul className="space-y-1">
                  {[
                    'Validates structure before formatting',
                    '2-space indentation applied consistently',
                    'Syntax errors surface a clear message',
                  ].map((note) => (
                    <li key={note} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5 shrink-0">—</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">HTML</p>
                <ul className="space-y-1">
                  {[
                    'Void elements (br, img, input…) handled correctly',
                    'Nesting depth drives indentation automatically',
                    'Best for snippets; not a full HTML validator',
                  ].map((note) => (
                    <li key={note} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5 shrink-0">—</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">CSS</p>
                <ul className="space-y-1">
                  {[
                    'Each declaration placed on its own line',
                    'Nested blocks indented by 2 spaces',
                    'Consecutive blank lines collapsed to one',
                  ].map((note) => (
                    <li key={note} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5 shrink-0">—</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">SQL</p>
                <ul className="space-y-1">
                  {[
                    'Keywords uppercased (SELECT, FROM, WHERE…)',
                    'Major clauses each start on a new line',
                    'AND / OR conditions indented under WHERE',
                  ].map((note) => (
                    <li key={note} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5 shrink-0">—</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
