"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToolLayout } from "@/components/tool-layout"

export default function BMICalculatorPage() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState("metric")
  const [results, setResults] = useState<{
    bmi: number
    category: string
    color: string
  } | null>(null)

  const calculateBMI = () => {
    let heightInMeters: number
    let weightInKg: number

    if (unit === "metric") {
      heightInMeters = Number.parseFloat(height) / 100
      weightInKg = Number.parseFloat(weight)
    } else {
      heightInMeters = Number.parseFloat(height) * 0.0254
      weightInKg = Number.parseFloat(weight) * 0.453592
    }

    if (heightInMeters && weightInKg) {
      const bmi = weightInKg / (heightInMeters * heightInMeters)
      let category = ""
      let color = ""

      if (bmi < 18.5) {
        category = "Underweight"
        color = "text-blue-600"
      } else if (bmi < 25) {
        category = "Normal weight"
        color = "text-green-600"
      } else if (bmi < 30) {
        category = "Overweight"
        color = "text-yellow-600"
      } else {
        category = "Obese"
        color = "text-red-600"
      }

      setResults({
        bmi: Math.round(bmi * 10) / 10,
        category,
        color,
      })
    }
  }

  const relatedTools = [
    { name: "Basic Calculator", href: "/calculators/basic" },
    { name: "Loan Calculator", href: "/calculators/loan" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "Tip Calculator", href: "/calculators/tip" },
  ]

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index and determine your health category with metric or imperial units."
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">BMI Calculator</CardTitle>
            <p className="text-muted-foreground">Calculate your Body Mass Index and health category</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Unit System</Label>
                  <RadioGroup value={unit} onValueChange={setUnit} className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="metric" id="metric" />
                      <Label htmlFor="metric">Metric</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="imperial" id="imperial" />
                      <Label htmlFor="imperial">Imperial</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={unit === "metric" ? "170" : "67"}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder={unit === "metric" ? "70" : "154"}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <Button onClick={calculateBMI} className="w-full">
                  Calculate BMI
                </Button>
              </div>

              {results && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Your Results</h3>
                  <div className="space-y-3">
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-2">Your BMI</div>
                      <div className="text-4xl font-bold text-primary mb-2">{results.bmi}</div>
                      <div className={`text-lg font-semibold ${results.color}`}>{results.category}</div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">BMI Categories</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Underweight</span>
                          <span className="text-blue-600">Below 18.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Normal weight</span>
                          <span className="text-green-600">18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overweight</span>
                          <span className="text-yellow-600">25 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Obese</span>
                          <span className="text-red-600">30 and above</span>
                        </div>
                      </div>
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
