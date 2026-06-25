'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Copy,
  Check,
  Globe,
  Plus,
  X,
  Sun,
  Moon,
  CalendarDays,
  Timer,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

const toolObj = {
  id: 'current-time',
  name: 'Current Time Display',
  description: 'View the current time, date, and Unix timestamp live across any timezone.',
  category: 'timestamp-tools',
  url: '/timestamp-tools/current-time',
}

const relatedTools = [
  { name: 'Timezone Converter', href: '/timestamp-tools/timezone-converter' },
  { name: 'Unix Timestamp', href: '/timestamp-tools/unix-converter' },
  { name: 'Epoch Converter', href: '/timestamp-tools/epoch-converter' },
]

const MAJOR_TIMEZONES = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'America/Denver', label: 'Denver (MT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKT)' },
  { value: 'America/Honolulu', label: 'Honolulu (HT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai / Kolkata (IST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai / Beijing (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
]

function getTimezoneAbbr(tz: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(date)
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? tz
  } catch {
    return tz
  }
}

function isDST(tz: string, date: Date): boolean {
  try {
    const jan = new Date(date.getFullYear(), 0, 1)
    const jul = new Date(date.getFullYear(), 6, 1)
    const getOffset = (d: Date) => {
      const str = d.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' })
      const match = str.match(/GMT([+-]\d+)/)
      return match ? parseInt(match[1]) : 0
    }
    const janOffset = getOffset(jan)
    const julOffset = getOffset(jul)
    const currentOffset = getOffset(date)
    // DST is when the offset is higher (further from 0 in the direction of summer)
    return currentOffset !== Math.min(janOffset, julOffset)
  } catch {
    return false
  }
}

function formatClockTime(date: Date, tz: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatDate(date: Date, tz: string, fmt: 'long' | 'short' | 'iso' | 'rfc' | 'relative'): string {
  switch (fmt) {
    case 'long':
      return date.toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'short':
      return date.toLocaleDateString('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    case 'iso':
      // ISO 8601 in specified timezone — we produce the date portion
      return date.toLocaleDateString('en-CA', { timeZone: tz }) + 'T' + formatClockTime(date, tz)
    case 'rfc':
      return date.toUTCString()
    case 'relative':
      return 'Just now'
    default:
      return date.toISOString()
  }
}

function isDaytime(date: Date, tz: string): boolean {
  const hour = parseInt(
    date.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }),
    10
  )
  return hour >= 6 && hour < 20
}

interface TimezoneClockProps {
  tz: string
  date: Date
  onRemove: (tz: string) => void
  isLocal?: boolean
}

