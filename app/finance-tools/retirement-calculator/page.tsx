'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
  User,
  Target,
  PiggyBank,
  Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ─── types ────────────────────────────────────────────────────────────────────

interface RetirementResult {
  yearsToRetirement: number
  projectedSavings: number
  inflationAdjustedSavings: number
  monthlyIncomeFrom4Percent: number
  totalMonthlyIncome: number
  desiredMonthlyIncome: number
  monthlyShortfallOrSurplus: number
  readinessScore: number
  readinessLabel: string
  readinessColor: 'text-success' | 'text-warning' | 'text-destructive'
  totalContributions: number
  totalGrowth: number
  milestones: Milestone[]
}

interface Milestone {
  age: number
  savings: number
  label: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

// ─── calculation ──────────────────────────────────────────────────────────────

function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturn: number,
  inflationRate: number,
  desiredMonthlyIncome: number,
  socialSecurityMonthly: number,
): RetirementResult | null {
  if (
    isNaN(currentAge) || isNaN(retirementAge) || isNaN(currentSavings) ||
    isNaN(monthlyContribution) || isNaN(annualReturn) || isNaN(inflationRate) ||
    isNaN(desiredMonthlyIncome) ||
    currentAge <= 0 || retirementAge <= currentAge || currentSavings < 0 ||
    monthlyContribution < 0 || annualReturn < 0 || inflationRate < 0 ||
    desiredMonthlyIncome < 0
  ) return null

  const years = retirementAge - currentAge
  const months = years * 12
  const monthlyRate = annualReturn / 100 / 12

  // Future value of current savings
  const fvSavings = currentSavings * Math.pow(1 + monthlyRate, months)

  // Future value of monthly contributions (annuity)
  const fvContributions =
    monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  const projectedSavings = fvSavings + fvContributions

  // Inflation adjustment: real purchasing power in today's dollars
  const inflationFactor = Math.pow(1 + inflationRate / 100, years)
  const inflationAdjustedSavings = projectedSavings / inflationFactor

  // 4% withdrawal rule (safe withdrawal rate)
  const annualWithdrawal4Pct = projectedSavings * 0.04
  const monthlyIncomeFrom4Percent = annualWithdrawal4Pct / 12

  // Total monthly income (savings + social security)
  const totalMonthlyIncome = monthlyIncomeFrom4Percent + (socialSecurityMonthly || 0)

  const monthlyShortfallOrSurplus = totalMonthlyIncome - desiredMonthlyIncome

  // Readiness score 0–100
  const incomeRatio = desiredMonthlyIncome > 0 ? totalMonthlyIncome / desiredMonthlyIncome : 1
  const readinessScore = clamp(Math.round(incomeRatio * 100), 0, 150)

  let readinessLabel: string
  let readinessColor: RetirementResult['readinessColor']

  if (incomeRatio >= 1) {
    readinessLabel = 'On Track'
    readinessColor = 'text-success'
  } else if (incomeRatio >= 0.75) {
    readinessLabel = 'Borderline'
    readinessColor = 'text-warning'
  } else {
    readinessLabel = 'Underfunded'
    readinessColor = 'text-destructive'
  }

  // Milestones at 25%, 50%, 75% of career + retirement
  const totalContributions = currentSavings + monthlyContribution * months
  const totalGrowth = projectedSavings - totalContributions

  const milestones: Milestone[] = []
  const checkpoints = [0.25, 0.5, 0.75, 1]
  for (const pct of checkpoints) {
    const m = Math.round(months * pct)
    const fvS = currentSavings * Math.pow(1 + monthlyRate, m)
    const fvC =
      monthlyRate === 0
        ? monthlyContribution * m
        : monthlyContribution * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate)
    const savings = fvS + fvC
    const age = currentAge + Math.round(years * pct)
    const label = pct === 1 ? 'Retirement' : pct === 0.5 ? 'Halfway' : pct === 0.25 ? 'Early career' : 'Late career'
    milestones.push({ age, savings, label })
  }

  return {
    yearsToRetirement: years,
    projectedSavings,
    inflationAdjustedSavings,
    monthlyIncomeFrom4Percent,
    totalMonthlyIncome,
    desiredMonthlyIncome,
    monthlyShortfallOrSurplus,
    readinessScore,
    readinessLabel,
    readinessColor,
    totalContributions,
    totalGrowth,
    milestones,
  }
}

// ─── tool metadata ────────────────────────────────────────────────────────────

const tool = {
  id: 'retirement-calculator',
  name: 'Retirement Calculator',
  description:
    'Plan your retirement with projected savings, inflation-adjusted values, income estimates, and a readiness assessment.',
  category: 'finance-tools',
  url: '/finance-tools/retirement-calculator',
}

const relatedTools = [
  { name: 'Savings Calculator', href: '/finance-tools/savings-calculator' },
  { name: 'Compound Interest', href: '/finance-tools/compound-interest' },
  { name: 'Investment Return', href: '/finance-tools/investment-return' },
]

