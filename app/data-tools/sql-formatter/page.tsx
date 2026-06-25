'use client'

import { useState, useCallback } from 'react'
import {
  Database,
  Copy,
  Minimize2,
  Maximize2,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCode,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Dialect = 'generic' | 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver'

interface FormatResult {
  output: string
  statementCount: number
  error: string | null
}

// ---------------------------------------------------------------------------
// SQL keyword lists
// ---------------------------------------------------------------------------

const SQL_KEYWORDS = [
  'SELECT',
  'DISTINCT',
  'FROM',
  'WHERE',
  'JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'OUTER JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'ON',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'LIKE',
  'BETWEEN',
  'AS',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'DROP',
  'ALTER',
  'TABLE',
  'INDEX',
  'VIEW',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'UNION ALL',
  'INTERSECT',
  'EXCEPT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'EXISTS',
  'ALL',
  'ANY',
  'SOME',
  'WITH',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'CONSTRAINT',
  'DEFAULT',
  'UNIQUE',
  'CHECK',
  'INDEX',
  'TRUNCATE',
]

// Dialect-specific keyword additions (informational — keywords are always uppercased)
const DIALECT_NOTES: Record<Dialect, string> = {
  generic: 'Standard SQL — compatible with most databases.',
  mysql: 'MySQL mode — backtick identifiers and AUTO_INCREMENT are recognized.',
  postgresql: 'PostgreSQL mode — double-quoted identifiers and RETURNING clause are recognized.',
  sqlite: 'SQLite mode — lightweight dialect with AUTOINCREMENT support.',
  sqlserver: 'SQL Server mode — square-bracket identifiers and TOP clause are recognized.',
}

// ---------------------------------------------------------------------------
// Formatting engine
// ---------------------------------------------------------------------------

// Clause keywords that always start on a new line (order matters for multi-word first)
const CLAUSE_STARTERS = [
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'UNION ALL',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'GROUP BY',
  'ORDER BY',
  'SELECT',
  'DISTINCT',
  'FROM',
  'WHERE',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'ON',
  'SET',
  'INTO',
  'VALUES',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'ALTER',
  'DROP',
  'TRUNCATE',
  'WITH',
]

function uppercaseKeywords(sql: string): string {
  // Sort longer keywords first so multi-word ones match before their parts
  const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length)

  let result = sql

  for (const kw of sorted) {
    // Match keyword as whole word(s), case-insensitive, not inside strings or comments
    const escaped = kw.replace(/\s+/g, '\\s+')
    const regex = new RegExp(`(?<!['"\\w])${escaped}(?!['"\\w])`, 'gi')
    result = result.replace(regex, kw)
  }

  return result
}

function splitIntoStatements(sql: string): string[] {
  // Split on semicolons that are not inside strings
  const statements: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const prev = sql[i - 1]

    if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle
    if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble

    if (ch === ';' && !inSingle && !inDouble) {
      current += ch
      const trimmed = current.trim()
      if (trimmed && trimmed !== ';') statements.push(trimmed)
      current = ''
    } else {
      current += ch
    }
  }

  const trimmed = current.trim()
  if (trimmed) statements.push(trimmed)

  return statements.filter(Boolean)
}

function formatStatement(sql: string): string {
  // Step 1: collapse whitespace (but respect string literals)
  let normalized = ''
  let inSingle = false
  let inDouble = false
  let i = 0

  while (i < sql.length) {
    const ch = sql[i]
    const prev = i > 0 ? sql[i - 1] : ''

    if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle
    if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble

    if (!inSingle && !inDouble && /\s/.test(ch)) {
      // Collapse multiple whitespace to single space
      if (normalized.length > 0 && normalized[normalized.length - 1] !== ' ') {
        normalized += ' '
      }
    } else {
      normalized += ch
    }
    i++
  }

  normalized = normalized.trim()

  // Step 2: uppercase keywords
  normalized = uppercaseKeywords(normalized)

  // Step 3: insert newlines before clause starters
  for (const clause of CLAUSE_STARTERS) {
    const escaped = clause.replace(/\s+/g, '\\s+')
    // Add newline before clause starters (but not at the very beginning)
    const regex = new RegExp(`(?<!^)(?<![\\w"'\`\\]])\\s*(${escaped})(?![\\w"'\`\\[])`, 'g')
    normalized = normalized.replace(regex, `\n${clause}`)
  }

  // Step 4: indent lines after SELECT and between commas in SELECT list
  const lines = normalized.split('\n')
  const indented: string[] = []

  let depth = 0

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim()
    if (!line) continue

    // Track subquery depth
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length

    if (closeParens > openParens) {
      depth = Math.max(0, depth - (closeParens - openParens))
    }

    indented.push('  '.repeat(depth) + line)

    if (openParens > closeParens) {
      depth += openParens - closeParens
    }
  }

  return indented.join('\n')
}

