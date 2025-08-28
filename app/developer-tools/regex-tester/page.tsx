'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye,
  Code2,
  BookOpen,
  Target
} from 'lucide-react'

interface Match {
  match: string
  index: number
  groups: string[]
  namedGroups: { [key: string]: string }
}

interface RegexFlag {
  key: string
  label: string
  description: string
  enabled: boolean
}

const commonPatterns = [
  {
    name: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Validates email addresses'
  },
  {
    name: 'Phone Number (US)',
    pattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    description: 'Matches US phone numbers'
  },
  {
    name: 'URL',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: 'Validates HTTP/HTTPS URLs'
  },
  {
    name: 'IPv4 Address',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'Matches IPv4 addresses'
  },
  {
    name: 'Credit Card',
    pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
    description: 'Validates major credit card numbers'
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    description: 'Matches ISO date format'
  },
  {
    name: 'Hexadecimal Color',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'Matches hex color codes'
  },
  {
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'At least 8 chars with uppercase, lowercase, number, and special char'
  }
]

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flags, setFlags] = useState<RegexFlag[]>([
    { key: 'g', label: 'Global', description: 'Find all matches', enabled: true },
    { key: 'i', label: 'Ignore Case', description: 'Case insensitive matching', enabled: false },
    { key: 'm', label: 'Multiline', description: '^$ match line breaks', enabled: false },
    { key: 's', label: 'Dot All', description: '. matches newlines', enabled: false },
    { key: 'u', label: 'Unicode', description: 'Unicode support', enabled: false },
    { key: 'y', label: 'Sticky', description: 'Match from lastIndex', enabled: false }
  ])
  const [replaceText, setReplaceText] = useState('')
  const [replaceResult, setReplaceResult] = useState('')

  useEffect(() => {
    testRegex()
  }, [pattern, testString, flags])

  const testRegex = () => {
    if (!pattern) {
      setMatches([])
      setIsValid(null)
      setError(null)
      setReplaceResult('')
      return
    }

    try {
      const flagString = flags.filter(f => f.enabled).map(f => f.key).join('')
      const regex = new RegExp(pattern, flagString)
      setIsValid(true)
      setError(null)

      if (!testString) {
        setMatches([])
        setReplaceResult('')
        return
      }

      const foundMatches: Match[] = []
      let match

      if (flags.find(f => f.key === 'g')?.enabled) {
        // Global search
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          })
          
          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        // Single match
        match = regex.exec(testString)
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          })
        }
      }

      setMatches(foundMatches)

      // Handle replace
      if (replaceText !== undefined) {
        try {
          const replaced = testString.replace(regex, replaceText)
          setReplaceResult(replaced)
        } catch (err) {
          setReplaceResult('Replace error: ' + (err as Error).message)
        }
      }

    } catch (err) {
      setIsValid(false)
      setError((err as Error).message)
      setMatches([])
      setReplaceResult('')
    }
  }

  const toggleFlag = (flagKey: string) => {
    setFlags(prev => prev.map(flag => 
      flag.key === flagKey ? { ...flag, enabled: !flag.enabled } : flag
    ))
  }

  const loadPattern = (patternData: typeof commonPatterns[0]) => {
    setPattern(patternData.pattern)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const loadSampleText = () => {
    const sample = `john.doe@example.com
Jane Smith <jane.smith@company.org>
Invalid email: not-an-email
Another valid email: test123@domain.co.uk
Phone: (555) 123-4567
Website: https://www.example.com
IP Address: 192.168.1.1
Date: 2024-01-15
Color: #FF5733
Password: MySecure123!`
    setTestString(sample)
  }

  const clearAll = () => {
    setPattern('')
    setTestString('')
    setReplaceText('')
    setMatches([])
    setIsValid(null)
    setError(null)
    setReplaceResult('')
  }

  const highlightMatches = (text: string, matches: Match[]) => {
    if (matches.length === 0) return text

    let result = ''
    let lastIndex = 0

    matches.forEach((match, i) => {
      result += text.slice(lastIndex, match.index)
      result += `<mark class="bg-yellow-200 px-1 rounded">${match.match}</mark>`
      lastIndex = match.index + match.match.length
    })

    result += text.slice(lastIndex)
    return result
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Regex Tester & Debugger
          </h1>
          <p className="text-lg text-gray-600">
            Test and debug regular expressions with real-time matching and detailed explanations.
          </p>
        </div>

        {/* Regex Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Regular Expression
            </CardTitle>
            <CardDescription>
              Enter your regex pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your regex pattern here..."
                  className="font-mono"
                />
                <span className="text-lg font-mono">/</span>
                <div className="flex gap-1">
                  {flags.map(flag => (
                    <Button
                      key={flag.key}
                      variant={flag.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFlag(flag.key)}
                      className="w-8 h-8 p-0 font-mono"
                      title={`${flag.label}: ${flag.description}`}
                    >
                      {flag.key}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Flags Description */}
              <div className="flex flex-wrap gap-2">
                {flags.filter(f => f.enabled).map(flag => (
                  <Badge key={flag.key} variant="secondary" className="text-xs">
                    {flag.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {(isValid !== null || error) && (
          <div className="mb-6">
            {isValid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Valid regex pattern • Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid regex: {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Test String */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Test String
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadSampleText}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Load Sample
                </Button>
              </CardTitle>
              <CardDescription>
                Enter text to test against your regex
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter test string here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Matches ({matches.length})
              </CardTitle>
              <CardDescription>
                Highlighted matches and capture groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Highlighted Text */}
                {testString && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div 
                      className="font-mono text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatches(testString, matches) 
                      }}
                    />
                  </div>
                )}

                {/* Match Details */}
                {matches.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {matches.map((match, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Match {index + 1}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(match.match)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Match:</strong> <code className="bg-white px-1 rounded">{match.match}</code></div>
                          <div><strong>Position:</strong> {match.index}-{match.index + match.match.length}</div>
                          {match.groups.length > 0 && (
                            <div><strong>Groups:</strong> {match.groups.map((group, i) => (
                              <code key={i} className="bg-white px-1 rounded ml-1">{group}</code>
                            ))}</div>
                          )}
                          {Object.keys(match.namedGroups).length > 0 && (
                            <div><strong>Named Groups:</strong> {Object.entries(match.namedGroups).map(([name, value]) => (
                              <span key={name} className="ml-1">{name}: <code className="bg-white px-1 rounded">{value}</code></span>
                            ))}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Replace Tool */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Find & Replace
            </CardTitle>
            <CardDescription>
              Test regex replacement functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Replace with:
                </label>
                <Input
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Replacement text (use $1, $2 for groups)"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Result:
                </label>
                <Input
                  value={replaceResult}
                  readOnly
                  className="font-mono bg-gray-50"
                  placeholder="Replacement result will appear here"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Patterns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Common Patterns
            </CardTitle>
            <CardDescription>
              Click to load frequently used regex patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonPatterns.map((patternData, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => loadPattern(patternData)}>
                  <h4 className="font-medium text-gray-900 mb-1">{patternData.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{patternData.description}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                    {patternData.pattern}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button onClick={() => copyToClipboard(pattern)} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Regex
          </Button>
          <Button onClick={clearAll} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* AdSense Placeholder */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </div>
    </div>
  )
}