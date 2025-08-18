"use client"

import { useState } from "react"
import { QrCode, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function QRGeneratorPage() {
  const [inputText, setInputText] = useState("")
  const [qrType, setQrType] = useState("text")
  const [size, setSize] = useState([200])
  const [qrCode, setQrCode] = useState("")
  const { toast } = useToast()

  const generateQR = () => {
    if (!inputText) {
      toast({
        title: "Error",
        description: "Please enter text or URL to generate QR code",
        variant: "destructive",
      })
      return
    }

    // Using a QR code API service (placeholder)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size[0]}x${size[0]}&data=${encodeURIComponent(
      inputText,
    )}`
    setQrCode(qrUrl)
  }

  const downloadQR = () => {
    if (!qrCode) return

    const link = document.createElement("a")
    link.href = qrCode
    link.download = "qrcode.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Downloaded!",
      description: "QR code saved to your downloads",
    })
  }

  const copyQRUrl = () => {
    navigator.clipboard.writeText(qrCode)
    toast({
      title: "Copied!",
      description: "QR code URL copied to clipboard",
    })
  }

  const qrTypes = [
    { value: "text", label: "Plain Text" },
    { value: "url", label: "Website URL" },
    { value: "email", label: "Email Address" },
    { value: "phone", label: "Phone Number" },
    { value: "sms", label: "SMS Message" },
    { value: "wifi", label: "WiFi Network" },
  ]

  const relatedTools = [
    { name: "URL Shortener", href: "/web-tools/url-shortener" },
    { name: "Base64 Encoder", href: "/web-tools/base64" },
    { name: "JSON Formatter", href: "/web-tools/json-formatter" },
    { name: "UUID Generator", href: "/web-tools/uuid-generator" },
  ]

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate customizable QR codes for text, URLs, WiFi networks, and more with adjustable sizes."
      category="Web Tools"
      categoryHref="/web-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">QR Code Generator</CardTitle>
            <p className="text-muted-foreground">Generate QR codes for text, URLs, and more</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>QR Code Type</Label>
                  <Select value={qrType} onValueChange={setQrType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qrTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inputText">Content</Label>
                  {qrType === "text" || qrType === "sms" ? (
                    <Textarea
                      id="inputText"
                      placeholder="Enter your text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <Input
                      id="inputText"
                      type={qrType === "email" ? "email" : qrType === "phone" ? "tel" : "text"}
                      placeholder={
                        qrType === "url"
                          ? "https://example.com"
                          : qrType === "email"
                            ? "email@example.com"
                            : qrType === "phone"
                              ? "+1234567890"
                              : qrType === "wifi"
                                ? "WIFI:T:WPA;S:NetworkName;P:Password;;"
                                : "Enter content..."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <Label>
                    Size: {size[0]}x{size[0]} pixels
                  </Label>
                  <div className="mt-2">
                    <Slider value={size} onValueChange={setSize} max={500} min={100} step={50} className="w-full" />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>100px</span>
                    <span>500px</span>
                  </div>
                </div>

                <Button onClick={generateQR} className="w-full">
                  Generate QR Code
                </Button>
              </div>

              <div className="space-y-4">
                {qrCode ? (
                  <>
                    <h3 className="font-serif text-lg font-semibold">Generated QR Code</h3>
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <img
                        src={qrCode || "/placeholder.svg"}
                        alt="Generated QR Code"
                        className="mx-auto border rounded"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={downloadQR} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={copyQRUrl} className="flex-1 bg-transparent">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-muted p-12 rounded-lg text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your QR code will appear here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">QR Code Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>WiFi:</strong> WIFI:T:WPA;S:NetworkName;P:Password;;
                </div>
                <div>
                  <strong>SMS:</strong> sms:+1234567890:Hello World
                </div>
                <div>
                  <strong>Email:</strong> mailto:someone@example.com
                </div>
                <div>
                  <strong>Phone:</strong> tel:+1234567890
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
