"use client"

import { useState } from "react"
import { Copy, ExternalLink, Link2, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

interface ShortenerOption {
  name: string
  href: string
  note: string
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const parsed = new URL(withProtocol)

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs can be shortened.")
  }

  return parsed.href
}

function buildShortenerOptions(url: string): ShortenerOption[] {
  const encoded = encodeURIComponent(url)
  return [
    {
      name: "TinyURL",
      href: `https://tinyurl.com/api-create.php?url=${encoded}`,
      note: "Opens a plain-text generated short link.",
    },
    {
      name: "is.gd",
      href: `https://is.gd/create.php?format=simple&url=${encoded}`,
      note: "Opens a generated short link from is.gd.",
    },
    {
      name: "v.gd",
      href: `https://v.gd/create.php?format=simple&url=${encoded}`,
      note: "Opens a generated short link from v.gd.",
    },
  ]
}

export default function URLShortenerPage() {
  const [longUrl, setLongUrl] = useState("")
  const [validatedUrl, setValidatedUrl] = useState("")
  const [options, setOptions] = useState<ShortenerOption[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

  const prepareLinks = () => {
    try {
      const normalized = normalizeUrl(longUrl)
      setValidatedUrl(normalized)
      setOptions(buildShortenerOptions(normalized))
      setError("")
    } catch (err) {
      setValidatedUrl("")
      setOptions([])
      setError(err instanceof Error ? err.message : "Enter a valid URL.")
      toast({
        title: "Invalid URL",
        description: "Enter a valid HTTP or HTTPS URL.",
        variant: "destructive",
      })
    }
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(validatedUrl)
    toast({
      title: "Copied",
      description: "Validated URL copied to clipboard",
    })
  }

  return (
    <ToolLayout
      title="URL Shortener"
      description="Validate a long URL and open trusted services that generate real short links."
      category="Web Tools"
      categoryHref="/web-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">URL Shortener</CardTitle>
          <p className="text-muted-foreground">
            Prepare real short links through trusted redirect services.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="longUrl">Long URL</Label>
              <Input
                id="longUrl"
                type="url"
                placeholder="https://example.com/very/long/url/path"
                value={longUrl}
                onChange={(e) => {
                  setLongUrl(e.target.value)
                  setError("")
                }}
              />
            </div>

            <Button onClick={prepareLinks} className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              Prepare Shortener Links
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validatedUrl && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Validated URL</Badge>
                <span className="text-xs text-muted-foreground">
                  {validatedUrl.length} characters
                </span>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Input value={validatedUrl} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={copyUrl} aria-label="Copy validated URL">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {options.map((option) => (
                  <div key={option.name} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/75 p-3">
                    <div>
                      <p className="font-medium text-foreground">{option.name}</p>
                      <p className="text-sm text-muted-foreground">{option.note}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={option.href} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              Short links require a redirect service. This page does not invent a fake short URL;
              it validates your URL locally and opens providers that create the real redirect.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
