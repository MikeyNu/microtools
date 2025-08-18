"use client"

import { useState } from "react"
import { Thermometer, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const temperatureUnits = [
  { code: "C", name: "Celsius", symbol: "°C" },
  { code: "F", name: "Fahrenheit", symbol: "°F" },
  { code: "K", name: "Kelvin", symbol: "K" },
  { code: "R", name: "Rankine", symbol: "°R" },
]

export default function TemperatureConverterPage() {
  const [temperature, setTemperature] = useState("")
  const [fromUnit, setFromUnit] = useState("C")
  const [toUnit, setToUnit] = useState("F")
  const [result, setResult] = useState<number | null>(null)

  const convertTemperature = () => {
    const temp = Number.parseFloat(temperature)
    if (!temp && temp !== 0) return

    let celsius: number

    // Convert to Celsius first
    switch (fromUnit) {
      case "C":
        celsius = temp
        break
      case "F":
        celsius = (temp - 32) * (5 / 9)
        break
      case "K":
        celsius = temp - 273.15
        break
      case "R":
        celsius = (temp - 491.67) * (5 / 9)
        break
      default:
        celsius = temp
    }

    // Convert from Celsius to target unit
    let converted: number
    switch (toUnit) {
      case "C":
        converted = celsius
        break
      case "F":
        converted = celsius * (9 / 5) + 32
        break
      case "K":
        converted = celsius + 273.15
        break
      case "R":
        converted = celsius * (9 / 5) + 491.67
        break
      default:
        converted = celsius
    }

    setResult(Math.round(converted * 100) / 100)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Thermometer className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/converters"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Converters
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Temperature Converter</CardTitle>
              <p className="text-muted-foreground">Convert between Celsius, Fahrenheit, Kelvin, and Rankine</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="0"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>From Unit</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatureUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>To Unit</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatureUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={convertTemperature} className="w-full">
                    Convert Temperature
                  </Button>
                </div>

                {result !== null && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold">Result</h3>
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {temperature}
                        {temperatureUnits.find((u) => u.code === fromUnit)?.symbol} equals
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {result}
                        {temperatureUnits.find((u) => u.code === toUnit)?.symbol}
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Quick Reference</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Water freezes: 0°C, 32°F</div>
                        <div>Water boils: 100°C, 212°F</div>
                        <div>Room temp: ~20°C, ~68°F</div>
                        <div>Body temp: 37°C, 98.6°F</div>
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
