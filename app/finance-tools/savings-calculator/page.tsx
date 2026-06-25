'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiggyBank,
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  Target,
  TrendingUp,
  BarChart3,
  Flag,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

// ─── Types ────────────────────────────────────────────────────────────────────

interface YearlyRow {
  year: number
  startBalance: number
  contributions: number
  interestEarned: number
  endBalance: number
}

interface SavingsResult {
  finalBalance: number
  totalContributions: number
  totalInterest: number
  yearlyBreakdown: YearlyRow[]
  milestones: MilestoneResult[]
}

interface MilestoneResult {
  amount: number
  yearsToReach: number | null
  monthsToReach: number | null
}

interface GoalResult {
  requiredMonthly: number
  targetAmount: number
  years: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const fmtFull = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const compoundingPeriodsMap: Record<string, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
}

const MILESTONES = [10_000, 50_000, 100_000, 500_000]

function calcSavings(
  initialDeposit: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
  compoundingKey: string,
): SavingsResult {
  const n = compoundingPeriodsMap[compoundingKey] ?? 12
  const r = annualRate / 100

  const yearlyBreakdown: YearlyRow[] = []
  let balance = initialDeposit
  let totalContributions = initialDeposit

  // Track milestones (in months precision)
  const milestoneMonths: Record<number, number | null> = {}
  MILESTONES.forEach((m) => {
    milestoneMonths[m] = null
  })

  // Monthly simulation for milestone detection
  let simBalance = initialDeposit
  const monthlyRate = r / 12
  for (let month = 1; month <= years * 12; month++) {
    simBalance = simBalance * (1 + monthlyRate) + monthlyContribution
    MILESTONES.forEach((milestone) => {
      if (milestoneMonths[milestone] === null && simBalance >= milestone) {
        milestoneMonths[milestone] = month
      }
    })
  }

  // Yearly breakdown
  for (let yr = 1; yr <= years; yr++) {
    const startBalance = balance
    const yearlyContributions = monthlyContribution * 12

    // Future value with compounding n times per year, plus monthly contributions
    // Use FV of lump sum + FV of annuity for monthly contributions
    const fvPrincipal = startBalance * Math.pow(1 + r / n, n)
    let fvContribs = 0
    if (monthlyContribution > 0) {
      const mRate = r / 12
      if (mRate > 0) {
        fvContribs = monthlyContribution * ((Math.pow(1 + mRate, 12) - 1) / mRate)
      } else {
        fvContribs = monthlyContribution * 12
      }
    }

    const endBalance = fvPrincipal + fvContribs
    const interestEarned = endBalance - startBalance - yearlyContributions

    yearlyBreakdown.push({
      year: yr,
      startBalance,
      contributions: yearlyContributions,
      interestEarned,
      endBalance,
    })

    balance = endBalance
    totalContributions += yearlyContributions
  }

  const finalBalance = balance
  const totalInterest = finalBalance - totalContributions

  const milestones: MilestoneResult[] = MILESTONES.map((amount) => {
    const months = milestoneMonths[amount]
    return {
      amount,
      yearsToReach: months !== null ? Math.floor(months / 12) : null,
      monthsToReach: months !== null ? months % 12 : null,
    }
  })

  return { finalBalance, totalContributions, totalInterest, yearlyBreakdown, milestones }
}

function calcRequiredMonthly(
  target: number,
  initialDeposit: number,
  annualRate: number,
  years: number,
): number {
  const r = annualRate / 100
  const mRate = r / 12
  const n = years * 12
  // FV = P*(1+mRate)^n + PMT*((1+mRate)^n - 1)/mRate
  // Solve for PMT
  const fvInitial = initialDeposit * Math.pow(1 + mRate, n)
  const remaining = target - fvInitial
  if (remaining <= 0) return 0
  if (mRate === 0) return remaining / n
  return remaining / ((Math.pow(1 + mRate, n) - 1) / mRate)
}

// ─── Component ────────────────────────────────────────────────────────────────

