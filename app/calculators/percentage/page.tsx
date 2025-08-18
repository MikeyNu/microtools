"use client"

import { useState } from "react"
import { Percent, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function PercentageCalculatorPage() {
  const [basicValue, setBasicValue] = useState("")
  const [basicPercent, setBasicPercent] = useState("")
  const [basicResult, setBasicResult] = useState<number | null>(null)

  const [changeOld, setChangeOld] = useState("")
  const [changeNew, setChangeNew] = useState("")
  const [changeResult, setChangeResult] = useState<number | null>(null)

  const calculateBasic = () => {
    const value = Number.parseFloat(basicValue)
    const percent = Number.parseFloat(basicPercent)
    if (value && percent) {
      setBasicResult((value * percent) / 100)
    }
  }

  const calculateChange = () => {
    const oldValue = Number.parseFloat(changeOld)
    const newValue = Number.parseFloat(changeNew)
    if (oldValue && newValue) {
      const change = ((newValue - oldValue) / oldValue) * 100
      setChangeResult(Math.round(change * 100) / 100)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Percent className="h-8 w-8 text-primary" />
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
              <CardTitle className="font-serif text-2xl">Percentage Calculator</CardTitle>
              <p className="text-muted-foreground">Calculate percentages and percentage changes</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Percentage</TabsTrigger>
                  <TabsTrigger value="change">Percentage Change</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basicValue">Value</Label>
                        <Input
                          id="basicValue"
                          type="number"
                          placeholder="100"
                          value={basicValue}
                          onChange={(e) => setBasicValue(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="basicPercent">Percentage (%)</Label>
                        <Input
                          id="basicPercent"
                          type="number"
                          placeholder="25"
                          value={basicPercent}
                          onChange={(e) => setBasicPercent(e.target.value)}
                        />
                      </div>
                      <Button onClick={calculateBasic} className="w-full">
                        Calculate
                      </Button>
                    </div>

                    {basicResult !== null && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-semibold">Result</h3>
                        <div className="bg-muted p-6 rounded-lg text-center">
                          <div className="text-sm text-muted-foreground mb-2">
                            {basicPercent}% of {basicValue} is
                          </div>
                          <div className="text-3xl font-bold text-primary">{basicResult}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="change" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="changeOld">Old Value</Label>
                        <Input
                          id="changeOld"
                          type="number"
                          placeholder="100"
                          value={changeOld}
                          onChange={(e) => setChangeOld(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="changeNew">New Value</Label>
                        <Input
                          id="changeNew"
                          type="number"
                          placeholder="125"
                          value={changeNew}
                          onChange={(e) => setChangeNew(e.target.value)}
                        />
                      </div>
                      <Button onClick={calculateChange} className="w-full">
                        Calculate Change
                      </Button>
                    </div>

                    {changeResult !== null && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-semibold">Result</h3>
                        <div className="bg-muted p-6 rounded-lg text-center">
                          <div className="text-sm text-muted-foreground mb-2">Percentage Change</div>
                          <div
                            className={`text-3xl font-bold ${changeResult >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {changeResult >= 0 ? "+" : ""}
                            {changeResult}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            {changeResult >= 0 ? "Increase" : "Decrease"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
