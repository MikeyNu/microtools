"use client"

import { useState } from "react"
import { Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState("1")
  const [version, setVersion] = useState("4")
  const { toast } = useToast()

  const formatUuidBytes = (bytes: Uint8Array) => {
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  const generateUuidV7 = () => {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)

    let timestamp = Date.now()
    for (let i = 5; i >= 0; i--) {
      bytes[i] = timestamp & 0xff
      timestamp = Math.floor(timestamp / 256)
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x70
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return formatUuidBytes(bytes)
  }

  const generateUUID = () => {
    const numCount = Math.min(Number.parseInt(count) || 1, 100)
    const newUuids: string[] = []

    for (let i = 0; i < numCount; i++) {
      if (version === "4") {
        newUuids.push(crypto.randomUUID())
      } else {
        newUuids.push(generateUuidV7())
      }
    }

    setUuids(newUuids)
  }

  const copyUUID = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
    toast({
      title: "Copied!",
      description: "UUID copied to clipboard",
    })
  }

  const copyAllUUIDs = () => {
    const allUuids = uuids.join("\n")
    navigator.clipboard.writeText(allUuids)
    toast({
      title: "Copied!",
      description: `${uuids.length} UUIDs copied to clipboard`,
    })
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate unique identifiers (UUIDs) for your applications"
      category="Web Tools"
      categoryHref="/web-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">UUID Generator</CardTitle>
          <p className="text-muted-foreground">Generate unique identifiers (UUIDs) for your applications</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div>
              <Label>Version</Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">UUID v7 (Time-ordered)</SelectItem>
                  <SelectItem value="4">UUID v4 (Random)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateUUID} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {uuids.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Generated UUIDs</h3>
                <Button variant="outline" onClick={copyAllUUIDs}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
                    <code className="flex-1 font-mono text-sm">{uuid}</code>
                    <Button variant="outline" size="sm" onClick={() => copyUUID(uuid)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">About UUIDs</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>UUID v7:</strong> Time-ordered UUIDs with cryptographic random bits. Useful for sortable database keys.
              </p>
              <p>
                <strong>UUID v4:</strong> Randomly generated. Most commonly used version with very low probability
                of collision.
              </p>
              <p>
                <strong>Use cases:</strong> Database primary keys, session IDs, file names, API request IDs, and any
                scenario requiring unique identifiers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
