'use client'

import { useState, useCallback } from 'react'
import { FileText, Download, Upload, Settings, Copy, Trash2, Eye, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface ConversionOptions {
  delimiter: string
  hasHeader: boolean
  skipEmptyLines: boolean
  trimWhitespace: boolean
  customHeaders: string[]
  outputFormat: 'array' | 'object'
}

interface ConversionResult {
  json: string
  rowCount: number
  columnCount: number
  errors: string[]
  warnings: string[]
}

export default function CsvToJsonPage() {
  const [csvInput, setCsvInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true,
    trimWhitespace: true,
    customHeaders: [],
    outputFormat: 'array'
  })
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('CSV to JSON Converter', 'data-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'csv-to-json',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV files to JSON format with customizable options',
    category: 'data-tools',
    url: '/data-tools/csv-to-json'
  }

  const parseCSV = (csvText: string, opts: ConversionOptions): ConversionResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!csvText.trim()) {
      errors.push('CSV input is empty')
      return { json: '', rowCount: 0, columnCount: 0, errors, warnings }
    }

    try {
      const lines = csvText.split('\n')
      const filteredLines = opts.skipEmptyLines ? lines.filter(line => line.trim()) : lines
      
      if (filteredLines.length === 0) {
        errors.push('No valid data rows found')
        return { json: '', rowCount: 0, columnCount: 0, errors, warnings }
      }

      // Parse CSV with proper handling of quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        let i = 0
        
        while (i < line.length) {
          const char = line[i]
          const nextChar = line[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"'
              i += 2
            } else {
              // Toggle quote state
              inQuotes = !inQuotes
              i++
            }
          } else if (char === opts.delimiter && !inQuotes) {
            // Field separator
            result.push(opts.trimWhitespace ? current.trim() : current)
            current = ''
            i++
          } else {
            current += char
            i++
          }
        }
        
        // Add the last field
        result.push(opts.trimWhitespace ? current.trim() : current)
        return result
      }

      const rows = filteredLines.map(line => parseCSVLine(line))
      
      if (rows.length === 0) {
        errors.push('No data rows to process')
        return { json: '', rowCount: 0, columnCount: 0, errors, warnings }
      }

      let headers: string[]
      let dataRows: string[][]
      
      if (opts.hasHeader && rows.length > 0) {
        headers = rows[0]
        dataRows = rows.slice(1)
      } else if (opts.customHeaders.length > 0) {
        headers = opts.customHeaders
        dataRows = rows
      } else {
        // Generate default headers
        const maxColumns = Math.max(...rows.map(row => row.length))
        headers = Array.from({ length: maxColumns }, (_, i) => `column_${i + 1}`)
        dataRows = rows
      }

      // Validate data consistency
      const expectedColumns = headers.length
      dataRows.forEach((row, index) => {
        if (row.length !== expectedColumns) {
          warnings.push(`Row ${index + 1} has ${row.length} columns, expected ${expectedColumns}`)
        }
      })

      // Convert to JSON
      let jsonData: any
      
      if (opts.outputFormat === 'object') {
        // Convert to array of objects
        jsonData = dataRows.map(row => {
          const obj: { [key: string]: string } = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ''
          })
          return obj
        })
      } else {
        // Keep as array format
        jsonData = [headers, ...dataRows]
      }

      const jsonString = JSON.stringify(jsonData, null, 2)
      
      return {
        json: jsonString,
        rowCount: dataRows.length,
        columnCount: headers.length,
        errors,
        warnings
      }
    } catch (error) {
      errors.push(`Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { json: '', rowCount: 0, columnCount: 0, errors, warnings }
    }
  }

  const convertToJson = () => {
    if (!csvInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter CSV data to convert',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    trackToolStart()

    try {
      const conversionResult = parseCSV(csvInput, options)
      setResult(conversionResult)
      setJsonOutput(conversionResult.json)
      
      if (conversionResult.errors.length > 0) {
        trackToolError()
        toast({
          title: 'Conversion completed with errors',
          description: `${conversionResult.errors.length} error(s) found`,
          variant: 'destructive'
        })
      } else {
        trackToolComplete()
        toast({
          title: 'Conversion successful',
          description: `Converted ${conversionResult.rowCount} rows to JSON`
        })
      }
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to convert CSV to JSON',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvInput(content)
      toast({
        title: 'File loaded',
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      })
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => 
      file.type === 'text/csv' || 
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/plain'
    )
    
    if (csvFile) {
      handleFileUpload(csvFile)
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      })
    }
  }, [handleFileUpload, toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

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
    a.download = 'converted-data.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'JSON file saved successfully'
    })
  }

  const clearAll = () => {
    setCsvInput('')
    setJsonOutput('')
    setResult(null)
  }

  const loadSampleData = () => {
    const sampleCSV = `name,age,city,country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Toronto,Canada
Alice Brown,28,Sydney,Australia`
    setCsvInput(sampleCSV)
  }

  const relatedTools = [
    { name: 'JSON Formatter', href: '/data-tools/json-formatter' },
    { name: 'XML Formatter', href: '/data-tools/xml-formatter' },
    { name: 'YAML Converter', href: '/data-tools/yaml-converter' },
    { name: 'Data Validator', href: '/data-tools/data-validator' }
  ]

  return (
    <ToolLayout
      title="CSV to JSON Converter"
      description="Convert CSV files to JSON format with customizable parsing options and validation."
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
              <h1 className="text-2xl font-bold">CSV to JSON Converter</h1>
              <p className="text-muted-foreground">Convert CSV data to JSON format</p>
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
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Conversion Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Select value={options.delimiter} onValueChange={(value) => setOptions(prev => ({ ...prev, delimiter: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="\t">Tab</SelectItem>
                      <SelectItem value="|">Pipe (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select value={options.outputFormat} onValueChange={(value: 'array' | 'object') => setOptions(prev => ({ ...prev, outputFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="array">Array of Arrays</SelectItem>
                      <SelectItem value="object">Array of Objects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="has-header" 
                      checked={options.hasHeader}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, hasHeader: !!checked }))}
                    />
                    <Label htmlFor="has-header" className="text-sm">First row is header</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="skip-empty" 
                      checked={options.skipEmptyLines}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, skipEmptyLines: !!checked }))}
                    />
                    <Label htmlFor="skip-empty" className="text-sm">Skip empty lines</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="trim-whitespace" 
                      checked={options.trimWhitespace}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, trimWhitespace: !!checked }))}
                    />
                    <Label htmlFor="trim-whitespace" className="text-sm">Trim whitespace</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={convertToJson} disabled={loading || !csvInput} className="w-full">
                    {loading ? 'Converting...' : 'Convert to JSON'}
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
                  <CardTitle className="text-sm">Conversion Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rows:</span>
                    <Badge variant="outline">{result.rowCount}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Columns:</span>
                    <Badge variant="outline">{result.columnCount}</Badge>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Errors:</span>
                      <Badge variant="destructive">{result.errors.length}</Badge>
                    </div>
                  )}
                  {result.warnings.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Warnings:</span>
                      <Badge variant="secondary">{result.warnings.length}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="input" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">CSV Input</TabsTrigger>
                <TabsTrigger value="output">JSON Output</TabsTrigger>
              </TabsList>
              
              <TabsContent value="input">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>CSV Input</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".csv,.txt"
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
                            Upload CSV
                          </label>
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Paste CSV data or drag and drop a CSV file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`relative ${
                        dragActive ? 'border-2 border-dashed border-purple-500 bg-purple-50' : ''
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Textarea
                        placeholder="name,age,city\nJohn,30,New York\nJane,25,London"
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                      {dragActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-50/90 border-2 border-dashed border-purple-500 rounded">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <p className="text-purple-700 font-medium">Drop CSV file here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="output">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>JSON Output</span>
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
                      Converted JSON data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={jsonOutput}
                      readOnly
                      placeholder="JSON output will appear here after conversion"
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
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
                {result.warnings.map((warning, index) => (
                  <Alert key={`warning-${index}`}>
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
            <strong>Tip:</strong> Use "Array of Objects" format for easier data manipulation in JavaScript. 
            The tool handles quoted fields, escaped quotes, and various delimiters automatically.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}