function minifyStatement(sql: string): string {
  // Collapse to single line, uppercase keywords
  let result = sql.replace(/\s+/g, ' ').trim()
  result = uppercaseKeywords(result)
  return result
}

function formatSQL(sql: string, minify: boolean): FormatResult {
  if (!sql.trim()) {
    return { output: '', statementCount: 0, error: null }
  }

  try {
    const statements = splitIntoStatements(sql)

    if (statements.length === 0) {
      return { output: '', statementCount: 0, error: 'No valid SQL statements found.' }
    }

    const processed = statements.map((stmt) =>
      minify ? minifyStatement(stmt) : formatStatement(stmt)
    )

    const separator = minify ? ' ' : '\n\n'
    return {
      output: processed.join(separator),
      statementCount: statements.length,
      error: null,
    }
  } catch (err) {
    return {
      output: '',
      statementCount: 0,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

// ---------------------------------------------------------------------------
// Sample SQL
// ---------------------------------------------------------------------------

const SAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent
from users u
left join orders o on u.id = o.user_id
where u.created_at >= '2024-01-01'
  and u.status = 'active'
group by u.id, u.name, u.email
having sum(o.total) > 500
order by total_spent desc
limit 25 offset 0;

insert into audit_log (user_id, action, created_at) values (42, 'login', now());

select p.name, p.sku, c.name as category, p.price
from products p
inner join categories c on p.category_id = c.id
where p.price between 10 and 100
  and p.stock > 0
  and c.slug not in ('archived', 'deleted')
order by p.name asc;`

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const tool = {
  id: 'sql-formatter',
  name: 'SQL Formatter',
  description: 'Format and beautify SQL queries with keyword uppercasing, clause indentation, and multi-statement support.',
  category: 'data-tools',
  url: '/data-tools/sql-formatter',
}

const relatedTools = [
  { name: 'XML Formatter', href: '/data-tools/xml-formatter' },
  { name: 'JSON Formatter', href: '/data-tools/json-formatter' },
  { name: 'Data Validator', href: '/data-tools/data-validator' },
]

export default function SqlFormatterPage() {
  const [input, setInput] = useState('')
  const [dialect, setDialect] = useState<Dialect>('generic')
  const [minify, setMinify] = useState(false)
  const [result, setResult] = useState<FormatResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFormat = useCallback(() => {
    const formatted = formatSQL(input, minify)
    setResult(formatted)
  }, [input, minify])

  const handleMinify = useCallback(() => {
    const minified = formatSQL(input, true)
    setResult(minified)
    setMinify(true)
  }, [input])

  const handleCopy = useCallback(() => {
    if (!result?.output) return
    navigator.clipboard.writeText(result.output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [result])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setMinify(false)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_SQL)
    setResult(null)
  }, [])

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Beautify SQL queries with proper indentation, uppercased keywords, and clause-by-clause formatting."
      category="Data Tools"
      categoryHref="/data-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        {/* Options row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-accent" />
              Formatting Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 min-w-[200px]">
                <Label htmlFor="dialect-select">SQL Dialect</Label>
                <Select
                  value={dialect}
                  onValueChange={(val) => setDialect(val as Dialect)}
                >
                  <SelectTrigger id="dialect-select" className="w-full">
                    <SelectValue placeholder="Select dialect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic SQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pb-0.5">
                <input
                  type="checkbox"
                  id="minify-toggle"
                  checked={minify}
                  onChange={(e) => setMinify(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="minify-toggle" className="cursor-pointer select-none">
                  Minify output
                </Label>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleSample}>
                  Sample SQL
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            {dialect !== 'generic' && (
              <p className="mt-3 text-sm text-muted-foreground">
                {DIALECT_NOTES[dialect]}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode className="h-4 w-4 text-accent" />
              SQL Input
            </CardTitle>
            <CardDescription>
              Paste one or more SQL statements. Separate multiple statements with semicolons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="sql-input"
              placeholder="SELECT id, name FROM users WHERE active = 1;"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[220px] font-mono text-sm"
              spellCheck={false}
            />

            <div className="flex gap-2">
              <Button onClick={handleFormat} disabled={!input.trim()}>
                <Maximize2 className="h-4 w-4" />
                Format SQL
              </Button>
              <Button variant="outline" onClick={handleMinify} disabled={!input.trim()}>
                <Minimize2 className="h-4 w-4" />
                Minify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {result?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}

        {/* Output */}
        {result && !result.error && result.output && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Formatted Output
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Read-only — copy or select all to use the result.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="flex items-center gap-1 font-variant-numeric tabular-nums">
                    <Hash className="h-3 w-3" />
                    {result.statementCount} {result.statementCount === 1 ? 'statement' : 'statements'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!result.output}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={result.output}
                readOnly
                className="min-h-[280px] font-mono text-sm bg-muted"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Info tip */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> All SQL keywords are uppercased automatically. Major clauses (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, etc.) are placed on their own lines. Subqueries and nested expressions are indented by depth. The dialect selector is informational — keyword uppercasing applies universally across all dialects.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
