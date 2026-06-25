"use client"

import { useMemo, useState } from "react"
import { Copy, FileDigit, RefreshCw } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type ConversionResult = {
  hex: string
  decimal: string
  binary: string
  text: string
  byteCount: number
}

function cleanHex(value: string) {
  return value
    .trim()
    .replace(/^0x/i, "")
    .replace(/[\s_:-]/g, "")
    .toUpperCase()
}

function group(value: string, size: number) {
  return value.replace(new RegExp(`(.{${size}})`, "g"), "$1 ").trim()
}

function assertHex(value: string) {
  if (!value) throw new Error("Enter a hexadecimal value.")
  if (!/^[0-9A-F]+$/i.test(value)) throw new Error("Hex values can only contain 0-9 and A-F.")
}

function hexToBytes(hex: string) {
  const normalized = hex.length % 2 === 0 ? hex : `0${hex}`
  const bytes = new Uint8Array(normalized.length / 2)

  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16)
  }

  return bytes
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

function decodeText(hex: string) {
  if (hex.length % 2 !== 0) return "Hex text decoding needs full byte pairs."
  const bytes = hexToBytes(hex)
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes)
}

function fromHex(value: string): ConversionResult {
  const hex = cleanHex(value)
  assertHex(hex)
  const numeric = BigInt(`0x${hex}`)

  return {
    hex,
    decimal: numeric.toString(10),
    binary: numeric.toString(2),
    text: decodeText(hex),
    byteCount: Math.ceil(hex.length / 2),
  }
}

function fromDecimal(value: string): ConversionResult {
  const cleaned = value.trim().replace(/[\s,_]/g, "")
  if (!/^\d+$/.test(cleaned)) throw new Error("Decimal input must be a non-negative whole number.")
  const numeric = BigInt(cleaned)
  return fromHex(numeric.toString(16))
}

function fromBinary(value: string): ConversionResult {
  const cleaned = value.trim().replace(/[\s_]/g, "")
  if (!/^[01]+$/.test(cleaned)) throw new Error("Binary input can only contain 0 and 1.")
  const numeric = BigInt(`0b${cleaned}`)
  return fromHex(numeric.toString(16))
}

function fromText(value: string): ConversionResult {
  if (!value.length) throw new Error("Enter text to encode as hex.")
  const hex = bytesToHex(new TextEncoder().encode(value))
  return fromHex(hex)
}

export default function HexConverterPage() {
  const [mode, setMode] = useState("hex")
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const relatedTools = [
    { name: "Binary Converter", href: "/converters/binary" },
    { name: "Base64 Encoder", href: "/developer-tools/base64" },
    { name: "Hash Generator", href: "/developer-tools/hash-generator" },
  ]

  const placeholder = useMemo(() => {
    if (mode === "decimal") return "255"
    if (mode === "binary") return "11111111"
    if (mode === "text") return "Micro Tools"
    return "FF 4D 69 63 72 6F"
  }, [mode])

  const convert = () => {
    setError("")

    try {
      const nextResult =
        mode === "decimal"
          ? fromDecimal(input)
          : mode === "binary"
            ? fromBinary(input)
            : mode === "text"
              ? fromText(input)
              : fromHex(input)

      setResult(nextResult)
      toast({ title: "Converted" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to convert this value."
      setResult(null)
      setError(message)
      toast({ title: "Conversion failed", description: message, variant: "destructive" })
    }
  }

  const loadSample = () => {
    setMode("text")
    setInput("Micro Tools")
    setResult(fromText("Micro Tools"))
    setError("")
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast({ title: `${label} copied` })
  }

  return (
    <ToolLayout
      title="Hex Converter"
      description="Convert hexadecimal, decimal, binary, and UTF-8 text values with byte-aware output."
      category="Converters"
      categoryHref="/converters"
      relatedTools={relatedTools}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDigit className="h-5 w-5 text-accent" />
              Hex Converter
            </CardTitle>
            <CardDescription>Convert numbers and text without losing precision on large integers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="hex">Hex</TabsTrigger>
                <TabsTrigger value="decimal">Decimal</TabsTrigger>
                <TabsTrigger value="binary">Binary</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>
              <TabsContent value={mode} className="mt-5 space-y-3">
                <Label htmlFor="converter-input">Input</Label>
                <Textarea
                  id="converter-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={placeholder}
                  className="min-h-32 font-mono"
                />
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={convert} className="sm:min-w-36">
                <RefreshCw className="mr-2 h-4 w-4" />
                Convert
              </Button>
              <Button type="button" variant="outline" onClick={loadSample}>
                Load Sample
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInput("")
                  setResult(null)
                  setError("")
                }}
                disabled={!input && !result && !error}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Result</CardTitle>
                <Badge variant="secondary">{result.byteCount} bytes</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                ["Hex", group(result.hex, 2)],
                ["Decimal", result.decimal],
                ["Binary", group(result.binary, 8)],
                ["UTF-8 Text", result.text],
              ].map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>{label}</Label>
                    <Button variant="ghost" size="sm" onClick={() => copy(value, label)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={value} readOnly className="font-mono" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
