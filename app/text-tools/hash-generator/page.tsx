"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"
import { generateHashHex } from "@/lib/hash-utils"

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState("")
  const [hashes, setHashes] = useState({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  })
  const { toast } = useToast()

  // Simple hash functions (for demonstration - in production, use crypto libraries)
  const generateHashes = async (text: string) => {
    if (!text) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" })
      return
    }

    try {
      const [md5Hash, sha1Hash, sha256Hash, sha512Hash] = await Promise.all([
        generateHashHex(text, "MD5"),
        generateHashHex(text, "SHA-1"),
        generateHashHex(text, "SHA-256"),
        generateHashHex(text, "SHA-512"),
      ])

      setHashes({
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        sha512: sha512Hash,
      })
    } catch (error) {
      console.error("Error generating hashes:", error)
    }
  }

  const copyHash = (hash: string, type: string) => {
    navigator.clipboard.writeText(hash)
    toast({
      title: "Copied!",
      description: `${type} hash copied to clipboard`,
    })
  }

  const handleTextChange = (text: string) => {
    setInputText(text)
    generateHashes(text)
  }

  const hashTypes = [
    { key: "md5", label: "MD5", description: "128-bit hash (32 hex characters)" },
    { key: "sha1", label: "SHA-1", description: "160-bit hash (40 hex characters)" },
    { key: "sha256", label: "SHA-256", description: "256-bit hash (64 hex characters)" },
    { key: "sha512", label: "SHA-512", description: "512-bit hash (128 hex characters)" },
  ]

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text"
      category="Text Tools"
      categoryHref="/text-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Hash Generator</CardTitle>
          <p className="text-muted-foreground">Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input-text">Input Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[120px] mt-2"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Generated Hashes</h3>
            {hashTypes.map((hashType) => (
              <Card key={hashType.key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{hashType.label}</CardTitle>
                      <p className="text-sm text-muted-foreground">{hashType.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyHash(hashes[hashType.key as keyof typeof hashes], hashType.label)}
                      disabled={!inputText}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Input
                    value={hashes[hashType.key as keyof typeof hashes]}
                    readOnly
                    className="font-mono text-sm"
                    placeholder={`Enter text above to generate ${hashType.label} hash`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">About Hash Functions</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>MD5:</strong> Fast but cryptographically broken. Use only for checksums, not security.
              </p>
              <p>
                <strong>SHA-1:</strong> Deprecated for cryptographic use but still used for checksums.
              </p>
              <p>
                <strong>SHA-256:</strong> Secure and widely used. Part of the SHA-2 family.
              </p>
              <p>
                <strong>SHA-512:</strong> More secure than SHA-256 with longer hash output.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => handleTextChange("")} disabled={!inputText}>
              Clear Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
