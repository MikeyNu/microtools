'use client'

import { useState } from 'react'
import { ArrowRightLeft, Copy, RotateCcw, Calculator, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface ConversionUnit {
  name: string
  symbol: string
  factor: number // Factor to convert to base unit
  offset?: number // For temperature conversions
}

interface ConversionCategory {
  name: string
  baseUnit: string
  units: ConversionUnit[]
}

interface ConversionResult {
  value: number
  fromUnit: string
  toUnit: string
  formula?: string
}

export default function UnitConverterPage() {
  const [inputValue, setInputValue] = useState('')
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('length')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([])
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Unit Converter', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units of measurement',
    category: 'math-tools',
    url: '/math-tools/unit-converter'
  }

  // Conversion categories and units
  const conversionCategories: { [key: string]: ConversionCategory } = {
    length: {
      name: 'Length',
      baseUnit: 'meter',
      units: [
        { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        { name: 'Meter', symbol: 'm', factor: 1 },
        { name: 'Kilometer', symbol: 'km', factor: 1000 },
        { name: 'Inch', symbol: 'in', factor: 0.0254 },
        { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        { name: 'Mile', symbol: 'mi', factor: 1609.344 },
        { name: 'Nautical Mile', symbol: 'nmi', factor: 1852 }
      ]
    },
    weight: {
      name: 'Weight/Mass',
      baseUnit: 'kilogram',
      units: [
        { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        { name: 'Gram', symbol: 'g', factor: 0.001 },
        { name: 'Kilogram', symbol: 'kg', factor: 1 },
        { name: 'Metric Ton', symbol: 't', factor: 1000 },
        { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
        { name: 'Pound', symbol: 'lb', factor: 0.453592 },
        { name: 'Stone', symbol: 'st', factor: 6.35029 },
        { name: 'US Ton', symbol: 'ton', factor: 907.185 }
      ]
    },
    temperature: {
      name: 'Temperature',
      baseUnit: 'celsius',
      units: [
        { name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
        { name: 'Fahrenheit', symbol: '°F', factor: 5/9, offset: -32 },
        { name: 'Kelvin', symbol: 'K', factor: 1, offset: -273.15 },
        { name: 'Rankine', symbol: '°R', factor: 5/9, offset: -459.67 }
      ]
    },
    area: {
      name: 'Area',
      baseUnit: 'square meter',
      units: [
        { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
        { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
        { name: 'Square Meter', symbol: 'm²', factor: 1 },
        { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
        { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
        { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
        { name: 'Square Yard', symbol: 'yd²', factor: 0.836127 },
        { name: 'Acre', symbol: 'ac', factor: 4046.86 },
        { name: 'Hectare', symbol: 'ha', factor: 10000 }
      ]
    },
    volume: {
      name: 'Volume',
      baseUnit: 'liter',
      units: [
        { name: 'Milliliter', symbol: 'ml', factor: 0.001 },
        { name: 'Liter', symbol: 'l', factor: 1 },
        { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
        { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735 },
        { name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
        { name: 'Pint (US)', symbol: 'pt', factor: 0.473176 },
        { name: 'Quart (US)', symbol: 'qt', factor: 0.946353 },
        { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
        { name: 'Gallon (UK)', symbol: 'gal (UK)', factor: 4.54609 }
      ]
    },
    speed: {
      name: 'Speed',
      baseUnit: 'meter per second',
      units: [
        { name: 'Meter per Second', symbol: 'm/s', factor: 1 },
        { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778 },
        { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704 },
        { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048 },
        { name: 'Knot', symbol: 'kn', factor: 0.514444 },
        { name: 'Mach', symbol: 'Ma', factor: 343 }
      ]
    },
    energy: {
      name: 'Energy',
      baseUnit: 'joule',
      units: [
        { name: 'Joule', symbol: 'J', factor: 1 },
        { name: 'Kilojoule', symbol: 'kJ', factor: 1000 },
        { name: 'Calorie', symbol: 'cal', factor: 4.184 },
        { name: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
        { name: 'Watt Hour', symbol: 'Wh', factor: 3600 },
        { name: 'Kilowatt Hour', symbol: 'kWh', factor: 3600000 },
        { name: 'BTU', symbol: 'BTU', factor: 1055.06 }
      ]
    },
    pressure: {
      name: 'Pressure',
      baseUnit: 'pascal',
      units: [
        { name: 'Pascal', symbol: 'Pa', factor: 1 },
        { name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
        { name: 'Bar', symbol: 'bar', factor: 100000 },
        { name: 'Atmosphere', symbol: 'atm', factor: 101325 },
        { name: 'PSI', symbol: 'psi', factor: 6894.76 },
        { name: 'Torr', symbol: 'Torr', factor: 133.322 },
        { name: 'mmHg', symbol: 'mmHg', factor: 133.322 }
      ]
    }
  }

  // Convert between units
  const convertUnits = (value: number, fromUnit: ConversionUnit, toUnit: ConversionUnit, category: ConversionCategory): number => {
    if (category.name === 'Temperature') {
      // Special handling for temperature conversions
      if (fromUnit.symbol === '°C' && toUnit.symbol === '°F') {
        return (value * 9/5) + 32
      } else if (fromUnit.symbol === '°F' && toUnit.symbol === '°C') {
        return (value - 32) * 5/9
      } else if (fromUnit.symbol === '°C' && toUnit.symbol === 'K') {
        return value + 273.15
      } else if (fromUnit.symbol === 'K' && toUnit.symbol === '°C') {
        return value - 273.15
      } else if (fromUnit.symbol === '°F' && toUnit.symbol === 'K') {
        return ((value - 32) * 5/9) + 273.15
      } else if (fromUnit.symbol === 'K' && toUnit.symbol === '°F') {
        return ((value - 273.15) * 9/5) + 32
      } else if (fromUnit.symbol === '°F' && toUnit.symbol === '°R') {
        return value + 459.67
      } else if (fromUnit.symbol === '°R' && toUnit.symbol === '°F') {
        return value - 459.67
      } else if (fromUnit.symbol === '°C' && toUnit.symbol === '°R') {
        return (value * 9/5) + 491.67
      } else if (fromUnit.symbol === '°R' && toUnit.symbol === '°C') {
        return (value - 491.67) * 5/9
      } else if (fromUnit.symbol === 'K' && toUnit.symbol === '°R') {
        return value * 9/5
      } else if (fromUnit.symbol === '°R' && toUnit.symbol === 'K') {
        return value * 5/9
      }
      return value // Same unit
    } else {
      // Standard conversion: convert to base unit, then to target unit
      const baseValue = value * fromUnit.factor
      return baseValue / toUnit.factor
    }
  }

  // Get conversion formula
  const getConversionFormula = (fromUnit: ConversionUnit, toUnit: ConversionUnit, category: ConversionCategory): string => {
    if (category.name === 'Temperature') {
      if (fromUnit.symbol === '°C' && toUnit.symbol === '°F') {
        return '(°C × 9/5) + 32'
      } else if (fromUnit.symbol === '°F' && toUnit.symbol === '°C') {
        return '(°F - 32) × 5/9'
      } else if (fromUnit.symbol === '°C' && toUnit.symbol === 'K') {
        return '°C + 273.15'
      } else if (fromUnit.symbol === 'K' && toUnit.symbol === '°C') {
        return 'K - 273.15'
      }
    }
    
    const ratio = fromUnit.factor / toUnit.factor
    if (ratio === 1) {
      return '1:1 (same unit)'
    } else if (ratio > 1) {
      return `× ${ratio.toExponential(3)}`
    } else {
      return `÷ ${(1/ratio).toExponential(3)}`
    }
  }

  // Perform conversion
  const performConversion = () => {
    const value = parseFloat(inputValue)
    
    if (isNaN(value)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number',
        variant: 'destructive'
      })
      return
    }
    
    if (!fromUnit || !toUnit) {
      toast({
        title: 'Error',
        description: 'Please select both from and to units',
        variant: 'destructive'
      })
      return
    }
    
    trackToolStart()
    
    try {
      const category = conversionCategories[selectedCategory]
      const fromUnitObj = category.units.find(u => u.symbol === fromUnit)
      const toUnitObj = category.units.find(u => u.symbol === toUnit)
      
      if (!fromUnitObj || !toUnitObj) {
        throw new Error('Invalid units selected')
      }
      
      const convertedValue = convertUnits(value, fromUnitObj, toUnitObj, category)
      const formula = getConversionFormula(fromUnitObj, toUnitObj, category)
      
      const conversionResult: ConversionResult = {
        value: convertedValue,
        fromUnit: fromUnitObj.name,
        toUnit: toUnitObj.name,
        formula
      }
      
      setResult(conversionResult)
      setConversionHistory(prev => [conversionResult, ...prev.slice(0, 9)]) // Keep last 10
      
      trackToolComplete()
      
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to perform conversion',
        variant: 'destructive'
      })
    }
  }

  // Swap units
  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
    
    if (result) {
      setInputValue(result.value.toString())
    }
  }

  // Copy result
  const copyResult = () => {
    if (!result) return
    
    const text = `${inputValue} ${fromUnit} = ${result.value} ${toUnit}`
    navigator.clipboard.writeText(text)
    
    toast({
      title: 'Copied!',
      description: 'Conversion result copied to clipboard'
    })
  }

  // Clear all
  const clearAll = () => {
    setInputValue('')
    setFromUnit('')
    setToUnit('')
    setResult(null)
  }

  // Load common conversions
  const loadCommonConversion = (category: string, from: string, to: string, value: string) => {
    setSelectedCategory(category)
    setFromUnit(from)
    setToUnit(to)
    setInputValue(value)
  }

  // Get current category
  const currentCategory = conversionCategories[selectedCategory]

  const relatedTools = [
    { name: 'Scientific Calculator', href: '/math-tools/scientific-calculator' },
    { name: 'Equation Solver', href: '/math-tools/equation-solver' },
    { name: 'Matrix Calculator', href: '/math-tools/matrix-calculator' },
    { name: 'Statistics Calculator', href: '/math-tools/statistics-calculator' }
  ]

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between different units of measurement with precision and ease."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Ruler className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Unit Converter</h1>
              <p className="text-muted-foreground">Convert between different units of measurement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Converter */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Unit Converter</CardTitle>
                <CardDescription>
                  Select a category and units to convert between different measurements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conversionCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversion Input */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter value"
                      onKeyDown={(e) => e.key === 'Enter' && performConversion()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromUnit">From</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategory.units.map(unit => (
                          <SelectItem key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={swapUnits}>
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toUnit">To</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategory.units.map(unit => (
                          <SelectItem key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Convert Button */}
                <div className="flex gap-2">
                  <Button onClick={performConversion} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Convert
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {/* Result */}
                {result && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">
                          {inputValue} {fromUnit} = {result.value.toLocaleString()} {toUnit}
                        </div>
                        {result.formula && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Formula: {result.formula}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={copyResult}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Conversions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCommonConversion('length', 'ft', 'm', '1')}
                  className="w-full justify-start text-left"
                >
                  1 foot to meters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCommonConversion('weight', 'lb', 'kg', '1')}
                  className="w-full justify-start text-left"
                >
                  1 pound to kilograms
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCommonConversion('temperature', '°F', '°C', '32')}
                  className="w-full justify-start text-left"
                >
                  32°F to Celsius
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCommonConversion('speed', 'mph', 'km/h', '60')}
                  className="w-full justify-start text-left"
                >
                  60 mph to km/h
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCommonConversion('volume', 'gal', 'l', '1')}
                  className="w-full justify-start text-left"
                >
                  1 gallon to liters
                </Button>
              </CardContent>
            </Card>

            {/* Conversion History */}
            {conversionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conversionHistory.slice(0, 5).map((conversion, index) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <div className="font-mono">
                        {conversion.value.toLocaleString()} {conversion.toUnit}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        from {conversion.fromUnit}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle>Available Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="font-semibold">{currentCategory.name}</div>
                  <div className="text-muted-foreground">
                    Base unit: {currentCategory.baseUnit}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {currentCategory.units.length} units available
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  {Object.entries(conversionCategories).map(([key, category]) => (
                    <Badge
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'secondary'}
                      className="justify-start cursor-pointer"
                      onClick={() => setSelectedCategory(key)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}