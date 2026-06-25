'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Hash,
  Copy,
  Download,
  Upload,
  FileText,
  Shield,
  Key,
  Trash2,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { ToolLayout } from "@/components/tool-layout"
import { generateHashHex, type HashAlgorithm as RealHashAlgorithm } from '@/lib/hash-utils'

interface HashResult {
  algorithm: string
  hash: string
  length: number
}

interface HashAlgorithm {
  name: string
  description: string
  outputLength: number
  commonUse: string
}

const algorithms: { [key: string]: HashAlgorithm } = {
  md5: {
    name: 'MD5',
    description: 'Message Digest Algorithm 5',
    outputLength: 32,
    commonUse: 'File integrity, checksums (deprecated for security)'
  },
  sha1: {
    name: 'SHA-1',
    description: 'Secure Hash Algorithm 1',
    outputLength: 40,
    commonUse: 'Git commits, legacy systems (deprecated for security)'
  },
  sha256: {
    name: 'SHA-256',
    description: 'Secure Hash Algorithm 256-bit',
    outputLength: 64,
    commonUse: 'Bitcoin, SSL certificates, password hashing'
  },
  sha512: {
    name: 'SHA-512',
    description: 'Secure Hash Algorithm 512-bit',
    outputLength: 128,
    commonUse: 'High-security applications, password hashing'
  },
  crc32: {
    name: 'CRC32',
    description: 'Cyclic Redundancy Check 32-bit',
    outputLength: 8,
    commonUse: 'Error detection, file verification'
  }
}

