'use client'

import { useState, useEffect } from 'react'
import { FileText, Copy, Download, Upload, ArrowLeftRight, Trash2, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface ConversionResult {
  success: boolean
  output: string
  errors: string[]
  warnings: string[]
  stats: {
    inputSize: number
    outputSize: number
    lines: number
    keys: number
  }
}

interface ConversionOptions {
  indentSize: number
  sortKeys: boolean
  includeComments: boolean
  flowStyle: boolean
}

export default function YamlConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [conversionMode, setConversionMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [options, setOptions] = useState<ConversionOptions>({
    indentSize: 2,
    sortKeys: false,
    includeComments: false,
    flowStyle: false
  })
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('YAML Converter', 'data-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'yaml-converter',
    name: 'YAML Converter',
    description: 'Convert between YAML and JSON formats with validation and formatting options',
    category: 'data-tools',
    url: '/data-tools/yaml-converter'
  }

  const parseYaml = (yamlString: string): any => {
    // Simple YAML parser for basic structures
    const lines = yamlString.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    const result: any = {}
    const stack: any[] = [result]
    let currentIndent = 0
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      const indent = line.length - line.trimStart().length
      
      // Handle arrays
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim()
        const current = stack[stack.length - 1]
        
        if (!Array.isArray(current)) {
          // Convert object to array if needed
          const keys = Object.keys(current)
          if (keys.length === 0) {
            stack[stack.length - 1] = []
          }
        }
        
        if (Array.isArray(stack[stack.length - 1])) {
          if (value.includes(':')) {
            const obj = parseKeyValue(value)
            stack[stack.length - 1].push(obj)
          } else {
            stack[stack.length - 1].push(parseValue(value))
          }
        }
      }
      // Handle key-value pairs
      else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':')
        const value = valueParts.join(':').trim()
        
        // Adjust stack based on indentation
        while (stack.length > 1 && indent <= currentIndent) {
          stack.pop()
          currentIndent -= options.indentSize
        }
        
        const current = stack[stack.length - 1]
        
        if (value === '' || value === '|' || value === '>') {
          // Object or multiline string
          current[key.trim()] = {}
          stack.push(current[key.trim()])
          currentIndent = indent
        } else {
          current[key.trim()] = parseValue(value)
        }
      }
    }
    
    return result
  }
  
  const parseKeyValue = (str: string): any => {
    const [key, ...valueParts] = str.split(':')
    const value = valueParts.join(':').trim()
    return { [key.trim()]: parseValue(value) }
  }
  
  const parseValue = (value: string): any => {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null') return null
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
    if (!isNaN(Number(value))) return Number(value)
    return value
  }

  const jsonToYaml = (obj: any, indent = 0): string => {
    const spaces = ' '.repeat(indent)
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const yamlObj = jsonToYaml(item, indent + options.indentSize)
          return `${spaces}- ${yamlObj.trim()}`
        } else {
          return `${spaces}- ${formatYamlValue(item)}`
        }
      }).join('\n')
    } else if (obj !== null && typeof obj === 'object') {
      const keys = options.sortKeys ? Object.keys(obj).sort() : Object.keys(obj)
      if (keys.length === 0) return '{}'
      
      return keys.map(key => {
        const value = obj[key]
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return `${spaces}${key}: []`
          } else {
            const yamlArray = jsonToYaml(value, indent + options.indentSize)
            return `${spaces}${key}:\n${yamlArray}`
          }
        } else if (value !== null && typeof value === 'object') {
          const yamlObj = jsonToYaml(value, indent + options.indentSize)
          return `${spaces}${key}:\n${yamlObj}`
        } else {
          return `${spaces}${key}: ${formatYamlValue(value)}`
        }
      }).join('\n')
    } else {
      return formatYamlValue(obj)
    }
  }
  
  const formatYamlValue = (value: any): string => {
    if (value === null) return 'null'
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'string') {
      // Quote strings that contain special characters
      if (value.includes(':') || value.includes('#') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '\\"')}"`
      }
      return value
    }
    return String(value)
  }

  const convertData = () => {
    if (!input.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter data to convert',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    const conversionResult: ConversionResult = {
      success: false,
      output: '',
      errors: [],
      warnings: [],
      stats: {
        inputSize: input.length,
        outputSize: 0,
        lines: input.split('\n').length,
        keys: 0
      }
    }

    try {
      if (conversionMode === 'yaml-to-json') {
        // Convert YAML to JSON
        const parsed = parseYaml(input)
        const jsonOutput = JSON.stringify(parsed, null, options.indentSize)
        
        conversionResult.output = jsonOutput
        conversionResult.success = true
        
        // Count keys
        const countKeys = (obj: any): number => {
          if (Array.isArray(obj)) {
            return obj.reduce((sum: number, item: any) => sum + countKeys(item), 0)
          } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).length + Object.values(obj).reduce((sum: number, value: any) => sum + countKeys(value), 0)
          }
          return 0
        }
        
        conversionResult.stats.keys = countKeys(parsed)
        
      } else {
        // Convert JSON to YAML
        const parsed = JSON.parse(input)
        const yamlOutput = jsonToYaml(parsed)
        
        conversionResult.output = yamlOutput
        conversionResult.success = true
        
        // Count keys
        const countKeys = (obj: any): number => {
          if (Array.isArray(obj)) {
            return obj.reduce((sum: number, item: any) => sum + countKeys(item), 0)
          } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).length + Object.values(obj).reduce((sum: number, value: any) => sum + countKeys(value), 0)
          }
          return 0
        }
        
        conversionResult.stats.keys = countKeys(parsed)
      }
      
      conversionResult.stats.outputSize = conversionResult.output.length
      
      // Add warnings
      if (conversionResult.stats.inputSize > 100000) {
        conversionResult.warnings.push('Input data is very large (>100KB)')
      }
      
      if (conversionMode === 'yaml-to-json' && input.includes('#')) {
        conversionResult.warnings.push('YAML comments will be lost in JSON conversion')
      }
      
      setOutput(conversionResult.output)
      setResult(conversionResult)
      
      trackToolComplete()
      
      toast({
        title: 'Conversion successful',
        description: `Converted ${conversionResult.stats.keys} keys from ${conversionMode.replace('-', ' ').toUpperCase()}`
      })
      
    } catch (error) {
      conversionResult.errors.push(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setResult(conversionResult)
      
      trackToolError()
      
      toast({
        title: 'Conversion failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const swapConversionMode = () => {
    const newMode = conversionMode === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json'
    setConversionMode(newMode)
    
    // Swap input and output if both have content
    if (input && output) {
      setInput(output)
      setOutput('')
      setResult(null)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast({
      title: 'Copied!',
      description: 'Output copied to clipboard'
    })
  }

  const downloadFile = () => {
    if (!output) return
    
    const extension = conversionMode === 'yaml-to-json' ? 'json' : 'yaml'
    const mimeType = conversionMode === 'yaml-to-json' ? 'application/json' : 'text/yaml'
    
    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: `File saved as ${extension.toUpperCase()}`
    })
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInput(content)
      toast({
        title: 'File loaded',
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      })
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setResult(null)
  }

  const loadSampleData = () => {
    if (conversionMode === 'yaml-to-json') {
      const sampleYaml = `# Sample YAML data
name: John Doe
age: 30
address:
  street: 123 Main St
  city: New York
  zipCode: "10001"
hobbies:
  - reading
  - swimming
  - coding
isActive: true
balance: 1250.50`
      setInput(sampleYaml)
    } else {
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
      setInput(sampleJson)
    }
  }

  const relatedTools = [
    { name: 'JSON Formatter', href: '/data-tools/json-formatter' },
    { name: 'CSV to JSON Converter', href: '/data-tools/csv-to-json' },
    { name: 'XML Formatter', href: '/data-tools/xml-formatter' },
    { name: 'Data Validator', href: '/data-tools/data-validator' }
  ]

  return (
    <ToolLayout
      title="YAML Converter"
      description="Convert between YAML and JSON formats with validation and formatting options."
      category="Data Tools"
      categoryHref="/data-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">YAML Converter</h1>
              <p className="text-muted-foreground">Convert between YAML and JSON formats</p>
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
                <CardTitle className="text-sm">Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Conversion Mode</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={conversionMode === 'yaml-to-json' ? 'default' : 'outline'}>
                      YAML → JSON
                    </Badge>
                    <Button variant="outline" size="sm" onClick={swapConversionMode}>
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                    <Badge variant={conversionMode === 'json-to-yaml' ? 'default' : 'outline'}>
                      JSON → YAML
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="indent">Indentation</Label>
                  <Select value={options.indentSize.toString()} onValueChange={(value) => setOptions(prev => ({ ...prev, indentSize: parseInt(value) }))}>
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
                  
                  {conversionMode === 'json-to-yaml' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-comments"
                        checked={options.includeComments}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="include-comments" className="text-sm">Include comments</Label>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button onClick={convertData} disabled={!input} className="w-full">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Convert
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
            
            {result && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    Conversion Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Input Size:</span>
                    <span>{(result.stats.inputSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Output Size:</span>
                    <span>{(result.stats.outputSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lines:</span>
                    <span>{result.stats.lines}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Keys:</span>
                    <span>{result.stats.keys}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="input" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">
                  {conversionMode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
                </TabsTrigger>
                <TabsTrigger value="output">
                  {conversionMode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="input">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{conversionMode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept={conversionMode === 'yaml-to-json' ? '.yaml,.yml,.txt' : '.json,.txt'}
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
                            Upload File
                          </label>
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Paste {conversionMode === 'yaml-to-json' ? 'YAML' : 'JSON'} data or upload a file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={conversionMode === 'yaml-to-json' ? 'name: John\nage: 30' : '{"name": "John", "age": 30}'}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="output">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{conversionMode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadFile} disabled={!output}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Converted {conversionMode === 'yaml-to-json' ? 'JSON' : 'YAML'} output
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={output}
                      readOnly
                      placeholder={`Converted ${conversionMode === 'yaml-to-json' ? 'JSON' : 'YAML'} will appear here`}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Error and Warning Messages */}
            {result && (result.errors.length > 0 || result.warnings.length > 0) && (
              <div className="space-y-2 mt-4">
                {result.errors.map((error, index) => (
                  <Alert key={`error-${index}`} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
                {result.warnings.map((warning, index) => (
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
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This converter supports basic YAML structures. Complex YAML features like 
            anchors, aliases, and multi-document files may not be fully supported. Comments in YAML will be 
            preserved when possible but lost during JSON conversion.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}