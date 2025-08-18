"use client"

import { useState } from "react"
import { Ruler, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const conversions = {
  length: {
    name: "Length",
    units: [
      { code: "mm", name: "Millimeter", factor: 1 },
      { code: "cm", name: "Centimeter", factor: 10 },
      { code: "m", name: "Meter", factor: 1000 },
      { code: "km", name: "Kilometer", factor: 1000000 },
      { code: "in", name: "Inch", factor: 25.4 },
      { code: "ft", name: "Foot", factor: 304.8 },
      { code: "yd", name: "Yard", factor: 914.4 },
      { code: "mi", name: "Mile", factor: 1609344 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { code: "mg", name: "Milligram", factor: 1 },
      { code: "g", name: "Gram", factor: 1000 },
      { code: "kg", name: "Kilogram", factor: 1000000 },
      { code: "oz", name: "Ounce", factor: 28349.5 },
      { code: "lb", name: "Pound", factor: 453592 },
      { code: "st", name: "Stone", factor: 6350293 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { code: "ml", name: "Milliliter", factor: 1 },
      { code: "l", name: "Liter", factor: 1000 },
      { code: "cup", name: "Cup", factor: 236.588 },
      { code: "pt", name: "Pint", factor: 473.176 },
      { code: "qt", name: "Quart", factor: 946.353 },
      { code: "gal", name: "Gallon", factor: 3785.41 },
      { code: "fl_oz", name: "Fluid Ounce", factor: 29.5735 },
    ],
  },
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState("length")
  const [amount, setAmount] = useState("1")
  const [fromUnit, setFromUnit] = useState("m")
  const [toUnit, setToUnit] = useState("ft")
  const [result, setResult] = useState<number | null>(null)

  const convertUnit = () => {
    const amountNum = Number.parseFloat(amount)
    const categoryData = conversions[category as keyof typeof conversions]
    const fromFactor = categoryData.units.find((u) => u.code === fromUnit)?.factor || 1
    const toFactor = categoryData.units.find((u) => u.code === toUnit)?.factor || 1

    if (amountNum) {
      const baseValue = amountNum * fromFactor
      const convertedValue = baseValue / toFactor
      setResult(Math.round(convertedValue * 1000000) / 1000000)
    }
  }

  const currentCategory = conversions[category as keyof typeof conversions]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Ruler className="h-8 w-8 text-primary" />
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
              <CardTitle className="font-serif text-2xl">Unit Converter</CardTitle>
              <p className="text-muted-foreground">Convert between different units of measurement</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={category} onValueChange={setCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="length">Length</TabsTrigger>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                </TabsList>

                <TabsContent value={category} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>From Unit</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentCategory.units.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                {unit.name} ({unit.code})
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
                            {currentCategory.units.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                {unit.name} ({unit.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={convertUnit} className="w-full">
                        Convert {currentCategory.name}
                      </Button>
                    </div>

                    {result !== null && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-semibold">Result</h3>
                        <div className="bg-muted p-6 rounded-lg text-center">
                          <div className="text-sm text-muted-foreground mb-2">
                            {amount} {fromUnit} equals
                          </div>
                          <div className="text-3xl font-bold text-primary mb-2">
                            {result.toLocaleString()} {toUnit}
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
