'use client'

import { useState } from 'react'
import { BarChart3, Copy, RotateCcw, Download, Upload, TrendingUp, Calculator } from 'lucide-react'
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

interface StatisticsResult {
  descriptive: {
    count: number
    sum: number
    mean: number
    median: number
    mode: number[]
    range: number
    variance: number
    standardDeviation: number
    skewness: number
    kurtosis: number
    min: number
    max: number
    q1: number
    q3: number
    iqr: number
  }
  distribution: {
    frequencies: { [key: string]: number }
    percentiles: { [key: string]: number }
  }
  confidence?: {
    level: number
    margin: number
    lower: number
    upper: number
  }
}

interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  correlation: number
  equation: string
  predictions?: { x: number; y: number }[]
}

export default function StatisticsCalculatorPage() {
  const [data, setData] = useState('')
  const [dataX, setDataX] = useState('')
  const [dataY, setDataY] = useState('')
  const [result, setResult] = useState<StatisticsResult | null>(null)
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null)
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [activeTab, setActiveTab] = useState('descriptive')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Statistics Calculator', 'math-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'statistics-calculator',
    name: 'Statistics Calculator',
    description: 'Calculate descriptive statistics, regression analysis, and confidence intervals',
    category: 'math-tools',
    url: '/math-tools/statistics-calculator'
  }

  // Parse data from string
  const parseData = (input: string): number[] => {
    return input
      .split(/[,\s\n]+/)
      .map(val => val.trim())
      .filter(val => val !== '')
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val))
  }

  // Calculate descriptive statistics
  const calculateDescriptiveStats = (values: number[]): StatisticsResult['descriptive'] => {
    if (values.length === 0) throw new Error('No valid data provided')
    
    const sorted = [...values].sort((a, b) => a - b)
    const n = values.length
    const sum = values.reduce((acc, val) => acc + val, 0)
    const mean = sum / n
    
    // Median
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)]
    
    // Mode
    const frequencies: { [key: number]: number } = {}
    values.forEach(val => {
      frequencies[val] = (frequencies[val] || 0) + 1
    })
    const maxFreq = Math.max(...Object.values(frequencies))
    const mode = Object.keys(frequencies)
      .filter(key => frequencies[Number(key)] === maxFreq)
      .map(Number)
    
    // Range
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    
    // Variance and Standard Deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
    const standardDeviation = Math.sqrt(variance)
    
    // Quartiles
    const q1Index = Math.floor(n * 0.25)
    const q3Index = Math.floor(n * 0.75)
    const q1 = sorted[q1Index]
    const q3 = sorted[q3Index]
    const iqr = q3 - q1
    
    // Skewness (Pearson's moment coefficient)
    const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0) / n
    
    // Kurtosis
    const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0) / n - 3
    
    return {
      count: n,
      sum,
      mean,
      median,
      mode,
      range,
      variance,
      standardDeviation,
      skewness,
      kurtosis,
      min,
      max,
      q1,
      q3,
      iqr
    }
  }

  // Calculate distribution statistics
  const calculateDistribution = (values: number[]): StatisticsResult['distribution'] => {
    const sorted = [...values].sort((a, b) => a - b)
    const n = values.length
    
    // Frequencies
    const frequencies: { [key: string]: number } = {}
    values.forEach(val => {
      const key = val.toString()
      frequencies[key] = (frequencies[key] || 0) + 1
    })
    
    // Percentiles
    const percentiles: { [key: string]: number } = {}
    const percentileValues = [5, 10, 25, 50, 75, 90, 95, 99]
    
    percentileValues.forEach(p => {
      const index = (p / 100) * (n - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower
      
      if (lower === upper) {
        percentiles[`p${p}`] = sorted[lower]
      } else {
        percentiles[`p${p}`] = sorted[lower] * (1 - weight) + sorted[upper] * weight
      }
    })
    
    return { frequencies, percentiles }
  }

  // Calculate confidence interval
  const calculateConfidenceInterval = (values: number[], level: number) => {
    const n = values.length
    const mean = values.reduce((acc, val) => acc + val, 0) / n
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
    const standardError = Math.sqrt(variance / n)
    
    // Using t-distribution approximation (simplified)
    const alpha = (100 - level) / 100
    const tValue = getTValue(alpha / 2, n - 1)
    const margin = tValue * standardError
    
    return {
      level,
      margin,
      lower: mean - margin,
      upper: mean + margin
    }
  }

  // Simplified t-value lookup (approximation)
  const getTValue = (alpha: number, df: number): number => {
    // Simplified t-table lookup for common values
    const tTable: { [key: number]: { [key: number]: number } } = {
      0.025: { // 95% confidence
        1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
        10: 2.228, 15: 2.131, 20: 2.086, 30: 2.042, 60: 2.000, 120: 1.980
      },
      0.005: { // 99% confidence
        1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
        10: 3.169, 15: 2.947, 20: 2.845, 30: 2.750, 60: 2.660, 120: 2.617
      }
    }
    
    const table = tTable[alpha] || tTable[0.025]
    
    // Find closest df
    const availableDf = Object.keys(table).map(Number).sort((a, b) => a - b)
    let closestDf = availableDf[0]
    
    for (const availDf of availableDf) {
      if (df >= availDf) {
        closestDf = availDf
      } else {
        break
      }
    }
    
    return table[closestDf] || 1.96 // Default to z-value for large samples
  }

  // Linear regression
  const calculateLinearRegression = (xValues: number[], yValues: number[]): RegressionResult => {
    if (xValues.length !== yValues.length || xValues.length < 2) {
      throw new Error('X and Y data must have the same length and at least 2 points')
    }
    
    const n = xValues.length
    const sumX = xValues.reduce((acc, val) => acc + val, 0)
    const sumY = yValues.reduce((acc, val) => acc + val, 0)
    const sumXY = xValues.reduce((acc, val, i) => acc + val * yValues[i], 0)
    const sumXX = xValues.reduce((acc, val) => acc + val * val, 0)
    const sumYY = yValues.reduce((acc, val) => acc + val * val, 0)
    
    const meanX = sumX / n
    const meanY = sumY / n
    
    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = meanY - slope * meanX
    
    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    const correlation = numerator / denominator
    
    // Calculate R-squared
    const rSquared = correlation * correlation
    
    // Generate equation string
    const equation = `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(4)}`
    
    return {
      slope,
      intercept,
      rSquared,
      correlation,
      equation
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const values = parseData(data)
    
    if (values.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid numerical data',
        variant: 'destructive'
      })
      return
    }
    
    trackToolStart()
    
    try {
      const descriptive = calculateDescriptiveStats(values)
      const distribution = calculateDistribution(values)
      const confidence = calculateConfidenceInterval(values, confidenceLevel)
      
      setResult({
        descriptive,
        distribution,
        confidence
      })
      
      trackToolComplete()
      
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to calculate statistics',
        variant: 'destructive'
      })
    }
  }

  // Calculate regression
  const calculateRegression = () => {
    const xValues = parseData(dataX)
    const yValues = parseData(dataY)
    
    if (xValues.length === 0 || yValues.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid X and Y data',
        variant: 'destructive'
      })
      return
    }
    
    trackToolStart()
    
    try {
      const regression = calculateLinearRegression(xValues, yValues)
      setRegressionResult(regression)
      trackToolComplete()
      
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to calculate regression',
        variant: 'destructive'
      })
    }
  }

  // Copy result to clipboard
  const copyResult = () => {
    if (!result && !regressionResult) return
    
    let text = 'Statistics Results\n================\n\n'
    
    if (result) {
      text += 'Descriptive Statistics:\n'
      text += `Count: ${result.descriptive.count}\n`
      text += `Mean: ${result.descriptive.mean.toFixed(4)}\n`
      text += `Median: ${result.descriptive.median.toFixed(4)}\n`
      text += `Standard Deviation: ${result.descriptive.standardDeviation.toFixed(4)}\n`
      text += `Variance: ${result.descriptive.variance.toFixed(4)}\n`
      text += `Range: ${result.descriptive.range.toFixed(4)}\n`
      text += `Min: ${result.descriptive.min}\n`
      text += `Max: ${result.descriptive.max}\n`
      
      if (result.confidence) {
        text += `\n${result.confidence.level}% Confidence Interval: [${result.confidence.lower.toFixed(4)}, ${result.confidence.upper.toFixed(4)}]\n`
      }
    }
    
    if (regressionResult) {
      text += '\nLinear Regression:\n'
      text += `Equation: ${regressionResult.equation}\n`
      text += `Correlation: ${regressionResult.correlation.toFixed(4)}\n`
      text += `R-squared: ${regressionResult.rSquared.toFixed(4)}\n`
    }
    
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Results copied to clipboard'
    })
  }

  // Download result as CSV
  const downloadResult = () => {
    if (!result) return
    
    const csv = [
      'Statistic,Value',
      `Count,${result.descriptive.count}`,
      `Mean,${result.descriptive.mean}`,
      `Median,${result.descriptive.median}`,
      `Standard Deviation,${result.descriptive.standardDeviation}`,
      `Variance,${result.descriptive.variance}`,
      `Range,${result.descriptive.range}`,
      `Min,${result.descriptive.min}`,
      `Max,${result.descriptive.max}`,
      `Q1,${result.descriptive.q1}`,
      `Q3,${result.descriptive.q3}`,
      `IQR,${result.descriptive.iqr}`,
      `Skewness,${result.descriptive.skewness}`,
      `Kurtosis,${result.descriptive.kurtosis}`
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'statistics-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Clear all data
  const clearAll = () => {
    setData('')
    setDataX('')
    setDataY('')
    setResult(null)
    setRegressionResult(null)
  }

  // Load sample data
  const loadSampleData = (type: string) => {
    if (type === 'normal') {
      // Generate normal distribution sample
      const sample = Array.from({ length: 50 }, () => {
        const u1 = Math.random()
        const u2 = Math.random()
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        return (z * 10 + 50).toFixed(2)
      })
      setData(sample.join(', '))
    } else if (type === 'regression') {
      // Generate correlated data
      const xData = Array.from({ length: 20 }, (_, i) => i + 1)
      const yData = xData.map(x => (2 * x + 5 + (Math.random() - 0.5) * 10).toFixed(2))
      setDataX(xData.join(', '))
      setDataY(yData.join(', '))
      setActiveTab('regression')
    }
  }

  const relatedTools = [
    { name: 'Scientific Calculator', href: '/math-tools/scientific-calculator' },
    { name: 'Equation Solver', href: '/math-tools/equation-solver' },
    { name: 'Matrix Calculator', href: '/math-tools/matrix-calculator' },
    { name: 'Graphing Calculator', href: '/math-tools/graphing-calculator' }
  ]

  return (
    <ToolLayout
      title="Statistics Calculator"
      description="Calculate descriptive statistics, regression analysis, confidence intervals, and more."
      category="Math Tools"
      categoryHref="/math-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Statistics Calculator</h1>
              <p className="text-muted-foreground">Comprehensive statistical analysis and calculations</p>
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
                <CardTitle>Data Input</CardTitle>
                <CardDescription>
                  Enter your data for statistical analysis. Separate values with commas, spaces, or new lines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="descriptive">Descriptive Stats</TabsTrigger>
                    <TabsTrigger value="regression">Regression Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="descriptive" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="data">Data Values</Label>
                      <Textarea
                        id="data"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder="Enter numbers separated by commas, spaces, or new lines\ne.g., 1, 2, 3, 4, 5 or\n1\n2\n3\n4\n5"
                        className="font-mono min-h-32"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confidence">Confidence Level (%)</Label>
                      <Select value={confidenceLevel.toString()} onValueChange={(value) => setConfidenceLevel(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={calculateStats} className="flex-1">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Statistics
                      </Button>
                      <Button variant="outline" onClick={() => loadSampleData('normal')}>
                        Sample Data
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="regression" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataX">X Values (Independent)</Label>
                        <Textarea
                          id="dataX"
                          value={dataX}
                          onChange={(e) => setDataX(e.target.value)}
                          placeholder="1, 2, 3, 4, 5"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataY">Y Values (Dependent)</Label>
                        <Textarea
                          id="dataY"
                          value={dataY}
                          onChange={(e) => setDataY(e.target.value)}
                          placeholder="2, 4, 6, 8, 10"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={calculateRegression} className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Calculate Regression
                      </Button>
                      <Button variant="outline" onClick={() => loadSampleData('regression')}>
                        Sample Data
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {data && (
                  <div>
                    <div className="font-semibold">Data Preview:</div>
                    <div className="text-muted-foreground">
                      {parseData(data).length} values
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="font-semibold">Supported Statistics:</div>
                  <div className="space-y-1 text-xs">
                    <div>• Mean, Median, Mode</div>
                    <div>• Standard Deviation</div>
                    <div>• Variance, Range</div>
                    <div>• Quartiles & IQR</div>
                    <div>• Skewness & Kurtosis</div>
                    <div>• Confidence Intervals</div>
                    <div>• Linear Regression</div>
                    <div>• Correlation Analysis</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Comma separated:</strong>
                  <div className="font-mono text-xs">1, 2, 3, 4, 5</div>
                </div>
                <div>
                  <strong>Space separated:</strong>
                  <div className="font-mono text-xs">1 2 3 4 5</div>
                </div>
                <div>
                  <strong>Line separated:</strong>
                  <div className="font-mono text-xs">1<br/>2<br/>3</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        {(result || regressionResult) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Statistical analysis results</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {result && (
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Descriptive Statistics */}
              {result && (
                <div>
                  <h3 className="font-semibold mb-4">Descriptive Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Count</div>
                      <div className="text-xl font-mono">{result.descriptive.count}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Mean</div>
                      <div className="text-xl font-mono">{result.descriptive.mean.toFixed(4)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Median</div>
                      <div className="text-xl font-mono">{result.descriptive.median.toFixed(4)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Std Dev</div>
                      <div className="text-xl font-mono">{result.descriptive.standardDeviation.toFixed(4)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Variance</div>
                      <div className="text-xl font-mono">{result.descriptive.variance.toFixed(4)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Range</div>
                      <div className="text-xl font-mono">{result.descriptive.range.toFixed(4)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Min</div>
                      <div className="text-xl font-mono">{result.descriptive.min}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Max</div>
                      <div className="text-xl font-mono">{result.descriptive.max}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Quartiles & Distribution</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Q1 (25%)</div>
                        <div className="text-lg font-mono">{result.descriptive.q1.toFixed(4)}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Q3 (75%)</div>
                        <div className="text-lg font-mono">{result.descriptive.q3.toFixed(4)}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">IQR</div>
                        <div className="text-lg font-mono">{result.descriptive.iqr.toFixed(4)}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Skewness</div>
                        <div className="text-lg font-mono">{result.descriptive.skewness.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {result.confidence && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Confidence Interval ({result.confidence.level}%)</h4>
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <div className="text-lg font-mono">
                          [{result.confidence.lower.toFixed(4)}, {result.confidence.upper.toFixed(4)}]
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Margin of Error: ±{result.confidence.margin.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Regression Results */}
              {regressionResult && (
                <div>
                  <h3 className="font-semibold mb-4">Linear Regression Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Equation</div>
                      <div className="text-lg font-mono">{regressionResult.equation}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Correlation (r)</div>
                      <div className="text-lg font-mono">{regressionResult.correlation.toFixed(4)}</div>
                      <Badge variant={Math.abs(regressionResult.correlation) > 0.7 ? 'default' : 'secondary'} className="mt-1">
                        {Math.abs(regressionResult.correlation) > 0.7 ? 'Strong' : 
                         Math.abs(regressionResult.correlation) > 0.3 ? 'Moderate' : 'Weak'}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">R-squared (r²)</div>
                      <div className="text-lg font-mono">{regressionResult.rSquared.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(regressionResult.rSquared * 100).toFixed(1)}% of variance explained
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Slope</div>
                      <div className="text-lg font-mono">{regressionResult.slope.toFixed(4)}</div>
                    </div>
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