const tool = {
  id: 'savings-calculator',
  name: 'Savings Calculator',
  description: 'Project your savings growth, track milestones, and calculate the monthly contribution needed to reach any goal.',
  category: 'finance-tools',
  url: '/finance-tools/savings-calculator',
}

const relatedTools = [
  { name: 'Compound Interest', href: '/finance-tools/compound-interest' },
  { name: 'Retirement Calculator', href: '/finance-tools/retirement-calculator' },
  { name: 'Investment Return', href: '/finance-tools/investment-return' },
]

export default function SavingsCalculatorPage() {
  // Projection mode inputs
  const [initialDeposit, setInitialDeposit] = useState('5000')
  const [monthlyContribution, setMonthlyContribution] = useState('300')
  const [annualRate, setAnnualRate] = useState('4.5')
  const [savingsYears, setSavingsYears] = useState('10')
  const [compounding, setCompounding] = useState('monthly')

  // Goal mode inputs
  const [goalTarget, setGoalTarget] = useState('100000')
  const [goalDeposit, setGoalDeposit] = useState('5000')
  const [goalRate, setGoalRate] = useState('4.5')
  const [goalYears, setGoalYears] = useState('10')

  const [result, setResult] = useState<SavingsResult | null>(null)
  const [goalResult, setGoalResult] = useState<GoalResult | null>(null)
  const [activeTab, setActiveTab] = useState('projection')

  const { trackToolStart, trackToolComplete } = useToolTracker('Savings Calculator', 'finance-tools')

  // ── Projection calc ──────────────────────────────────────────────────────────

  const runProjection = useCallback(() => {
    const p = parseFloat(initialDeposit)
    const pmt = parseFloat(monthlyContribution)
    const r = parseFloat(annualRate)
    const y = parseFloat(savingsYears)

    if (isNaN(p) || isNaN(pmt) || isNaN(r) || isNaN(y)) return
    if (p < 0 || pmt < 0 || r < 0 || y <= 0 || y > 50) return

    trackToolStart()
    const res = calcSavings(p, pmt, r, y, compounding)
    setResult(res)
    trackToolComplete()
  }, [initialDeposit, monthlyContribution, annualRate, savingsYears, compounding, trackToolStart, trackToolComplete])

  useEffect(() => {
    const t = setTimeout(runProjection, 350)
    return () => clearTimeout(t)
  }, [runProjection])

  // ── Goal calc ────────────────────────────────────────────────────────────────

  const runGoal = useCallback(() => {
    const target = parseFloat(goalTarget)
    const dep = parseFloat(goalDeposit)
    const r = parseFloat(goalRate)
    const y = parseFloat(goalYears)

    if (isNaN(target) || isNaN(dep) || isNaN(r) || isNaN(y)) return
    if (target <= 0 || dep < 0 || r < 0 || y <= 0 || y > 50) return

    const required = calcRequiredMonthly(target, dep, r, y)
    setGoalResult({ requiredMonthly: Math.max(0, required), targetAmount: target, years: y })
  }, [goalTarget, goalDeposit, goalRate, goalYears])

  useEffect(() => {
    const t = setTimeout(runGoal, 350)
    return () => clearTimeout(t)
  }, [runGoal])

  // ── Progress bar util ────────────────────────────────────────────────────────

  const progressPct = (part: number, total: number) =>
    total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0

  return (
    <ToolLayout
      title="Savings Calculator"
      description="Project your savings growth, track milestones, and find the monthly contribution needed to hit any savings goal."
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projection">
              <TrendingUp className="size-4" />
              Savings Projection
            </TabsTrigger>
            <TabsTrigger value="goal">
              <Target className="size-4" />
              Savings Goal
            </TabsTrigger>
          </TabsList>

          {/* ── PROJECTION TAB ─────────────────────────────────────────────── */}
          <TabsContent value="projection" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Inputs */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5" />
                    Savings Parameters
                  </CardTitle>
                  <CardDescription>
                    Enter your details to project savings growth.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initial-deposit">
                      Initial Deposit ($)
                    </Label>
                    <Input
                      id="initial-deposit"
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-contrib">
                      Monthly Contribution ($)
                    </Label>
                    <Input
                      id="monthly-contrib"
                      type="number"
                      min="0"
                      placeholder="300"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annual-rate">
                      Annual Interest Rate (%)
                    </Label>
                    <Input
                      id="annual-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="4.5"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="savings-years">
                      Savings Period (Years)
                    </Label>
                    <Input
                      id="savings-years"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="10"
                      value={savingsYears}
                      onChange={(e) => setSavingsYears(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compounding-freq">
                      Compounding Frequency
                    </Label>
                    <Select value={compounding} onValueChange={setCompounding}>
                      <SelectTrigger id="compounding-freq" className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={runProjection}>
                    <Calculator className="size-4" />
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {/* Results panel */}
              <div className="lg:col-span-2 space-y-6">
                {result && (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="px-6 py-5 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Final Balance</p>
                          <p className="text-2xl font-bold text-success font-variant-numeric tabular-nums">
                            {fmtFull(result.finalBalance)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="px-6 py-5 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Contributed</p>
                          <p className="text-2xl font-bold tabular-nums">
                            {fmtFull(result.totalContributions)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="px-6 py-5 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Interest Earned</p>
                          <p className="text-2xl font-bold text-accent tabular-nums">
                            {fmtFull(result.totalInterest)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Progress visualization */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="size-5" />
                          Balance Composition
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stacked bar */}
                        <div className="w-full h-5 rounded-sm overflow-hidden flex" role="img" aria-label="Balance composition bar">
                          {/* Initial deposit */}
                          <div
                            className="h-full bg-primary/70"
                            style={{ width: `${progressPct(parseFloat(initialDeposit) || 0, result.finalBalance)}%` }}
                            title={`Initial deposit: ${fmt(parseFloat(initialDeposit) || 0)}`}
                          />
                          {/* Monthly contributions minus initial */}
                          <div
                            className="h-full bg-primary/40"
                            style={{ width: `${progressPct(result.totalContributions - (parseFloat(initialDeposit) || 0), result.finalBalance)}%` }}
                            title={`Monthly contributions: ${fmt(result.totalContributions - (parseFloat(initialDeposit) || 0))}`}
                          />
                          {/* Interest */}
                          <div
                            className="h-full bg-accent/60 flex-1"
                            title={`Interest earned: ${fmt(result.totalInterest)}`}
                          />
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-primary/70" />
                            <span className="text-muted-foreground">Initial deposit</span>
                            <span className="font-semibold tabular-nums">{fmt(parseFloat(initialDeposit) || 0)}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-primary/40" />
                            <span className="text-muted-foreground">Contributions</span>
                            <span className="font-semibold tabular-nums">{fmt(result.totalContributions - (parseFloat(initialDeposit) || 0))}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-accent/60" />
                            <span className="text-muted-foreground">Interest</span>
                            <span className="font-semibold text-accent tabular-nums">{fmt(result.totalInterest)}</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Flag className="size-5" />
                          Milestones
                        </CardTitle>
                        <CardDescription>
                          How long to reach key savings thresholds at this rate.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {result.milestones.map((m) => {
                            const reached = m.yearsToReach !== null
                            return (
                              <div
                                key={m.amount}
                                className={`rounded-md border p-3 text-center ${reached ? 'bg-muted' : 'opacity-50'}`}
                              >
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                  {fmt(m.amount)}
                                </p>
                                {reached ? (
                                  <p className="font-semibold text-sm tabular-nums">
                                    {m.yearsToReach}y {m.monthsToReach}m
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Not reached</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Yearly breakdown table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="size-5" />
                          Year-by-Year Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Year</th>
                                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Start Balance</th>
                                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Contributions</th>
                                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Interest</th>
                                <th className="text-right py-2 pl-4 font-medium text-muted-foreground">End Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.yearlyBreakdown.map((row) => (
                                <tr key={row.year} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                  <td className="py-2 pr-4">
                                    <Badge variant="outline">Yr {row.year}</Badge>
                                  </td>
                                  <td className="text-right py-2 px-4">{fmtFull(row.startBalance)}</td>
                                  <td className="text-right py-2 px-4">{fmtFull(row.contributions)}</td>
                                  <td className="text-right py-2 px-4 text-accent">+{fmtFull(row.interestEarned)}</td>
                                  <td className="text-right py-2 pl-4 font-semibold">{fmtFull(row.endBalance)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!result && (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    Enter your savings details to see projections.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── GOAL TAB ──────────────────────────────────────────────────────── */}
          <TabsContent value="goal" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Goal inputs */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="size-5" />
                    Your Savings Goal
                  </CardTitle>
                  <CardDescription>
                    Set a target and we'll tell you how much to save monthly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">
                      Target Amount ($)
                    </Label>
                    <Input
                      id="goal-target"
                      type="number"
                      min="1"
                      placeholder="100000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-deposit">
                      Initial Deposit ($)
                    </Label>
                    <Input
                      id="goal-deposit"
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={goalDeposit}
                      onChange={(e) => setGoalDeposit(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-rate">
                      Annual Interest Rate (%)
                    </Label>
                    <Input
                      id="goal-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="4.5"
                      value={goalRate}
                      onChange={(e) => setGoalRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-years">
                      Timeframe (Years)
                    </Label>
                    <Input
                      id="goal-years"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="10"
                      value={goalYears}
                      onChange={(e) => setGoalYears(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={runGoal}>
                    <Target className="size-4" />
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {/* Goal result */}
              <div className="lg:col-span-2 space-y-6">
                {goalResult && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="size-5" />
                          Required Monthly Contribution
                        </CardTitle>
                        <CardDescription>
                          To reach {fmtFull(goalResult.targetAmount)} in {goalResult.years} years
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-muted rounded-lg p-6 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Save per month</p>
                          <p className="text-4xl font-bold text-success tabular-nums">
                            {fmtFull(goalResult.requiredMonthly)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {fmtFull(goalResult.requiredMonthly * 12)} per year
                          </p>
                        </div>

                        {/* Progress toward goal */}
                        {(() => {
                          const dep = parseFloat(goalDeposit) || 0
                          const totalSaved =
                            dep + goalResult.requiredMonthly * 12 * goalResult.years
                          const pct = progressPct(dep, goalResult.targetAmount)
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Initial deposit covers</span>
                                <span className="font-semibold tabular-nums">{pct}% of goal</span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{fmt(dep)}</span>
                                <span>{fmt(goalResult.targetAmount)}</span>
                              </div>
                            </div>
                          )
                        })()}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground mb-1">Total Contributions</p>
                            <p className="font-semibold tabular-nums">
                              {fmtFull((parseFloat(goalDeposit) || 0) + goalResult.requiredMonthly * 12 * goalResult.years)}
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground mb-1">Interest Portion</p>
                            <p className="font-semibold text-accent tabular-nums">
                              {fmtFull(
                                goalResult.targetAmount -
                                  ((parseFloat(goalDeposit) || 0) +
                                    goalResult.requiredMonthly * 12 * goalResult.years),
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Apply to projection */}
                    <Alert>
                      <Percent className="size-4" />
                      <AlertDescription>
                        Want to see year-by-year growth for this plan? Switch to{' '}
                        <button
                          className="underline font-medium focus-visible:outline-ring"
                          onClick={() => {
                            setMonthlyContribution(goalResult.requiredMonthly.toFixed(2))
                            setInitialDeposit(goalDeposit)
                            setAnnualRate(goalRate)
                            setSavingsYears(String(goalResult.years))
                            setActiveTab('projection')
                          }}
                        >
                          Savings Projection
                        </button>{' '}
                        to see the full breakdown with these values pre-filled.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {!goalResult && (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    Enter your goal details to calculate the required contribution.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Alert>
          <TrendingUp className="size-4" />
          <AlertDescription>
            <strong>Note:</strong> Projections assume a constant interest rate and regular contributions.
            Actual savings growth will vary based on your account type, rate changes, and contribution timing.
            This tool is for planning purposes only.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
