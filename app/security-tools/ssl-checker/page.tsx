'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Copy, ExternalLink, Globe, Info, RefreshCw, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToast } from '@/hooks/use-toast'

interface TLSResult {
  domain: string
  checkedAt: string
  reachable: boolean
  url: string
  message: string
}

const tool = {
  id: 'ssl-checker',
  name: 'SSL Certificate Checker',
  description: 'Check whether a domain completes a trusted browser HTTPS handshake.',
  category: 'security-tools',
  url: '/security-tools/ssl-checker',
}

const relatedTools = [
  { name: 'Password Strength Checker', href: '/security-tools/password-checker' },
  { name: '2FA Generator', href: '/security-tools/2fa-generator' },
  { name: 'Hash Generator', href: '/security-tools/hash-generator' },
  { name: 'DNS Lookup', href: '/network-tools/dns-lookup' },
]

function normalizeDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase()
}

function isValidDomain(domain: string): boolean {
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)
}

export default function SSLCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TLSResult | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const checkSSL = async () => {
    const normalized = normalizeDomain(domain)
    if (!normalized) {
      setError('Enter a domain name.')
      return
    }
    if (!isValidDomain(normalized)) {
      setError('Enter a valid domain, such as example.com.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    const url = `https://${normalized}/`

    try {
      await fetch(url, {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      })

      setResult({
        domain: normalized,
        checkedAt: new Date().toLocaleString(),
        reachable: true,
        url,
        message:
          'Your browser completed an HTTPS request to this domain. That means the TLS handshake and certificate trust checks passed for this browser.',
      })
      toast({ title: 'TLS check complete', description: `${normalized} accepted a browser HTTPS request.` })
    } catch {
      setResult({
        domain: normalized,
        checkedAt: new Date().toLocaleString(),
        reachable: false,
        url,
        message:
          'The browser could not complete an HTTPS request. Possible causes include an invalid certificate, blocked mixed/CORS request, DNS failure, timeout, or a server that refuses browser probes.',
      })
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  const copyDomain = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.domain)
    toast({ title: 'Copied', description: 'Domain copied to clipboard.' })
  }

  const sslLabsUrl = result
    ? `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(result.domain)}`
    : ''
  const crtShUrl = result ? `https://crt.sh/?q=${encodeURIComponent(result.domain)}` : ''

  return (
    <ToolLayout
      title="SSL Certificate Checker"
      description="Check whether a domain completes a trusted browser HTTPS handshake, with links for full certificate-chain analysis."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Browser TLS Check
            </CardTitle>
            <CardDescription>
              Enter a domain to verify whether this browser can establish a trusted HTTPS connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && checkSSL()}
                className="font-mono"
              />
            </div>

            <Button onClick={checkSSL} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking HTTPS...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Check SSL
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  {result.reachable ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                  TLS Result
                </span>
                <Badge variant={result.reachable ? 'default' : 'secondary'}>
                  {result.reachable ? 'Trusted by browser' : 'Not confirmed'}
                </Badge>
              </CardTitle>
              <CardDescription>Checked {result.checkedAt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm font-mono break-all">{result.url}</code>
                  <Button variant="outline" size="sm" onClick={copyDomain}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{result.message}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline" className="flex-1">
                  <a href={sslLabsUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full SSL Labs Test
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={crtShUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Certificate Transparency
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Browser JavaScript cannot read certificate issuer, expiry date, serial number, or fingerprint directly.
            This tool therefore checks browser trust/reachability and links to dedicated certificate analyzers for
            chain details.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
