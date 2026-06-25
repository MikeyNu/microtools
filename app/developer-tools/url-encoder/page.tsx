'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import {
  Link2,
  Copy,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowRightLeft,
  Globe,
  Code2,
  Lock,
  Table2,
} from 'lucide-react'

const toolObj = {
  id: 'url-encoder',
  name: 'URL Encoder / Decoder',
  description: 'Encode and decode URLs and query strings using encodeURIComponent, decodeURIComponent, and encodeURI.',
  category: 'developer-tools',
  url: '/developer-tools/url-encoder',
}

const relatedTools = [
  { name: 'Base64 Encoder', href: '/developer-tools/base64' },
  { name: 'HTML Encoder', href: '/text-utilities/html-encoder' },
  { name: 'JSON Formatter', href: '/developer-tools/json-formatter' },
]

const COMMON_CHARS = [
  { char: ' ',  encoded: '%20', description: 'Space' },
  { char: '!',  encoded: '%21', description: 'Exclamation mark' },
  { char: '"',  encoded: '%22', description: 'Double quote' },
  { char: '#',  encoded: '%23', description: 'Hash / fragment' },
  { char: '$',  encoded: '%24', description: 'Dollar sign' },
  { char: '%',  encoded: '%25', description: 'Percent sign' },
  { char: '&',  encoded: '%26', description: 'Ampersand' },
  { char: "'",  encoded: '%27', description: 'Single quote' },
  { char: '(',  encoded: '%28', description: 'Open parenthesis' },
  { char: ')',  encoded: '%29', description: 'Close parenthesis' },
  { char: '*',  encoded: '%2A', description: 'Asterisk' },
  { char: '+',  encoded: '%2B', description: 'Plus sign' },
  { char: ',',  encoded: '%2C', description: 'Comma' },
  { char: '/',  encoded: '%2F', description: 'Forward slash' },
  { char: ':',  encoded: '%3A', description: 'Colon' },
  { char: ';',  encoded: '%3B', description: 'Semicolon' },
  { char: '=',  encoded: '%3D', description: 'Equals sign' },
  { char: '?',  encoded: '%3F', description: 'Question mark' },
  { char: '@',  encoded: '%40', description: 'At sign' },
  { char: '[',  encoded: '%5B', description: 'Open bracket' },
  { char: ']',  encoded: '%5D', description: 'Close bracket' },
  { char: '{',  encoded: '%7B', description: 'Open brace' },
  { char: '|',  encoded: '%7C', description: 'Pipe' },
  { char: '}',  encoded: '%7D', description: 'Close brace' },
]

type EncodeMode = 'component' | 'decode' | 'full'