const algorithmMap: Record<string, RealHashAlgorithm> = {
  md5: 'MD5',
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
  crc32: 'CRC32',
}

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256')
  const [results, setResults] = useState<HashResult[]>([])
  const [generateAll, setGenerateAll] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)

  useEffect(() => {
    generateHashes()
  }, [inputText, selectedAlgorithm, generateAll])

  const generateHashes = async () => {
    if (!inputText.trim()) {
      setResults([])
      return
    }

    const newResults: HashResult[] = []

    if (generateAll) {
      const allResults = await Promise.all(Object.keys(algorithms).map(async (algo) => {
        const hash = await generateHash(inputText, algo)
        return {
          algorithm: algo,
          hash,
          length: hash.length
        }
      }))
      newResults.push(...allResults)
    } else {
      const hash = await generateHash(inputText, selectedAlgorithm)
      newResults.push({
        algorithm: selectedAlgorithm,
        hash,
        length: hash.length
      })
    }

    setResults(newResults)
  }

  const generateHash = async (text: string, algorithm: string): Promise<string> => {
    const mapped = algorithmMap[algorithm]
    if (!mapped) return ''
    return generateHashHex(text, mapped)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        const hashJobs = generateAll ? Object.keys(algorithms) : [selectedAlgorithm]
        const hashed = await Promise.all(hashJobs.map(async (algo) => {
          const hash = await generateHashHex(result, algorithmMap[algo])
          return {
            algorithm: algo,
            hash,
            length: hash.length
          }
        }))
        setResults(hashed)
        setInputText('')
        setFileInfo({
          name: file.name,
          size: file.size
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResults = () => {
    const content = results.map(result =>
      `${algorithms[result.algorithm].name}: ${result.hash}`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hash-results.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleText = () => {
    const sample = 'Hello, World! This is a sample text for hash generation.\n\nHash functions are mathematical algorithms that transform input data into fixed-size strings.'
    setInputText(sample)
  }

  const clearAll = () => {
    setInputText('')
    setResults([])
    setFileInfo(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSecurityLevel = (algorithm: string) => {
    switch (algorithm) {
      case 'md5':
      case 'sha1':
        return { level: 'Low', color: 'bg-destructive/10 text-destructive', description: 'Deprecated for security' }
      case 'crc32':
        return { level: 'None', color: 'bg-muted text-foreground', description: 'Error detection only' }
      case 'sha256':
        return { level: 'High', color: 'bg-success/10 text-success', description: 'Cryptographically secure' }
      case 'sha512':
        return { level: 'Very High', color: 'bg-muted/50 text-foreground', description: 'Maximum security' }
      default:
        return { level: 'Unknown', color: 'bg-muted text-foreground', description: '' }
    }
  }

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes"
      category="Developer Tools"
      categoryHref="/developer-tools"
    >
      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Configuration
          </CardTitle>
          <CardDescription>
            Select hash algorithm and generation options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Hash Algorithm:
              </label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} disabled={generateAll}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(algorithms).map(([key, algo]) => (
                    <SelectItem key={key} value={key}>
                      {algo.name} ({algo.outputLength} chars)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={generateAll ? "default" : "outline"}
                onClick={() => setGenerateAll(!generateAll)}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {generateAll ? 'Generate All Hashes' : 'Generate Single Hash'}
              </Button>
            </div>
          </div>
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
            Upload a text file to generate its hash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.json,.xml,.csv,.log"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-muted/50 file:text-muted-foreground hover:file:bg-muted/50"
            />

            {fileInfo && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{fileInfo.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatBytes(fileInfo.size)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadSampleText}
            >
              Load Sample
            </Button>
          </CardTitle>
          <CardDescription>
            Enter text to generate hash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[200px] font-mono text-sm"
            />

            {inputText && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Characters: {inputText.length}</span>
                <span>Bytes: {new Blob([inputText]).size}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Hash Results
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardTitle>
            <CardDescription>
              Generated hash values for your input
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => {
                const algo = algorithms[result.algorithm]
                const security = getSecurityLevel(result.algorithm)

                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-mono">
                          {algo.name}
                        </Badge>
                        <Badge className={security.color}>
                          {security.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.length} characters
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result.hash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-muted/50 rounded border font-mono text-sm break-all">
                        {result.hash}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div><strong>Description:</strong> {algo.description}</div>
                        <div><strong>Common Use:</strong> {algo.commonUse}</div>
                        {security.description && (
                          <div><strong>Security:</strong> {security.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Algorithm Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Algorithm Comparison
          </CardTitle>
          <CardDescription>
            Compare different hash algorithms and their characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Algorithm</th>
                  <th className="text-left p-2">Output Length</th>
                  <th className="text-left p-2">Security Level</th>
                  <th className="text-left p-2">Speed</th>
                  <th className="text-left p-2">Common Use Cases</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(algorithms).map(([key, algo]) => {
                  const security = getSecurityLevel(key)
                  const speed = key === 'crc32' ? 'Very Fast' : key === 'md5' ? 'Fast' : key === 'sha1' ? 'Fast' : key === 'sha256' ? 'Medium' : 'Slow'

                  return (
                    <tr key={key} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{algo.name}</td>
                      <td className="p-2 font-mono">{algo.outputLength} chars</td>
                      <td className="p-2">
                        <Badge className={security.color + ' text-xs'}>
                          {security.level}
                        </Badge>
                      </td>
                      <td className="p-2">{speed}</td>
                      <td className="p-2 text-muted-foreground">{algo.commonUse}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={clearAll} variant="outline">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Info Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About Hash Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What are Hash Functions?</h4>
              <p className="text-muted-foreground mb-4">
                Hash functions are mathematical algorithms that transform input data of any size
                into fixed-size strings. They are deterministic, meaning the same input always
                produces the same output.
              </p>

              <h4 className="font-semibold mb-2">Key Properties:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Deterministic output</li>
                <li>• Fixed output size</li>
                <li>• Fast computation</li>
                <li>• Avalanche effect (small input changes = large output changes)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Security Considerations:</h4>
              <ul className="text-muted-foreground space-y-1 mb-4">
                <li>• <strong>MD5 & SHA-1:</strong> Deprecated for security use</li>
                <li>• <strong>SHA-256:</strong> Current standard for most applications</li>
                <li>• <strong>SHA-512:</strong> Higher security for sensitive data</li>
                <li>• <strong>CRC32:</strong> Error detection only, not cryptographic</li>
              </ul>

              <h4 className="font-semibold mb-2">Common Applications:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• File integrity verification</li>
                <li>• Password storage (with salt)</li>
                <li>• Digital signatures</li>
                <li>• Blockchain and cryptocurrencies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AdSense Placeholder */}
      <div className="bg-muted border-2 border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Advertisement Space</p>
      </div>
    </ToolLayout>
  )
}
