"use client"

import { useState } from "react"
import { Receipt, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"

export default function TipCalculatorPage() {
  const [billAmount, setBillAmount] = useState("")
  const [tipPercent, setTipPercent] = useState([18])
  const [people, setPeople] = useState("1")
  const [results, setResults] = useState<{
    tipAmount: number
    totalAmount: number
    perPerson: number
    tipPerPerson: number
  } | null>(null)

  const calculateTip = () => {
    const bill = Number.parseFloat(billAmount)
    const tip = tipPercent[0]
    const numPeople = Number.parseInt(people)

    if (bill && tip && numPeople) {
      const tipAmount = (bill * tip) / 100
      const totalAmount = bill + tipAmount
      const perPerson = totalAmount / numPeople
      const tipPerPerson = tipAmount / numPeople

      setResults({
        tipAmount: Math.round(tipAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        perPerson: Math.round(perPerson * 100) / 100,
        tipPerPerson: Math.round(tipPerPerson * 100) / 100,
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
              <Receipt className="h-8 w-8 text-primary" />
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
              <CardTitle className="font-serif text-2xl">Tip Calculator</CardTitle>
              <p className="text-muted-foreground">Calculate tips and split bills easily</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="billAmount">Bill Amount ($)</Label>
                    <Input
                      id="billAmount"
                      type="number"
                      placeholder="50.00"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tip Percentage: {tipPercent[0]}%</Label>
                    <div className="mt-2">
                      <Slider
                        value={tipPercent}
                        onValueChange={setTipPercent}
                        max={30}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>30%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="people">Number of People</Label>
                    <Input
                      id="people"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                    />
                  </div>

                  <Button onClick={calculateTip} className="w-full">
                    Calculate Tip
                  </Button>
                </div>

                {results && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold">Results</h3>
                    <div className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Tip Amount</div>
                        <div className="text-xl font-semibold text-accent">${results.tipAmount}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-2xl font-bold text-primary">${results.totalAmount}</div>
                      </div>
                      {Number.parseInt(people) > 1 && (
                        <>
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Per Person</div>
                            <div className="text-xl font-semibold">${results.perPerson}</div>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Tip Per Person</div>
                            <div className="text-lg font-medium text-accent">${results.tipPerPerson}</div>
                          </div>
                        </>
                      )}
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
