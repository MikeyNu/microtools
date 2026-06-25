'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import {
  Send,
  Plus,
  Trash2,
  Globe,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Copy,
  CheckCircle2,
  XCircle,
  Info,
  FileJson,
  ListFilter,
} from 'lucide-react'

const toolObj = {
  id: 'api-tester',
  name: 'API Tester',
  description: 'Send HTTP requests and inspect responses directly in your browser.',
  category: 'developer-tools',
  url: '/developer-tools/api-tester',
}

const relatedTools = [
  { name: 'JSON Formatter', href: '/developer-tools/json-formatter' },
  { name: 'URL Encoder', href: '/developer-tools/url-encoder' },
  { name: 'Base64 Encoder', href: '/developer-tools/base64' },
]

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

interface HeaderPair {
  id: string
  key: string
  value: string
}

interface ResponseData {
  status: number
  statusText: string
  durationMs: number
  headers: Record<string, string>
  body: string
  isJson: boolean
  parsedJson: unknown
  error?: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function getMethodColor(method: HttpMethod): string {
  switch (method) {
    case 'GET':    return 'text-success'
    case 'POST':   return 'text-accent'
    case 'PUT':    return 'text-warning'
    case 'DELETE': return 'text-destructive'
    case 'PATCH':  return 'text-warning'
    default:       return 'text-muted-foreground'
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-success'
  if (status >= 400) return 'text-destructive'
  if (status >= 300) return 'text-warning'
  return 'text-muted-foreground'
}

function getStatusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) return 'bg-success/10 text-success border-success/30'
  if (status >= 400) return 'bg-destructive/10 text-destructive border-destructive/30'
  if (status >= 300) return 'bg-warning/10 text-warning border-warning/30'
  return 'bg-muted text-muted-foreground border-border'
}

function tryFormatJson(raw: string): { isJson: boolean; formatted: string; parsed: unknown } {
  try {
    const parsed = JSON.parse(raw)
    return { isJson: true, formatted: JSON.stringify(parsed, null, 2), parsed }
  } catch {
    return { isJson: false, formatted: raw, parsed: null }
  }
}

