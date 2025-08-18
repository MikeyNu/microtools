"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [results, setResults] = useState<{
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
  } | null>(null)

  const calculateLoan = () => {
    const principal = Number.parseFloat(loanAmount)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const time = Number.parseFloat(loanTerm) * 12

    if (principal && rate && time) {
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      const totalPayment = monthlyPayment * time
      const totalInterest = totalPayment - principal

      setResults({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
      })
    }
  }

  const relatedTools = [
    { name: "Basic Calculator", href: "/calculators/basic" },
    { name: "Mortgage Calculator", href: "/calculators/mortgage" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "Tip Calculator", href: "/calculators/tip" },
  ]

  return (
    <ToolLayout
      title="Loan Calculator"
      description="Calculate your monthly loan payments, total payment amount, and interest costs for any loan."
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Loan Calculator</CardTitle>
            <p className="text-muted-foreground">Calculate your monthly loan payments and total interest</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    placeholder="5.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    placeholder="30"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
                <Button onClick={calculateLoan} className="w-full">
                  Calculate Payment
                </Button>
              </div>

              {results && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Results</h3>
                  <div className="space-y-3">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Monthly Payment</div>
                      <div className="text-2xl font-bold text-primary">${results.monthlyPayment.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Payment</div>
                      <div className="text-xl font-semibold">${results.totalPayment.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Interest</div>
                      <div className="text-xl font-semibold text-accent">${results.totalInterest.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
