'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileJson, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye,
  Code2,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface ValidationError {
  line: number
  column: number
  message: string
}

export default function JSONFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [stats, setStats] = useState<{size: number, lines: number, keys: number} | null>(null)
  const [activeTab, setActiveTab] = useState('format')

  const formatJSON = (indent: number = 2) => {
    if (!input.trim()) {
      setOutput('')
      setIsValid(null)
      setErrors([])
      setStats(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setIsValid(true)
      setErrors([])
      
      // Calculate stats
      const lines = formatted.split('\n').length
      const size = new Blob([formatted]).size
      const keys = countKeys(parsed)
      setStats({ size, lines, keys })
    } catch (error: any) {
      setIsValid(false)
      setOutput('')
      setStats(null)
      
      // Parse error details
      const errorMessage = error.message
      const lineMatch = errorMessage.match(/line (\d+)/)
      const columnMatch = errorMessage.match(/column (\d+)/)
      
      setErrors([{
        line: lineMatch ? parseInt(lineMatch[1]) : 1,
        column: columnMatch ? parseInt(columnMatch[1]) : 1,
        message: errorMessage
      }])
    }
  }

  const minifyJSON = () => {
    if (!input.trim()) return
    
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setIsValid(true)
      setErrors([])
      
      // Calculate stats
      const size = new Blob([minified]).size
      const keys = countKeys(parsed)
      setStats({ size, lines: 1, keys })
    } catch (error: any) {
      setIsValid(false)
      setOutput('')
      setStats(null)
      setErrors([{
        line: 1,
        column: 1,
        message: error.message
      }])
    }
  }

  const validateJSON = () => {
    if (!input.trim()) {
      setIsValid(null)
      setErrors([])
      setStats(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setIsValid(true)
      setErrors([])
      
      // Calculate stats
      const size = new Blob([input]).size
      const lines = input.split('\n').length
      const keys = countKeys(parsed)
      setStats({ size, lines, keys })
    } catch (error: any) {
      setIsValid(false)
      setStats(null)
      
      const errorMessage = error.message
      const lineMatch = errorMessage.match(/line (\d+)/)
      const columnMatch = errorMessage.match(/column (\d+)/)
      
      setErrors([{
        line: lineMatch ? parseInt(lineMatch[1]) : 1,
        column: columnMatch ? parseInt(columnMatch[1]) : 1,
        message: errorMessage
      }])
    }
  }

  const countKeys = (obj: any): number => {
    let count = 0
    
    const traverse = (item: any) => {
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          item.forEach(traverse)
        } else {
          count += Object.keys(item).length
          Object.values(item).forEach(traverse)
        }
      }
    }
    
    traverse(obj)
    return count
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadSampleJSON = () => {
    const sample = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001",
        "country": "USA"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "metadata": {
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "version": 1.2
      }
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setIsValid(null)
    setErrors([])
    setStats(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            JSON Formatter & Validator
          </h1>
          <p className="text-lg text-gray-600">
            Format, validate, and beautify JSON data with syntax highlighting and error detection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => formatJSON(2)} className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Format (2 spaces)
          </Button>
          <Button onClick={() => formatJSON(4)} variant="outline" className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Format (4 spaces)
          </Button>
          <Button onClick={minifyJSON} variant="outline" className="flex items-center gap-2">
            <Minimize2 className="h-4 w-4" />
            Minify
          </Button>
          <Button onClick={validateJSON} variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validate
          </Button>
          <Button onClick={loadSampleJSON} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Load Sample
          </Button>
          <Button onClick={clearAll} variant="outline" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Status Bar */}
        {(isValid !== null || stats) && (
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {isValid !== null && (
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Valid JSON
                    </Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Invalid JSON
                    </Badge>
                  </>
                )}
              </div>
            )}
            
            {stats && (
              <>
                <div className="text-sm text-gray-600">
                  Size: <span className="font-medium">{formatFileSize(stats.size)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Lines: <span className="font-medium">{stats.lines}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Keys: <span className="font-medium">{stats.keys}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>
                    <strong>Line {error.line}, Column {error.column}:</strong> {error.message}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Input JSON
              </CardTitle>
              <CardDescription>
                Paste your JSON data here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Formatted Output
                </div>
                {output && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(output)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadJSON(output, 'formatted.json')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Formatted and validated JSON output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted JSON will appear here..."
                className="min-h-[400px] font-mono text-sm bg-gray-50"
              />
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>JSON Formatter Features</CardTitle>
            <CardDescription>
              Everything you need for JSON processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Code2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Format & Beautify</h3>
                <p className="text-sm text-gray-600">
                  Automatically format JSON with proper indentation and structure.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Validate & Debug</h3>
                <p className="text-sm text-gray-600">
                  Detect syntax errors with precise line and column information.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Minimize2 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Minify & Compress</h3>
                <p className="text-sm text-gray-600">
                  Remove whitespace and reduce file size for production use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>JSON Tips & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Common JSON Errors:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Missing quotes around property names</li>
                  <li>• Trailing commas after last property</li>
                  <li>• Single quotes instead of double quotes</li>
                  <li>• Unescaped special characters</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Best Practices:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use consistent indentation (2 or 4 spaces)</li>
                  <li>• Keep property names descriptive</li>
                  <li>• Validate before using in production</li>
                  <li>• Minify for better performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Placeholder */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </div>
    </div>
  )
}