"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToolLayout } from "@/components/tool-layout"

export default function BasicCalculatorPage() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "×":
        return firstValue * secondValue
      case "÷":
        return firstValue / secondValue
      case "=":
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = Number.parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const clearEntry = () => {
    setDisplay("0")
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const relatedTools = [
    { name: "Loan Calculator", href: "/calculators/loan" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "Tip Calculator", href: "/calculators/tip" },
    { name: "BMI Calculator", href: "/calculators/bmi" },
  ]

  return (
    <ToolLayout
      title="Basic Calculator"
      description="A full-featured calculator for basic arithmetic operations with memory functions."
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display */}
            <div className="bg-muted p-4 rounded-lg text-right">
              <div className="text-3xl font-mono font-bold text-foreground min-h-[3rem] flex items-center justify-end">
                {display}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={clear} className="h-12 bg-transparent">
                AC
              </Button>
              <Button variant="outline" onClick={clearEntry} className="h-12 bg-transparent">
                CE
              </Button>
              <Button variant="outline" className="h-12 bg-transparent">
                ±
              </Button>
              <Button
                variant="default"
                onClick={() => inputOperation("÷")}
                className="h-12 bg-accent hover:bg-accent/90"
              >
                ÷
              </Button>

              <Button variant="outline" onClick={() => inputNumber("7")} className="h-12">
                7
              </Button>
              <Button variant="outline" onClick={() => inputNumber("8")} className="h-12">
                8
              </Button>
              <Button variant="outline" onClick={() => inputNumber("9")} className="h-12">
                9
              </Button>
              <Button
                variant="default"
                onClick={() => inputOperation("×")}
                className="h-12 bg-accent hover:bg-accent/90"
              >
                ×
              </Button>

              <Button variant="outline" onClick={() => inputNumber("4")} className="h-12">
                4
              </Button>
              <Button variant="outline" onClick={() => inputNumber("5")} className="h-12">
                5
              </Button>
              <Button variant="outline" onClick={() => inputNumber("6")} className="h-12">
                6
              </Button>
              <Button
                variant="default"
                onClick={() => inputOperation("-")}
                className="h-12 bg-accent hover:bg-accent/90"
              >
                -
              </Button>

              <Button variant="outline" onClick={() => inputNumber("1")} className="h-12">
                1
              </Button>
              <Button variant="outline" onClick={() => inputNumber("2")} className="h-12">
                2
              </Button>
              <Button variant="outline" onClick={() => inputNumber("3")} className="h-12">
                3
              </Button>
              <Button
                variant="default"
                onClick={() => inputOperation("+")}
                className="h-12 bg-accent hover:bg-accent/90"
              >
                +
              </Button>

              <Button variant="outline" onClick={() => inputNumber("0")} className="h-12 col-span-2">
                0
              </Button>
              <Button variant="outline" onClick={inputDecimal} className="h-12 bg-transparent">
                .
              </Button>
              <Button onClick={performCalculation} className="h-12 bg-primary hover:bg-primary/90">
                =
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
