'use client'

import React, { useState, useCallback } from 'react'
import { CalendarDays, Clock, PlusCircle, MinusCircle, ArrowLeftRight, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

const toolObj = {
  id: 'time-calculator',
  name: 'Time Calculator',
  description: 'Add or subtract time from a date, or calculate the exact difference between two dates.',
  category: 'timestamp-tools',
  url: '/timestamp-tools/time-calculator',
}

const relatedTools = [
  { name: 'Epoch Converter', href: '/timestamp-tools/epoch-converter' },
  { name: 'Unix Timestamp', href: '/timestamp-tools/unix-converter' },
  { name: 'Timezone Converter', href: '/timestamp-tools/timezone-converter' },
]

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toLocalDatetimeString(date: Date): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`
}

function nowString(): string {
  return toLocalDatetimeString(new Date())
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface AddSubtractFields {
  days: string
  hours: string
  minutes: string
  seconds: string
}

interface DiffResult {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  isNegative: boolean
}

function computeAddSubtract(
  baseDate: Date,
  fields: AddSubtractFields,
  operation: 'add' | 'subtract'
): Date {
  const sign = operation === 'add' ? 1 : -1
  const days = parseFloat(fields.days) || 0
  const hours = parseFloat(fields.hours) || 0
  const minutes = parseFloat(fields.minutes) || 0
  const seconds = parseFloat(fields.seconds) || 0

  const totalMs =
    sign *
    (days * 86400000 +
      hours * 3600000 +
      minutes * 60000 +
      seconds * 1000)

  return new Date(baseDate.getTime() + totalMs)
}

function computeDiff(dateA: Date, dateB: Date): DiffResult {
  const isNegative = dateB < dateA
  const [start, end] = isNegative ? [dateB, dateA] : [dateA, dateB]

  const totalMs = end.getTime() - start.getTime()
  const totalSeconds = Math.floor(totalMs / 1000)
  const totalMinutes = Math.floor(totalMs / 60000)
  const totalHours = Math.floor(totalMs / 3600000)
  const totalDays = Math.floor(totalMs / 86400000)

  // Compute years/months/days/hours/minutes/seconds breakdown
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()
  let hours = end.getHours() - start.getHours()
  let minutes = end.getMinutes() - start.getMinutes()
  let seconds = end.getSeconds() - start.getSeconds()

  if (seconds < 0) { seconds += 60; minutes-- }
  if (minutes < 0) { minutes += 60; hours-- }
  if (hours < 0) { hours += 24; days-- }
  if (days < 0) {
    // borrow days from previous month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
    months--
  }
  if (months < 0) { months += 12; years-- }

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    isNegative,
  }
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-muted rounded-md px-4 py-3 min-w-[72px]">
      <span
        className="font-mono text-xl font-semibold text-accent tabular-nums leading-none"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className="font-mono text-sm font-medium tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function TimeCalculatorPage() {
  // --- Add/Subtract state ---
  const [baseDate, setBaseDate] = useState<string>(nowString())
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [fields, setFields] = useState<AddSubtractFields>({
    days: '',
    hours: '',
    minutes: '',
    seconds: '',
  })
  const [addSubResult, setAddSubResult] = useState<Date | null>(null)
  const [addSubError, setAddSubError] = useState<string>('')

  // --- Difference state ---
  const [dateA, setDateA] = useState<string>(nowString())
  const [dateB, setDateB] = useState<string>('')
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [diffError, setDiffError] = useState<string>('')

  // --- Add/Subtract handlers ---
  const handleFieldChange = (key: keyof AddSubtractFields, val: string) => {
    // allow digits, decimal point, minus only
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setFields((prev) => ({ ...prev, [key]: val }))
    }
  }

  const handleCalculateAddSub = useCallback(() => {
    setAddSubError('')
    setAddSubResult(null)

    if (!baseDate) {
      setAddSubError('Please enter a starting date and time.')
      return
    }
    const parsed = new Date(baseDate)
    if (isNaN(parsed.getTime())) {
      setAddSubError('The starting date is not valid.')
      return
    }

    const hasAny =
      fields.days !== '' ||
      fields.hours !== '' ||
      fields.minutes !== '' ||
      fields.seconds !== ''

    if (!hasAny) {
      setAddSubError('Enter at least one time value to add or subtract.')
      return
    }

    const result = computeAddSubtract(parsed, fields, operation)
    setAddSubResult(result)
  }, [baseDate, fields, operation])

  const handleResetAddSub = () => {
    setBaseDate(nowString())
    setFields({ days: '', hours: '', minutes: '', seconds: '' })
    setAddSubResult(null)
    setAddSubError('')
  }

  // --- Difference handlers ---
  const handleCalculateDiff = useCallback(() => {
    setDiffError('')
    setDiffResult(null)

    if (!dateA) {
      setDiffError('Please enter the first date.')
      return
    }
    if (!dateB) {
      setDiffError('Please enter the second date.')
      return
    }
    const a = new Date(dateA)
    const b = new Date(dateB)
    if (isNaN(a.getTime())) {
      setDiffError('The first date is not valid.')
      return
    }
    if (isNaN(b.getTime())) {
      setDiffError('The second date is not valid.')
      return
    }
    if (a.getTime() === b.getTime()) {
      setDiffError('Both dates are identical — the difference is zero.')
      return
    }

    setDiffResult(computeDiff(a, b))
  }, [dateA, dateB])

  const handleSwapDates = () => {
    setDateA(dateB)
    setDateB(dateA)
    setDiffResult(null)
    setDiffError('')
  }

  const handleResetDiff = () => {
    setDateA(nowString())
    setDateB('')
    setDiffResult(null)
    setDiffError('')
  }

  return (
    <ToolLayout
      title="Time Calculator"
      description="Add or subtract time from any date, or calculate the exact difference between two dates — broken down into years, months, days, hours, minutes, and seconds."
      category="Timestamp Tools"
      categoryHref="/timestamp-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement bar */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="time-calculator" />
          <ShareButton tool={toolObj} />
        </div>

        <Tabs defaultValue="add-subtract" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="add-subtract" className="flex items-center gap-1.5">
              <PlusCircle className="size-3.5" />
              Add / Subtract
            </TabsTrigger>
            <TabsTrigger value="difference" className="flex items-center gap-1.5">
              <ArrowLeftRight className="size-3.5" />
              Difference
            </TabsTrigger>
          </TabsList>

          {/* ── ADD / SUBTRACT TAB ── */}
          <TabsContent value="add-subtract" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-4 text-accent" />
                  Add or Subtract Time
                </CardTitle>
                <CardDescription>
                  Start from a date and time, then apply an offset in days, hours, minutes, and seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Starting date */}
                <div className="space-y-1.5">
                  <Label htmlFor="base-date">Starting Date &amp; Time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="base-date"
                      type="datetime-local"
                      value={baseDate}
                      onChange={(e) => {
                        setBaseDate(e.target.value)
                        setAddSubResult(null)
                        setAddSubError('')
                      }}
                      step="1"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setBaseDate(nowString())
                        setAddSubResult(null)
                      }}
                      title="Set to now"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Operation toggle */}
                <div className="space-y-1.5">
                  <Label>Operation</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={operation === 'add' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setOperation('add'); setAddSubResult(null) }}
                      className="flex items-center gap-1.5"
                    >
                      <PlusCircle className="size-3.5" />
                      Add
                    </Button>
                    <Button
                      variant={operation === 'subtract' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setOperation('subtract'); setAddSubResult(null) }}
                      className="flex items-center gap-1.5"
                    >
                      <MinusCircle className="size-3.5" />
                      Subtract
                    </Button>
                  </div>
                </div>

                {/* Time fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { key: 'days', label: 'Days' },
                      { key: 'hours', label: 'Hours' },
                      { key: 'minutes', label: 'Minutes' },
                      { key: 'seconds', label: 'Seconds' },
                    ] as { key: keyof AddSubtractFields; label: string }[]
                  ).map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={`field-${key}`}>{label}</Label>
                      <Input
                        id={`field-${key}`}
                        type="number"
                        min="0"
                        value={fields[key]}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>
                  ))}
                </div>

                {addSubError && (
                  <p className="text-sm text-destructive">{addSubError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleCalculateAddSub}>Calculate</Button>
                  <Button variant="outline" onClick={handleResetAddSub}>Reset</Button>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            {addSubResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-accent" />
                    Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      {operation === 'add' ? 'After adding' : 'After subtracting'}
                    </p>
                    <p className="text-lg font-semibold text-foreground leading-snug">
                      {formatDateTime(addSubResult)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {DAYS_OF_WEEK[addSubResult.getDay()]}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {addSubResult.toISOString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</p>
                      <p className="font-medium">{formatDateTime(new Date(baseDate))}</p>
                      <Badge variant="outline" className="text-xs">
                        {DAYS_OF_WEEK[new Date(baseDate).getDay()]}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Offset applied</p>
                      <p className="font-medium font-mono tabular-nums">
                        {operation === 'add' ? '+' : '−'}{' '}
                        {[
                          fields.days && `${fields.days}d`,
                          fields.hours && `${fields.hours}h`,
                          fields.minutes && `${fields.minutes}m`,
                          fields.seconds && `${fields.seconds}s`,
                        ]
                          .filter(Boolean)
                          .join(' ') || '0s'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── DIFFERENCE TAB ── */}
          <TabsContent value="difference" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="size-4 text-accent" />
                  Difference Between Two Dates
                </CardTitle>
                <CardDescription>
                  Enter any two dates and times to get the exact elapsed time between them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="date-a">First Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input
                        id="date-a"
                        type="datetime-local"
                        value={dateA}
                        onChange={(e) => {
                          setDateA(e.target.value)
                          setDiffResult(null)
                          setDiffError('')
                        }}
                        step="1"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { setDateA(nowString()); setDiffResult(null) }}
                        title="Set to now"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date-b">Second Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input
                        id="date-b"
                        type="datetime-local"
                        value={dateB}
                        onChange={(e) => {
                          setDateB(e.target.value)
                          setDiffResult(null)
                          setDiffError('')
                        }}
                        step="1"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { setDateB(nowString()); setDiffResult(null) }}
                        title="Set to now"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {diffError && (
                  <p className="text-sm text-destructive">{diffError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleCalculateDiff}>Calculate</Button>
                  <Button variant="outline" onClick={handleSwapDates} className="flex items-center gap-1.5">
                    <ArrowLeftRight className="size-3.5" />
                    Swap
                  </Button>
                  <Button variant="outline" onClick={handleResetDiff}>Reset</Button>
                </div>
              </CardContent>
            </Card>

            {/* Difference result */}
            {diffResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-accent" />
                    Time Difference
                    {diffResult.isNegative && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        Second date is earlier
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Breakdown pills */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                      Breakdown
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {diffResult.years > 0 && (
                        <StatPill label="years" value={diffResult.years} />
                      )}
                      {diffResult.months > 0 && (
                        <StatPill label="months" value={diffResult.months} />
                      )}
                      <StatPill label="days" value={diffResult.days} />
                      <StatPill label="hours" value={diffResult.hours} />
                      <StatPill label="minutes" value={diffResult.minutes} />
                      <StatPill label="seconds" value={diffResult.seconds} />
                    </div>
                  </div>

                  {/* Natural language summary */}
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wide text-xs">Summary</p>
                    <p className="text-foreground font-medium leading-relaxed">
                      {[
                        diffResult.years > 0 && `${diffResult.years} year${diffResult.years !== 1 ? 's' : ''}`,
                        diffResult.months > 0 && `${diffResult.months} month${diffResult.months !== 1 ? 's' : ''}`,
                        diffResult.days > 0 && `${diffResult.days} day${diffResult.days !== 1 ? 's' : ''}`,
                        diffResult.hours > 0 && `${diffResult.hours} hour${diffResult.hours !== 1 ? 's' : ''}`,
                        diffResult.minutes > 0 && `${diffResult.minutes} minute${diffResult.minutes !== 1 ? 's' : ''}`,
                        diffResult.seconds > 0 && `${diffResult.seconds} second${diffResult.seconds !== 1 ? 's' : ''}`,
                      ]
                        .filter(Boolean)
                        .join(', ') || '0 seconds'}
                    </p>
                  </div>

                  {/* Total units */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Total in each unit
                    </p>
                    <div className="rounded-md border border-border/60 px-3 py-1">
                      <TotalRow
                        label="Total days"
                        value={diffResult.totalDays.toLocaleString()}
                      />
                      <TotalRow
                        label="Total hours"
                        value={diffResult.totalHours.toLocaleString()}
                      />
                      <TotalRow
                        label="Total minutes"
                        value={diffResult.totalMinutes.toLocaleString()}
                      />
                      <TotalRow
                        label="Total seconds"
                        value={diffResult.totalSeconds.toLocaleString()}
                      />
                    </div>
                  </div>

                  {/* Date pair summary */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: 'From', value: dateA },
                      { label: 'To', value: dateB },
                    ].map(({ label, value }) => {
                      const d = new Date(value)
                      return (
                        <div key={label} className="bg-muted rounded-lg p-3 space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-medium leading-snug">{formatDateTime(d)}</p>
                          <Badge variant="outline" className="text-xs">
                            {DAYS_OF_WEEK[d.getDay()]}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  )
}
