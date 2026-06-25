'use client'

import React, { useState, useCallback } from 'react'
import {
  Calendar,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Hash,
  AlignLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ── helpers ────────────────────────────────────────────────────────────────

const toolObj = {
  id: 'date-format-converter',
  name: 'Date Format Converter',
  description: 'Convert any date into dozens of formats instantly — ISO 8601, RFC 2822, Unix, human-readable, relative, and more.',
  category: 'timestamp-tools',
  url: '/timestamp-tools/date-format',
}

const relatedTools = [
  { name: 'Epoch Converter', href: '/timestamp-tools/epoch-converter' },
  { name: 'Unix Timestamp', href: '/timestamp-tools/unix-converter' },
  { name: 'Time Calculator', href: '/timestamp-tools/time-calculator' },
]

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getQuarter(d: Date): number {
  return Math.floor(d.getMonth() / 3) + 1
}

function getRelativeTime(d: Date): string {
  const now = Date.now()
  const diffMs = now - d.getTime()
  const abs = Math.abs(diffMs)
  const isFuture = diffMs < 0

  const seconds = Math.floor(abs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30.44)
  const years = Math.floor(days / 365.25)

  let label: string
  if (seconds < 45) label = 'just now'
  else if (seconds < 90) label = `${isFuture ? 'in ' : ''}1 minute${isFuture ? '' : ' ago'}`
  else if (minutes < 45) label = `${isFuture ? 'in ' : ''}${minutes} minutes${isFuture ? '' : ' ago'}`
  else if (minutes < 90) label = `${isFuture ? 'in ' : ''}1 hour${isFuture ? '' : ' ago'}`
  else if (hours < 22) label = `${isFuture ? 'in ' : ''}${hours} hours${isFuture ? '' : ' ago'}`
  else if (hours < 36) label = `${isFuture ? 'in ' : ''}1 day${isFuture ? '' : ' ago'}`
  else if (days < 25) label = `${isFuture ? 'in ' : ''}${days} days${isFuture ? '' : ' ago'}`
  else if (days < 45) label = `${isFuture ? 'in ' : ''}1 month${isFuture ? '' : ' ago'}`
  else if (months < 11) label = `${isFuture ? 'in ' : ''}${months} months${isFuture ? '' : ' ago'}`
  else if (months < 18) label = `${isFuture ? 'in ' : ''}1 year${isFuture ? '' : ' ago'}`
  else label = `${isFuture ? 'in ' : ''}${years} years${isFuture ? '' : ' ago'}`

  return label
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function pad4(n: number): string {
  return String(n).padStart(4, '0')
}

// Custom format token engine (YYYY-MM-DD HH:mm:ss style)
function applyCustomFormat(d: Date, fmt: string): string {
  const YYYY = pad4(d.getFullYear())
  const YY = YYYY.slice(2)
  const MM = pad2(d.getMonth() + 1)
  const DD = pad2(d.getDate())
  const HH = pad2(d.getHours())
  const hh = pad2(d.getHours() % 12 || 12)
  const mm = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  const A = d.getHours() < 12 ? 'AM' : 'PM'
  const a = A.toLowerCase()
  const D = String(d.getDate())
  const M = String(d.getMonth() + 1)
  const H = String(d.getHours())
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return fmt
    .replace(/YYYY/g, YYYY)
    .replace(/YY/g, YY)
    .replace(/MMMM/g, monthNames[d.getMonth()])
    .replace(/MMM/g, monthShort[d.getMonth()])
    .replace(/MM/g, MM)
    .replace(/M(?!M)/g, M)
    .replace(/DDDD/g, dayNames[d.getDay()])
    .replace(/DDD/g, dayShort[d.getDay()])
    .replace(/DD/g, DD)
    .replace(/D(?!D)/g, D)
    .replace(/HH/g, HH)
    .replace(/H(?!H)/g, H)
    .replace(/hh/g, hh)
    .replace(/h(?!h)/g, String(d.getHours() % 12 || 12))
    .replace(/mm/g, mm)
    .replace(/ss/g, ss)
    .replace(/A/g, A)
    .replace(/a/g, a)
}

interface FormatRow {
  label: string
  value: string
  mono?: boolean
  group?: string
}

function buildFormats(d: Date): FormatRow[] {
  const iso = d.toISOString()
  const rfc = d.toUTCString()
  const unix = Math.floor(d.getTime() / 1000)

  const humanReadable = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d)

  const short = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(d)

  const european = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${pad4(d.getFullYear())}`

  const utcStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(d)

  const localStr = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(d)

  const relative = getRelativeTime(d)

  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d)
  const dayOfYear = getDayOfYear(d)
  const weekNum = getISOWeek(d)
  const quarter = getQuarter(d)

  return [
    { label: 'ISO 8601', value: iso, mono: true, group: 'Standards' },
    { label: 'RFC 2822', value: rfc, mono: true, group: 'Standards' },
    { label: 'Unix Timestamp', value: String(unix), mono: true, group: 'Standards' },
    { label: 'Human Readable', value: humanReadable, group: 'Locale' },
    { label: 'Short (US)', value: short, group: 'Locale' },
    { label: 'European', value: european, group: 'Locale' },
    { label: 'UTC', value: utcStr, group: 'Locale' },
    { label: 'Local', value: localStr, group: 'Locale' },
    { label: 'Relative', value: relative, group: 'Locale' },
    { label: 'Day of Week', value: dayOfWeek, group: 'Calendar Facts' },
    { label: 'Day of Year', value: String(dayOfYear), mono: true, group: 'Calendar Facts' },
    { label: 'ISO Week Number', value: `W${pad2(weekNum)}`, mono: true, group: 'Calendar Facts' },
    { label: 'Quarter', value: `Q${quarter}`, mono: true, group: 'Calendar Facts' },
  ]
}

// ── sub-components ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (_) {
      // clipboard unavailable
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={`
        flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0
        border transition-colors duration-150
        ${copied
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      `}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function FormatGroup({ label, rows }: { label: string; rows: FormatRow[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 mt-1">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground select-none">
          {label}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors group"
          >
            <span className="w-36 flex-shrink-0 text-xs text-muted-foreground leading-snug">
              {row.label}
            </span>
            <span
              className={`flex-1 text-sm leading-snug break-all tabular-nums ${row.mono ? 'font-mono' : ''}`}
            >
              {row.value}
            </span>
            <CopyButton text={row.value} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── page ────────────────────────────────────────────────────────────────────

export default function DateFormatPage() {
  const nowLocal = () => {
    const n = new Date()
    const pad = (x: number) => String(x).padStart(2, '0')
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`
  }

  const [dateValue, setDateValue] = useState<string>(nowLocal)
  const [customFmt, setCustomFmt] = useState<string>('YYYY-MM-DD HH:mm:ss')
  const [customOutput, setCustomOutput] = useState<string>('')
  const [customError, setCustomError] = useState<string>('')

  const parsedDate: Date | null = (() => {
    if (!dateValue) return null
    const d = new Date(dateValue)
    return isNaN(d.getTime()) ? null : d
  })()

  const formats = parsedDate ? buildFormats(parsedDate) : []

  const groups: Record<string, FormatRow[]> = {}
  for (const row of formats) {
    const g = row.group ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(row)
  }

  // Custom format
  const handleCustomFormat = useCallback(() => {
    if (!parsedDate) {
      setCustomError('Please enter a valid date first.')
      setCustomOutput('')
      return
    }
    try {
      const result = applyCustomFormat(parsedDate, customFmt)
      setCustomOutput(result)
      setCustomError('')
    } catch (_) {
      setCustomError('Could not apply format string.')
      setCustomOutput('')
    }
  }, [parsedDate, customFmt])

  // Run on format string change + date change
  React.useEffect(() => {
    if (parsedDate && customFmt) {
      try {
        setCustomOutput(applyCustomFormat(parsedDate, customFmt))
        setCustomError('')
      } catch (_) {
        setCustomError('Could not apply format string.')
        setCustomOutput('')
      }
    } else {
      setCustomOutput('')
    }
  }, [parsedDate, customFmt])

  return (
    <ToolLayout
      title="Date Format Converter"
      description="Convert any date into dozens of formats instantly — ISO 8601, RFC 2822, Unix, human-readable, relative, and more."
      category="Timestamp Tools"
      categoryHref="/timestamp-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="date-format-converter" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Input card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Select a Date
            </CardTitle>
            <CardDescription>
              Choose a date and time to see it rendered in every common format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="date-input" className="sr-only">Date and time</Label>
                <Input
                  id="date-input"
                  type="datetime-local"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setDateValue(nowLocal())}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
                Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Format output grid */}
        {parsedDate ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-accent" />
                All Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(groups).map(([groupLabel, rows]) => (
                <FormatGroup key={groupLabel} label={groupLabel} rows={rows} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              Enter a date above to see all formats.
            </CardContent>
          </Card>
        )}

        {/* Custom format card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-accent" />
              Custom Format String
            </CardTitle>
            <CardDescription>
              Build your own format using tokens. The result updates as you type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-fmt">Format string</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="custom-fmt"
                  value={customFmt}
                  onChange={(e) => setCustomFmt(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  className="font-mono flex-1"
                />
                {customOutput && <CopyButton text={customOutput} />}
              </div>
            </div>

            {customError && (
              <p className="text-sm text-destructive">{customError}</p>
            )}

            {customOutput && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Output</p>
                <p className="font-mono text-base break-all">{customOutput}</p>
              </div>
            )}

            {/* Token reference */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Token Reference</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                {[
                  ['YYYY', '4-digit year'],
                  ['YY', '2-digit year'],
                  ['MMMM', 'Full month name'],
                  ['MMM', 'Short month name'],
                  ['MM', 'Month (01–12)'],
                  ['M', 'Month (1–12)'],
                  ['DDDD', 'Full day name'],
                  ['DDD', 'Short day name'],
                  ['DD', 'Day (01–31)'],
                  ['D', 'Day (1–31)'],
                  ['HH', 'Hour 24h (00–23)'],
                  ['hh', 'Hour 12h (01–12)'],
                  ['mm', 'Minutes (00–59)'],
                  ['ss', 'Seconds (00–59)'],
                  ['A', 'AM / PM'],
                  ['a', 'am / pm'],
                ].map(([token, desc]) => (
                  <div key={token} className="flex items-baseline gap-1.5 text-xs">
                    <code className="font-mono text-accent font-semibold">{token}</code>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preset examples */}
            <div className="pt-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Presets</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'YYYY-MM-DD',
                  'DD/MM/YYYY',
                  'MM/DD/YYYY',
                  'DDDD, MMMM D, YYYY',
                  'YYYY-MM-DD HH:mm:ss',
                  'hh:mm A',
                  'MMM D, YYYY',
                  'YYYY/MM/DD HH:mm',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomFmt(preset)}
                    className={`
                      text-xs px-2.5 py-1 rounded border font-mono transition-colors
                      ${customFmt === preset
                        ? 'border-accent/50 bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/50'
                      }
                    `}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Format Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-foreground">Standards</h4>
              <p><span className="font-medium text-foreground">ISO 8601</span> — International standard. Used in APIs, databases, and data interchange. Always UTC (Z suffix).</p>
              <p><span className="font-medium text-foreground">RFC 2822</span> — Email and HTTP standard. Used in email headers and HTTP <code className="font-mono text-xs">Date</code> fields.</p>
              <p><span className="font-medium text-foreground">Unix Timestamp</span> — Seconds since 1970-01-01T00:00:00Z. Language-agnostic and timezone-free.</p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-foreground">Calendar Facts</h4>
              <p><span className="font-medium text-foreground">ISO Week</span> — Follows ISO 8601: weeks start Monday, W01 is the week containing the first Thursday of the year.</p>
              <p><span className="font-medium text-foreground">Day of Year</span> — 1-indexed ordinal day, useful for scheduling and date arithmetic.</p>
              <p><span className="font-medium text-foreground">Quarter</span> — Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
