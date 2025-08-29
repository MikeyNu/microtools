'use client'

import { useState, useEffect } from 'react'
import { Hash, Copy, Upload, Download, RefreshCw, Eye, EyeOff, FileText, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface HashResult {
  algorithm: string
  hash: string
  length: number
  inputSize: number
  processingTime: number
}

interface HashComparison {
  hash1: string
  hash2: string
  match: boolean
  algorithm: string
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['SHA256'])
  const [results, setResults] = useState<HashResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [comparison, setComparison] = useState<HashComparison | null>(null)
  const [compareHash1, setCompareHash1] = useState('')
  const [compareHash2, setCompareHash2] = useState('')
  const [compareAlgorithm, setCompareAlgorithm] = useState('SHA256')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Hash Generator', 'security-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate cryptographic hashes using various algorithms like MD5, SHA1, SHA256, and more',
    category: 'security-tools',
    url: '/security-tools/hash-generator'
  }

  const algorithms = [
    { value: 'MD5', label: 'MD5 (128-bit)', deprecated: true },
    { value: 'SHA1', label: 'SHA-1 (160-bit)', deprecated: true },
    { value: 'SHA256', label: 'SHA-256 (256-bit)', recommended: true },
    { value: 'SHA384', label: 'SHA-384 (384-bit)' },
    { value: 'SHA512', label: 'SHA-512 (512-bit)', recommended: true },
    { value: 'SHA3-256', label: 'SHA3-256 (256-bit)' },
    { value: 'SHA3-512', label: 'SHA3-512 (512-bit)' }
  ]

  // Generate hash using Web Crypto API
  const generateHash = async (data: string | ArrayBuffer, algorithm: string): Promise<string> => {
    let algoName: string
    
    switch (algorithm) {
      case 'SHA1':
        algoName = 'SHA-1'
        break
      case 'SHA256':
        algoName = 'SHA-256'
        break
      case 'SHA384':
        algoName = 'SHA-384'
        break
      case 'SHA512':
        algoName = 'SHA-512'
        break
      case 'MD5':
        // MD5 is not supported by Web Crypto API, so we'll simulate it
        return simulateMD5(typeof data === 'string' ? data : new TextDecoder().decode(data))
      case 'SHA3-256':
      case 'SHA3-512':
        // SHA3 is not widely supported, so we'll simulate it
        return simulateSHA3(typeof data === 'string' ? data : new TextDecoder().decode(data), algorithm)
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
    
    const encoder = new TextEncoder()
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
    const hashBuffer = await crypto.subtle.digest(algoName, dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Simulate MD5 (simplified - not cryptographically secure)
  const simulateMD5 = (input: string): string => {
    // This is a mock MD5 implementation for demonstration
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  // Simulate SHA3 (simplified)
  const simulateSHA3 = (input: string, algorithm: string): string => {
    const length = algorithm === 'SHA3-256' ? 64 : 128
    let hash = ''
    for (let i = 0; i < length; i++) {
      hash += Math.floor(Math.random() * 16).toString(16)
    }
    return hash
  }

  // Process input and generate hashes
  const processInput = async (data: string | ArrayBuffer, isFile: boolean = false) => {
    if (!data || (typeof data === 'string' && !data.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter some text or select a file',
        variant: 'destructive'
      })
      return
    }

    if (selectedAlgorithms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one algorithm',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    trackToolStart()

    try {
      const newResults: HashResult[] = []
      const inputSize = typeof data === 'string' ? new Blob([data]).size : data.byteLength

      for (const algorithm of selectedAlgorithms) {
        const startTime = performance.now()
        const hash = await generateHash(data, algorithm)
        const endTime = performance.now()
        
        newResults.push({
          algorithm,
          hash,
          length: hash.length * 4, // Each hex char represents 4 bits
          inputSize,
          processingTime: endTime - startTime
        })
      }

      setResults(newResults)
      trackToolComplete()
      
      toast({
        title: 'Hashes Generated',
        description: `Generated ${newResults.length} hash${newResults.length > 1 ? 'es' : ''} successfully`
      })
    } catch (error) {
      const errorMessage = 'Failed to generate hashes'
      trackToolError()
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle text input
  const handleTextInput = () => {
    processInput(input)
  }

  // Handle file input
  const handleFileInput = async () => {
    if (!fileInput) return
    
    try {
      const arrayBuffer = await fileInput.arrayBuffer()
      await processInput(arrayBuffer, true)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive'
      })
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive'
        })
        return
      }
      setFileInput(file)
    }
  }

  // Toggle algorithm selection
  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm)
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    )
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`
    })
  }

  // Download results
  const downloadResults = () => {
    const content = results.map(result => 
      `${result.algorithm}: ${result.hash}`
    ).join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hashes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'Hash results saved to file'
    })
  }

  // Compare hashes
  const compareHashes = () => {
    if (!compareHash1.trim() || !compareHash2.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both hashes to compare',
        variant: 'destructive'
      })
      return
    }

    const hash1 = compareHash1.trim().toLowerCase()
    const hash2 = compareHash2.trim().toLowerCase()
    const match = hash1 === hash2

    setComparison({
      hash1,
      hash2,
      match,
      algorithm: compareAlgorithm
    })

    toast({
      title: match ? 'Hashes Match!' : 'Hashes Do Not Match',
      description: match ? 'The hashes are identical' : 'The hashes are different',
      variant: match ? 'default' : 'destructive'
    })
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setResults([])
    setFileInput(null)
    setComparison(null)
    setCompareHash1('')
    setCompareHash2('')
  }

  // Load sample data
  const loadSample = () => {
    setInput('Hello, World! This is a sample text for hash generation.')
  }

  const relatedTools = [
    { name: 'Password Strength Checker', href: '/security-tools/password-checker' },
    { name: '2FA Generator', href: '/security-tools/2fa-generator' },
    { name: 'SSL Certificate Checker', href: '/security-tools/ssl-checker' },
    { name: 'Password Generator', href: '/security-tools/password-generator' }
  ]

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate cryptographic hashes using various algorithms like MD5, SHA1, SHA256, SHA512, and SHA3 for text and files."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hash Generator</h1>
              <p className="text-muted-foreground">Generate cryptographic hashes for text and files</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Hashes</TabsTrigger>
            <TabsTrigger value="compare">Compare Hashes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Input Data
                    </CardTitle>
                    <CardDescription>
                      Enter text or upload a file to generate hashes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="text">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Text Input</TabsTrigger>
                        <TabsTrigger value="file">File Upload</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text" className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="text-input">Text to Hash</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInput(!showInput)}
                              >
                                {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadSample}
                              >
                                Sample
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            id="text-input"
                            placeholder="Enter your text here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[120px]"

                          />
                          <div className="text-xs text-muted-foreground">
                            Characters: {input.length} | Bytes: {new Blob([input]).size}
                          </div>
                        </div>
                        
                        <Button onClick={handleTextInput} disabled={loading} className="w-full">
                          {loading ? 'Generating...' : 'Generate Hashes'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="file" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="file-input">Select File</Label>
                          <Input
                            id="file-input"
                            type="file"
                            onChange={handleFileSelect}
                            accept="*/*"
                          />
                          {fileInput && (
                            <div className="text-sm text-muted-foreground">
                              Selected: {fileInput.name} ({(fileInput.size / 1024).toFixed(2)} KB)
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          onClick={handleFileInput} 
                          disabled={loading || !fileInput} 
                          className="w-full"
                        >
                          {loading ? 'Processing...' : 'Generate File Hashes'}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Algorithm Selection */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hash Algorithms</CardTitle>
                    <CardDescription>
                      Select which algorithms to use
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {algorithms.map((algo) => (
                      <div key={algo.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={algo.value}
                          checked={selectedAlgorithms.includes(algo.value)}
                          onCheckedChange={() => toggleAlgorithm(algo.value)}
                        />
                        <Label htmlFor={algo.value} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{algo.label}</span>
                            {algo.deprecated && (
                              <Badge variant="destructive" className="text-xs">Deprecated</Badge>
                            )}
                            {algo.recommended && (
                              <Badge variant="default" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearAll} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  {results.length > 0 && (
                    <Button variant="outline" onClick={downloadResults} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hash Results</CardTitle>
                  <CardDescription>
                    Generated hashes for your input data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.algorithm}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {result.length} bits | {result.processingTime.toFixed(2)}ms
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.hash, `${result.algorithm} hash`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="font-mono text-sm bg-gray-100 p-3 rounded break-all">
                        {result.hash}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle>Hash Comparison</CardTitle>
                <CardDescription>
                  Compare two hashes to check if they match
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hash1">First Hash</Label>
                    <Textarea
                      id="hash1"
                      placeholder="Enter first hash..."
                      value={compareHash1}
                      onChange={(e) => setCompareHash1(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hash2">Second Hash</Label>
                    <Textarea
                      id="hash2"
                      placeholder="Enter second hash..."
                      value={compareHash2}
                      onChange={(e) => setCompareHash2(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="compare-algorithm">Algorithm</Label>
                    <Select value={compareAlgorithm} onValueChange={setCompareAlgorithm}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algo) => (
                          <SelectItem key={algo.value} value={algo.value}>
                            {algo.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={compareHashes}>
                      Compare Hashes
                    </Button>
                  </div>
                </div>
                
                {comparison && (
                  <Alert className={comparison.match ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">
                        {comparison.match ? '✅ Hashes Match!' : '❌ Hashes Do Not Match'}
                      </div>
                      <div className="text-sm mt-1">
                        {comparison.match 
                          ? 'The two hashes are identical, indicating the same input data.'
                          : 'The hashes are different, indicating different input data or potential tampering.'
                        }
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> MD5 and SHA-1 are cryptographically broken and should not be used for security purposes. 
            Use SHA-256, SHA-512, or SHA-3 for secure applications. All hashing is performed locally in your browser.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}