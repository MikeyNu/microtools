'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Calendar, PieChart, Info } from 'lucide-react'
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

interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
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
}

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [loanType, setLoanType] = useState('personal')
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  const [downPayment, setDownPayment] = useState('')
  const [results, setResults] = useState<LoanResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Loan Calculator', 'calculators')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Calculate loan payments with detailed amortization schedule',
    category: 'calculators',
    url: '/calculators/loan'
  }
  
  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInputs = () => {
    const newErrors: string[] = []
    
    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      newErrors.push('Please enter a valid loan amount')
    }
    if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) < 0) {
      newErrors.push('Please enter a valid interest rate')
    }
    if (!loanTerm || isNaN(Number(loanTerm)) || Number(loanTerm) <= 0) {
      newErrors.push('Please enter a valid loan term')
    }
    if (downPayment && (isNaN(Number(downPayment)) || Number(downPayment) < 0)) {
      newErrors.push('Please enter a valid down payment amount')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }
  
  const generateAmortizationSchedule = (
    principal: number,
    monthlyRate: number,
    totalPayments: number,
    monthlyPayment: number
  ): AmortizationEntry[] => {
    const schedule: AmortizationEntry[] = []
    let remainingBalance = principal
    
    for (let month = 1; month <= totalPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
      
      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.max(0, Math.round(remainingBalance * 100) / 100)
      })
      
      if (remainingBalance <= 0) break
    }
    
    return schedule
  }

  const calculateLoan = () => {
    if (!validateInputs()) {
      trackToolError()
      return
    }
    
    try {
      let principal = Number.parseFloat(loanAmount)
      const annualRate = Number.parseFloat(interestRate) / 100
      const years = Number.parseFloat(loanTerm)
      const down = downPayment ? Number.parseFloat(downPayment) : 0
      
      // Adjust principal for down payment
      principal = principal - down
      
      if (principal <= 0) {
        setErrors(['Loan amount must be greater than down payment'])
        return
      }
      
      // Calculate payment frequency multiplier
      const paymentsPerYear = paymentFrequency === 'monthly' ? 12 : 
                             paymentFrequency === 'biweekly' ? 26 : 
                             paymentFrequency === 'weekly' ? 52 : 12
      
      const periodRate = annualRate / paymentsPerYear
      const totalPayments = years * paymentsPerYear
      
      let monthlyPayment: number
      
      if (periodRate === 0) {
        // Handle 0% interest rate
        monthlyPayment = principal / totalPayments
      } else {
        // Standard loan payment formula
        monthlyPayment = (principal * periodRate * Math.pow(1 + periodRate, totalPayments)) / 
                        (Math.pow(1 + periodRate, totalPayments) - 1)
      }
      
      const totalPayment = monthlyPayment * totalPayments
      const totalInterest = totalPayment - principal
      const interestPercentage = (totalInterest / principal) * 100
      
      // Generate amortization schedule (limit to first 12 months for display)
      const amortizationSchedule = generateAmortizationSchedule(
        principal, 
        periodRate, 
        Math.min(totalPayments, 12), 
        monthlyPayment
      )
      
      const result: LoanResult = {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        interestPercentage: Math.round(interestPercentage * 100) / 100,
        amortizationSchedule,
        summary: {
          principalPaid: Math.round(principal * 100) / 100,
          interestPaid: Math.round(totalInterest * 100) / 100,
          remainingBalance: 0
        }
      }
      
      setResults(result)
      trackToolComplete()
    } catch (error) {
      trackToolError()
      setErrors(['An error occurred during calculation'])
    }
  }

  const relatedTools = [
    { name: "Basic Calculator", href: "/calculators/basic" },
    { name: "Mortgage Calculator", href: "/calculators/mortgage" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "BMI Calculator", href: "/calculators/bmi" },
  ]

  return (
    <ToolLayout
      title="Loan Calculator"
      description="Calculate loan payments with detailed amortization schedule and comprehensive analysis"
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Loan Calculator</h1>
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
                <Calculator className="h-5 w-5" />
                Loan Details
              </CardTitle>
              <CardDescription>
                Enter your loan information to calculate payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="25000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment ($)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    placeholder="0"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="5.5"
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
                    placeholder="5"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Loan</SelectItem>
                      <SelectItem value="auto">Auto Loan</SelectItem>
                      <SelectItem value="home">Home Loan</SelectItem>
                      <SelectItem value="business">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Frequency</Label>
                  <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateLoan} className="w-full" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Loan
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly Payment */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">${results.monthlyPayment}</div>
                  <Badge variant="outline" className="mt-2">
                    {paymentFrequency} payments
                  </Badge>
                </div>

                {/* Payment Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Payment</div>
                    <div className="text-xl font-bold">${results.totalPayment}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
                    <div className="text-xl font-bold text-orange-600">${results.totalInterest}</div>
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

                {/* Quick Stats */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Loan Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Principal:</span>
                      <span className="font-medium">${results.summary.principalPaid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest:</span>
                      <span className="font-medium text-orange-600">${results.summary.interestPaid}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total:</span>
                      <span>${results.totalPayment}</span>
                    </div>
                  </div>
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
                First 12 months payment breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Payment</th>
                      <th className="text-right p-2">Principal</th>
                      <th className="text-right p-2">Interest</th>
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
                    Showing first 12 months. The complete schedule continues with decreasing interest and increasing principal payments.
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
