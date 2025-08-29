'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calculator, DollarSign, PieChart, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface InvestmentResult {
  initialInvestment: number
  monthlyContribution: number
  annualReturn: number
  years: number
  totalContributions: number
  totalReturns: number
  finalValue: number
  yearlyBreakdown: YearlyData[]
}

interface YearlyData {
  year: number
  startingBalance: number
  contributions: number
  returns: number
  endingBalance: number
}

export default function InvestmentReturnPage() {
  const [initialInvestment, setInitialInvestment] = useState('10000')
  const [monthlyContribution, setMonthlyContribution] = useState('500')
  const [annualReturn, setAnnualReturn] = useState('7')
  const [years, setYears] = useState('10')
  const [investmentType, setInvestmentType] = useState('stocks')
  const [result, setResult] = useState<InvestmentResult | null>(null)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Investment Return Calculator', 'finance-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'investment-return',
    name: 'Investment Return Calculator',
    description: 'Calculate potential returns on your investments with compound growth',
    category: 'finance-tools',
    url: '/finance-tools/investment-return'
  }

  // Investment type presets
  const investmentTypes = {
    stocks: { name: 'Stocks (S&P 500)', avgReturn: 10, risk: 'High' },
    bonds: { name: 'Bonds', avgReturn: 4, risk: 'Low' },
    'real-estate': { name: 'Real Estate', avgReturn: 8, risk: 'Medium' },
    'mixed-portfolio': { name: 'Mixed Portfolio', avgReturn: 7, risk: 'Medium' },
    'savings-account': { name: 'Savings Account', avgReturn: 1, risk: 'Very Low' },
    'index-funds': { name: 'Index Funds', avgReturn: 8, risk: 'Medium' },
    'crypto': { name: 'Cryptocurrency', avgReturn: 15, risk: 'Very High' }
  }

  const calculateInvestmentReturn = () => {
    const initial = parseFloat(initialInvestment)
    const monthly = parseFloat(monthlyContribution)
    const rate = parseFloat(annualReturn) / 100
    const time = parseInt(years)
    
    if (isNaN(initial) || initial < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid initial investment amount',
        variant: 'destructive'
      })
      return
    }
    
    if (isNaN(monthly) || monthly < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid monthly contribution amount',
        variant: 'destructive'
      })
      return
    }
    
    if (isNaN(rate) || rate < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid annual return rate',
        variant: 'destructive'
      })
      return
    }
    
    if (isNaN(time) || time <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number of years',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    try {
      const monthlyRate = rate / 12
      const totalMonths = time * 12
      
      let balance = initial
      const yearlyBreakdown: YearlyData[] = []
      
      for (let year = 1; year <= time; year++) {
        const startingBalance = balance
        let yearContributions = 0
        let yearReturns = 0
        
        // Calculate monthly for this year
        for (let month = 1; month <= 12; month++) {
          // Add monthly contribution
          balance += monthly
          yearContributions += monthly
          
          // Apply monthly return
          const monthlyReturn = balance * monthlyRate
          balance += monthlyReturn
          yearReturns += monthlyReturn
        }
        
        yearlyBreakdown.push({
          year,
          startingBalance,
          contributions: yearContributions,
          returns: yearReturns,
          endingBalance: balance
        })
      }
      
      const totalContributions = initial + (monthly * totalMonths)
      const totalReturns = balance - totalContributions
      
      const investmentResult: InvestmentResult = {
        initialInvestment: initial,
        monthlyContribution: monthly,
        annualReturn: rate * 100,
        years: time,
        totalContributions,
        totalReturns,
        finalValue: balance,
        yearlyBreakdown
      }
      
      setResult(investmentResult)
      trackToolComplete()
      
      toast({
        title: 'Calculation Complete',
        description: `Your investment could grow to ${formatCurrency(balance)} in ${time} years`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to calculate investment returns',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const downloadResults = () => {
    if (!result) return
    
    const csvContent = [
      ['Year', 'Starting Balance', 'Contributions', 'Returns', 'Ending Balance'],
      ...result.yearlyBreakdown.map(year => [
        year.year.toString(),
        year.startingBalance.toFixed(2),
        year.contributions.toFixed(2),
        year.returns.toFixed(2),
        year.endingBalance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'investment-projection.csv'
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'Investment projection saved as CSV file'
    })
  }

  const setPresetValues = (type: string) => {
    const preset = investmentTypes[type as keyof typeof investmentTypes]
    if (preset) {
      setAnnualReturn(preset.avgReturn.toString())
      setInvestmentType(type)
    }
  }

  // Auto-calculate when inputs change
  useEffect(() => {
    if (initialInvestment && monthlyContribution && annualReturn && years) {
      const timer = setTimeout(() => {
        calculateInvestmentReturn()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [initialInvestment, monthlyContribution, annualReturn, years])

  const relatedTools = [
    { name: 'Compound Interest Calculator', href: '/finance-tools/compound-interest' },
    { name: 'Currency Converter', href: '/finance-tools/currency-converter' },
    { name: 'Loan Calculator', href: '/calculators/loan' },
    { name: 'Retirement Calculator', href: '/calculators/retirement' }
  ]

  return (
    <ToolLayout
      title="Investment Return Calculator"
      description="Calculate potential returns on your investments with compound growth and detailed projections."
      category="Finance Tools"
      categoryHref="/finance-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Investment Return Calculator</h1>
              <p className="text-muted-foreground">Project your investment growth over time</p>
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
                <CardTitle>Investment Parameters</CardTitle>
                <CardDescription>
                  Enter your investment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initial">Initial Investment</Label>
                  <Input
                    id="initial"
                    type="number"
                    placeholder="10000"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly Contribution</Label>
                  <Input
                    id="monthly"
                    type="number"
                    placeholder="500"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="return">Annual Return Rate (%)</Label>
                  <Input
                    id="return"
                    type="number"
                    step="0.1"
                    placeholder="7"
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="years">Investment Period (Years)</Label>
                  <Input
                    id="years"
                    type="number"
                    placeholder="10"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Investment Type Presets</Label>
                  <Select value={investmentType} onValueChange={setPresetValues}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(investmentTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center justify-between w-full">
                            <span>{type.name}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant="outline" className="text-xs">
                                {type.avgReturn}%
                              </Badge>
                              <Badge 
                                variant={type.risk === 'Very High' ? 'destructive' : 
                                        type.risk === 'High' ? 'destructive' :
                                        type.risk === 'Medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {type.risk}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={calculateInvestmentReturn} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Returns
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {result && (
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="breakdown">Year by Year</TabsTrigger>
                  <TabsTrigger value="chart">Visualization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Final Value
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(result.finalValue)}
                        </div>
                        <p className="text-muted-foreground mt-2">
                          After {result.years} years
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Total Returns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(result.totalReturns)}
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {formatPercentage((result.totalReturns / result.totalContributions) * 100)} gain
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Contributions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(result.totalContributions)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          <div>Initial: {formatCurrency(result.initialInvestment)}</div>
                          <div>Monthly: {formatCurrency(result.monthlyContribution)} × {result.years * 12} months</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Investment Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Annual Return:</span>
                            <span className="font-medium">{formatPercentage(result.annualReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time Period:</span>
                            <span className="font-medium">{result.years} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Contribution:</span>
                            <span className="font-medium">{formatCurrency(result.monthlyContribution)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Months:</span>
                            <span className="font-medium">{result.years * 12}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={downloadResults} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="breakdown">
                  <Card>
                    <CardHeader>
                      <CardTitle>Year-by-Year Breakdown</CardTitle>
                      <CardDescription>
                        Detailed projection for each year
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Year</th>
                              <th className="text-right p-2">Starting Balance</th>
                              <th className="text-right p-2">Contributions</th>
                              <th className="text-right p-2">Returns</th>
                              <th className="text-right p-2">Ending Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.yearlyBreakdown.map((year) => (
                              <tr key={year.year} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{year.year}</td>
                                <td className="p-2 text-right">{formatCurrency(year.startingBalance)}</td>
                                <td className="p-2 text-right">{formatCurrency(year.contributions)}</td>
                                <td className="p-2 text-right text-green-600">{formatCurrency(year.returns)}</td>
                                <td className="p-2 text-right font-medium">{formatCurrency(year.endingBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="chart">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Growth Visualization
                      </CardTitle>
                      <CardDescription>
                        Visual representation of your investment growth
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatPercentage((result.totalContributions / result.finalValue) * 100)}
                            </div>
                            <div className="text-sm text-muted-foreground">Contributions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatPercentage((result.totalReturns / result.finalValue) * 100)}
                            </div>
                            <div className="text-sm text-muted-foreground">Returns</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-muted rounded-lg h-8 flex overflow-hidden">
                          <div 
                            className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${(result.totalContributions / result.finalValue) * 100}%` }}
                          >
                            Contributions
                          </div>
                          <div 
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${(result.totalReturns / result.finalValue) * 100}%` }}
                          >
                            Returns
                          </div>
                        </div>
                        
                        <div className="text-center text-sm text-muted-foreground">
                          Your {formatCurrency(result.totalContributions)} in contributions grew to {formatCurrency(result.finalValue)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
            
            {!result && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-4" />
                    <p>Enter your investment details to see projections</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> This calculator provides estimates based on the inputs provided. 
            Actual investment returns may vary due to market conditions, fees, taxes, and other factors. 
            Past performance does not guarantee future results.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}