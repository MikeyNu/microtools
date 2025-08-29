'use client'

import { useState, useEffect } from 'react'
import { Calculator, Delete, RotateCcw, Copy, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface CalculationHistory {
  expression: string
  result: string
  timestamp: Date
}

export default function ScientificCalculatorPage() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg')
  const [precision, setPrecision] = useState(10)
  const [showHistory, setShowHistory] = useState(false)
  const [memory, setMemory] = useState(0)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Scientific Calculator', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    description: 'Advanced calculator with trigonometric, logarithmic, and exponential functions',
    category: 'math-tools',
    url: '/math-tools/scientific-calculator'
  }

  // Mathematical constants
  const constants = {
    pi: Math.PI,
    e: Math.E,
    phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
    sqrt2: Math.sqrt(2),
    ln2: Math.LN2,
    ln10: Math.LN10
  }

  // Convert angle based on mode
  const convertAngle = (angle: number): number => {
    return angleMode === 'deg' ? (angle * Math.PI) / 180 : angle
  }

  // Convert result angle back to display mode
  const convertAngleBack = (angle: number): number => {
    return angleMode === 'deg' ? (angle * 180) / Math.PI : angle
  }

  // Safe evaluation function
  const safeEval = (expr: string): number => {
    try {
      // Replace mathematical functions and constants
      let processedExpr = expr
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/sinh\(/g, 'Math.sinh(')
        .replace(/cosh\(/g, 'Math.cosh(')
        .replace(/tanh\(/g, 'Math.tanh(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/\^/g, '**')
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![0-9])/g, Math.E.toString())
        .replace(/φ/g, constants.phi.toString())

      // Handle trigonometric functions with angle conversion
      if (angleMode === 'deg') {
        processedExpr = processedExpr
          .replace(/Math\.sin\(([^)]+)\)/g, (match, angle) => `Math.sin(${angle} * Math.PI / 180)`)
          .replace(/Math\.cos\(([^)]+)\)/g, (match, angle) => `Math.cos(${angle} * Math.PI / 180)`)
          .replace(/Math\.tan\(([^)]+)\)/g, (match, angle) => `Math.tan(${angle} * Math.PI / 180)`)
      }

      const result = Function(`"use strict"; return (${processedExpr})`)() as number
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result')
      }
      
      return result
    } catch (error) {
      throw new Error('Invalid expression')
    }
  }

  // Handle button click
  const handleButtonClick = (value: string) => {
    trackToolStart()

    if (value === '='|| value === 'Enter') {
      calculate()
    } else if (value === 'C') {
      clear()
    } else if (value === 'CE') {
      clearEntry()
    } else if (value === '←') {
      backspace()
    } else if (value === 'M+') {
      setMemory(prev => prev + parseFloat(display) || 0)
      toast({ title: 'Memory', description: 'Value added to memory' })
    } else if (value === 'M-') {
      setMemory(prev => prev - parseFloat(display) || 0)
      toast({ title: 'Memory', description: 'Value subtracted from memory' })
    } else if (value === 'MR') {
      setDisplay(memory.toString())
      setExpression(memory.toString())
    } else if (value === 'MC') {
      setMemory(0)
      toast({ title: 'Memory', description: 'Memory cleared' })
    } else {
      appendToExpression(value)
    }
  }

  // Append value to expression
  const appendToExpression = (value: string) => {
    if (display === '0' && !isNaN(Number(value))) {
      setDisplay(value)
      setExpression(value)
    } else {
      const newExpression = expression + value
      setExpression(newExpression)
      setDisplay(newExpression)
    }
  }

  // Calculate result
  const calculate = () => {
    if (!expression.trim()) return

    try {
      const result = safeEval(expression)
      const formattedResult = Number(result.toPrecision(precision)).toString()
      
      // Add to history
      const newHistoryItem: CalculationHistory = {
        expression,
        result: formattedResult,
        timestamp: new Date()
      }
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]) // Keep last 50 items
      
      setDisplay(formattedResult)
      setExpression(formattedResult)
      
      trackToolComplete()
      
    } catch (error) {
      setDisplay('Error')
      trackToolError()
      toast({
        title: 'Error',
        description: 'Invalid expression',
        variant: 'destructive'
      })
    }
  }

  // Clear all
  const clear = () => {
    setDisplay('0')
    setExpression('')
  }

  // Clear entry
  const clearEntry = () => {
    setDisplay('0')
  }

  // Backspace
  const backspace = () => {
    if (expression.length > 1) {
      const newExpression = expression.slice(0, -1)
      setExpression(newExpression)
      setDisplay(newExpression)
    } else {
      clear()
    }
  }

  // Copy result to clipboard
  const copyResult = () => {
    navigator.clipboard.writeText(display)
    toast({
      title: 'Copied!',
      description: 'Result copied to clipboard'
    })
  }

  // Load from history
  const loadFromHistory = (item: CalculationHistory) => {
    setExpression(item.expression)
    setDisplay(item.expression)
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    toast({
      title: 'History cleared',
      description: 'Calculation history has been cleared'
    })
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key
      
      if (key >= '0' && key <= '9') {
        handleButtonClick(key)
      } else if (['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
        handleButtonClick(key)
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault()
        handleButtonClick('=')
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleButtonClick('C')
      } else if (key === 'Backspace') {
        event.preventDefault()
        handleButtonClick('←')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [expression])

  const relatedTools = [
    { name: 'Equation Solver', href: '/math-tools/equation-solver' },
    { name: 'Matrix Calculator', href: '/math-tools/matrix-calculator' },
    { name: 'Statistics Calculator', href: '/math-tools/statistics-calculator' },
    { name: 'Unit Converter', href: '/math-tools/unit-converter' }
  ]

  return (
    <ToolLayout
      title="Scientific Calculator"
      description="Advanced calculator with trigonometric, logarithmic, exponential functions, and scientific notation support."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Scientific Calculator</h1>
              <p className="text-muted-foreground">Advanced mathematical calculations with scientific functions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calculator</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={angleMode === 'deg' ? 'default' : 'secondary'}>
                      {angleMode.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display */}
                <div className="space-y-2">
                  <div className="text-right text-sm text-muted-foreground font-mono min-h-[20px]">
                    {expression || ' '}
                  </div>
                  <div className="relative">
                    <Input
                      value={display}
                      readOnly
                      className="text-right text-2xl font-mono h-16 pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyResult}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Memory and Settings */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="font-mono">{memory}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="angle-mode">Angle:</Label>
                      <Select value={angleMode} onValueChange={(value: 'deg' | 'rad') => setAngleMode(value)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deg">DEG</SelectItem>
                          <SelectItem value="rad">RAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-8 gap-2">
                  {/* Row 1 - Memory and Clear */}
                  <Button variant="outline" onClick={() => handleButtonClick('MC')} className="text-xs">MC</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('MR')} className="text-xs">MR</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('M+')} className="text-xs">M+</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('M-')} className="text-xs">M-</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('C')} className="text-red-600">C</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('CE')} className="text-red-600">CE</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('←')}><Delete className="h-4 w-4" /></Button>
                  <Button variant="outline" onClick={() => handleButtonClick('/')} className="text-blue-600">÷</Button>

                  {/* Row 2 - Scientific Functions */}
                  <Button variant="outline" onClick={() => handleButtonClick('sin(')} className="text-xs">sin</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('cos(')} className="text-xs">cos</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('tan(')} className="text-xs">tan</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('log(')} className="text-xs">log</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('7')}>7</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('8')}>8</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('9')}>9</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('*')} className="text-blue-600">×</Button>

                  {/* Row 3 - Inverse Functions */}
                  <Button variant="outline" onClick={() => handleButtonClick('asin(')} className="text-xs">asin</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('acos(')} className="text-xs">acos</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('atan(')} className="text-xs">atan</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('ln(')} className="text-xs">ln</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('4')}>4</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('5')}>5</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('6')}>6</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('-')} className="text-blue-600">−</Button>

                  {/* Row 4 - Powers and Roots */}
                  <Button variant="outline" onClick={() => handleButtonClick('sqrt(')} className="text-xs">√</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('^2')} className="text-xs">x²</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('^')} className="text-xs">x^y</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('exp(')} className="text-xs">exp</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('1')}>1</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('2')}>2</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('3')}>3</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('+')} className="text-blue-600">+</Button>

                  {/* Row 5 - Constants and Parentheses */}
                  <Button variant="outline" onClick={() => handleButtonClick('π')} className="text-xs">π</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('e')} className="text-xs">e</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('(')} className="text-xs">(</Button>
                  <Button variant="outline" onClick={() => handleButtonClick(')')} className="text-xs">)</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('0')} className="col-span-2">0</Button>
                  <Button variant="outline" onClick={() => handleButtonClick('.')}>.</Button>
                  <Button variant="default" onClick={() => handleButtonClick('=')} className="bg-blue-600 hover:bg-blue-700">=</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History and Settings */}
          <div className="space-y-4">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="precision">Precision</Label>
                  <Select value={precision.toString()} onValueChange={(value) => setPrecision(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 digits</SelectItem>
                      <SelectItem value="10">10 digits</SelectItem>
                      <SelectItem value="15">15 digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Constants */}
            <Card>
              <CardHeader>
                <CardTitle>Constants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Button variant="ghost" size="sm" onClick={() => handleButtonClick('π')} className="justify-start">
                    π = {Math.PI.toFixed(4)}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleButtonClick('e')} className="justify-start">
                    e = {Math.E.toFixed(4)}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleButtonClick('φ')} className="justify-start">
                    φ = {constants.phi.toFixed(4)}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleButtonClick('√2')} className="justify-start">
                    √2 = {constants.sqrt2.toFixed(4)}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {showHistory && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>History</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No calculations yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="p-2 rounded border cursor-pointer hover:bg-gray-50"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.expression}
                          </div>
                          <div className="text-sm font-mono">
                            = {item.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}