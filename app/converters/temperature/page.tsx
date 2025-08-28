"use client"

import { useState, useEffect } from "react"
import { Thermometer, ArrowLeft, RefreshCw, Copy, History, Info, AlertCircle, TrendingUp, Snowflake, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { FavoriteButton, ShareButton } from "@/components/user-engagement"
import { useToolTracker } from "@/hooks/use-tool-tracker"

interface ConversionResult {
  value: number
  fromUnit: string
  toUnit: string
  formula: string
  description: string
}

interface ConversionHistory {
  id: string
  timestamp: Date
  input: number
  fromUnit: string
  toUnit: string
  result: number
}

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
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [showAllUnits, setShowAllUnits] = useState(false)
  
  const { trackToolStart, trackToolComplete } = useToolTracker()
  
  const tool = {
    id: 'temperature-converter',
    name: "Temperature Converter",
    category: "converters",
    description: "Convert temperatures between different units with detailed explanations",
    url: '/converters/temperature'
  }
  
  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInput = () => {
    const newErrors: string[] = []
    const temp = Number.parseFloat(temperature)
    
    if (!temperature || isNaN(temp)) {
      newErrors.push("Please enter a valid temperature")
    }
    
    // Check for absolute zero violations
    if (fromUnit === "K" && temp < 0) {
      newErrors.push("Kelvin temperature cannot be negative")
    }
    if (fromUnit === "R" && temp < 0) {
      newErrors.push("Rankine temperature cannot be negative")
    }
    if (fromUnit === "C" && temp < -273.15) {
      newErrors.push("Temperature cannot be below absolute zero (-273.15°C)")
    }
    if (fromUnit === "F" && temp < -459.67) {
      newErrors.push("Temperature cannot be below absolute zero (-459.67°F)")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }
  
  const getConversionFormula = (from: string, to: string, value: number) => {
    if (from === to) return `${value} = ${value}`
    
    const formulas: Record<string, Record<string, string>> = {
      C: {
        F: `(${value} × 9/5) + 32`,
        K: `${value} + 273.15`,
        R: `(${value} + 273.15) × 9/5`
      },
      F: {
        C: `(${value} - 32) × 5/9`,
        K: `(${value} - 32) × 5/9 + 273.15`,
        R: `${value} + 459.67`
      },
      K: {
        C: `${value} - 273.15`,
        F: `(${value} - 273.15) × 9/5 + 32`,
        R: `${value} × 9/5`
      },
      R: {
        C: `${value} × 5/9 - 273.15`,
        F: `${value} - 459.67`,
        K: `${value} × 5/9`
      }
    }
    
    return formulas[from]?.[to] || "Direct conversion"
  }
  
  const getTemperatureDescription = (temp: number, unit: string) => {
    const celsius = convertToCelsius(temp, unit)
    
    if (celsius < -200) return "Extremely cold - approaching absolute zero"
    if (celsius < -100) return "Extremely cold - colder than Antarctica"
    if (celsius < -50) return "Very cold - Arctic conditions"
    if (celsius < 0) return "Freezing - water turns to ice"
    if (celsius < 10) return "Cold - winter weather"
    if (celsius < 20) return "Cool - comfortable indoor temperature"
    if (celsius < 30) return "Warm - pleasant weather"
    if (celsius < 40) return "Hot - summer weather"
    if (celsius < 60) return "Very hot - desert conditions"
    if (celsius < 100) return "Extremely hot - approaching boiling point"
    if (celsius === 100) return "Boiling point of water at sea level"
    return "Extremely hot - above boiling point"
  }
  
  const convertToCelsius = (temp: number, unit: string): number => {
    switch (unit) {
      case "C": return temp
      case "F": return (temp - 32) * (5 / 9)
      case "K": return temp - 273.15
      case "R": return (temp - 491.67) * (5 / 9)
      default: return temp
    }
  }
  
  const convertFromCelsius = (celsius: number, unit: string): number => {
    switch (unit) {
      case "C": return celsius
      case "F": return (celsius * 9/5) + 32
      case "K": return celsius + 273.15
      case "R": return (celsius + 273.15) * 9/5
      default: return celsius
    }
  }
  
  const convertTemperature = () => {
    if (!validateInput()) return
    
    const temp = Number.parseFloat(temperature)
    const celsius = convertToCelsius(temp, fromUnit)
    const converted = convertFromCelsius(celsius, toUnit)
    
    const conversionResult: ConversionResult = {
      value: Math.round(converted * 100000) / 100000, // Round to 5 decimal places
      fromUnit,
      toUnit,
      formula: getConversionFormula(fromUnit, toUnit, temp),
      description: getTemperatureDescription(converted, toUnit)
    }
    
    setResult(conversionResult)
    
    // Add to history
    const historyEntry: ConversionHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      input: temp,
      fromUnit,
      toUnit,
      result: conversionResult.value
    }
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 9)]) // Keep last 10 conversions
    trackToolComplete()
  }
  
  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (result) {
      setTemperature(result.value.toString())
      setResult(null)
    }
  }
  
  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result.value.toString())
    }
  }
  
  const clearHistory = () => {
    setHistory([])
  }

  // Temperature units configuration
  const temperatureUnits = [
    { code: "C", name: "Celsius", symbol: "°C" },
    { code: "F", name: "Fahrenheit", symbol: "°F" },
    { code: "K", name: "Kelvin", symbol: "K" },
    { code: "R", name: "Rankine", symbol: "°R" }
  ]

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
            <div className="flex items-center space-x-4">
              <FavoriteButton toolId={tool.id} />
              <ShareButton tool={tool} />
              <Link
                href="/converters"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Converters
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Thermometer className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif text-3xl">Temperature Converter</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Convert between Celsius, Fahrenheit, Kelvin, and Rankine with detailed explanations
              </CardDescription>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">Scientific Accuracy</Badge>
                <Badge variant="secondary">Formula Display</Badge>
                <Badge variant="secondary">History Tracking</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {errors.length > 0 && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="converter" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="converter">Converter</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="converter" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="temperature" className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4" />
                          <span>Temperature Value</span>
                        </Label>
                        <Input
                          id="temperature"
                          type="number"
                          placeholder="Enter temperature"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>From Unit</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {temperatureUnits.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                <div className="flex items-center space-x-2">
                                  <span>{unit.name}</span>
                                  <span className="text-muted-foreground">({unit.symbol})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label>To Unit</Label>
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {temperatureUnits.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                <div className="flex items-center space-x-2">
                                  <span>{unit.name}</span>
                                  <span className="text-muted-foreground">({unit.symbol})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={swapUnits} variant="outline" className="flex-1">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Swap
                        </Button>
                        <Button onClick={convertTemperature} className="flex-1">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Convert
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-6">
                  {result ? (
                    <div className="space-y-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {result.value}
                          </div>
                          <div className="text-lg text-muted-foreground mb-4">
                            {temperatureUnits.find(u => u.code === result.toUnit)?.symbol}
                          </div>
                          <Button onClick={copyResult} variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Result
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Info className="h-5 w-5" />
                            <span>Conversion Details</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Formula:</Label>
                            <div className="bg-muted p-3 rounded-lg font-mono text-sm mt-1">
                              {result.formula}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Description:</Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              {result.description}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>All Unit Conversions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {temperatureUnits.map((unit) => {
                              if (unit.code === result.fromUnit) return null
                              const converted = convertFromCelsius(
                                convertToCelsius(Number.parseFloat(temperature), result.fromUnit),
                                unit.code
                              )
                              return (
                                <div key={unit.code} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                  <span className="font-medium">{unit.name}</span>
                                  <span className="text-primary font-semibold">
                                    {Math.round(converted * 100000) / 100000} {unit.symbol}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Convert a temperature to see detailed results</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Conversion History</h3>
                    {history.length > 0 && (
                      <Button onClick={clearHistory} variant="outline" size="sm">
                        Clear History
                      </Button>
                    )}
                  </div>
                  
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((entry) => (
                        <Card key={entry.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">
                                  {entry.input} {temperatureUnits.find(u => u.code === entry.fromUnit)?.symbol} → {entry.result} {temperatureUnits.find(u => u.code === entry.toUnit)?.symbol}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.timestamp.toLocaleString()}
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  setTemperature(entry.input.toString())
                                  setFromUnit(entry.fromUnit)
                                  setToUnit(entry.toUnit)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Reuse
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No conversion history yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Related Tools */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Related Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/converters/unit" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Unit Converter</div>
                </Link>
                <Link href="/converters/currency" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Currency Converter</div>
                </Link>
                <Link href="/converters/file-size" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">File Size Converter</div>
                </Link>
                <Link href="/calculators/basic" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Basic Calculator</div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
