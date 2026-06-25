'use client'

import { useState, useCallback } from 'react'
import {
  Type,
  Copy,
  Check,
  RefreshCw,
  ClipboardList,
  AlignLeft,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ─── Conversion helpers ────────────────────────────────────────────────────────

function toUpperCase(text: string): string {
  return text.toUpperCase()
}

function toLowerCase(text: string): string {
  return text.toLowerCase()
}

function toTitleCase(text: string): string {
  return text.replace(/\b\w+/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
}

function toCamelCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('')
}

function toPascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function toSnakeCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('_')
    .toLowerCase()
}

function toKebabCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('-')
    .toLowerCase()
}

function toScreamingSnake(text: string): string {
  return toSnakeCase(text).toUpperCase()
}

function toDotCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('.')
    .toLowerCase()
}

function toPathCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('/')
    .toLowerCase()
}

function toToggleCase(text: string): string {
  return text
    .split('')
    .map((char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    )
    .join('')
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Conversion {
  id: string
  label: string
  sublabel: string
  fn: (text: string) => string
  example: string
}

const CONVERSIONS: Conversion[] = [
  {
    id: 'uppercase',
    label: 'UPPERCASE',
    sublabel: 'All characters capitalised',
    fn: toUpperCase,
    example: 'HELLO WORLD',
  },
  {
    id: 'lowercase',
    label: 'lowercase',
    sublabel: 'All characters lowercased',
    fn: toLowerCase,
    example: 'hello world',
  },
  {
    id: 'titleCase',
    label: 'Title Case',
    sublabel: 'First letter of each word',
    fn: toTitleCase,
    example: 'Hello World',
  },
  {
    id: 'sentenceCase',
    label: 'Sentence case',
    sublabel: 'Capitalised at sentence starts',
    fn: toSentenceCase,
    example: 'Hello world. Second sentence.',
  },
  {
    id: 'camelCase',
    label: 'camelCase',
    sublabel: 'No spaces, first word lower',
    fn: toCamelCase,
    example: 'helloWorld',
  },
  {
    id: 'pascalCase',
    label: 'PascalCase',
    sublabel: 'No spaces, each word capitalised',
    fn: toPascalCase,
    example: 'HelloWorld',
  },
  {
    id: 'snakeCase',
    label: 'snake_case',
    sublabel: 'Words joined by underscores',
    fn: toSnakeCase,
    example: 'hello_world',
  },
  {
    id: 'kebabCase',
    label: 'kebab-case',
    sublabel: 'Words joined by hyphens',
    fn: toKebabCase,
    example: 'hello-world',
  },
  {
    id: 'screamingSnake',
    label: 'SCREAMING_SNAKE',
    sublabel: 'Uppercase with underscores',
    fn: toScreamingSnake,
    example: 'HELLO_WORLD',
  },
  {
    id: 'dotCase',
    label: 'dot.case',
    sublabel: 'Words joined by dots',
    fn: toDotCase,
    example: 'hello.world',
  },
  {
    id: 'pathCase',
    label: 'path/case',
    sublabel: 'Words joined by slashes',
    fn: toPathCase,
    example: 'hello/world',
  },
  {
    id: 'toggleCase',
    label: 'tOGGLE cASE',
    sublabel: 'Inverts each character case',
    fn: toToggleCase,
    example: 'hELLO wORLD',
  },
]

const toolObj = {
  id: 'text-case-converter-util',
  name: 'Text Case Converter',
  description: 'Convert text between uppercase, lowercase, camelCase, snake_case, and 8 more formats.',
  category: 'text-utilities',
  url: '/text-utilities/case-converter',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CaseConverterPage() {
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyAllDone, setCopyAllDone] = useState(false)

  const charCount = input.length
  const wordCount = input.trim() === '' ? 0 : input.trim().split(/\s+/).length

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch {
      // fallback: do nothing silently
    }
  }, [])

  const copyAll = useCallback(async () => {
    if (!input.trim()) return
    const summary = CONVERSIONS.map((c) => `${c.label}:\n${c.fn(input)}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(summary)
      setCopyAllDone(true)
      setTimeout(() => setCopyAllDone(false), 2000)
    } catch {
      // fallback
    }
  }, [input])

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between uppercase, lowercase, camelCase, snake_case, and 8 more formats instantly."
      category="Text Utilities"
      categoryHref="/text-utilities"
      relatedTools={[
        { name: 'Text Counter', href: '/text-utilities/text-counter' },
        { name: 'Case Converter', href: '/text-tools/case-converter' },
        { name: 'Text Reverser', href: '/text-tools/text-reverser' },
      ]}
    >
      <div className="space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="text-case-converter-util" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Input card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-accent" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste or type your text. All conversions update instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text" className="sr-only">
                Input text
              </Label>
              <Textarea
                id="input-text"
                placeholder="Type or paste your text here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px] font-mono text-sm resize-y"
                spellCheck={false}
              />
            </div>

            {/* Stats + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">{charCount}</span>
                    {' '}char{charCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">{wordCount}</span>
                    {' '}word{wordCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                  disabled={!input.trim()}
                >
                  {copyAllDone ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <ClipboardList className="w-4 h-4" />
                  )}
                  {copyAllDone ? 'Copied all' : 'Copy all formats'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('')}
                  disabled={!input}
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {CONVERSIONS.map((conv) => {
            const result = input ? conv.fn(input) : ''
            const isCopied = copiedId === conv.id

            return (
              <Card key={conv.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold font-mono tracking-tight">
                        {conv.label}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {conv.sublabel}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result, conv.id)}
                      disabled={!result}
                      className="shrink-0 h-7 px-2"
                      aria-label={`Copy ${conv.label}`}
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1">
                  <div className="bg-muted rounded-md px-3 py-2 min-h-[44px] flex items-center">
                    {result ? (
                      <span className="font-mono text-sm break-all leading-relaxed text-foreground">
                        {result}
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground italic">
                        {conv.example}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Format reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-4 h-4 text-accent" />
              Format Reference
            </CardTitle>
            <CardDescription>
              When to use each naming convention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'UPPERCASE', use: 'Constants, headings, abbreviations' },
                { label: 'lowercase', use: 'Body text, filenames, email addresses' },
                { label: 'Title Case', use: 'Headlines, book titles, proper nouns' },
                { label: 'Sentence case', use: 'UI labels, button text, descriptions' },
                { label: 'camelCase', use: 'JavaScript variables and function names' },
                { label: 'PascalCase', use: 'Class names, React components, types' },
                { label: 'snake_case', use: 'Python variables, database columns, Ruby' },
                { label: 'kebab-case', use: 'CSS classes, HTML attributes, URL slugs' },
                { label: 'SCREAMING_SNAKE', use: 'Environment variables, shell constants' },
                { label: 'dot.case', use: 'Config keys, i18n translation IDs' },
                { label: 'path/case', use: 'File paths, URL segments, routing' },
                { label: 'tOGGLE cASE', use: 'Stylistic emphasis, mocking text meme' },
              ].map(({ label, use }) => (
                <div key={label} className="flex items-baseline gap-2.5 py-1 border-b border-border/40 last:border-0">
                  <Badge variant="secondary" className="font-mono text-xs shrink-0">
                    {label}
                  </Badge>
                  <span className="text-sm text-muted-foreground leading-snug">{use}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
