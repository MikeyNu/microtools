"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Binary, FileDigit, Copy, RotateCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BinaryConverterPage() {
  const [textInput, setTextInput] = useState("")
  const [binaryInput, setBinaryInput] = useState("")
  const [decimalInput, setDecimalInput] = useState("")
  const [hexInput, setHexInput] = useState("")
  const { toast } = useToast()

  const textToBinary = () => {
    try {
      const binary = textInput
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')
      setBinaryInput(binary)
      toast({ title: "Converted to binary!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to convert", variant: "destructive" })
    }
  }

  const binaryToText = () => {
    try {
      const text = binaryInput
        .split(' ')
        .map(binary => String.fromCharCode(parseInt(binary, 2)))
        .join('')
      setTextInput(text)
      toast({ title: "Converted from binary!" })
    } catch (error) {
      toast({ title: "Error", description: "Invalid binary format", variant: "destructive" })
    }
  }

  const decimalToBinary = () => {
    try {
      const num = parseInt(decimalInput)
      if (isNaN(num)) throw new Error("Invalid number")
      setBinaryInput(num.toString(2))
      setHexInput(num.toString(16).toUpperCase())
      toast({ title: "Converted from decimal!" })
    } catch (error) {
      toast({ title: "Error", description: "Invalid decimal number", variant: "destructive" })
    }
  }

  const binaryToDecimal = () => {
    try {
      const cleanBinary = binaryInput.replace(/\s/g, '')
      const num = parseInt(cleanBinary, 2)
      if (isNaN(num)) throw new Error("Invalid binary")
      setDecimalInput(num.toString())
      setHexInput(num.toString(16).toUpperCase())
      toast({ title: "Converted from binary!" })
    } catch (error) {
      toast({ title: "Error", description: "Invalid binary format", variant: "destructive" })
    }
  }

  const hexToBinary = () => {
    try {
      const num = parseInt(hexInput, 16)
      if (isNaN(num)) throw new Error("Invalid hex")
      setBinaryInput(num.toString(2))
      setDecimalInput(num.toString())
      toast({ title: "Converted from hexadecimal!" })
    } catch (error) {
      toast({ title: "Error", description: "Invalid hexadecimal format", variant: "destructive" })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} copied to clipboard!` })
  }

  const relatedTools = [
    { name: "Hex Converter", href: "/converters/hex" },
    { name: "Base64 Encoder", href: "/developer-tools/base64" },
    { name: "Hash Generator", href: "/developer-tools/hash-generator" },
  ]

  return (
    <ToolLayout
      title="Binary Converter"
      description="Convert between binary, decimal, hexadecimal, and text formats instantly."
      category="Converters"
      categoryHref="/converters"
      relatedTools={relatedTools}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text ↔ Binary</TabsTrigger>
            <TabsTrigger value="decimal">Decimal ↔ Binary</TabsTrigger>
            <TabsTrigger value="hex">Hex ↔ Binary</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Text to Binary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Text Input</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(textInput, "Text")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to convert to binary..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={textToBinary} className="flex-1">
                    <Binary className="mr-2 h-4 w-4" />
                    Text → Binary
                  </Button>
                  <Button onClick={binaryToText} variant="outline" className="flex-1">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Binary → Text
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Binary Output</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(binaryInput, "Binary")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={binaryInput}
                    onChange={(e) => setBinaryInput(e.target.value)}
                    placeholder="Binary output will appear here..."
                    rows={4}
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decimal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Decimal ↔ Binary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Decimal Number</Label>
                  <Textarea
                    value={decimalInput}
                    onChange={(e) => setDecimalInput(e.target.value)}
                    placeholder="Enter decimal number..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={decimalToBinary} className="flex-1">
                    <FileDigit className="mr-2 h-4 w-4" />
                    Decimal → Binary
                  </Button>
                  <Button onClick={binaryToDecimal} variant="outline" className="flex-1">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Binary → Decimal
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Binary</Label>
                  <Textarea
                    value={binaryInput}
                    onChange={(e) => setBinaryInput(e.target.value)}
                    placeholder="Binary representation..."
                    rows={2}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hexadecimal (Auto-calculated)</Label>
                  <Textarea
                    value={hexInput}
                    readOnly
                    placeholder="Hex representation..."
                    rows={2}
                    className="font-mono bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hex" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hexadecimal ↔ Binary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hexadecimal</Label>
                  <Textarea
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    placeholder="Enter hexadecimal (e.g., FF, 1A2B)..."
                    rows={2}
                    className="font-mono"
                  />
                </div>

                <Button onClick={hexToBinary} className="w-full">
                  <Binary className="mr-2 h-4 w-4" />
                  Convert All Formats
                </Button>

                <div className="space-y-2">
                  <Label>Binary</Label>
                  <Textarea
                    value={binaryInput}
                    onChange={(e) => setBinaryInput(e.target.value)}
                    placeholder="Binary representation..."
                    rows={2}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Decimal (Auto-calculated)</Label>
                  <Textarea
                    value={decimalInput}
                    readOnly
                    placeholder="Decimal representation..."
                    rows={2}
                    className="font-mono bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>About Binary Converter</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Convert between binary, decimal, hexadecimal, and text formats. Essential tool for
              programmers, students, and anyone working with different number systems.
            </p>
            <h3>Features:</h3>
            <ul>
              <li>Text to binary and binary to text conversion</li>
              <li>Decimal to binary and binary to decimal conversion</li>
              <li>Hexadecimal to binary conversion</li>
              <li>Automatic conversion between all formats</li>
              <li>Copy results with one click</li>
              <li>Support for large numbers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

