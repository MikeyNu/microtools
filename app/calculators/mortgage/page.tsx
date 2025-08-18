"use client"

import { useState } from "react"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [results, setResults] = useState<{
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
    loanAmount: number
  } | null>(null)

  const calculateMortgage = () => {
    const price = Number.parseFloat(homePrice)
    const down = Number.parseFloat(downPayment)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const time = Number.parseFloat(loanTerm) * 12

    if (price && down && rate && time) {
      const loanAmount = price - down
      const monthlyPayment = (loanAmount * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      const totalPayment = monthlyPayment * time
      const totalInterest = totalPayment - loanAmount

      setResults({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        loanAmount: loanAmount,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/calculators"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calculators
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Mortgage Calculator</CardTitle>
              <p className="text-muted-foreground">Calculate your monthly mortgage payments</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="homePrice">Home Price ($)</Label>
                    <Input
                      id="homePrice"
                      type="number"
                      placeholder="400000"
                      value={homePrice}
                      onChange={(e) => setHomePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      placeholder="80000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="6.5"
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
                  <Button onClick={calculateMortgage} className="w-full">
                    Calculate Mortgage
                  </Button>
                </div>

                {results && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold">Results</h3>
                    <div className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Monthly Payment</div>
                        <div className="text-2xl font-bold text-primary">
                          ${results.monthlyPayment.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Loan Amount</div>
                        <div className="text-xl font-semibold">${results.loanAmount.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Payment</div>
                        <div className="text-xl font-semibold">${results.totalPayment.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Interest</div>
                        <div className="text-xl font-semibold text-accent">
                          ${results.totalInterest.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