export default function UrlEncoderPage() {
  const [activeTab, setActiveTab] = useState<EncodeMode>('component')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const runOperation = useCallback((value: string, mode: EncodeMode) => {
    setError(null)
    setOutput('')

    if (!value.trim()) return

    try {
      let result = ''
      if (mode === 'component') {
        result = encodeURIComponent(value)
      } else if (mode === 'decode') {
        result = decodeURIComponent(value)
      } else {
        result = encodeURI(value)
      }
      setOutput(result)
    } catch (err) {
      setError((err as Error).message || 'Invalid encoding — check that percent-sequences are complete (e.g. %20, not %2).')
      setOutput('')
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInput(value)
    setError(null)
    setOutput('')
  }

  const handleTabChange = (tab: string) => {
    const next = tab as EncodeMode
    setActiveTab(next)
    setOutput('')
    setError(null)
  }

  const handleEncode = () => runOperation(input, activeTab)

  const handleSwap = () => {
    if (!output) return
    setInput(output)
    setOutput('')
    setError(null)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently fail
    }
  }

  const tabLabel: Record<EncodeMode, string> = {
    component: 'Encode Component',
    decode: 'Decode',
    full: 'Encode Full URL',
  }

  const tabDescription: Record<EncodeMode, string> = {
    component: 'Encodes a query parameter or path segment — escapes all reserved characters including /, ?, #, &.',
    decode: 'Decodes a percent-encoded string back to its original characters.',
    full: 'Encodes a complete URL — preserves /, ?, #, &, = and other URL structure characters.',
  }

  const placeholders: Record<EncodeMode, string> = {
    component: 'e.g. hello world & more=yes',
    decode: 'e.g. hello%20world%20%26%20more%3Dyes',
    full: 'e.g. https://example.com/search?q=hello world&lang=en',
  }

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode query parameters, decode percent-encoded strings, or encode a full URL while preserving its structure."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement buttons */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="url-encoder" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Mode tabs */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-4 w-4 text-accent" />
              Operation Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="component" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Encode</span> Component
                </TabsTrigger>
                <TabsTrigger value="decode" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Code2 className="h-3.5 w-3.5" />
                  Decode
                </TabsTrigger>
                <TabsTrigger value="full" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Encode</span> Full URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="component" className="mt-3">
                <p className="text-sm text-muted-foreground">{tabDescription.component}</p>
              </TabsContent>
              <TabsContent value="decode" className="mt-3">
                <p className="text-sm text-muted-foreground">{tabDescription.decode}</p>
              </TabsContent>
              <TabsContent value="full" className="mt-3">
                <p className="text-sm text-muted-foreground">{tabDescription.full}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4 text-accent" />
                Input
              </CardTitle>
              <CardDescription>
                {activeTab === 'decode'
                  ? 'Paste a percent-encoded string'
                  : activeTab === 'full'
                  ? 'Paste or type the full URL'
                  : 'Paste a query value or path segment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="url-input" className="sr-only">Input</Label>
              <Textarea
                id="url-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholders[activeTab]}
                className="min-h-[180px] font-mono text-sm resize-y"
                spellCheck={false}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground font-variant-numeric tabular-nums">
                <span>{input.length} chars</span>
                {input.length > 0 && (
                  <span>{new Blob([input]).size} bytes</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent" />
                  Output
                </span>
                <div className="flex items-center gap-2">
                  {output && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSwap}
                      title="Use output as next input"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline ml-1">Use as Input</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={copied ? 'default' : 'outline'}
                    onClick={handleCopy}
                    disabled={!output}
                  >
                    {copied ? (
                      <><CheckCircle className="h-3.5 w-3.5" /><span className="ml-1">Copied</span></>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /><span className="ml-1 hidden sm:inline">Copy</span></>
                    )}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {activeTab === 'decode'
                  ? 'Decoded plain text'
                  : activeTab === 'full'
                  ? 'Encoded URL with structure preserved'
                  : 'Percent-encoded component'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="url-output" className="sr-only">Output</Label>
              <Textarea
                id="url-output"
                value={output}
                readOnly
                placeholder="Result will appear here after you click an action below…"
                className="min-h-[180px] font-mono text-sm resize-y bg-muted"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                <span>{output.length} chars</span>
                {output.length > 0 && (
                  <span>{new Blob([output]).size} bytes</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEncode} disabled={!input.trim()}>
            {activeTab === 'component' && <Lock className="h-4 w-4" />}
            {activeTab === 'decode' && <Code2 className="h-4 w-4" />}
            {activeTab === 'full' && <Globe className="h-4 w-4" />}
            {tabLabel[activeTab]}
          </Button>

          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!input && !output}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Method comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-4 w-4 text-accent" />
              Method Comparison
            </CardTitle>
            <CardDescription>
              When to use each encoding function
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-accent shrink-0" />
                  <code className="font-mono text-xs font-semibold">encodeURIComponent</code>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Encodes everything except <code className="font-mono">A–Z a–z 0–9 - _ . ! ~ * ' ( )</code>.
                  Use for individual query parameter values or path segments — it will escape <code className="font-mono">/ ? & = #</code>.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">Query values</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-accent shrink-0" />
                  <code className="font-mono text-xs font-semibold">encodeURI</code>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Preserves URL-structural characters <code className="font-mono">: / ? # [ ] @ ! $ & ' ( ) * + , ; =</code>.
                  Use when you have a full URL and want to encode only the unsafe characters.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">Full URLs</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-4 w-4 text-accent shrink-0" />
                  <code className="font-mono text-xs font-semibold">decodeURIComponent</code>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Reverses percent-encoding for any encoded string. Throws on malformed sequences like <code className="font-mono">%ZZ</code>.
                  Use to read back values that were encoded with either <code className="font-mono">encodeURI</code> or <code className="font-mono">encodeURIComponent</code>.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">Decoding</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Table2 className="h-4 w-4 text-accent" />
              Common Encoded Characters
            </CardTitle>
            <CardDescription>
              Quick reference for frequently used percent-encoded values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-foreground w-16">Char</th>
                    <th className="text-left py-2 pr-4 font-semibold text-foreground w-24">Encoded</th>
                    <th className="text-left py-2 font-semibold text-foreground">Description</th>
                    <th className="text-right py-2 font-semibold text-foreground w-24 hidden sm:table-cell">Try it</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_CHARS.map(({ char, encoded, description }) => (
                    <tr
                      key={encoded}
                      className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-2 pr-4">
                        <code className="font-mono bg-muted px-1.5 py-0.5 rounded-sm text-xs text-foreground">
                          {char === ' ' ? '(space)' : char}
                        </code>
                      </td>
                      <td className="py-2 pr-4">
                        <code className="font-mono text-xs text-accent font-semibold">{encoded}</code>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{description}</td>
                      <td className="py-2 text-right hidden sm:table-cell">
                        <button
                          onClick={() => {
                            setInput(char)
                            setActiveTab('component')
                            runOperation(char, 'component')
                          }}
                          className="text-xs text-muted-foreground hover:text-accent transition-colors underline underline-offset-2"
                        >
                          encode
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
