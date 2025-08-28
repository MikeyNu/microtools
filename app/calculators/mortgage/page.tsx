'use client'

import { useState, useEffect } from 'react'
import { Home, Calculator, DollarSign, TrendingUp, Calendar, PieChart, Info, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface MortgageResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanAmount: number
  monthlyPMI: number
  monthlyTaxes: number
  monthlyInsurance: number
  totalMonthlyPayment: number
  interestPercentage: number
  amortizationSchedule: AmortizationEntry[]
  summary: {
    principalPaid: number
    interestPaid: number
    remainingBalance: number
  }
}

interface AmortizationEntry {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  pmi: number
  taxes: number
  insurance: number
  totalPayment: number
}

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [downPaymentType, setDownPaymentType] = useState('amount') // 'amount' or 'percentage'
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [propertyTax, setPropertyTax] = useState('')
  const [homeInsurance, setHomeInsurance] = useState('')
  const [pmiRate, setPmiRate] = useState('0.5')
  const [errors, setErrors] = useState<string[]>([])
  const [results, setResults] = useState<MortgageResult | null>(null)
  
  const { trackToolStart, trackToolComplete } = useToolTracker('Mortgage Calculator', 'Calculators')
  
  const tool = {
    id: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    category: 'Calculators',
    description: 'Calculate mortgage payments with PMI, taxes, and insurance',
    url: '/calculators/mortgage'
  }
  
  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInputs = () => {
    const newErrors: string[] = []
    const price = parseFloat(homePrice)
    const down = parseFloat(downPayment)
    const rate = parseFloat(interestRate)
    const term = parseFloat(loanTerm)
    const tax = parseFloat(propertyTax || '0')
    const insurance = parseFloat(homeInsurance || '0')
    const pmi = parseFloat(pmiRate)

    if (!homePrice || price <= 0) newErrors.push('Home price must be greater than 0')
    if (!downPayment || down < 0) newErrors.push('Down payment must be 0 or greater')
    if (!interestRate || rate <= 0) newErrors.push('Interest rate must be greater than 0')
    if (!loanTerm || term <= 0) newErrors.push('Loan term must be greater than 0')
    if (tax < 0) newErrors.push('Property tax cannot be negative')
    if (insurance < 0) newErrors.push('Home insurance cannot be negative')
    if (pmi < 0) newErrors.push('PMI rate cannot be negative')

    if (downPaymentType === 'percentage' && down > 100) {
      newErrors.push('Down payment percentage cannot exceed 100%')
    }

    if (downPaymentType === 'amount' && down >= price) {
      newErrors.push('Down payment cannot be greater than or equal to home price')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const generateAmortizationSchedule = (loanAmount: number, monthlyRate: number, totalMonths: number, monthlyTax: number, monthlyInsurance: number, monthlyPMI: number): AmortizationEntry[] => {
    const schedule: AmortizationEntry[] = []
    let remainingBalance = loanAmount
    const monthlyPrincipalInterest = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

    // Show first 12 months
    for (let month = 1; month <= Math.min(12, totalMonths); month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPrincipalInterest - interestPayment
      remainingBalance -= principalPayment

      const currentPMI = remainingBalance / loanAmount > 0.8 ? monthlyPMI : 0

      schedule.push({
        month,
        payment: parseFloat(monthlyPrincipalInterest.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(remainingBalance.toFixed(2)),
        pmi: parseFloat(currentPMI.toFixed(2)),
        taxes: parseFloat(monthlyTax.toFixed(2)),
        insurance: parseFloat(monthlyInsurance.toFixed(2)),
        totalPayment: parseFloat((monthlyPrincipalInterest + currentPMI + monthlyTax + monthlyInsurance).toFixed(2))
      })
    }

    return schedule
  }

  const calculateMortgage = () => {
    if (!validateInputs()) return

    trackToolComplete()

    const price = parseFloat(homePrice)
    const rate = parseFloat(interestRate) / 100 / 12
    const term = parseFloat(loanTerm) * 12
    const tax = parseFloat(propertyTax || '0')
    const insurance = parseFloat(homeInsurance || '0')
    const pmi = parseFloat(pmiRate) / 100 / 12

    // Calculate down payment amount
    let downAmount: number
    if (downPaymentType === 'percentage') {
      downAmount = (parseFloat(downPayment) / 100) * price
    } else {
      downAmount = parseFloat(downPayment)
    }

    const loanAmount = price - downAmount
    const downPaymentPercentage = (downAmount / price) * 100

    // Calculate monthly payments
    const monthlyPrincipalInterest = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    const monthlyTax = tax / 12
    const monthlyInsurance = insurance / 12
    const monthlyPMI = downPaymentPercentage < 20 ? loanAmount * pmi : 0
    const totalMonthlyPayment = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + monthlyPMI

    const totalPayment = monthlyPrincipalInterest * term
    const totalInterest = totalPayment - loanAmount
    const interestPercentage = (totalInterest / totalPayment) * 100

    const amortizationSchedule = generateAmortizationSchedule(
      loanAmount,
      rate,
      term,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI
    )

    setResults({
      monthlyPayment: parseFloat(monthlyPrincipalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      loanAmount: parseFloat(loanAmount.toFixed(2)),
      monthlyPMI: parseFloat(monthlyPMI.toFixed(2)),
      monthlyTaxes: parseFloat(monthlyTax.toFixed(2)),
      monthlyInsurance: parseFloat(monthlyInsurance.toFixed(2)),
      totalMonthlyPayment: parseFloat(totalMonthlyPayment.toFixed(2)),
      interestPercentage: parseFloat(interestPercentage.toFixed(2)),
      amortizationSchedule,
      summary: {
        principalPaid: parseFloat(loanAmount.toFixed(2)),
        interestPaid: parseFloat(totalInterest.toFixed(2)),
        remainingBalance: 0
      }
    })
  }

  const relatedTools = [
    { name: "Loan Calculator", href: "/calculators/loan" },
    { name: "BMI Calculator", href: "/calculators/bmi" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "Basic Calculator", href: "/calculators/basic" },
  ]

  return (
    <ToolLayout
      title="Mortgage Calculator"
      description="Calculate mortgage payments with PMI, taxes, insurance, and detailed amortization schedule"
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Mortgage Calculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Mortgage Details
              </CardTitle>
              <CardDescription>
                Enter your home purchase and loan information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homePrice">Home Price ($)</Label>
                <Input
                  id="homePrice"
                  type="number"
                  placeholder="400000"
                  value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Down Payment</Label>
                <div className="flex gap-2">
                  <Select value={downPaymentType} onValueChange={setDownPaymentType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="percentage">Percent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={downPaymentType === 'percentage' ? '20' : '80000'}
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="6.5"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    placeholder="30"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyTax">Annual Property Tax ($)</Label>
                  <Input
                    id="propertyTax"
                    type="number"
                    placeholder="5000"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInsurance">Annual Home Insurance ($)</Label>
                  <Input
                    id="homeInsurance"
                    type="number"
                    placeholder="1200"
                    value={homeInsurance}
                    onChange={(e) => setHomeInsurance(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pmiRate">PMI Rate (% annually)</Label>
                <Input
                  id="pmiRate"
                  type="number"
                  placeholder="0.5"
                  step="0.1"
                  value={pmiRate}
                  onChange={(e) => setPmiRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  PMI applies when down payment is less than 20%
                </p>
              </div>

              <Button onClick={calculateMortgage} className="w-full" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Mortgage
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Monthly Payment */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Total Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">${results.totalMonthlyPayment.toLocaleString()}</div>
                  <Badge variant="outline" className="mt-2">
                    Including taxes, insurance & PMI
                  </Badge>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Principal & Interest</span>
                    <span className="font-semibold">${results.monthlyPayment.toLocaleString()}</span>
                  </div>
                  {results.monthlyTaxes > 0 && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Property Taxes</span>
                      <span className="font-semibold">${results.monthlyTaxes.toLocaleString()}</span>
                    </div>
                  )}
                  {results.monthlyInsurance > 0 && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Home Insurance</span>
                      <span className="font-semibold">${results.monthlyInsurance.toLocaleString()}</span>
                    </div>
                  )}
                  {results.monthlyPMI > 0 && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>PMI</span>
                      <span className="font-semibold text-orange-600">${results.monthlyPMI.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Loan Summary */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Loan Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span className="font-medium">${results.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-medium text-orange-600">${results.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Payment:</span>
                      <span>${results.totalPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Interest Percentage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interest vs Principal</span>
                    <span>{results.interestPercentage}% interest</span>
                  </div>
                  <Progress 
                    value={(results.totalInterest / results.totalPayment) * 100} 
                    className="h-3" 
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Amortization Schedule */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Amortization Schedule
              </CardTitle>
              <CardDescription>
                First 12 months payment breakdown with taxes, insurance, and PMI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">P&I</th>
                      <th className="text-right p-2">Principal</th>
                      <th className="text-right p-2">Interest</th>
                      <th className="text-right p-2">PMI</th>
                      <th className="text-right p-2">Taxes</th>
                      <th className="text-right p-2">Insurance</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.amortizationSchedule.map((entry) => (
                      <tr key={entry.month} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{entry.month}</td>
                        <td className="p-2 text-right">${entry.payment}</td>
                        <td className="p-2 text-right text-green-600">${entry.principal}</td>
                        <td className="p-2 text-right text-orange-600">${entry.interest}</td>
                        <td className="p-2 text-right text-red-600">${entry.pmi}</td>
                        <td className="p-2 text-right">${entry.taxes}</td>
                        <td className="p-2 text-right">${entry.insurance}</td>
                        <td className="p-2 text-right font-medium">${entry.totalPayment}</td>
                        <td className="p-2 text-right">${entry.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {results.amortizationSchedule.length === 12 && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Showing first 12 months. PMI is automatically removed when loan balance drops below 80% of original home value.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
