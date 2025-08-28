'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowUpDown, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  FileText,
  Image,
  Code2,
  Eye,
  EyeOff
} from 'lucide-react'

interface FileInfo {
  name: string
  size: number
  type: string
  content: string
}

export default function Base64Page() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isValidBase64, setIsValidBase64] = useState<boolean | null>(null)

  useEffect(() => {
    processText()
  }, [inputText, mode])

  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('')
      setError(null)
      setIsValidBase64(null)
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)))
        setOutputText(encoded)
        setError(null)
        setIsValidBase64(null)
      } else {
        // Validate Base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
        const isValid = base64Regex.test(inputText.replace(/\s/g, ''))
        setIsValidBase64(isValid)
        
        if (isValid) {
          const decoded = decodeURIComponent(escape(atob(inputText.replace(/\s/g, ''))))
          setOutputText(decoded)
          setError(null)
        } else {
          setError('Invalid Base64 format')
          setOutputText('')
        }
      }
    } catch (err) {
      setError((err as Error).message)
      setOutputText('')
      setIsValidBase64(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.xml')) {
          // Text file
          setInputText(result)
          setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content: result
          })
        } else {
          // Binary file - convert to base64
          const base64 = result.split(',')[1] // Remove data:mime;base64, prefix
          setInputText(base64)
          setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            content: base64
          })
          setMode('decode')
        }
      }
    }

    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.xml')) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResult = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAsFile = () => {
    if (mode === 'decode' && fileInfo) {
      try {
        const binaryString = atob(inputText.replace(/\s/g, ''))
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: fileInfo.type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileInfo.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Failed to download file:', err)
      }
    }
  }

  const loadSampleData = () => {
    const samples = {
      encode: 'Hello, World! This is a sample text for Base64 encoding.\n\nSpecial characters: áéíóú ñ 中文 🚀',
      decode: 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4KClNwZWNpYWwgY2hhcmFjdGVyczogw6HDqcOtw7PDuiDDsSDkuK3mlociuJDwn5qA'
    }
    setInputText(samples[mode])
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setError(null)
    setFileInfo(null)
    setIsValidBase64(null)
  }

  const switchMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    
    // Swap input and output if both have content
    if (inputText && outputText && !error) {
      setInputText(outputText)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImagePreviewable = (type: string) => {
    return type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(type)
  }

  const getDataUrl = () => {
    if (mode === 'decode' && fileInfo && isImagePreviewable(fileInfo.type)) {
      return `data:${fileInfo.type};base64,${inputText.replace(/\s/g, '')}`
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Base64 Encoder & Decoder
          </h1>
          <p className="text-lg text-gray-600">
            Encode and decode text or files to/from Base64 format with support for binary files.
          </p>
        </div>

        {/* Mode Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Mode Selection
              </div>
              <Button onClick={switchMode} variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Switch Mode
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encode" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Encode
                </TabsTrigger>
                <TabsTrigger value="decode" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Decode
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
            <CardDescription>
              Upload a file to {mode === 'encode' ? 'encode to' : 'decode from'} Base64
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {fileInfo && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {fileInfo.type.startsWith('image/') ? <Image className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                      {fileInfo.name}
                    </Badge>
                    <span className="text-sm text-gray-600">{formatBytes(fileInfo.size)}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Type:</strong> {fileInfo.type || 'Unknown'}
                  </div>
                  
                  {mode === 'decode' && isImagePreviewable(fileInfo.type) && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                      
                      {showPreview && getDataUrl() && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <img 
                            src={getDataUrl()!} 
                            alt="Preview" 
                            className="max-w-full max-h-64 object-contain mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {(error || isValidBase64 !== null) && (
          <div className="mb-6">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : mode === 'decode' && isValidBase64 !== null ? (
              <Alert className={isValidBase64 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {isValidBase64 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={isValidBase64 ? "text-green-800" : "text-red-800"}>
                  {isValidBase64 ? 'Valid Base64 format' : 'Invalid Base64 format'}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mode === 'encode' ? <FileText className="h-5 w-5" /> : <Code2 className="h-5 w-5" />}
                  {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadSampleData}
                >
                  Load Sample
                </Button>
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Enter text to encode to Base64' 
                  : 'Enter Base64 string to decode'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'encode' 
                    ? 'Enter your text here...' 
                    : 'Enter Base64 string here...'
                  }
                  className={`min-h-[300px] ${mode === 'decode' ? 'font-mono' : ''} text-sm`}
                />
                
                {inputText && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Characters: {inputText.length}</span>
                    <span>Bytes: {new Blob([inputText]).size}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === 'encode' ? <Code2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Base64 encoded result' 
                  : 'Decoded text result'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={outputText}
                  readOnly
                  className={`min-h-[300px] ${mode === 'encode' ? 'font-mono' : ''} text-sm bg-gray-50`}
                  placeholder="Result will appear here..."
                />
                
                {outputText && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Characters: {outputText.length}</span>
                    <span>Bytes: {new Blob([outputText]).size}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            onClick={() => copyToClipboard(outputText)} 
            disabled={!outputText}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Result
          </Button>
          
          <Button 
            onClick={downloadResult} 
            disabled={!outputText}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as Text
          </Button>
          
          {mode === 'decode' && fileInfo && (
            <Button 
              onClick={downloadAsFile} 
              disabled={!outputText || !!error}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as {fileInfo.name}
            </Button>
          )}
          
          <Button onClick={clearAll} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Info Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Base64</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">What is Base64?</h4>
                <p className="text-gray-600 mb-4">
                  Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format. 
                  It's commonly used for encoding data in email, web pages, and APIs.
                </p>
                
                <h4 className="font-semibold mb-2">Common Use Cases:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Email attachments</li>
                  <li>• Data URLs for images</li>
                  <li>• API authentication tokens</li>
                  <li>• Storing binary data in text formats</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Character Set:</h4>
                <p className="text-gray-600 mb-4">
                  Base64 uses 64 characters: A-Z, a-z, 0-9, +, / and = for padding.
                </p>
                
                <h4 className="font-semibold mb-2">Size Increase:</h4>
                <p className="text-gray-600">
                  Base64 encoding increases the size by approximately 33% due to the encoding overhead.
                </p>
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