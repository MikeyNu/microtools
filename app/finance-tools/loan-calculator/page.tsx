'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  interestPct: number
  amortization: AmortizationRow[]
}

interface EarlyPayoffResult {
  originalMonths: number
  newMonths: number
  monthsSaved: number
  interestSaved: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function fmtShort(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function calcPMT(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months
  const r = monthlyRate
  const n = months
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function buildAmortization(
  principal: number,
  monthlyRate: number,
  months: number,
  pmt: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = []
  let balance = principal
  for (let m = 1; m <= months; m++) {
    const interestCharge = balance * monthlyRate
    const principalCharge = Math.min(pmt - interestCharge, balance)
    balance = Math.max(balance - principalCharge, 0)
    rows.push({
      month: m,
      payment: pmt,
      principal: principalCharge,
      interest: interestCharge,
      balance,
    })
  }
  return rows
}

function earlyPayoff(
  principal: number,
  monthlyRate: number,
  originalMonths: number,
  extraPayment: number
): EarlyPayoffResult | null {
  if (extraPayment <= 0) return null
  const basePMT = calcPMT(principal, monthlyRate, originalMonths)
  const newPMT = basePMT + extraPayment

  let balance = principal
  let months = 0
  let totalInterest = 0
  while (balance > 0.005 && months < originalMonths * 2) {
    const interest = balance * monthlyRate
    const principalPaid = Math.min(newPMT - interest, balance)
    balance = Math.max(balance - principalPaid, 0)
    totalInterest += interest
    months++
  }

  const originalInterest = basePMT * originalMonths - principal

  return {
    originalMonths,
    newMonths: months,
    monthsSaved: originalMonths - months,
    interestSaved: originalInterest - totalInterest,
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const tool = {
  id: 'loan-calculator-finance',
  name: 'Loan Calculator',
  description: 'Calculate monthly payments, total interest, and see a full amortization schedule for any fixed or variable-rate loan.',
  category: 'finance-tools',
  url: '/finance-tools/loan-calculator',
}

const relatedTools = [
  { name: 'Compound Interest', href: '/finance-tools/compound-interest' },
  { name: 'Savings Calculator', href: '/finance-tools/savings-calculator' },
  { name: 'Retirement Calculator', href: '/finance-tools/retirement-calculator' },
]

export default function LoanCalculatorPage() {
  // ── Inputs
  const [loanAmount, setLoanAmount] = useState('25000')
  const [annualRate, setAnnualRate] = useState('6.5')
  const [termValue, setTermValue] = useState('5')
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years')
  const [loanType, setLoanType] = useState<'fixed' | 'variable'>('fixed')
  const [extraPayment, setExtraPayment] = useState('')

  // ── Results
  const [result, setResult] = useState<LoanResult | null>(null)
  const [earlyResult, setEarlyResult] = useState<EarlyPayoffResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFullTable, setShowFullTable] = useState(false)

  // ── Compute
  const calculate = useCallback(() => {
    setError(null)

    const P = parseFloat(loanAmount)
    const annRate = parseFloat(annualRate)
    const tv = parseFloat(termValue)

    if (isNaN(P) || P <= 0) { setError('Enter a valid loan amount greater than zero.'); return }
    if (isNaN(annRate) || annRate < 0) { setError('Enter a valid annual interest rate (0 or above).'); return }
    if (isNaN(tv) || tv <= 0) { setError('Enter a valid loan term.'); return }

    const months = termUnit === 'years' ? Math.round(tv * 12) : Math.round(tv)
    if (months < 1 || months > 600) { setError('Loan term must be between 1 month and 50 years.'); return }

    const r = annRate / 100 / 12
    const pmt = calcPMT(P, r, months)
    const totalPayment = pmt * months
    const totalInterest = totalPayment - P
    const interestPct = (totalInterest / totalPayment) * 100

    const amortization = buildAmortization(P, r, months, pmt)

    setResult({ monthlyPayment: pmt, totalPayment, totalInterest, interestPct, amortization })

    // Early payoff
    const extra = parseFloat(extraPayment)
    if (!isNaN(extra) && extra > 0) {
      setEarlyResult(earlyPayoff(P, r, months, extra))
    } else {
      setEarlyResult(null)
    }
  }, [loanAmount, annualRate, termValue, termUnit, extraPayment])

  useEffect(() => {
    const timer = setTimeout(calculate, 400)
    return () => clearTimeout(timer)
  }, [calculate])

  // ── Derived display data
  const amortizationRows = result?.amortization ?? []
  const visibleRows = showFullTable ? amortizationRows : amortizationRows.slice(0, 12)

  const principalPct = result ? ((parseFloat(loanAmount) / result.totalPayment) * 100) : 0
  const interestPct = result ? (100 - principalPct) : 0

  // Bar chart: group amortization into bands for CSS bar chart
  const chartBands = result
    ? (() => {
        const rows = result.amortization
        const bandCount = Math.min(rows.length, 24)
        const step = Math.max(1, Math.floor(rows.length / bandCount))
        const bands: { month: number; principal: number; interest: number }[] = []
        for (let i = 0; i < rows.length; i += step) {
          const slice = rows.slice(i, i + step)
          bands.push({
            month: slice[0].month,
            principal: slice.reduce((s, r) => s + r.principal, 0),
            interest: slice.reduce((s, r) => s + r.interest, 0),
          })
        }
        return bands
      })()
    : []

  const maxBandTotal = Math.max(...chartBands.map((b) => b.principal + b.interest), 1)

  return (
    <ToolLayout
      title="Loan Calculator"
      description="Calculate monthly payments, total interest, and a full amortization schedule for any loan."
      category="Finance Tools"
      categoryHref="/finance-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: inputs ──────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Parameters
                </CardTitle>
                <CardDescription>
                  Adjust values to see results update instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <Label htmlFor="loan-amount" className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Loan Amount
                  </Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    min="1"
                    step="1000"
                    placeholder="25000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>

                {/* Annual Rate */}
                <div className="space-y-2">
                  <Label htmlFor="annual-rate" className="flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="annual-rate"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="6.5"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                  />
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <Label htmlFor="term-value" className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Loan Term
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="term-value"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="5"
                      value={termValue}
                      onChange={(e) => setTermValue(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={termUnit} onValueChange={(v) => setTermUnit(v as 'years' | 'months')}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Loan Type */}
                <div className="space-y-2">
                  <Label htmlFor="loan-type">Loan Type</Label>
                  <Select value={loanType} onValueChange={(v) => setLoanType(v as 'fixed' | 'variable')}>
                    <SelectTrigger id="loan-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="variable">Variable Rate (note)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loanType === 'variable' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Variable-rate loans adjust periodically. This calculator uses your entered rate as a fixed approximation — actual payments will vary with rate changes.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={calculate} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </CardContent>
            </Card>

            {/* Early Payoff Inputs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Early Payoff
                </CardTitle>
                <CardDescription className="text-xs">
                  See how extra monthly payments reduce your term and interest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="extra-payment" className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Extra Monthly Payment
                  </Label>
                  <Input
                    id="extra-payment"
                    type="number"
                    min="0"
                    step="50"
                    placeholder="e.g. 200"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                  />
                </div>

                {earlyResult && (
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Months saved</span>
                      <span className="font-semibold tabular-nums text-success">
                        {earlyResult.monthsSaved} mo
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">New payoff time</span>
                      <span className="font-semibold tabular-nums">
                        {earlyResult.newMonths} mo
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest saved</span>
                      <span className="font-semibold tabular-nums text-success">
                        {fmt(earlyResult.interestSaved)}
                      </span>
                    </div>
                  </div>
                )}

                {!earlyResult && (
                  <p className="text-xs text-muted-foreground">
                    Enter an extra payment amount above to see payoff savings.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: results ────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-accent tabular-nums">
                        {fmt(result.monthlyPayment)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Monthly Payment</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold tabular-nums">
                        {fmt(result.totalPayment)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Total Payment</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-warning tabular-nums">
                        {fmt(result.totalInterest)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Total Interest</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold tabular-nums">
                        {result.interestPct.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Interest of Total</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Principal vs Interest breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingDown className="h-4 w-4" />
                      Payment Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Stacked bar */}
                    <div className="flex h-8 w-full overflow-hidden rounded-sm">
                      <div
                        className="flex items-center justify-center text-xs text-white font-medium transition-all duration-500"
                        style={{
                          width: `${principalPct}%`,
                          backgroundColor: 'var(--museum-verdigris)',
                        }}
                      >
                        {principalPct > 15 ? 'Principal' : ''}
                      </div>
                      <div
                        className="flex items-center justify-center text-xs text-white font-medium transition-all duration-500"
                        style={{
                          width: `${interestPct}%`,
                          backgroundColor: 'var(--accent)',
                        }}
                      >
                        {interestPct > 10 ? 'Interest' : ''}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: 'var(--museum-verdigris)' }}
                        />
                        Principal {fmtShort(parseFloat(loanAmount))} ({principalPct.toFixed(1)}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: 'var(--accent)' }}
                        />
                        Interest {fmtShort(result.totalInterest)} ({interestPct.toFixed(1)}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar chart: principal vs interest over time */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4" />
                      Principal vs. Interest Over Time
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Each bar represents a segment of your loan term. Watch principal grow as interest shrinks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-px h-36 w-full overflow-x-auto">
                      {chartBands.map((band, i) => {
                        const total = band.principal + band.interest
                        const pPct = (band.principal / total) * 100
                        const iPct = (band.interest / total) * 100
                        const heightPct = (total / maxBandTotal) * 100
                        return (
                          <div
                            key={i}
                            className="flex flex-col-reverse flex-1 min-w-[8px] rounded-t-sm overflow-hidden"
                            style={{ height: `${heightPct}%` }}
                            title={`Month ${band.month}: Principal ${fmtShort(band.principal)}, Interest ${fmtShort(band.interest)}`}
                          >
                            <div
                              style={{
                                height: `${pPct}%`,
                                backgroundColor: 'var(--museum-verdigris)',
                                opacity: 0.85,
                              }}
                            />
                            <div
                              style={{
                                height: `${iPct}%`,
                                backgroundColor: 'var(--accent)',
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-3 rounded-sm"
                          style={{ backgroundColor: 'var(--museum-verdigris)', opacity: 0.85 }}
                        />
                        Principal
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-3 rounded-sm"
                          style={{ backgroundColor: 'var(--accent)', opacity: 0.75 }}
                        />
                        Interest
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Amortization schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        Amortization Schedule
                      </CardTitle>
                      <Badge variant="outline" className="text-xs font-normal">
                        {amortizationRows.length} payments
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card border-b border-border/60">
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Month
                            </th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Payment
                            </th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Principal
                            </th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Interest
                            </th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row, idx) => (
                            <tr
                              key={row.month}
                              className={`border-b border-border/30 hover:bg-muted/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                            >
                              <td className="px-4 py-2 tabular-nums text-muted-foreground">
                                {row.month}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums font-medium">
                                {fmt(row.payment)}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums" style={{ color: 'var(--museum-verdigris)' }}>
                                {fmt(row.principal)}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums text-warning">
                                {fmt(row.interest)}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">
                                {fmt(row.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {amortizationRows.length > 12 && (
                      <div className="border-t border-border/40 px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFullTable((p) => !p)}
                          className="w-full text-xs"
                        >
                          {showFullTable ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                              Show first 12 months
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                              Show all {amortizationRows.length} months
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !error && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Calculator className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Enter your loan details to see your payment breakdown and amortization schedule.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Results are calculated using the standard PMT amortization formula and assume a fixed interest rate applied monthly. They are estimates only — consult a lender for exact figures including fees, insurance, and rate adjustments.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