// ─── timeline bar component ───────────────────────────────────────────────────

function TimelineBar({ milestones, currentAge }: { milestones: Milestone[]; currentAge: number }) {
  const maxSavings = milestones[milestones.length - 1]?.savings ?? 1
  const retirementAge = milestones[milestones.length - 1]?.age ?? currentAge + 1

  return (
    <div className="space-y-3">
      {milestones.map((m, i) => {
        const barPct = maxSavings > 0 ? clamp((m.savings / maxSavings) * 100, 2, 100) : 2
        const isFinal = i === milestones.length - 1
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Age {m.age}
                {m.label !== 'Retirement' ? ` — ${m.label}` : ''}
              </span>
              <span className={`font-medium tabular-nums ${isFinal ? 'text-accent' : 'text-foreground'}`}>
                {fmtK(m.savings)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isFinal ? 'bg-accent' : 'bg-muted-foreground/40'}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── readiness ring component ─────────────────────────────────────────────────

function ReadinessRing({
  score,
  label,
  colorClass,
}: {
  score: number
  label: string
  colorClass: string
}) {
  // cap display at 100%
  const displayPct = clamp(score, 0, 100)
  const r = 40
  const circ = 2 * Math.PI * r
  const dashOffset = circ * (1 - displayPct / 100)

  const strokeColor =
    colorClass === 'text-success'
      ? 'var(--success)'
      : colorClass === 'text-warning'
      ? 'var(--warning)'
      : 'var(--destructive)'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label={`Readiness: ${label}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="700" fill={strokeColor} fontFamily="inherit">
          {displayPct}%
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="8.5" fill="var(--muted-foreground)" fontFamily="inherit">
          funded
        </text>
      </svg>
      <Badge
        className={`text-xs font-semibold ${
          colorClass === 'text-success'
            ? 'bg-success/10 text-success border-success/20'
            : colorClass === 'text-warning'
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}
        variant="outline"
      >
        {label}
      </Badge>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function RetirementCalculatorPage() {
  const [currentAge, setCurrentAge] = useState('35')
  const [retirementAge, setRetirementAge] = useState('65')
  const [currentSavings, setCurrentSavings] = useState('50000')
  const [monthlyContribution, setMonthlyContribution] = useState('500')
  const [annualReturn, setAnnualReturn] = useState('7')
  const [inflationRate, setInflationRate] = useState('2.5')
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState('4000')
  const [socialSecurity, setSocialSecurity] = useState('')

  const [result, setResult] = useState<RetirementResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback(() => {
    const ca = parseFloat(currentAge)
    const ra = parseFloat(retirementAge)
    const cs = parseFloat(currentSavings)
    const mc = parseFloat(monthlyContribution)
    const ar = parseFloat(annualReturn)
    const ir = parseFloat(inflationRate)
    const dmi = parseFloat(desiredMonthlyIncome)
    const ss = parseFloat(socialSecurity) || 0

    if (isNaN(ca) || isNaN(ra) || isNaN(cs) || isNaN(mc) || isNaN(ar) || isNaN(ir) || isNaN(dmi)) {
      setError('Please fill in all required fields with valid numbers.')
      setResult(null)
      return
    }
    if (ra <= ca) {
      setError('Retirement age must be greater than current age.')
      setResult(null)
      return
    }
    if (ca <= 0 || ra > 100) {
      setError('Please enter realistic ages (1–100).')
      setResult(null)
      return
    }

    setError(null)
    const res = calculateRetirement(ca, ra, cs, mc, ar, ir, dmi, ss)
    setResult(res)
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflationRate, desiredMonthlyIncome, socialSecurity])

  useEffect(() => {
    const t = setTimeout(calculate, 400)
    return () => clearTimeout(t)
  }, [calculate])

  return (
    <ToolLayout
      title="Retirement Calculator"
      description="Project your retirement savings, estimate monthly income, and see your retirement readiness score with an inflation-adjusted outlook."
      category="Finance Tools"
      categoryHref="/finance-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* engagement buttons */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── inputs ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Your Profile
                </CardTitle>
                <CardDescription>Age and target retirement date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-age">Current Age</Label>
                    <Input
                      id="current-age"
                      type="number"
                      min="1"
                      max="99"
                      placeholder="35"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retirement-age">Retirement Age</Label>
                    <Input
                      id="retirement-age"
                      type="number"
                      min="2"
                      max="100"
                      placeholder="65"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-accent" />
                  Savings & Contributions
                </CardTitle>
                <CardDescription>How much you have and contribute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-savings" className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Current Savings
                  </Label>
                  <Input
                    id="current-savings"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-contribution" className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Monthly Contribution
                  </Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Growth & Income Assumptions
                </CardTitle>
                <CardDescription>Return, inflation, and income goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual-return" className="flex items-center gap-2">
                      <Percent className="h-3.5 w-3.5" />
                      Annual Return (%)
                    </Label>
                    <Input
                      id="annual-return"
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      placeholder="7"
                      value={annualReturn}
                      onChange={(e) => setAnnualReturn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inflation-rate" className="flex items-center gap-2">
                      <Percent className="h-3.5 w-3.5" />
                      Inflation Rate (%)
                    </Label>
                    <Input
                      id="inflation-rate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="2.5"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desired-income" className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" />
                    Desired Monthly Retirement Income
                  </Label>
                  <Input
                    id="desired-income"
                    type="number"
                    min="0"
                    placeholder="4000"
                    value={desiredMonthlyIncome}
                    onChange={(e) => setDesiredMonthlyIncome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-security" className="flex items-center gap-2">
                    <Landmark className="h-3.5 w-3.5" />
                    Est. Social Security / Month
                    <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                  </Label>
                  <Input
                    id="social-security"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={socialSecurity}
                    onChange={(e) => setSocialSecurity(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={calculate} className="w-full" size="lg">
              <Calculator className="h-4 w-4" />
              Calculate Retirement Plan
            </Button>
          </div>

          {/* ── results ── */}
          <div className="lg:col-span-3 space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <>
                {/* readiness summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-accent" />
                      Retirement Readiness
                    </CardTitle>
                    <CardDescription>
                      Retiring at age {retirementAge} — {result.yearsToRetirement} years from now
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <ReadinessRing
                        score={result.readinessScore}
                        label={result.readinessLabel}
                        colorClass={result.readinessColor}
                      />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Projected Savings</p>
                          <p className="text-xl font-bold text-foreground tabular-nums">{fmt(result.projectedSavings)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">at retirement (nominal)</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Today's Dollars</p>
                          <p className="text-xl font-bold text-foreground tabular-nums">{fmt(result.inflationAdjustedSavings)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">inflation-adjusted value</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Monthly Income</p>
                          <p className={`text-xl font-bold tabular-nums ${result.readinessColor}`}>
                            {fmt(result.totalMonthlyIncome)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">4% rule + Social Security</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            {result.monthlyShortfallOrSurplus >= 0 ? 'Monthly Surplus' : 'Monthly Shortfall'}
                          </p>
                          <p className={`text-xl font-bold tabular-nums ${result.monthlyShortfallOrSurplus >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {result.monthlyShortfallOrSurplus >= 0 ? '+' : ''}{fmt(result.monthlyShortfallOrSurplus)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">vs. {fmt(result.desiredMonthlyIncome)} goal</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* savings breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-accent" />
                      Savings Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contributions</p>
                        <p className="font-bold tabular-nums text-foreground">{fmtK(result.totalContributions)}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Growth</p>
                        <p className="font-bold tabular-nums text-success">{fmtK(result.totalGrowth)}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                        <p className="font-bold tabular-nums text-accent">{fmtK(result.projectedSavings)}</p>
                      </div>
                    </div>
                    {/* stacked bar */}
                    <div>
                      <div className="flex h-5 rounded-md overflow-hidden w-full">
                        <div
                          className="bg-muted-foreground/50 flex items-center justify-center text-[10px] text-background font-semibold"
                          style={{
                            width: `${clamp((result.totalContributions / result.projectedSavings) * 100, 2, 98)}%`,
                          }}
                        >
                          {result.projectedSavings > 0 ? Math.round((result.totalContributions / result.projectedSavings) * 100) : 0}%
                        </div>
                        <div
                          className="bg-success flex items-center justify-center text-[10px] text-white font-semibold flex-1"
                        >
                          {result.projectedSavings > 0 ? Math.round((result.totalGrowth / result.projectedSavings) * 100) : 0}%
                        </div>
                      </div>
                      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                        <span>Your contributions</span>
                        <span>Investment growth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* income breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-accent" />
                      Monthly Income at Retirement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-sm text-muted-foreground">From savings (4% rule)</span>
                      <span className="font-semibold tabular-nums">{fmt(result.monthlyIncomeFrom4Percent)}</span>
                    </div>
                    {(parseFloat(socialSecurity) || 0) > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">Social Security</span>
                        <span className="font-semibold tabular-nums">{fmt(parseFloat(socialSecurity))}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-sm font-medium">Total estimated income</span>
                      <span className={`font-bold text-lg tabular-nums ${result.readinessColor}`}>
                        {fmt(result.totalMonthlyIncome)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Your income goal</span>
                      <span className="font-semibold tabular-nums">{fmt(result.desiredMonthlyIncome)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* savings timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      Savings Timeline
                    </CardTitle>
                    <CardDescription>Projected portfolio at key milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TimelineBar milestones={result.milestones} currentAge={parseFloat(currentAge)} />
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !error && (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <Calculator className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Fill in your details on the left and your retirement projection will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* disclaimer */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Estimates only.</strong> This calculator uses the 4% safe withdrawal rule and assumes
            constant annual returns. Actual results will vary due to market volatility, taxes, fees, and
            changing contribution levels. Consult a licensed financial advisor for personalized retirement
            planning.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
