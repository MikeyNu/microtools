'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  Maximize2,
} from 'lucide-react'

interface ValidationError {
  line: number
  column: number
  message: string
}

export function JSONFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [stats, setStats] = useState<{ size: number; lines: number; keys: number } | null>(null)

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
      const lines = formatted.split('\n').length
      const size = new Blob([formatted]).size
      const keys = countKeys(parsed)
      setStats({ size, lines, keys })
    } catch (error: any) {
      setIsValid(false)
      setOutput('')
      setStats(null)
      const errorMessage = error.message
      const lineMatch = errorMessage.match(/line (\d+)/)
      const columnMatch = errorMessage.match(/column (\d+)/)
      setErrors([{
        line: lineMatch ? parseInt(lineMatch[1]) : 1,
        column: columnMatch ? parseInt(columnMatch[1]) : 1,
        message: errorMessage,
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
      const size = new Blob([minified]).size
      const keys = countKeys(parsed)
      setStats({ size, lines: 1, keys })
    } catch (error: any) {
      setIsValid(false)
      setOutput('')
      setStats(null)
      setErrors([{ line: 1, column: 1, message: error.message }])
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
        message: errorMessage,
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
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        country: 'USA',
      },
      hobbies: ['reading', 'swimming', 'coding'],
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      metadata: {
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        version: 1.2,
      },
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
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => formatJSON(2)} size="sm" className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5" />
          Format (2 spaces)
        </Button>
        <Button onClick={() => formatJSON(4)} size="sm" variant="outline" className="flex items-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5" />
          Format (4 spaces)
        </Button>
        <Button onClick={minifyJSON} size="sm" variant="outline" className="flex items-center gap-1.5">
          <Minimize2 className="h-3.5 w-3.5" />
          Minify
        </Button>
        <Button onClick={validateJSON} size="sm" variant="outline" className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" />
          Validate
        </Button>
        <Button onClick={loadSampleJSON} size="sm" variant="outline" className="flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          Sample
        </Button>
        <Button onClick={clearAll} size="sm" variant="outline" className="flex items-center gap-1.5 text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      {/* Status Bar */}
      {(isValid !== null || stats) && (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-card border border-border rounded-md">
          {isValid !== null && (
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 font-mono text-xs">
                    Valid JSON
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 font-mono text-xs">
                    Invalid JSON
                  </Badge>
                </>
              )}
            </div>
          )}
          {stats && (
            <>
              <span className="text-xs text-muted-foreground font-mono">
                {formatFileSize(stats.size)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stats.lines} lines
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stats.keys} keys
              </span>
            </>
          )}
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1 font-mono text-xs">
              {errors.map((error, index) => (
                <div key={index}>
                  <strong>Line {error.line}, Col {error.column}:</strong> {error.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="font-mono text-sm font-semibold flex items-center gap-2">
              <FileJson className="h-4 w-4 text-accent" />
              Input
            </CardTitle>
            <CardDescription className="text-xs">Paste your JSON here</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="min-h-[360px] font-mono text-sm resize-y bg-background border-border"
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="font-mono text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-accent" />
                Output
              </div>
              {output && (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyToClipboard(output)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => downloadJSON(output, 'formatted.json')}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-xs">Formatted output</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="min-h-[360px] font-mono text-sm resize-y bg-muted/30 border-border text-foreground"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="font-mono text-sm font-semibold">Common JSON errors</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">To watch for</p>
              <ul className="space-y-1">
                {[
                  'Missing quotes around property names',
                  'Trailing commas after last property',
                  'Single quotes instead of double quotes',
                  'Unescaped special characters in strings',
                ].map((tip) => (
                  <li key={tip} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">—</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Best practices</p>
              <ul className="space-y-1">
                {[
                  'Use consistent indentation (2 or 4 spaces)',
                  'Keep property names descriptive',
                  'Validate before using in production',
                  'Minify for better transfer performance',
                ].map((tip) => (
                  <li key={tip} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">—</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