function TimezoneClock({ tz, date, onRemove, isLocal = false }: TimezoneClockProps) {
  const timeStr = formatClockTime(date, tz)
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const abbr = getTimezoneAbbr(tz, date)
  const dst = isDST(tz, date)
  const daytime = isDaytime(date, tz)
  const label = MAJOR_TIMEZONES.find((t) => t.value === tz)?.label ?? tz

  return (
    <Card className="relative">
      {!isLocal && (
        <button
          onClick={() => onRemove(tz)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={`Remove ${tz}`}
        >
          <X className="size-3.5" />
        </button>
      )}
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-muted-foreground">
            {daytime ? <Sun className="size-3.5 mt-0.5" /> : <Moon className="size-3.5 mt-0.5" />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate font-medium tracking-wide uppercase leading-none mb-0.5">
              {abbr}
              {isLocal && (
                <span className="ml-1.5 normal-case tracking-normal font-normal">(your timezone)</span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{label}</p>
          </div>
        </div>
        <div
          className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground leading-tight mt-2"
          aria-live="polite"
          aria-label={`Current time in ${label}`}
        >
          {timeStr}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">{dateStr}</span>
          {dst && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-warning border-warning/40">
              DST
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CurrentTimePage() {
  const [now, setNow] = useState<Date>(() => new Date())
  const [localTz, setLocalTz] = useState<string>('UTC')
  const [additionalTzs, setAdditionalTzs] = useState<string[]>([
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
  ])
  const [selectedTzToAdd, setSelectedTzToAdd] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setLocalTz(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const unixSeconds = Math.floor(now.getTime() / 1000)
  const unixMs = now.getTime()

  const copyText = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      // clipboard unavailable
    }
  }, [])

  const addTimezone = () => {
    if (!selectedTzToAdd) return
    if (selectedTzToAdd === localTz) return
    if (additionalTzs.includes(selectedTzToAdd)) return
    setAdditionalTzs((prev) => [...prev, selectedTzToAdd])
    setSelectedTzToAdd('')
  }

  const removeTimezone = (tz: string) => {
    setAdditionalTzs((prev) => prev.filter((t) => t !== tz))
  }

  const availableToAdd = MAJOR_TIMEZONES.filter(
    (tz) => tz.value !== localTz && !additionalTzs.includes(tz.value)
  )

  const timeStr = formatClockTime(now, localTz)
  const localDst = isDST(localTz, now)
  const localAbbr = getTimezoneAbbr(localTz, now)

  const dateFormats = [
    { label: 'Full date', value: formatDate(now, localTz, 'long'), key: 'long' },
    { label: 'Short date', value: formatDate(now, localTz, 'short'), key: 'short' },
    { label: 'ISO 8601', value: formatDate(now, localTz, 'iso'), key: 'iso' },
    { label: 'RFC 2822 / UTC', value: formatDate(now, 'UTC', 'rfc'), key: 'rfc' },
  ]

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyText(text, id)}
      className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      aria-label="Copy to clipboard"
    >
      {copied === id ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  )

  return (
    <ToolLayout
      title="Current Time Display"
      description="Live clock showing the current time, date, and Unix timestamp — across any timezone."
      category="Timestamp Tools"
      categoryHref="/timestamp-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="current-time" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Primary clock */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Live Clock
            </CardTitle>
            <CardDescription>
              Updating every second &mdash; detected timezone: <span className="text-foreground font-medium">{localTz}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Big clock face */}
            <div className="bg-muted rounded-lg p-6 flex flex-col items-center sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div
                  className="font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-foreground leading-none"
                  aria-live="polite"
                  aria-label="Current time"
                >
                  {timeStr}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">
                    {now.toLocaleDateString('en-US', {
                      timeZone: localTz,
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {localAbbr}
                  </Badge>
                  {localDst && (
                    <Badge variant="outline" className="text-xs text-warning border-warning/40">
                      DST active
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyText(timeStr, 'clock')}
                className="shrink-0"
              >
                {copied === 'clock' ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === 'clock' ? 'Copied' : 'Copy time'}
              </Button>
            </div>

            {/* UTC row */}
            <div className="flex items-center gap-3 px-1">
              <Globe className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">UTC:</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {formatClockTime(now, 'UTC')} &mdash; {now.toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <CopyButton text={formatClockTime(now, 'UTC')} id="utc" />
            </div>
          </CardContent>
        </Card>

        {/* Unix timestamp */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Timer className="size-4" />
              Unix Timestamp
            </CardTitle>
            <CardDescription>
              Seconds elapsed since the Unix epoch (Jan 1, 1970 00:00:00 UTC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5 font-medium">Seconds</p>
                <p
                  className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground leading-tight"
                  aria-live="polite"
                  aria-label="Unix timestamp in seconds"
                >
                  {unixSeconds.toLocaleString('en-US')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyText(unixSeconds.toString(), 'unix-s')}
              >
                {copied === 'unix-s' ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copy
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5 font-medium">Milliseconds</p>
                  <p
                    className="font-mono text-sm tabular-nums text-foreground"
                    aria-live="polite"
                    aria-label="Unix timestamp in milliseconds"
                  >
                    {unixMs.toLocaleString('en-US')}
                  </p>
                </div>
                <CopyButton text={unixMs.toString()} id="unix-ms" />
              </div>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5 font-medium">ISO 8601</p>
                  <p
                    className="font-mono text-sm tabular-nums text-foreground truncate"
                    aria-live="polite"
                    aria-label="Current time in ISO 8601 format"
                  >
                    {now.toISOString()}
                  </p>
                </div>
                <CopyButton text={now.toISOString()} id="iso" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date formats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Current Date Formats
            </CardTitle>
            <CardDescription>
              Common representations of today&apos;s date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dateFormats.map(({ label, value, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                      {label}
                    </p>
                    <p className="font-mono text-sm text-foreground tabular-nums truncate">{value}</p>
                  </div>
                  <CopyButton text={value} id={`fmt-${key}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* World clocks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4" />
              World Clocks
            </CardTitle>
            <CardDescription>
              Your local timezone plus any others you add
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Add timezone control */}
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor="tz-select" className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Add timezone
                </Label>
                <Select value={selectedTzToAdd} onValueChange={setSelectedTzToAdd}>
                  <SelectTrigger id="tz-select" className="w-full">
                    <SelectValue placeholder="Select a timezone…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={addTimezone}
                disabled={!selectedTzToAdd}
                variant="outline"
                className="shrink-0"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {/* Clock grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Local timezone always first */}
              <TimezoneClock
                tz={localTz}
                date={now}
                onRemove={() => {}}
                isLocal
              />
              {additionalTzs.map((tz) => (
                <TimezoneClock
                  key={tz}
                  tz={tz}
                  date={now}
                  onRemove={removeTimezone}
                />
              ))}
            </div>

            {additionalTzs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Add timezones above to compare them side by side.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
