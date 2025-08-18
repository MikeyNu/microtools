"use client"

import { useState } from "react"
import { Palette, ArrowLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ColorConverterPage() {
  const [hexColor, setHexColor] = useState("#3b82f6")
  const [rgbColor, setRgbColor] = useState({ r: 59, g: 130, b: 246 })
  const [hslColor, setHslColor] = useState({ h: 217, s: 91, l: 60 })
  const { toast } = useToast()

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h: number
    let s: number
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
        default:
          h = 0
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r: number
    let g: number
    let b: number

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  const updateFromHex = (hex: string) => {
    setHexColor(hex)
    const rgb = hexToRgb(hex)
    if (rgb) {
      setRgbColor(rgb)
      setHslColor(rgbToHsl(rgb.r, rgb.g, rgb.b))
    }
  }

  const updateFromRgb = (r: number, g: number, b: number) => {
    const rgb = { r, g, b }
    setRgbColor(rgb)
    setHexColor(rgbToHex(r, g, b))
    setHslColor(rgbToHsl(r, g, b))
  }

  const updateFromHsl = (h: number, s: number, l: number) => {
    const hsl = { h, s, l }
    setHslColor(hsl)
    const rgb = hslToRgb(h, s, l)
    setRgbColor(rgb)
    setHexColor(rgbToHex(rgb.r, rgb.g, rgb.b))
  }

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${format} color copied to clipboard`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/converters"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Converters
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Color Converter</CardTitle>
              <p className="text-muted-foreground">Convert between HEX, RGB, and HSL color formats</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Preview */}
              <div className="text-center">
                <div
                  className="w-32 h-32 mx-auto rounded-lg border-2 border-border shadow-lg"
                  style={{ backgroundColor: hexColor }}
                />
                <p className="text-sm text-muted-foreground mt-2">Color Preview</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* HEX */}
                <div className="space-y-2">
                  <Label htmlFor="hex">HEX Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="hex"
                      type="text"
                      value={hexColor}
                      onChange={(e) => updateFromHex(e.target.value)}
                      placeholder="#3b82f6"
                    />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(hexColor, "HEX")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* RGB */}
                <div className="space-y-2">
                  <Label>RGB Color</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbColor.r}
                      onChange={(e) => updateFromRgb(Number.parseInt(e.target.value), rgbColor.g, rgbColor.b)}
                      placeholder="R"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbColor.g}
                      onChange={(e) => updateFromRgb(rgbColor.r, Number.parseInt(e.target.value), rgbColor.b)}
                      placeholder="G"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbColor.b}
                      onChange={(e) => updateFromRgb(rgbColor.r, rgbColor.g, Number.parseInt(e.target.value))}
                      placeholder="B"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => copyToClipboard(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, "RGB")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy RGB
                  </Button>
                </div>

                {/* HSL */}
                <div className="space-y-2">
                  <Label>HSL Color</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="0"
                      max="360"
                      value={hslColor.h}
                      onChange={(e) => updateFromHsl(Number.parseInt(e.target.value), hslColor.s, hslColor.l)}
                      placeholder="H"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={hslColor.s}
                      onChange={(e) => updateFromHsl(hslColor.h, Number.parseInt(e.target.value), hslColor.l)}
                      placeholder="S"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={hslColor.l}
                      onChange={(e) => updateFromHsl(hslColor.h, hslColor.s, Number.parseInt(e.target.value))}
                      placeholder="L"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => copyToClipboard(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, "HSL")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HSL
                  </Button>
                </div>
              </div>

              {/* Color Information */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Color Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">HEX:</span> {hexColor}
                  </div>
                  <div>
                    <span className="font-medium">RGB:</span> {rgbColor.r}, {rgbColor.g}, {rgbColor.b}
                  </div>
                  <div>
                    <span className="font-medium">HSL:</span> {hslColor.h}°, {hslColor.s}%, {hslColor.l}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
