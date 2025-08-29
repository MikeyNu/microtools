'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calculator, DollarSign, Calendar, Percent, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface CompoundResult {
  principal: number
  totalAmount: number
  totalInterest: number
  yearlyBreakdown: {
    year: number
    startingAmount: number
    interestEarned: number
    endingAmount: number
  }[]
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState('10000')
  const [interestRate, setInterestRate] = useState('7')
  const [timePeriod, setTimePeriod] = useState('10')
  const [compoundingFrequency, setCompoundingFrequency] = useState('12')
  const [monthlyContribution, setMonthlyContribution] = useState('0')
  const [result, setResult] = useState<CompoundResult | null>(null)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Compound Interest Calculator', 'finance-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    description: 'Calculate compound interest and see how your investments grow over time',
    category: 'finance-tools',
    url: '/finance-tools/compound-interest'
  }

  const compoundingOptions = [
    { value: '1', label: 'Annually' },
    { value: '2', label: 'Semi-annually' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
    { value: '52', label: 'Weekly' },
    { value: '365', label: 'Daily' }
  ]

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal)
    const r = parseFloat(interestRate) / 100
    const n = parseFloat(compoundingFrequency)
    const t = parseFloat(timePeriod)
    const PMT = parseFloat(monthlyContribution)

    if (isNaN(P) || isNaN(r) || isNaN(n) || isNaN(t) || P <= 0 || r < 0 || n <= 0 || t <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid positive numbers for all fields',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    try {
      const yearlyBreakdown = []
      let currentAmount = P
      
      for (let year = 1; year <= t; year++) {
        const startingAmount = currentAmount
        
        // Calculate compound interest for the year
        const compoundInterest = currentAmount * Math.pow(1 + r/n, n) - currentAmount
        
        // Add monthly contributions with compound interest
        let contributionInterest = 0
        if (PMT > 0) {
          // Future value of annuity formula for monthly contributions
          const monthlyRate = r / 12
          const monthsInYear = 12
          contributionInterest = PMT * (Math.pow(1 + monthlyRate, monthsInYear) - 1) / monthlyRate
          currentAmount += contributionInterest
        }
        
        const totalInterestEarned = compoundInterest + (contributionInterest - PMT * 12)
        currentAmount = startingAmount + compoundInterest + PMT * 12
        
        // Apply compound interest to the new amount
        currentAmount = currentAmount * Math.pow(1 + r/n, n)
        
        yearlyBreakdown.push({
          year,
          startingAmount,
          interestEarned: totalInterestEarned,
          endingAmount: currentAmount
        })
      }
      
      // Final calculation using standard compound interest formula
      const finalAmount = P * Math.pow(1 + r/n, n*t)
      
      // Add future value of monthly contributions
      let contributionValue = 0
      if (PMT > 0) {
        const monthlyRate = r / 12
        const totalMonths = t * 12
        contributionValue = PMT * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
      }
      
      const totalAmount = finalAmount + contributionValue
      const totalContributions = P + (PMT * 12 * t)
      const totalInterest = totalAmount - totalContributions
      
      const compoundResult: CompoundResult = {
        principal: P,
        totalAmount,
        totalInterest,
        yearlyBreakdown
      }
      
      setResult(compoundResult)
      trackToolComplete()
      
      toast({
        title: 'Calculation Complete',
        description: `Your investment will grow to $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to calculate compound interest',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Auto-calculate when inputs change
  useEffect(() => {
    if (principal && interestRate && timePeriod && compoundingFrequency) {
      const timer = setTimeout(() => {
        calculateCompoundInterest()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [principal, interestRate, timePeriod, compoundingFrequency, monthlyContribution])

  const relatedTools = [
    { name: 'Investment Return Calculator', href: '/finance-tools/investment-return' },
    { name: 'Savings Calculator', href: '/finance-tools/savings-calculator' },
    { name: 'Retirement Calculator', href: '/finance-tools/retirement-calculator' },
    { name: 'Loan Calculator', href: '/calculators/loan' }
  ]

  return (
    <ToolLayout
      title="Compound Interest Calculator"
      description="Calculate compound interest and see how your investments grow over time with detailed yearly breakdowns and visualizations."
      category="Finance Tools"
      categoryHref="/finance-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Compound Interest Calculator</h1>
              <p className="text-muted-foreground">See how your money grows with compound interest</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Investment Parameters
                </CardTitle>
                <CardDescription>
                  Enter your investment details to calculate compound interest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Initial Investment
                  </Label>
                  <Input
                    id="principal"
                    type="number"
                    placeholder="10000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interest-rate" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    placeholder="7"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-period" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Time Period (Years)
                  </Label>
                  <Input
                    id="time-period"
                    type="number"
                    placeholder="10"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compounding-frequency">
                    Compounding Frequency
                  </Label>
                  <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {compoundingOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly-contribution" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Contribution (Optional)
                  </Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    placeholder="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
                
                <Button onClick={calculateCompoundInterest} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Interest
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(result.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">Final Amount</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(result.totalInterest)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Interest</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercentage((result.totalInterest / result.principal) * 100)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Return</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Investment Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Initial Investment</Label>
                          <p className="text-lg font-semibold">{formatCurrency(result.principal)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Monthly Contributions</Label>
                          <p className="text-lg font-semibold">
                            {formatCurrency(parseFloat(monthlyContribution) * 12 * parseFloat(timePeriod))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ 
                            width: `${(result.principal / result.totalAmount) * 100}%` 
                          }}
                        >
                          Principal
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Principal: {formatPercentage((result.principal / result.totalAmount) * 100)}</span>
                        <span>Interest: {formatPercentage((result.totalInterest / result.totalAmount) * 100)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Growth Breakdown</CardTitle>
                    <CardDescription>
                      See how your investment grows year by year
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.yearlyBreakdown.map((year, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Year {year.year}</Badge>
                            <span className="font-semibold">{formatCurrency(year.endingAmount)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="block">Starting</span>
                              <span className="font-medium">{formatCurrency(year.startingAmount)}</span>
                            </div>
                            <div>
                              <span className="block">Interest</span>
                              <span className="font-medium text-green-600">
                                +{formatCurrency(year.interestEarned)}
                              </span>
                            </div>
                            <div>
                              <span className="block">Ending</span>
                              <span className="font-medium">{formatCurrency(year.endingAmount)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This calculator provides estimates based on the compound interest formula. 
            Actual investment returns may vary due to market conditions, fees, and other factors.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}