export default function ApiTesterPage() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { id: generateId(), key: 'Content-Type', value: 'application/json' },
  ])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [responseHeadersExpanded, setResponseHeadersExpanded] = useState(false)

  // ---- header helpers ----
  const addHeader = () => {
    setHeaders((prev) => [...prev, { id: generateId(), key: '', value: '' }])
  }

  const removeHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id))
  }

  const updateHeader = (id: string, field: 'key' | 'value', val: string) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    )
  }

  // ---- send request ----
  const sendRequest = useCallback(async () => {
    if (!url.trim()) return

    setLoading(true)
    setResponse(null)

    const start = Date.now()

    try {
      const reqHeaders: Record<string, string> = {}
      headers.forEach(({ key, value }) => {
        if (key.trim()) reqHeaders[key.trim()] = value
      })

      const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
      }

      if (method !== 'GET' && body.trim()) {
        fetchOptions.body = body
      }

      const res = await fetch(url.trim(), fetchOptions)
      const durationMs = Date.now() - start

      const resHeaders: Record<string, string> = {}
      res.headers.forEach((val, key) => {
        resHeaders[key] = val
      })

      const rawText = await res.text()
      const { isJson, formatted, parsed } = tryFormatJson(rawText)

      setResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs,
        headers: resHeaders,
        body: formatted,
        isJson,
        parsedJson: parsed,
      })
    } catch (err: unknown) {
      const durationMs = Date.now() - start
      const message = err instanceof Error ? err.message : 'Unknown network error'
      setResponse({
        status: 0,
        statusText: 'Network Error',
        durationMs,
        headers: {},
        body: '',
        isJson: false,
        parsedJson: null,
        error: message,
      })
    } finally {
      setLoading(false)
    }
  }, [url, method, headers, body])

  // ---- clear ----
  const clearAll = () => {
    setUrl('')
    setMethod('GET')
    setHeaders([{ id: generateId(), key: 'Content-Type', value: 'application/json' }])
    setBody('')
    setResponse(null)
  }

  // ---- copy helper ----
  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {}
  }

  const bodyDisabled = method === 'GET'

  return (
    <ToolLayout
      title="API Tester"
      description="Send HTTP requests and inspect responses directly in your browser — no extensions required."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-5">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="api-tester" />
          <ShareButton tool={toolObj} />
        </div>

        {/* CORS notice */}
        <Alert className="border-warning/40 bg-warning/5">
          <AlertTriangle className="size-4 text-warning" />
          <AlertDescription className="text-muted-foreground pl-1">
            <span className="font-medium text-foreground">Browser CORS restrictions apply.</span>{' '}
            Many public APIs block cross-origin requests. If a request fails unexpectedly, the
            server may not allow requests from browser pages. Use a proxy or server-side client
            for those APIs.
          </AlertDescription>
        </Alert>

        {/* Request builder */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-accent" />
              Request
            </CardTitle>
            <CardDescription>Configure the endpoint, method, headers, and body.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* URL + method row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="sm:w-36 shrink-0">
                <Label htmlFor="http-method" className="sr-only">HTTP Method</Label>
                <Select
                  value={method}
                  onValueChange={(v) => setMethod(v as HttpMethod)}
                >
                  <SelectTrigger id="http-method" className="w-full font-mono font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        <span className={`font-mono font-semibold ${getMethodColor(m)}`}>{m}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="request-url" className="sr-only">Request URL</Label>
                <Input
                  id="request-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
                />
              </div>

              <Button
                onClick={sendRequest}
                disabled={loading || !url.trim()}
                className="shrink-0 gap-2"
              >
                <Send className="size-4" />
                {loading ? 'Sending…' : 'Send'}
              </Button>
            </div>

            {/* Tabs: Headers | Body */}
            <Tabs defaultValue="headers">
              <TabsList>
                <TabsTrigger value="headers" className="gap-1.5">
                  <ListFilter className="size-3.5" />
                  Headers
                  {headers.filter((h) => h.key.trim()).length > 0 && (
                    <span className="ml-1 rounded-full bg-accent/15 px-1.5 py-px text-xs font-semibold text-accent tabular-nums">
                      {headers.filter((h) => h.key.trim()).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className="gap-1.5" disabled={bodyDisabled}>
                  <FileJson className="size-3.5" />
                  Body
                  {bodyDisabled && (
                    <span className="ml-1 text-xs text-muted-foreground">(GET)</span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Headers panel */}
              <TabsContent value="headers">
                <div className="mt-3 space-y-2">
                  {headers.map((header) => (
                    <div key={header.id} className="flex gap-2 items-center">
                      <Input
                        value={header.key}
                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        placeholder="Header name"
                        className="font-mono text-sm"
                        aria-label="Header name"
                      />
                      <Input
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="font-mono text-sm"
                        aria-label="Header value"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(header.id)}
                        aria-label="Remove header"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addHeader} className="gap-1.5">
                    <Plus className="size-3.5" />
                    Add header
                  </Button>
                </div>
              </TabsContent>

              {/* Body panel */}
              <TabsContent value="body">
                <div className="mt-3 space-y-2">
                  <Label htmlFor="request-body" className="text-sm text-muted-foreground">
                    Request body (JSON, text, or any format)
                  </Label>
                  <Textarea
                    id="request-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={'{\n  "key": "value"\n}'}
                    className="min-h-[160px] font-mono text-sm"
                    disabled={bodyDisabled}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="size-3.5" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response panel */}
        {response && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                {response.error ? (
                  <XCircle className="size-4 text-destructive" />
                ) : (
                  <CheckCircle2 className={`size-4 ${getStatusColor(response.status)}`} />
                )}
                Response

                <div className="ml-auto flex items-center gap-2">
                  {!response.error && (
                    <Badge
                      variant="outline"
                      className={`font-mono font-semibold tabular-nums ${getStatusBadgeClass(response.status)}`}
                    >
                      {response.status} {response.statusText}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1 font-mono text-muted-foreground">
                    <Clock className="size-3" />
                    {response.durationMs} ms
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Network error */}
              {response.error && (
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertDescription>
                    <span className="font-medium">Network error:</span> {response.error}
                    <p className="mt-1 text-xs opacity-80">
                      This is often caused by CORS restrictions, a bad URL, or the server being
                      unreachable from the browser.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Response headers (collapsible) */}
              {!response.error && Object.keys(response.headers).length > 0 && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                    onClick={() => setResponseHeadersExpanded((v) => !v)}
                    aria-expanded={responseHeadersExpanded}
                  >
                    {responseHeadersExpanded ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                    Response Headers
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-px text-xs tabular-nums">
                      {Object.keys(response.headers).length}
                    </span>
                  </button>

                  {responseHeadersExpanded && (
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <table className="w-full text-xs font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <tbody>
                          {Object.entries(response.headers).map(([k, v]) => (
                            <tr key={k} className="border-b border-border/40 last:border-0">
                              <td className="pr-4 py-1 text-muted-foreground align-top whitespace-nowrap font-semibold">
                                {k}
                              </td>
                              <td className="py-1 break-all text-foreground">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Response body */}
              {!response.error && response.body && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <FileJson className="size-3.5" />
                      Body
                      {response.isJson && (
                        <Badge variant="secondary" className="text-xs py-0 h-5">
                          JSON
                        </Badge>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-7 text-xs text-muted-foreground"
                      onClick={() => copyText(response.body, 'body')}
                    >
                      {copied === 'body' ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied === 'body' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words">
                      {response.body}
                    </pre>
                  </div>
                </div>
              )}

              {!response.error && !response.body && (
                <p className="text-sm text-muted-foreground italic">
                  The server returned an empty body.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Info className="size-4" />
              Usage tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>
              Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">Enter</kbd> in the URL field to send quickly.
            </p>
            <p>
              Set <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">Authorization: Bearer &lt;token&gt;</code> in the headers tab to authenticate requests.
            </p>
            <p>
              Paste a JSON body in the Body tab for POST, PUT, and PATCH requests — the response will be pretty-printed automatically if it is valid JSON.
            </p>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
