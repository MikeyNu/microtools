"use client"

import { useState, useEffect } from "react"
import { Percent, Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolLayout } from "@/components/tool-layout"
import { FavoriteButton, ShareButton } from "@/components/user-engagement"
import { useToolTracker } from "@/components/analytics-provider"

interface CalculationResult {
  type: string
  result: number
  formula: string
  explanation: string
}

export default function PercentageCalculator() {
  // Basic percentage states
  const [basicValue, setBasicValue] = useState('')
  const [basicTotal, setBasicTotal] = useState('')
  const [basicResult, setBasicResult] = useState<CalculationResult | null>(null)
  
  // Percentage change states
  const [changeOld, setChangeOld] = useState('')
  const [changeNew, setChangeNew] = useState('')
  const [changeResult, setChangeResult] = useState<CalculationResult | null>(null)
  
  // Increase/decrease states
  const [increaseValue, setIncreaseValue] = useState('')
  const [increasePercent, setIncreasePercent] = useState('')
  const [increaseOperation, setIncreaseOperation] = useState<'increase' | 'decrease'>('increase')
  const [increaseResult, setIncreaseResult] = useState<CalculationResult | null>(null)
  
  // Discount states
  const [discountPrice, setDiscountPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountResult, setDiscountResult] = useState<CalculationResult[]>([])
  
  // Error handling
  const [errors, setErrors] = useState<string[]>([])
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Percentage Calculator', 'calculators')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages, percentage changes, increases, decreases, and discounts',
    category: 'calculators',
    url: '/calculators/percentage'
  }

  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInputs = (values: string[], labels: string[]): number[] | null => {
    const errors: string[] = []
    const parsedValues: number[] = []
    
    values.forEach((value, index) => {
      if (!value.trim()) {
        errors.push(`${labels[index]} is required`)
      } else {
        const parsed = parseFloat(value)
        if (isNaN(parsed)) {
          errors.push(`${labels[index]} must be a valid number`)
        } else {
          parsedValues.push(parsed)
        }
      }
    })
    
    if (errors.length > 0) {
      setErrors(errors)
      return null
    }
    
    setErrors([])
    return parsedValues
  }

  const calculateBasic = () => {
    try {
      const values = validateInputs([basicValue, basicTotal], ['Value', 'Total'])
      if (!values) {
        trackToolError()
        return
      }
      
      const [value, total] = values
      
      if (total === 0) {
        setErrors(['Total cannot be zero'])
        trackToolError()
        return
      }
      
      const percentage = (value / total) * 100
      
      setBasicResult({
        type: 'Basic Percentage',
        result: percentage,
        formula: `(${value} ÷ ${total}) × 100`,
        explanation: `${value} is ${percentage.toFixed(2)}% of ${total}`
      })
      
      trackToolComplete()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Calculation failed'
      setErrors([errorMsg])
      trackToolError()
    }
  }

  const calculateChange = () => {
    try {
      const values = validateInputs([changeOld, changeNew], ['Old Value', 'New Value'])
      if (!values) {
        trackToolError()
        return
      }
      
      const [oldValue, newValue] = values
      
      if (oldValue === 0) {
        setErrors(['Old value cannot be zero'])
        trackToolError()
        return
      }
      
      const change = ((newValue - oldValue) / oldValue) * 100
      const isIncrease = change > 0
      
      setChangeResult({
        type: 'Percentage Change',
        result: Math.abs(change),
        formula: `((${newValue} - ${oldValue}) ÷ ${oldValue}) × 100`,
        explanation: `${isIncrease ? 'Increase' : 'Decrease'} of ${Math.abs(change).toFixed(2)}%`
      })
      
      trackToolComplete()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Calculation failed'
      setErrors([errorMsg])
      trackToolError()
    }
  }

  const calculateIncrease = () => {
    try {
      const values = validateInputs([increaseValue, increasePercent], ['Original Value', 'Percentage'])
      if (!values) {
        trackToolError()
        return
      }
      
      const [originalValue, percentage] = values
      
      if (increaseOperation === 'decrease' && percentage > 100) {
        setErrors(['Decrease percentage cannot exceed 100%'])
        trackToolError()
        return
      }
      
      const multiplier = increaseOperation === 'increase' ? 1 + (percentage / 100) : 1 - (percentage / 100)
      const newValue = originalValue * multiplier
      
      setIncreaseResult({
        type: `Percentage ${increaseOperation}`,
        result: newValue,
        formula: `${originalValue} × ${multiplier.toFixed(3)}`,
        explanation: `${originalValue} ${increaseOperation === 'increase' ? 'increased' : 'decreased'} by ${percentage}% = ${newValue.toFixed(2)}`
      })
      
      trackToolComplete()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Calculation failed'
      setErrors([errorMsg])
      trackToolError()
    }
  }

  const calculateDiscount = () => {
    try {
      const values = validateInputs([discountPrice, discountPercent], ['Original Price', 'Discount Percentage'])
      if (!values) {
        trackToolError()
        return
      }
      
      const [originalPrice, discountPercentage] = values
      
      if (discountPercentage < 0 || discountPercentage > 100) {
        setErrors(['Discount percentage must be between 0 and 100'])
        trackToolError()
        return
      }
      
      const discountAmount = (originalPrice * discountPercentage) / 100
      const finalPrice = originalPrice - discountAmount
      
      setDiscountResult([
        {
          type: 'Discount Amount',
          result: discountAmount,
          formula: `${originalPrice} × (${discountPercentage} ÷ 100)`,
          explanation: `You save $${discountAmount.toFixed(2)}`
        },
        {
          type: 'Final Price',
          result: finalPrice,
          formula: `${originalPrice} - ${discountAmount.toFixed(2)}`,
          explanation: `Final price: $${finalPrice.toFixed(2)}`
        }
      ])
      
      trackToolComplete()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Calculation failed'
      setErrors([errorMsg])
      trackToolError()
    }
  }

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages, percentage changes, increases, decreases, and discounts with detailed explanations"
      category="Calculators"
      categoryHref="/calculators"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Percentage Calculator</h1>
              <p className="text-muted-foreground">Professional percentage calculations with step-by-step solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm">• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Calculator Tabs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic %</TabsTrigger>
            <TabsTrigger value="change">% Change</TabsTrigger>
            <TabsTrigger value="increase">Increase/Decrease</TabsTrigger>
            <TabsTrigger value="discount">Discount</TabsTrigger>
          </TabsList>

          {/* Basic Percentage */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Percentage Calculation</CardTitle>
                <CardDescription>Find what percentage one number is of another</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="Enter value"
                      value={basicValue}
                      onChange={(e) => setBasicValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      type="number"
                      placeholder="Enter total"
                      value={basicTotal}
                      onChange={(e) => setBasicTotal(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={calculateBasic} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Percentage
                </Button>
                {basicResult && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{basicResult.type}</Badge>
                      <span className="text-2xl font-bold text-primary">{basicResult.result.toFixed(2)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Formula:</strong> {basicResult.formula}
                    </p>
                    <p className="text-sm">{basicResult.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Percentage Change */}
          <TabsContent value="change">
            <Card>
              <CardHeader>
                <CardTitle>Percentage Change Calculation</CardTitle>
                <CardDescription>Calculate the percentage increase or decrease between two values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="oldValue">Old Value</Label>
                    <Input
                      id="oldValue"
                      type="number"
                      placeholder="Enter old value"
                      value={changeOld}
                      onChange={(e) => setChangeOld(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newValue">New Value</Label>
                    <Input
                      id="newValue"
                      type="number"
                      placeholder="Enter new value"
                      value={changeNew}
                      onChange={(e) => setChangeNew(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={calculateChange} className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate Change
                </Button>
                {changeResult && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{changeResult.type}</Badge>
                      <span className="text-2xl font-bold text-primary">{changeResult.result.toFixed(2)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Formula:</strong> {changeResult.formula}
                    </p>
                    <p className="text-sm">{changeResult.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Increase/Decrease */}
          <TabsContent value="increase">
            <Card>
              <CardHeader>
                <CardTitle>Percentage Increase/Decrease</CardTitle>
                <CardDescription>Calculate the result of increasing or decreasing a value by a percentage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalValue">Original Value</Label>
                    <Input
                      id="originalValue"
                      type="number"
                      placeholder="Enter original value"
                      value={increaseValue}
                      onChange={(e) => setIncreaseValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      placeholder="Enter percentage"
                      value={increasePercent}
                      onChange={(e) => setIncreasePercent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={increaseOperation === 'increase' ? 'default' : 'outline'}
                    onClick={() => setIncreaseOperation('increase')}
                    className="flex-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Increase
                  </Button>
                  <Button
                    variant={increaseOperation === 'decrease' ? 'default' : 'outline'}
                    onClick={() => setIncreaseOperation('decrease')}
                    className="flex-1"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Decrease
                  </Button>
                </div>
                <Button onClick={calculateIncrease} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Result
                </Button>
                {increaseResult && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{increaseResult.type}</Badge>
                      <span className="text-2xl font-bold text-primary">{increaseResult.result.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Formula:</strong> {increaseResult.formula}
                    </p>
                    <p className="text-sm">{increaseResult.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discount Calculator */}
          <TabsContent value="discount">
            <Card>
              <CardHeader>
                <CardTitle>Discount Calculator</CardTitle>
                <CardDescription>Calculate discount amounts and final prices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      placeholder="Enter original price"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountPercent">Discount Percentage (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      placeholder="Enter discount %"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={calculateDiscount} className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Calculate Discount
                </Button>
                {discountResult.length > 0 && (
                  <div className="space-y-3">
                    {discountResult.map((result, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{result.type}</Badge>
                          <span className="text-2xl font-bold text-primary">${result.result.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Formula:</strong> {result.formula}
                        </p>
                        <p className="text-sm">{result.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Tips */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Percentage</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Find what percentage one number is of another. For example, "25 is what percent of 100?"
                </p>
                <p className="text-xs text-muted-foreground">Formula: (Value ÷ Total) × 100</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Percentage Change</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Calculate the percentage increase or decrease between two values.
                </p>
                <p className="text-xs text-muted-foreground">Formula: ((New - Old) ÷ Old) × 100</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Increase/Decrease</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Calculate the result of increasing or decreasing a value by a percentage.
                </p>
                <p className="text-xs text-muted-foreground">Formula: Original × (1 ± Percentage/100)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Discount Calculator</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Calculate discount amounts and final sale prices.
                </p>
                <p className="text-xs text-muted-foreground">Formula: Original × (Discount/100)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
