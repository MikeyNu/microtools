"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"
import { Lock, Unlock, Copy, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function JWTDecoderPage() {
  const [token, setToken] = useState("")
  const [header, setHeader] = useState("")
  const [payload, setPayload] = useState("")
  const [signature, setSignature] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [showSignature, setShowSignature] = useState(false)
  const { toast } = useToast()

  const decodeJWT = () => {
    try {
      const parts = token.split('.')
      
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. JWT should have 3 parts separated by dots.")
      }

      // Decode header
      const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      setHeader(JSON.stringify(decodedHeader, null, 2))

      // Decode payload
      const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      setPayload(JSON.stringify(decodedPayload, null, 2))

      // Store signature (not decoded, as it's a hash)
      setSignature(parts[2])

      // Check expiration
      if (decodedPayload.exp) {
        const expirationDate = new Date(decodedPayload.exp * 1000)
        const isExpired = expirationDate < new Date()
        setIsValid(!isExpired)
        
        if (isExpired) {
          toast({ 
            title: "Token Expired", 
            description: `Expired on ${expirationDate.toLocaleString()}`,
            variant: "destructive"
          })
        } else {
          toast({ 
            title: "Token Valid", 
            description: `Expires on ${expirationDate.toLocaleString()}`
          })
        }
      } else {
        setIsValid(null)
        toast({ title: "Token decoded successfully!" })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to decode JWT",
        variant: "destructive"
      })
      setHeader("")
      setPayload("")
      setSignature("")
      setIsValid(null)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} copied to clipboard!` })
  }

  const clear = () => {
    setToken("")
    setHeader("")
    setPayload("")
    setSignature("")
    setIsValid(null)
  }

  const loadExample = () => {
    const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    setToken(exampleToken)
  }

  const relatedTools = [
    { name: "Base64 Encoder", href: "/developer-tools/base64" },
    { name: "Hash Generator", href: "/developer-tools/hash-generator" },
    { name: "JSON Formatter", href: "/developer-tools/json-formatter" },
  ]

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and analyze JSON Web Tokens (JWT) to inspect header, payload, and signature."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                JWT Token Input
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadExample}>
                  Load Example
                </Button>
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Paste your JWT token here</Label>
              <Textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={decodeJWT} className="w-full" size="lg">
              <Unlock className="mr-2 h-4 w-4" />
              Decode JWT
            </Button>
          </CardContent>
        </Card>

        {(header || payload) && (
          <>
            {isValid !== null && (
              <Card className={isValid ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <>
                        <Badge variant="default" className="bg-green-500">Valid</Badge>
                        <span className="text-sm text-muted-foreground">Token is not expired</span>
                      </>
                    ) : (
                      <>
                        <Badge variant="destructive">Expired</Badge>
                        <span className="text-sm text-muted-foreground">Token has expired</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Header</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(header, "Header")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm font-mono max-h-80">
                    {header}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Payload</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payload, "Payload")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm font-mono max-h-80">
                    {payload}
                  </pre>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Signature
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSignature(!showSignature)}
                    >
                      {showSignature ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  {showSignature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(signature, "Signature")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showSignature ? (
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm font-mono break-all">
                    {signature}
                  </pre>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                    Click the eye icon to reveal signature
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-5 w-5" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  This tool only decodes and displays JWT contents. It does NOT verify the signature.
                  Never paste sensitive or production tokens in online tools. Signature verification
                  requires the secret key and should be done server-side.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About JWT Decoder</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Decode and inspect JSON Web Tokens (JWT) to view their header, payload, and signature
              components. Useful for debugging authentication issues and understanding token structure.
            </p>
            <h3>Features:</h3>
            <ul>
              <li>Decode JWT header and payload</li>
              <li>Check token expiration status</li>
              <li>View signature (without verification)</li>
              <li>Copy individual parts to clipboard</li>
              <li>Pretty-printed JSON output</li>
              <li>Example token for testing</li>
            </ul>
            <h3>Common JWT Claims:</h3>
            <ul>
              <li><strong>iss</strong> - Issuer of the token</li>
              <li><strong>sub</strong> - Subject (user ID)</li>
              <li><strong>aud</strong> - Audience</li>
              <li><strong>exp</strong> - Expiration time</li>
              <li><strong>iat</strong> - Issued at time</li>
              <li><strong>nbf</strong> - Not before time</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

