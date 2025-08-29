'use client'

import { useState, useEffect } from 'react'
import { Code, Copy, Download, Upload, Minimize2, Maximize2, Eye, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    size: number
    keys: number
    depth: number
    arrays: number
    objects: number
  }
}

interface FormatOptions {
  indent: number
  sortKeys: boolean
  removeComments: boolean
}

export default function JsonFormatterPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [options, setOptions] = useState<FormatOptions>({
    indent: 2,
    sortKeys: false,
    removeComments: false
  })
  const [viewMode, setViewMode] = useState<'formatted' | 'minified' | 'tree'>('formatted')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('JSON Formatter', 'data-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate and minify JSON data with syntax highlighting',
    category: 'data-tools',
    url: '/data-tools/json-formatter'
  }

  const validateJson = (jsonString: string): ValidationResult => {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      stats: {
        size: jsonString.length,
        keys: 0,
        depth: 0,
        arrays: 0,
        objects: 0
      }
    }

    if (!jsonString.trim()) {
      result.errors.push('JSON input is empty')
      return result
    }

    try {
      // Remove comments if option is enabled
      let cleanJson = jsonString
      if (options.removeComments) {
        // Remove single-line comments
        cleanJson = cleanJson.replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        cleanJson = cleanJson.replace(/\/\*[\s\S]*?\*\//g, '')
      }

      const parsed = JSON.parse(cleanJson)
      result.isValid = true

      // Calculate statistics
      const calculateStats = (obj: any, depth = 0): void => {
        result.stats.depth = Math.max(result.stats.depth, depth)
        
        if (Array.isArray(obj)) {
          result.stats.arrays++
          obj.forEach(item => calculateStats(item, depth + 1))
        } else if (obj !== null && typeof obj === 'object') {
          result.stats.objects++
          result.stats.keys += Object.keys(obj).length
          Object.values(obj).forEach(value => calculateStats(value, depth + 1))
        }
      }

      calculateStats(parsed)

      // Add warnings for common issues
      if (result.stats.depth > 10) {
        result.warnings.push('JSON has very deep nesting (>10 levels)')
      }
      if (result.stats.size > 100000) {
        result.warnings.push('JSON is very large (>100KB)')
      }
      if (jsonString.includes('\t') && jsonString.includes('  ')) {
        result.warnings.push('Mixed indentation detected (tabs and spaces)')
      }

    } catch (error) {
      result.errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  const formatJson = () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter JSON data to format',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    try {
      // Remove comments if option is enabled
      let cleanJson = jsonInput
      if (options.removeComments) {
        cleanJson = cleanJson.replace(/\/\/.*$/gm, '')
        cleanJson = cleanJson.replace(/\/\*[\s\S]*?\*\//g, '')
      }

      const parsed = JSON.parse(cleanJson)
      
      // Sort keys if option is enabled
      const sortedJson = options.sortKeys ? sortObjectKeys(parsed) : parsed
      
      let formatted: string
      
      switch (viewMode) {
        case 'minified':
          formatted = JSON.stringify(sortedJson)
          break
        case 'formatted':
          formatted = JSON.stringify(sortedJson, null, options.indent)
          break
        case 'tree':
          formatted = generateTreeView(sortedJson)
          break
        default:
          formatted = JSON.stringify(sortedJson, null, options.indent)
      }
      
      setJsonOutput(formatted)
      
      const validationResult = validateJson(jsonInput)
      setValidation(validationResult)
      
      trackToolComplete()
      
      toast({
        title: 'JSON formatted successfully',
        description: `${validationResult.stats.objects} objects, ${validationResult.stats.arrays} arrays`
      })
    } catch (error) {
      trackToolError()
      const validationResult = validateJson(jsonInput)
      setValidation(validationResult)
      
      toast({
        title: 'Invalid JSON',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj !== null && typeof obj === 'object') {
      const sorted: { [key: string]: any } = {}
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key])
      })
      return sorted
    }
    return obj
  }

  const generateTreeView = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      let result = '[\n'
      obj.forEach((item, index) => {
        result += `${spaces}  ${generateTreeView(item, indent + 1)}`
        if (index < obj.length - 1) result += ','
        result += '\n'
      })
      result += `${spaces}]`
      return result
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj)
      if (keys.length === 0) return '{}'
      let result = '{\n'
      keys.forEach((key, index) => {
        result += `${spaces}  "${key}": ${generateTreeView(obj[key], indent + 1)}`
        if (index < keys.length - 1) result += ','
        result += '\n'
      })
      result += `${spaces}}`
      return result
    } else if (typeof obj === 'string') {
      return `"${obj}"`
    } else {
      return String(obj)
    }
  }

  const minifyJson = () => {
    setViewMode('minified')
    formatJson()
  }

  const prettifyJson = () => {
    setViewMode('formatted')
    formatJson()
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput)
    toast({
      title: 'Copied!',
      description: 'JSON output copied to clipboard'
    })
  }

  const downloadJson = () => {
    if (!jsonOutput) return
    
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'JSON file saved successfully'
    })
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
      toast({
        title: 'File loaded',
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      })
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    setJsonInput('')
    setJsonOutput('')
    setValidation(null)
  }

  const loadSampleData = () => {
    const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "isActive": true,
  "balance": 1250.50
}`
    setJsonInput(sampleJson)
  }

  // Auto-validate when input changes
  useEffect(() => {
    if (jsonInput.trim()) {
      const timer = setTimeout(() => {
        const validationResult = validateJson(jsonInput)
        setValidation(validationResult)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setValidation(null)
    }
  }, [jsonInput, options.removeComments])

  const relatedTools = [
    { name: 'CSV to JSON Converter', href: '/data-tools/csv-to-json' },
    { name: 'XML Formatter', href: '/data-tools/xml-formatter' },
    { name: 'YAML Converter', href: '/data-tools/yaml-converter' },
    { name: 'Data Validator', href: '/data-tools/data-validator' }
  ]

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate and minify JSON data with syntax highlighting and error detection."
      category="Data Tools"
      categoryHref="/data-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Code className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">JSON Formatter</h1>
              <p className="text-muted-foreground">Format, validate and minify JSON data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Format Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="indent">Indentation</Label>
                  <Select value={options.indent.toString()} onValueChange={(value) => setOptions(prev => ({ ...prev, indent: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="view-mode">View Mode</Label>
                  <Select value={viewMode} onValueChange={(value: 'formatted' | 'minified' | 'tree') => setViewMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formatted">Formatted</SelectItem>
                      <SelectItem value="minified">Minified</SelectItem>
                      <SelectItem value="tree">Tree View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sort-keys"
                      checked={options.sortKeys}
                      onChange={(e) => setOptions(prev => ({ ...prev, sortKeys: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="sort-keys" className="text-sm">Sort keys</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remove-comments"
                      checked={options.removeComments}
                      onChange={(e) => setOptions(prev => ({ ...prev, removeComments: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="remove-comments" className="text-sm">Remove comments</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={prettifyJson} disabled={!jsonInput} className="w-full">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Format JSON
                  </Button>
                  
                  <Button onClick={minifyJson} disabled={!jsonInput} variant="outline" className="w-full">
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Minify JSON
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleData}>
                      <Eye className="h-4 w-4 mr-1" />
                      Sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {validation && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {validation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                      {validation.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Size:</span>
                    <span>{(validation.stats.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Objects:</span>
                    <span>{validation.stats.objects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Arrays:</span>
                    <span>{validation.stats.arrays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Keys:</span>
                    <span>{validation.stats.keys}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Depth:</span>
                    <span>{validation.stats.depth}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="input" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">JSON Input</TabsTrigger>
                <TabsTrigger value="output">Formatted Output</TabsTrigger>
              </TabsList>
              
              <TabsContent value="input">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>JSON Input</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".json,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file)
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload JSON
                          </label>
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Paste JSON data or upload a JSON file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder='{"name": "John", "age": 30}'
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="output">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Formatted Output</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!jsonOutput}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadJson} disabled={!jsonOutput}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Formatted JSON output
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={jsonOutput}
                      readOnly
                      placeholder="Formatted JSON will appear here"
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Error and Warning Messages */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="space-y-2 mt-4">
                {validation.errors.map((error, index) => (
                  <Alert key={`error-${index}`} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
                {validation.warnings.map((warning, index) => (
                  <Alert key={`warning-${index}`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </div>

        <Alert>
          <Code className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> This tool supports JSON with comments (JSONC). Enable "Remove comments" 
            option to strip comments before formatting. Use tree view for better visualization of complex structures.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}