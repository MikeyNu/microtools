'use client'

import { useState } from 'react'
import { Calculator, Plus, Minus, X, Copy, RotateCcw, Download, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

type Matrix = number[][]

interface MatrixResult {
  result: Matrix | number | null
  operation: string
  steps?: string[]
  properties?: {
    determinant?: number
    rank?: number
    trace?: number
    eigenvalues?: number[]
  }
}

export default function MatrixCalculatorPage() {
  const [matrixA, setMatrixA] = useState<Matrix>([[1, 2], [3, 4]])
  const [matrixB, setMatrixB] = useState<Matrix>([[5, 6], [7, 8]])
  const [result, setResult] = useState<MatrixResult | null>(null)
  const [operation, setOperation] = useState<string>('add')
  const [matrixSize, setMatrixSize] = useState({ rows: 2, cols: 2 })
  const [activeMatrix, setActiveMatrix] = useState<'A' | 'B'>('A')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Matrix Calculator', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'matrix-calculator',
    name: 'Matrix Calculator',
    description: 'Perform matrix operations including addition, multiplication, determinant, and inverse',
    category: 'math-tools',
    url: '/math-tools/matrix-calculator'
  }

  // Create empty matrix with given dimensions
  const createMatrix = (rows: number, cols: number): Matrix => {
    return Array(rows).fill(0).map(() => Array(cols).fill(0))
  }

  // Update matrix dimensions
  const updateMatrixSize = (rows: number, cols: number) => {
    setMatrixSize({ rows, cols })
    
    // Resize matrices
    const newMatrixA = createMatrix(rows, cols)
    const newMatrixB = createMatrix(rows, cols)
    
    // Copy existing values
    for (let i = 0; i < Math.min(rows, matrixA.length); i++) {
      for (let j = 0; j < Math.min(cols, matrixA[0]?.length || 0); j++) {
        newMatrixA[i][j] = matrixA[i]?.[j] || 0
      }
    }
    
    for (let i = 0; i < Math.min(rows, matrixB.length); i++) {
      for (let j = 0; j < Math.min(cols, matrixB[0]?.length || 0); j++) {
        newMatrixB[i][j] = matrixB[i]?.[j] || 0
      }
    }
    
    setMatrixA(newMatrixA)
    setMatrixB(newMatrixB)
  }

  // Update matrix value
  const updateMatrixValue = (matrix: 'A' | 'B', row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0
    
    if (matrix === 'A') {
      const newMatrix = [...matrixA]
      newMatrix[row][col] = numValue
      setMatrixA(newMatrix)
    } else {
      const newMatrix = [...matrixB]
      newMatrix[row][col] = numValue
      setMatrixB(newMatrix)
    }
  }

  // Matrix addition
  const addMatrices = (a: Matrix, b: Matrix): Matrix => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrices must have the same dimensions for addition')
    }
    
    return a.map((row, i) => row.map((val, j) => val + b[i][j]))
  }

  // Matrix subtraction
  const subtractMatrices = (a: Matrix, b: Matrix): Matrix => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('Matrices must have the same dimensions for subtraction')
    }
    
    return a.map((row, i) => row.map((val, j) => val - b[i][j]))
  }

  // Matrix multiplication
  const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
    if (a[0].length !== b.length) {
      throw new Error('Number of columns in first matrix must equal number of rows in second matrix')
    }
    
    const result = createMatrix(a.length, b[0].length)
    
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j]
        }
      }
    }
    
    return result
  }

  // Scalar multiplication
  const scalarMultiply = (matrix: Matrix, scalar: number): Matrix => {
    return matrix.map(row => row.map(val => val * scalar))
  }

  // Matrix transpose
  const transpose = (matrix: Matrix): Matrix => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))
  }

  // Calculate determinant (for square matrices)
  const determinant = (matrix: Matrix): number => {
    const n = matrix.length
    if (n !== matrix[0].length) {
      throw new Error('Determinant can only be calculated for square matrices')
    }
    
    if (n === 1) return matrix[0][0]
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
    
    let det = 0
    for (let i = 0; i < n; i++) {
      const subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== i))
      det += matrix[0][i] * Math.pow(-1, i) * determinant(subMatrix)
    }
    
    return det
  }

  // Calculate matrix inverse (2x2 only for simplicity)
  const inverse = (matrix: Matrix): Matrix => {
    if (matrix.length !== 2 || matrix[0].length !== 2) {
      throw new Error('Inverse calculation is only supported for 2x2 matrices in this demo')
    }
    
    const det = determinant(matrix)
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is singular (determinant is zero)')
    }
    
    const [[a, b], [c, d]] = matrix
    return [
      [d / det, -b / det],
      [-c / det, a / det]
    ]
  }

  // Calculate trace (sum of diagonal elements)
  const trace = (matrix: Matrix): number => {
    if (matrix.length !== matrix[0].length) {
      throw new Error('Trace can only be calculated for square matrices')
    }
    
    return matrix.reduce((sum, row, i) => sum + row[i], 0)
  }

  // Calculate rank (simplified - count non-zero rows after row reduction)
  const rank = (matrix: Matrix): number => {
    const m = matrix.map(row => [...row]) // Copy matrix
    const rows = m.length
    const cols = m[0].length
    
    // Gaussian elimination
    for (let i = 0; i < Math.min(rows, cols); i++) {
      // Find pivot
      let maxRow = i
      for (let k = i + 1; k < rows; k++) {
        if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) {
          maxRow = k
        }
      }
      
      // Swap rows
      [m[i], m[maxRow]] = [m[maxRow], m[i]]
      
      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < rows; k++) {
        if (Math.abs(m[i][i]) > 1e-10) {
          const factor = m[k][i] / m[i][i]
          for (let j = i; j < cols; j++) {
            m[k][j] -= factor * m[i][j]
          }
        }
      }
    }
    
    // Count non-zero rows
    let rankCount = 0
    for (let i = 0; i < rows; i++) {
      if (m[i].some(val => Math.abs(val) > 1e-10)) {
        rankCount++
      }
    }
    
    return rankCount
  }

  // Perform matrix operation
  const performOperation = () => {
    trackToolStart()
    
    try {
      let operationResult: Matrix | number | null = null
      let steps: string[] = []
      let properties: MatrixResult['properties'] = {}
      let operationName = ''
      
      switch (operation) {
        case 'add':
          operationResult = addMatrices(matrixA, matrixB)
          operationName = 'Matrix Addition (A + B)'
          steps = ['Adding corresponding elements of matrices A and B']
          break
          
        case 'subtract':
          operationResult = subtractMatrices(matrixA, matrixB)
          operationName = 'Matrix Subtraction (A - B)'
          steps = ['Subtracting corresponding elements of matrix B from matrix A']
          break
          
        case 'multiply':
          operationResult = multiplyMatrices(matrixA, matrixB)
          operationName = 'Matrix Multiplication (A × B)'
          steps = [
            'Multiplying matrices using dot product of rows and columns',
            `Result[i][j] = Σ(A[i][k] × B[k][j]) for k = 0 to ${matrixA[0].length - 1}`
          ]
          break
          
        case 'transpose_a':
          operationResult = transpose(matrixA)
          operationName = 'Transpose of Matrix A'
          steps = ['Swapping rows and columns of matrix A']
          break
          
        case 'transpose_b':
          operationResult = transpose(matrixB)
          operationName = 'Transpose of Matrix B'
          steps = ['Swapping rows and columns of matrix B']
          break
          
        case 'determinant_a':
          operationResult = null
          operationName = 'Determinant of Matrix A'
          properties.determinant = determinant(matrixA)
          steps = [
            'Calculating determinant using cofactor expansion',
            `det(A) = ${properties.determinant}`
          ]
          break
          
        case 'determinant_b':
          operationResult = null
          operationName = 'Determinant of Matrix B'
          properties.determinant = determinant(matrixB)
          steps = [
            'Calculating determinant using cofactor expansion',
            `det(B) = ${properties.determinant}`
          ]
          break
          
        case 'inverse_a':
          operationResult = inverse(matrixA)
          operationName = 'Inverse of Matrix A'
          properties.determinant = determinant(matrixA)
          steps = [
            'Calculating matrix inverse using adjugate method',
            `det(A) = ${properties.determinant}`,
            'A⁻¹ = (1/det(A)) × adj(A)'
          ]
          break
          
        case 'inverse_b':
          operationResult = inverse(matrixB)
          operationName = 'Inverse of Matrix B'
          properties.determinant = determinant(matrixB)
          steps = [
            'Calculating matrix inverse using adjugate method',
            `det(B) = ${properties.determinant}`,
            'B⁻¹ = (1/det(B)) × adj(B)'
          ]
          break
          
        case 'properties_a':
          operationResult = null
          operationName = 'Properties of Matrix A'
          if (matrixA.length === matrixA[0].length) {
            properties.determinant = determinant(matrixA)
            properties.trace = trace(matrixA)
          }
          properties.rank = rank(matrixA)
          steps = [
            'Calculating matrix properties:',
            ...(properties.determinant !== undefined ? [`Determinant: ${properties.determinant}`] : []),
            ...(properties.trace !== undefined ? [`Trace: ${properties.trace}`] : []),
            `Rank: ${properties.rank}`
          ]
          break
          
        case 'properties_b':
          operationResult = null
          operationName = 'Properties of Matrix B'
          if (matrixB.length === matrixB[0].length) {
            properties.determinant = determinant(matrixB)
            properties.trace = trace(matrixB)
          }
          properties.rank = rank(matrixB)
          steps = [
            'Calculating matrix properties:',
            ...(properties.determinant !== undefined ? [`Determinant: ${properties.determinant}`] : []),
            ...(properties.trace !== undefined ? [`Trace: ${properties.trace}`] : []),
            `Rank: ${properties.rank}`
          ]
          break
          
        default:
          throw new Error('Unknown operation')
      }
      
      setResult({
        result: operationResult,
        operation: operationName,
        steps,
        properties
      })
      
      trackToolComplete()
      
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to perform operation',
        variant: 'destructive'
      })
    }
  }

  // Copy result to clipboard
  const copyResult = () => {
    if (!result) return
    
    let text = `${result.operation}\n\n`
    
    if (result.result) {
      if (Array.isArray(result.result)) {
        text += 'Result Matrix:\n'
        text += result.result.map(row => row.map(val => val.toFixed(3)).join('\t')).join('\n')
      } else {
        text += `Result: ${result.result}`
      }
    }
    
    if (result.properties) {
      text += '\n\nProperties:\n'
      Object.entries(result.properties).forEach(([key, value]) => {
        if (value !== undefined) {
          text += `${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`
        }
      })
    }
    
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Result copied to clipboard'
    })
  }

  // Download result as CSV
  const downloadResult = () => {
    if (!result || !result.result || !Array.isArray(result.result)) return
    
    const csv = result.result.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'matrix-result.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Clear matrices
  const clearMatrices = () => {
    setMatrixA(createMatrix(matrixSize.rows, matrixSize.cols))
    setMatrixB(createMatrix(matrixSize.rows, matrixSize.cols))
    setResult(null)
  }

  // Load example matrices
  const loadExample = (type: string) => {
    if (type === 'identity') {
      const size = Math.min(matrixSize.rows, matrixSize.cols)
      const identity = createMatrix(size, size)
      for (let i = 0; i < size; i++) {
        identity[i][i] = 1
      }
      if (activeMatrix === 'A') {
        setMatrixA(identity)
      } else {
        setMatrixB(identity)
      }
    } else if (type === 'random') {
      const randomMatrix = createMatrix(matrixSize.rows, matrixSize.cols)
      for (let i = 0; i < matrixSize.rows; i++) {
        for (let j = 0; j < matrixSize.cols; j++) {
          randomMatrix[i][j] = Math.floor(Math.random() * 20) - 10
        }
      }
      if (activeMatrix === 'A') {
        setMatrixA(randomMatrix)
      } else {
        setMatrixB(randomMatrix)
      }
    }
  }

  const relatedTools = [
    { name: 'Scientific Calculator', href: '/math-tools/scientific-calculator' },
    { name: 'Equation Solver', href: '/math-tools/equation-solver' },
    { name: 'Statistics Calculator', href: '/math-tools/statistics-calculator' },
    { name: 'Graphing Calculator', href: '/math-tools/graphing-calculator' }
  ]

  return (
    <ToolLayout
      title="Matrix Calculator"
      description="Perform matrix operations including addition, multiplication, determinant, inverse, and more."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Grid3X3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Matrix Calculator</h1>
              <p className="text-muted-foreground">Perform advanced matrix operations and calculations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Matrix Input */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Matrix Input</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label>Size:</Label>
                    <Select value={`${matrixSize.rows}x${matrixSize.cols}`} onValueChange={(value) => {
                      const [rows, cols] = value.split('x').map(Number)
                      updateMatrixSize(rows, cols)
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x2">2×2</SelectItem>
                        <SelectItem value="3x3">3×3</SelectItem>
                        <SelectItem value="4x4">4×4</SelectItem>
                        <SelectItem value="2x3">2×3</SelectItem>
                        <SelectItem value="3x2">3×2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeMatrix} onValueChange={(value) => setActiveMatrix(value as 'A' | 'B')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="A">Matrix A</TabsTrigger>
                    <TabsTrigger value="B">Matrix B</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="A" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Matrix A ({matrixSize.rows}×{matrixSize.cols})</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadExample('identity')}>
                            Identity
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => loadExample('random')}>
                            Random
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize.cols}, 1fr)` }}>
                        {matrixA.map((row, i) =>
                          row.map((val, j) => (
                            <Input
                              key={`a-${i}-${j}`}
                              value={val.toString()}
                              onChange={(e) => updateMatrixValue('A', i, j, e.target.value)}
                              className="text-center font-mono"
                              placeholder="0"
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="B" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Matrix B ({matrixSize.rows}×{matrixSize.cols})</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadExample('identity')}>
                            Identity
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => loadExample('random')}>
                            Random
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize.cols}, 1fr)` }}>
                        {matrixB.map((row, i) =>
                          row.map((val, j) => (
                            <Input
                              key={`b-${i}-${j}`}
                              value={val.toString()}
                              onChange={(e) => updateMatrixValue('B', i, j, e.target.value)}
                              className="text-center font-mono"
                              placeholder="0"
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operation</Label>
                    <Select value={operation} onValueChange={setOperation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Addition (A + B)</SelectItem>
                        <SelectItem value="subtract">Subtraction (A - B)</SelectItem>
                        <SelectItem value="multiply">Multiplication (A × B)</SelectItem>
                        <SelectItem value="transpose_a">Transpose A</SelectItem>
                        <SelectItem value="transpose_b">Transpose B</SelectItem>
                        <SelectItem value="determinant_a">Determinant A</SelectItem>
                        <SelectItem value="determinant_b">Determinant B</SelectItem>
                        <SelectItem value="inverse_a">Inverse A (2×2 only)</SelectItem>
                        <SelectItem value="inverse_b">Inverse B (2×2 only)</SelectItem>
                        <SelectItem value="properties_a">Properties A</SelectItem>
                        <SelectItem value="properties_b">Properties B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={performOperation} className="flex-1">
                      Calculate
                    </Button>
                    <Button variant="outline" onClick={clearMatrices}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Operations */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setOperation('add'); performOperation(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  A + B
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setOperation('subtract'); performOperation(); }}>
                  <Minus className="h-4 w-4 mr-2" />
                  A - B
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setOperation('multiply'); performOperation(); }}>
                  <X className="h-4 w-4 mr-2" />
                  A × B
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setOperation('determinant_a'); performOperation(); }}>
                  <Calculator className="h-4 w-4 mr-2" />
                  det(A)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setOperation('transpose_a'); performOperation(); }}>
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  A^T
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matrix Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>Matrix A: {matrixSize.rows}×{matrixSize.cols}</div>
                <div>Matrix B: {matrixSize.rows}×{matrixSize.cols}</div>
                <div className="pt-2 border-t">
                  <div className="font-semibold mb-1">Supported Operations:</div>
                  <div>• Addition/Subtraction</div>
                  <div>• Multiplication</div>
                  <div>• Transpose</div>
                  <div>• Determinant (square)</div>
                  <div>• Inverse (2×2)</div>
                  <div>• Rank & Trace</div>
                </div>
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
                  <CardTitle>{result.operation}</CardTitle>
                  <CardDescription>Matrix operation result</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {result.result && Array.isArray(result.result) && (
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Result Matrix */}
              {result.result && Array.isArray(result.result) && (
                <div>
                  <h3 className="font-semibold mb-3">Result Matrix:</h3>
                  <div className="overflow-x-auto">
                    <div className="inline-block border rounded-lg p-4 bg-gray-50">
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${result.result[0].length}, 1fr)` }}>
                        {result.result.map((row, i) =>
                          row.map((val, j) => (
                            <div key={`result-${i}-${j}`} className="w-16 h-10 flex items-center justify-center border rounded bg-white font-mono text-sm">
                              {val.toFixed(3)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Properties */}
              {result.properties && Object.keys(result.properties).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Properties:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(result.properties).map(([key, value]) => {
                      if (value === undefined) return null
                      return (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                          <div className="font-mono text-lg">
                            {Array.isArray(value) ? value.join(', ') : typeof value === 'number' ? value.toFixed(6) : value}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Steps */}
              {result.steps && result.steps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Calculation Steps:</h3>
                  <div className="space-y-2">
                    {result.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded border-l-2 border-purple-200">
                        <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                        <div className="text-sm">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}