"use client"

import { useState } from "react"
import { Code, ArrowLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function Base64Page() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [activeTab, setActiveTab] = useState("encode")
  const { toast } = useToast()

  const encodeBase64 = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(inputText)))
      setOutputText(encoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode text",
        variant: "destructive",
      })
    }
  }

  const decodeBase64 = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(inputText)))
      setOutputText(decoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid Base64 string",
        variant: "destructive",
      })
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText)
    toast({
      title: "Copied!",
      description: "Output copied to clipboard",
    })
  }

  const clearAll = () => {
    setInputText("")
    setOutputText("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/web-tools"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Web Tools
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Base64 Encoder/Decoder</CardTitle>
              <p className="text-muted-foreground">Encode and decode Base64 strings safely</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encode">Encode</TabsTrigger>
                  <TabsTrigger value="decode">Decode</TabsTrigger>
                </TabsList>

                <TabsContent value="encode" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Plain Text Input</label>
                      <Textarea
                        placeholder="Enter text to encode..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[150px] mt-2"
                      />
                    </div>
                    <Button onClick={encodeBase64} className="w-full" disabled={!inputText}>
                      Encode to Base64
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="decode" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Base64 Input</label>
                      <Textarea
                        placeholder="Enter Base64 string to decode..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[150px] mt-2 font-mono"
                      />
                    </div>
                    <Button onClick={decodeBase64} className="w-full" disabled={!inputText}>
                      Decode from Base64
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {outputText && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">
                      {activeTab === "encode" ? "Base64 Output" : "Decoded Output"}
                    </h3>
                    <Button variant="outline" onClick={copyOutput}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={outputText}
                    readOnly
                    className={`min-h-[150px] ${activeTab === "encode" ? "font-mono" : ""}`}
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">About Base64</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
                    It's commonly used for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Encoding binary data in emails and web pages</li>
                    <li>Data URLs for embedding images in HTML/CSS</li>
                    <li>API authentication tokens</li>
                    <li>Storing binary data in text-based formats like JSON or XML</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
