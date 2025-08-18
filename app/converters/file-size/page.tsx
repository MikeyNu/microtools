"use client"

import { useState } from "react"
import { HardDrive, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const fileSizeUnits = [
  { code: "B", name: "Bytes", factor: 1 },
  { code: "KB", name: "Kilobytes", factor: 1024 },
  { code: "MB", name: "Megabytes", factor: 1024 * 1024 },
  { code: "GB", name: "Gigabytes", factor: 1024 * 1024 * 1024 },
  { code: "TB", name: "Terabytes", factor: 1024 * 1024 * 1024 * 1024 },
  { code: "PB", name: "Petabytes", factor: 1024 * 1024 * 1024 * 1024 * 1024 },
]

export default function FileSizeConverterPage() {
  const [size, setSize] = useState("1")
  const [fromUnit, setFromUnit] = useState("GB")
  const [toUnit, setToUnit] = useState("MB")
  const [result, setResult] = useState<number | null>(null)

  const convertFileSize = () => {
    const sizeNum = Number.parseFloat(size)
    const fromFactor = fileSizeUnits.find((u) => u.code === fromUnit)?.factor || 1
    const toFactor = fileSizeUnits.find((u) => u.code === toUnit)?.factor || 1

    if (sizeNum) {
      const bytes = sizeNum * fromFactor
      const converted = bytes / toFactor
      setResult(Math.round(converted * 1000000) / 1000000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-primary" />
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
              <CardTitle className="font-serif text-2xl">File Size Converter</CardTitle>
              <p className="text-muted-foreground">Convert between bytes, KB, MB, GB, TB, and PB</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="size">File Size</Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="1"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>From Unit</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fileSizeUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name} ({unit.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>To Unit</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fileSizeUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name} ({unit.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={convertFileSize} className="w-full">
                    Convert File Size
                  </Button>
                </div>

                {result !== null && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold">Result</h3>
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {size} {fromUnit} equals
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {result.toLocaleString()} {toUnit}
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Common File Sizes</h4>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div className="flex justify-between">
                          <span>Photo (JPEG):</span>
                          <span>2-5 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Song (MP3):</span>
                          <span>3-5 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HD Video (1 min):</span>
                          <span>100-200 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DVD Movie:</span>
                          <span>4.7 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
