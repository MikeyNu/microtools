"use client"

import { useState } from "react"
import { LucideLink, ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import NextLink from "next/link"

export default function URLShortenerPage() {
  const [longUrl, setLongUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const shortenUrl = () => {
    if (!longUrl) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const alias = customAlias || Math.random().toString(36).substring(2, 8)
      const shortened = `https://short.ly/${alias}`
      setShortUrl(shortened)
      setIsLoading(false)
    }, 1000)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(shortUrl)
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    })
  }

  const openUrl = () => {
    window.open(shortUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NextLink href="/" className="flex items-center space-x-2">
              <LucideLink className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </NextLink>
            <NextLink
              href="/web-tools"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Web Tools
            </NextLink>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">URL Shortener</CardTitle>
              <p className="text-muted-foreground">Create short, shareable links from long URLs</p>
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
                    onChange={(e) => setLongUrl(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="customAlias">Custom Alias (Optional)</Label>
                  <Input
                    id="customAlias"
                    type="text"
                    placeholder="my-custom-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Leave empty for random alias</p>
                </div>

                <Button onClick={shortenUrl} className="w-full" disabled={isLoading}>
                  {isLoading ? "Shortening..." : "Shorten URL"}
                </Button>
              </div>

              {shortUrl && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Shortened URL</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Input value={shortUrl} readOnly className="flex-1" />
                      <Button variant="outline" size="sm" onClick={copyUrl}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={openUrl}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-muted-foreground">Original Length</div>
                      <div className="font-semibold">{longUrl.length} characters</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-muted-foreground">Short Length</div>
                      <div className="font-semibold text-accent">{shortUrl.length} characters</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Custom aliases for branded links</li>
                  <li>• Click tracking and analytics</li>
                  <li>• QR code generation</li>
                  <li>• Bulk URL shortening</li>
                  <li>• Link expiration settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
