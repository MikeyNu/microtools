'use client'

import { useState } from 'react'
import { Calculator, Copy, RotateCcw, Download, Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface Solution {
  variable: string
  value: number | string
  type: 'real' | 'complex' | 'no_solution' | 'infinite'
}

interface EquationResult {
  solutions: Solution[]
  steps: string[]
  type: 'linear' | 'quadratic' | 'cubic' | 'system' | 'polynomial'
  discriminant?: number
}

export default function EquationSolverPage() {
  const [equation, setEquation] = useState('')
  const [equationType, setEquationType] = useState<'single' | 'system'>('single')
  const [systemEquations, setSystemEquations] = useState(['', ''])
  const [result, setResult] = useState<EquationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [variables, setVariables] = useState(['x', 'y'])
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Equation Solver', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'equation-solver',
    name: 'Equation Solver',
    description: 'Solve linear, quadratic, cubic equations and systems of equations',
    category: 'math-tools',
    url: '/math-tools/equation-solver'
  }

  // Parse and solve quadratic equation ax² + bx + c = 0
  const solveQuadratic = (a: number, b: number, c: number): EquationResult => {
    const steps = [
      `Given equation: ${a}x² + ${b}x + ${c} = 0`,
      `Using quadratic formula: x = (-b ± √(b² - 4ac)) / 2a`
    ]
    
    const discriminant = b * b - 4 * a * c
    steps.push(`Discriminant: Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`)
    
    const solutions: Solution[] = []
    
    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
      solutions.push(
        { variable: 'x₁', value: Number(x1.toFixed(6)), type: 'real' },
        { variable: 'x₂', value: Number(x2.toFixed(6)), type: 'real' }
      )
      steps.push(`Two real solutions: x₁ = ${x1.toFixed(6)}, x₂ = ${x2.toFixed(6)}`)
    } else if (discriminant === 0) {
      const x = -b / (2 * a)
      solutions.push({ variable: 'x', value: Number(x.toFixed(6)), type: 'real' })
      steps.push(`One real solution: x = ${x.toFixed(6)}`)
    } else {
      const realPart = -b / (2 * a)
      const imagPart = Math.sqrt(-discriminant) / (2 * a)
      solutions.push(
        { variable: 'x₁', value: `${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i`, type: 'complex' },
        { variable: 'x₂', value: `${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`, type: 'complex' }
      )
      steps.push(`Two complex solutions: x₁ = ${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i, x₂ = ${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`)
    }
    
    return { solutions, steps, type: 'quadratic', discriminant }
  }

  // Parse and solve linear equation ax + b = 0
  const solveLinear = (a: number, b: number): EquationResult => {
    const steps = [`Given equation: ${a}x + ${b} = 0`]
    const solutions: Solution[] = []
    
    if (a === 0) {
      if (b === 0) {
        solutions.push({ variable: 'x', value: 'Any real number', type: 'infinite' })
        steps.push('0 = 0: Infinite solutions (any real number)')
      } else {
        solutions.push({ variable: 'x', value: 'No solution', type: 'no_solution' })
        steps.push(`${b} = 0: No solution (contradiction)`)
      }
    } else {
      const x = -b / a
      solutions.push({ variable: 'x', value: Number(x.toFixed(6)), type: 'real' })
      steps.push(`x = -${b}/${a} = ${x.toFixed(6)}`)
    }
    
    return { solutions, steps, type: 'linear' }
  }

  // Solve 2x2 system of linear equations
  const solveSystem2x2 = (eq1: string, eq2: string): EquationResult => {
    const steps = [`System of equations:`, `${eq1}`, `${eq2}`]
    
    try {
      // Parse equations (simplified parser for demo)
      const parseEquation = (eq: string) => {
        // Remove spaces and convert to standard form
        const cleaned = eq.replace(/\s/g, '').replace(/=/g, '-(') + ')'
        
        // Extract coefficients (simplified)
        const xMatch = cleaned.match(/([+-]?\d*)x/)
        const yMatch = cleaned.match(/([+-]?\d*)y/)
        const constMatch = cleaned.match(/([+-]?\d+)(?![xy])/)
        
        const a = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseInt(xMatch[1])) : 0
        const b = yMatch ? (yMatch[1] === '' || yMatch[1] === '+' ? 1 : yMatch[1] === '-' ? -1 : parseInt(yMatch[1])) : 0
        const c = constMatch ? -parseInt(constMatch[1]) : 0
        
        return { a, b, c }
      }
      
      const eq1Parsed = parseEquation(eq1)
      const eq2Parsed = parseEquation(eq2)
      
      const { a: a1, b: b1, c: c1 } = eq1Parsed
      const { a: a2, b: b2, c: c2 } = eq2Parsed
      
      steps.push(`Equation 1: ${a1}x + ${b1}y = ${c1}`)
      steps.push(`Equation 2: ${a2}x + ${b2}y = ${c2}`)
      
      // Calculate determinant
      const det = a1 * b2 - a2 * b1
      steps.push(`Determinant: ${a1} × ${b2} - ${a2} × ${b1} = ${det}`)
      
      const solutions: Solution[] = []
      
      if (det === 0) {
        // Check if system is inconsistent or has infinite solutions
        if (a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) {
          solutions.push(
            { variable: 'x', value: 'Infinite solutions', type: 'infinite' },
            { variable: 'y', value: 'Infinite solutions', type: 'infinite' }
          )
          steps.push('System has infinite solutions (dependent equations)')
        } else {
          solutions.push(
            { variable: 'x', value: 'No solution', type: 'no_solution' },
            { variable: 'y', value: 'No solution', type: 'no_solution' }
          )
          steps.push('System has no solution (inconsistent)')
        }
      } else {
        // Unique solution using Cramer's rule
        const x = (c1 * b2 - c2 * b1) / det
        const y = (a1 * c2 - a2 * c1) / det
        
        solutions.push(
          { variable: 'x', value: Number(x.toFixed(6)), type: 'real' },
          { variable: 'y', value: Number(y.toFixed(6)), type: 'real' }
        )
        
        steps.push(`Using Cramer's rule:`)
        steps.push(`x = (${c1} × ${b2} - ${c2} × ${b1}) / ${det} = ${x.toFixed(6)}`)
        steps.push(`y = (${a1} × ${c2} - ${a2} × ${c1}) / ${det} = ${y.toFixed(6)}`)
      }
      
      return { solutions, steps, type: 'system' }
      
    } catch (error) {
      throw new Error('Failed to parse system of equations')
    }
  }

  // Parse equation and determine type
  const parseEquation = (eq: string): EquationResult => {
    // Remove spaces and normalize
    const normalized = eq.replace(/\s/g, '').toLowerCase()
    
    // Check for quadratic (contains x²)
    if (normalized.includes('x²') || normalized.includes('x^2')) {
      // Extract coefficients for ax² + bx + c = 0
      const parts = normalized.split('=')
      if (parts.length !== 2) throw new Error('Invalid equation format')
      
      // Simplified coefficient extraction
      const left = parts[0]
      const right = parts[1]
      
      // Move everything to left side
      const expression = left + '-(' + right + ')'
      
      // Extract coefficients (simplified)
      const x2Match = expression.match(/([+-]?\d*)x[²^]?2?/)
      const xMatch = expression.match(/([+-]?\d*)x(?![²^])/)
      const constMatch = expression.match(/([+-]?\d+)(?![x²^])/g)
      
      const a = x2Match ? (x2Match[1] === '' || x2Match[1] === '+' ? 1 : x2Match[1] === '-' ? -1 : parseInt(x2Match[1])) : 0
      const b = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseInt(xMatch[1])) : 0
      const c = constMatch ? constMatch.reduce((sum, match) => sum + parseInt(match), 0) : 0
      
      if (a === 0) {
        return solveLinear(b, c)
      } else {
        return solveQuadratic(a, b, c)
      }
    } else {
      // Linear equation ax + b = 0
      const parts = normalized.split('=')
      if (parts.length !== 2) throw new Error('Invalid equation format')
      
      const left = parts[0]
      const right = parts[1]
      const expression = left + '-(' + right + ')'
      
      const xMatch = expression.match(/([+-]?\d*)x/)
      const constMatch = expression.match(/([+-]?\d+)(?!x)/g)
      
      const a = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseInt(xMatch[1])) : 0
      const b = constMatch ? constMatch.reduce((sum, match) => sum + parseInt(match), 0) : 0
      
      return solveLinear(a, b)
    }
  }

  // Solve equation
  const solveEquation = async () => {
    if (equationType === 'single' && !equation.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an equation',
        variant: 'destructive'
      })
      return
    }
    
    if (equationType === 'system' && systemEquations.some(eq => !eq.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter all equations in the system',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    trackToolStart()

    try {
      let result: EquationResult
      
      if (equationType === 'single') {
        result = parseEquation(equation)
      } else {
        result = solveSystem2x2(systemEquations[0], systemEquations[1])
      }
      
      setResult(result)
      trackToolComplete()
      
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to solve equation',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy result to clipboard
  const copyResult = () => {
    if (!result) return
    
    const text = result.solutions.map(sol => `${sol.variable} = ${sol.value}`).join('\n')
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Solutions copied to clipboard'
    })
  }

  // Download result as text file
  const downloadResult = () => {
    if (!result) return
    
    const content = [
      'Equation Solution',
      '================',
      '',
      'Steps:',
      ...result.steps.map(step => `• ${step}`),
      '',
      'Solutions:',
      ...result.solutions.map(sol => `${sol.variable} = ${sol.value} (${sol.type})`),
      '',
      `Generated on: ${new Date().toLocaleString()}`
    ].join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'equation-solution.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Clear all inputs
  const clearAll = () => {
    setEquation('')
    setSystemEquations(['', ''])
    setResult(null)
  }

  // Add equation to system
  const addEquation = () => {
    if (systemEquations.length < 5) {
      setSystemEquations([...systemEquations, ''])
    }
  }

  // Remove equation from system
  const removeEquation = (index: number) => {
    if (systemEquations.length > 2) {
      setSystemEquations(systemEquations.filter((_, i) => i !== index))
    }
  }

  // Update system equation
  const updateSystemEquation = (index: number, value: string) => {
    const newEquations = [...systemEquations]
    newEquations[index] = value
    setSystemEquations(newEquations)
  }

  // Load example equations
  const loadExample = (type: string) => {
    if (type === 'linear') {
      setEquation('2x + 5 = 11')
      setEquationType('single')
    } else if (type === 'quadratic') {
      setEquation('x² - 5x + 6 = 0')
      setEquationType('single')
    } else if (type === 'system') {
      setSystemEquations(['2x + 3y = 7', 'x - y = 1'])
      setEquationType('system')
    }
  }

  const relatedTools = [
    { name: 'Scientific Calculator', href: '/math-tools/scientific-calculator' },
    { name: 'Matrix Calculator', href: '/math-tools/matrix-calculator' },
    { name: 'Statistics Calculator', href: '/math-tools/statistics-calculator' },
    { name: 'Graphing Calculator', href: '/math-tools/graphing-calculator' }
  ]

  return (
    <ToolLayout
      title="Equation Solver"
      description="Solve linear, quadratic, cubic equations and systems of equations with step-by-step solutions."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Equation Solver</h1>
              <p className="text-muted-foreground">Solve equations with detailed step-by-step solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Equation Input</CardTitle>
                <CardDescription>
                  Enter your equation(s) to solve. Supports linear, quadratic, and systems of equations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={equationType} onValueChange={(value) => setEquationType(value as 'single' | 'system')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Equation</TabsTrigger>
                    <TabsTrigger value="system">System of Equations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="equation">Equation</Label>
                      <Input
                        id="equation"
                        value={equation}
                        onChange={(e) => setEquation(e.target.value)}
                        placeholder="e.g., x² - 5x + 6 = 0 or 2x + 3 = 7"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadExample('linear')}>
                        Linear Example
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => loadExample('quadratic')}>
                        Quadratic Example
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="system" className="space-y-4">
                    <div className="space-y-3">
                      {systemEquations.map((eq, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Label className="w-16">Eq {index + 1}:</Label>
                          <Input
                            value={eq}
                            onChange={(e) => updateSystemEquation(index, e.target.value)}
                            placeholder={`e.g., ${index === 0 ? '2x + 3y = 7' : 'x - y = 1'}`}
                            className="font-mono flex-1"
                          />
                          {systemEquations.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEquation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      {systemEquations.length < 5 && (
                        <Button variant="outline" size="sm" onClick={addEquation}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Equation
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => loadExample('system')}>
                        System Example
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2">
                  <Button onClick={solveEquation} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Solving...' : 'Solve Equation'}
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples and Tips */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Linear:</strong>
                  <div className="font-mono text-xs mt-1 space-y-1">
                    <div>2x + 3 = 7</div>
                    <div>5x - 2 = 3x + 4</div>
                  </div>
                </div>
                <div>
                  <strong>Quadratic:</strong>
                  <div className="font-mono text-xs mt-1 space-y-1">
                    <div>x² - 5x + 6 = 0</div>
                    <div>2x² + 3x - 1 = 0</div>
                  </div>
                </div>
                <div>
                  <strong>System:</strong>
                  <div className="font-mono text-xs mt-1 space-y-1">
                    <div>2x + 3y = 7</div>
                    <div>x - y = 1</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Use x² or x^2 for squared terms</div>
                <div>• Separate terms with + or -</div>
                <div>• Use parentheses for grouping</div>
                <div>• Variables: x, y for systems</div>
                <div>• Decimals are supported</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Solution</CardTitle>
                  <CardDescription>
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)} equation solution
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Solutions */}
              <div>
                <h3 className="font-semibold mb-3">Solutions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.solutions.map((solution, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-mono text-lg">
                        {solution.variable} = {solution.value}
                      </div>
                      <Badge variant={solution.type === 'real' ? 'default' : solution.type === 'complex' ? 'secondary' : 'destructive'} className="mt-1">
                        {solution.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discriminant for quadratic */}
              {result.discriminant !== undefined && (
                <div>
                  <h3 className="font-semibold mb-2">Discriminant:</h3>
                  <div className="p-3 border rounded-lg">
                    <div className="font-mono">Δ = {result.discriminant}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.discriminant > 0 ? 'Two real solutions' :
                       result.discriminant === 0 ? 'One real solution' :
                       'Two complex solutions'}
                    </div>
                  </div>
                </div>
              )}

              {/* Steps */}
              <div>
                <h3 className="font-semibold mb-3">Step-by-step solution:</h3>
                <div className="space-y-2">
                  {result.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded border-l-2 border-blue-200">
                      <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                      <div className="font-mono text-sm">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}