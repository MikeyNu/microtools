'use client'

import { useState, useRef, useEffect } from 'react'
import { LineChart, Copy, RotateCcw, Download, Upload, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface GraphFunction {
  id: string
  expression: string
  color: string
  visible: boolean
  domain?: { min: number; max: number }
}

interface GraphSettings {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  gridSize: number
  showGrid: boolean
  showAxes: boolean
  showLabels: boolean
}

interface Point {
  x: number
  y: number
}

export default function GraphingCalculatorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [functions, setFunctions] = useState<GraphFunction[]>([
    { id: '1', expression: 'x^2', color: '#3b82f6', visible: true },
    { id: '2', expression: 'sin(x)', color: '#ef4444', visible: false },
    { id: '3', expression: 'cos(x)', color: '#10b981', visible: false }
  ])
  const [settings, setSettings] = useState<GraphSettings>({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    gridSize: 1,
    showGrid: true,
    showAxes: true,
    showLabels: true
  })
  const [newExpression, setNewExpression] = useState('')
  const [selectedColor, setSelectedColor] = useState('#8b5cf6')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Graphing Calculator', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'graphing-calculator',
    name: 'Graphing Calculator',
    description: 'Plot mathematical functions and analyze their graphs',
    category: 'math-tools',
    url: '/math-tools/graphing-calculator'
  }

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  // Safe math expression evaluator
  const evaluateExpression = (expr: string, x: number): number => {
    try {
      // Replace mathematical functions and constants
      let expression = expr
        .replace(/\bx\b/g, x.toString())
        .replace(/\bpi\b|π/g, Math.PI.toString())
        .replace(/\be\b/g, Math.E.toString())
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
        .replace(/\^/g, '**')
      
      // Validate expression contains only allowed characters
      if (!/^[0-9+\-*/.()\s\w]+$/.test(expression)) {
        throw new Error('Invalid characters in expression')
      }
      
      const result = Function('"use strict"; return (' + expression + ')')() as number
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return NaN
      }
      
      return result
    } catch {
      return NaN
    }
  }

  // Generate points for a function
  const generatePoints = (func: GraphFunction, settings: GraphSettings): Point[] => {
    const points: Point[] = []
    const step = (settings.xMax - settings.xMin) / 1000
    
    for (let x = settings.xMin; x <= settings.xMax; x += step) {
      const y = evaluateExpression(func.expression, x)
      if (!isNaN(y) && isFinite(y)) {
        points.push({ x, y })
      }
    }
    
    return points
  }

  // Convert graph coordinates to canvas coordinates
  const graphToCanvas = (point: Point, canvas: HTMLCanvasElement, settings: GraphSettings) => {
    const { width, height } = canvas
    const xRange = settings.xMax - settings.xMin
    const yRange = settings.yMax - settings.yMin
    
    const canvasX = ((point.x - settings.xMin) / xRange) * width
    const canvasY = height - ((point.y - settings.yMin) / yRange) * height
    
    return { x: canvasX, y: canvasY }
  }

  // Convert canvas coordinates to graph coordinates
  const canvasToGraph = (canvasPoint: Point, canvas: HTMLCanvasElement, settings: GraphSettings) => {
    const { width, height } = canvas
    const xRange = settings.xMax - settings.xMin
    const yRange = settings.yMax - settings.yMin
    
    const graphX = settings.xMin + (canvasPoint.x / width) * xRange
    const graphY = settings.yMin + ((height - canvasPoint.y) / height) * yRange
    
    return { x: graphX, y: graphY }
  }

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: GraphSettings) => {
    if (!settings.showGrid) return
    
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    
    const xRange = settings.xMax - settings.xMin
    const yRange = settings.yMax - settings.yMin
    
    // Vertical grid lines
    for (let x = Math.ceil(settings.xMin / settings.gridSize) * settings.gridSize; x <= settings.xMax; x += settings.gridSize) {
      const canvasPos = graphToCanvas({ x, y: 0 }, canvas, settings)
      ctx.beginPath()
      ctx.moveTo(canvasPos.x, 0)
      ctx.lineTo(canvasPos.x, canvas.height)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let y = Math.ceil(settings.yMin / settings.gridSize) * settings.gridSize; y <= settings.yMax; y += settings.gridSize) {
      const canvasPos = graphToCanvas({ x: 0, y }, canvas, settings)
      ctx.beginPath()
      ctx.moveTo(0, canvasPos.y)
      ctx.lineTo(canvas.width, canvasPos.y)
      ctx.stroke()
    }
  }

  // Draw axes
  const drawAxes = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: GraphSettings) => {
    if (!settings.showAxes) return
    
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    
    // X-axis
    if (settings.yMin <= 0 && settings.yMax >= 0) {
      const yAxisPos = graphToCanvas({ x: 0, y: 0 }, canvas, settings)
      ctx.beginPath()
      ctx.moveTo(0, yAxisPos.y)
      ctx.lineTo(canvas.width, yAxisPos.y)
      ctx.stroke()
    }
    
    // Y-axis
    if (settings.xMin <= 0 && settings.xMax >= 0) {
      const xAxisPos = graphToCanvas({ x: 0, y: 0 }, canvas, settings)
      ctx.beginPath()
      ctx.moveTo(xAxisPos.x, 0)
      ctx.lineTo(xAxisPos.x, canvas.height)
      ctx.stroke()
    }
  }

  // Draw labels
  const drawLabels = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: GraphSettings) => {
    if (!settings.showLabels) return
    
    ctx.fillStyle = '#374151'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    
    // X-axis labels
    for (let x = Math.ceil(settings.xMin / settings.gridSize) * settings.gridSize; x <= settings.xMax; x += settings.gridSize) {
      if (x === 0) continue
      const canvasPos = graphToCanvas({ x, y: 0 }, canvas, settings)
      if (canvasPos.y >= 0 && canvasPos.y <= canvas.height) {
        ctx.fillText(x.toString(), canvasPos.x, Math.min(canvasPos.y + 15, canvas.height - 5))
      }
    }
    
    ctx.textAlign = 'left'
    // Y-axis labels
    for (let y = Math.ceil(settings.yMin / settings.gridSize) * settings.gridSize; y <= settings.yMax; y += settings.gridSize) {
      if (y === 0) continue
      const canvasPos = graphToCanvas({ x: 0, y }, canvas, settings)
      if (canvasPos.x >= 0 && canvasPos.x <= canvas.width) {
        ctx.fillText(y.toString(), Math.max(canvasPos.x + 5, 5), canvasPos.y - 5)
      }
    }
  }

  // Draw function
  const drawFunction = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, func: GraphFunction, settings: GraphSettings) => {
    if (!func.visible) return
    
    const points = generatePoints(func, settings)
    if (points.length === 0) return
    
    ctx.strokeStyle = func.color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    ctx.beginPath()
    let isFirstPoint = true
    
    for (const point of points) {
      const canvasPos = graphToCanvas(point, canvas, settings)
      
      if (canvasPos.x >= 0 && canvasPos.x <= canvas.width && 
          canvasPos.y >= 0 && canvasPos.y <= canvas.height) {
        if (isFirstPoint) {
          ctx.moveTo(canvasPos.x, canvasPos.y)
          isFirstPoint = false
        } else {
          ctx.lineTo(canvasPos.x, canvasPos.y)
        }
      } else {
        isFirstPoint = true
      }
    }
    
    ctx.stroke()
  }

  // Render the graph
  const renderGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply zoom and pan
    const adjustedSettings = {
      ...settings,
      xMin: (settings.xMin - pan.x) / zoom,
      xMax: (settings.xMax - pan.x) / zoom,
      yMin: (settings.yMin - pan.y) / zoom,
      yMax: (settings.yMax - pan.y) / zoom
    }
    
    // Draw components
    drawGrid(ctx, canvas, adjustedSettings)
    drawAxes(ctx, canvas, adjustedSettings)
    
    // Draw functions
    functions.forEach(func => {
      drawFunction(ctx, canvas, func, adjustedSettings)
    })
    
    drawLabels(ctx, canvas, adjustedSettings)
  }

  // Handle canvas mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const xRange = settings.xMax - settings.xMin
    const yRange = settings.yMax - settings.yMin
    
    const panDeltaX = -(deltaX / canvas.width) * xRange
    const panDeltaY = (deltaY / canvas.height) * yRange
    
    setPan(prev => ({
      x: prev.x + panDeltaX,
      y: prev.y + panDeltaY
    }))
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add new function
  const addFunction = () => {
    if (!newExpression.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a function expression',
        variant: 'destructive'
      })
      return
    }
    
    trackToolStart()
    
    try {
      // Test the expression
      evaluateExpression(newExpression, 0)
      
      const newFunc: GraphFunction = {
        id: Date.now().toString(),
        expression: newExpression,
        color: selectedColor,
        visible: true
      }
      
      setFunctions(prev => [...prev, newFunc])
      setNewExpression('')
      
      trackToolComplete()
      
      toast({
        title: 'Function Added',
        description: `Added function: ${newExpression}`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Invalid function expression',
        variant: 'destructive'
      })
    }
  }

  // Remove function
  const removeFunction = (id: string) => {
    setFunctions(prev => prev.filter(f => f.id !== id))
  }

  // Toggle function visibility
  const toggleFunction = (id: string) => {
    setFunctions(prev => prev.map(f => 
      f.id === id ? { ...f, visible: !f.visible } : f
    ))
  }

  // Update function expression
  const updateFunction = (id: string, expression: string) => {
    setFunctions(prev => prev.map(f => 
      f.id === id ? { ...f, expression } : f
    ))
  }

  // Zoom functions
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 10))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }

  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSettings({
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      gridSize: 1,
      showGrid: true,
      showAxes: true,
      showLabels: true
    })
  }

  // Load example functions
  const loadExamples = (type: string) => {
    let examples: GraphFunction[] = []
    
    if (type === 'polynomial') {
      examples = [
        { id: '1', expression: 'x^2', color: '#3b82f6', visible: true },
        { id: '2', expression: 'x^3 - 2*x', color: '#ef4444', visible: true },
        { id: '3', expression: '0.5*x^4 - x^2', color: '#10b981', visible: true }
      ]
    } else if (type === 'trigonometric') {
      examples = [
        { id: '1', expression: 'sin(x)', color: '#3b82f6', visible: true },
        { id: '2', expression: 'cos(x)', color: '#ef4444', visible: true },
        { id: '3', expression: 'tan(x)', color: '#10b981', visible: true }
      ]
    } else if (type === 'exponential') {
      examples = [
        { id: '1', expression: '2^x', color: '#3b82f6', visible: true },
        { id: '2', expression: 'e^x', color: '#ef4444', visible: true },
        { id: '3', expression: 'log(x)', color: '#10b981', visible: true }
      ]
    }
    
    setFunctions(examples)
  }

  // Download graph as image
  const downloadGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'graph.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  // Effect to render graph when dependencies change
  useEffect(() => {
    renderGraph()
  }, [functions, settings, zoom, pan])

  const relatedTools = [
    { name: 'Scientific Calculator', href: '/math-tools/scientific-calculator' },
    { name: 'Equation Solver', href: '/math-tools/equation-solver' },
    { name: 'Matrix Calculator', href: '/math-tools/matrix-calculator' },
    { name: 'Statistics Calculator', href: '/math-tools/statistics-calculator' }
  ]

  return (
    <ToolLayout
      title="Graphing Calculator"
      description="Plot mathematical functions and analyze their graphs with interactive controls."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Graphing Calculator</h1>
              <p className="text-muted-foreground">Interactive function plotting and analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Add Function */}
            <Card>
              <CardHeader>
                <CardTitle>Add Function</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expression">Expression</Label>
                  <Input
                    id="expression"
                    value={newExpression}
                    onChange={(e) => setNewExpression(e.target.value)}
                    placeholder="e.g., x^2, sin(x), 2*x + 1"
                    onKeyDown={(e) => e.key === 'Enter' && addFunction()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 ${
                          selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
                
                <Button onClick={addFunction} className="w-full">
                  Add Function
                </Button>
              </CardContent>
            </Card>

            {/* Functions List */}
            <Card>
              <CardHeader>
                <CardTitle>Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {functions.map(func => (
                  <div key={func.id} className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox
                      checked={func.visible}
                      onCheckedChange={() => toggleFunction(func.id)}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <Input
                      value={func.expression}
                      onChange={(e) => updateFunction(func.id, e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFunction(func.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                {functions.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No functions added
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExamples('polynomial')}
                  className="w-full"
                >
                  Polynomial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExamples('trigonometric')}
                  className="w-full"
                >
                  Trigonometric
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExamples('exponential')}
                  className="w-full"
                >
                  Exponential
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Graph */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Graph</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetView}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadGraph}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Graph Canvas */}
                  <div className="border rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="w-full h-auto cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                  
                  {/* Graph Settings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="xMin">X Min</Label>
                      <Input
                        id="xMin"
                        type="number"
                        value={settings.xMin}
                        onChange={(e) => setSettings(prev => ({ ...prev, xMin: parseFloat(e.target.value) || -10 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xMax">X Max</Label>
                      <Input
                        id="xMax"
                        type="number"
                        value={settings.xMax}
                        onChange={(e) => setSettings(prev => ({ ...prev, xMax: parseFloat(e.target.value) || 10 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yMin">Y Min</Label>
                      <Input
                        id="yMin"
                        type="number"
                        value={settings.yMin}
                        onChange={(e) => setSettings(prev => ({ ...prev, yMin: parseFloat(e.target.value) || -10 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yMax">Y Max</Label>
                      <Input
                        id="yMax"
                        type="number"
                        value={settings.yMax}
                        onChange={(e) => setSettings(prev => ({ ...prev, yMax: parseFloat(e.target.value) || 10 }))}
                      />
                    </div>
                  </div>
                  
                  {/* Display Options */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showGrid"
                        checked={settings.showGrid}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showGrid: !!checked }))}
                      />
                      <Label htmlFor="showGrid">Show Grid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showAxes"
                        checked={settings.showAxes}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAxes: !!checked }))}
                      />
                      <Label htmlFor="showAxes">Show Axes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showLabels"
                        checked={settings.showLabels}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLabels: !!checked }))}
                      />
                      <Label htmlFor="showLabels">Show Labels</Label>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>Controls:</strong> Click and drag to pan • Use zoom buttons to zoom in/out • Supported functions: sin, cos, tan, log, ln, sqrt, abs, ^, +, -, *, /, (, )
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}