"use client"

import { useState } from "react"
import { FileCode, ArrowLeft, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function JSONFormatterPage() {
  const [inputJson, setInputJson] = useState("")
  const [outputJson, setOutputJson] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutputJson(formatted)
      setIsValid(true)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setIsValid(false)
      setOutputJson("")
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(inputJson)
      const minified = JSON.stringify(parsed)
      setOutputJson(minified)
      setIsValid(true)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setIsValid(false)
      setOutputJson("")
    }
  }

  const validateJson = () => {
    try {
      JSON.parse(inputJson)
      setIsValid(true)
      setError("")
      toast({
        title: "Valid JSON",
        description: "Your JSON is properly formatted",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setIsValid(false)
      toast({
        title: "Invalid JSON",
        description: err instanceof Error ? err.message : "Invalid JSON",
        variant: "destructive",
      })
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(outputJson)
    toast({
      title: "Copied!",
      description: "Formatted JSON copied to clipboard",
    })
  }

  const clearAll = () => {
    setInputJson("")
    setOutputJson("")
    setIsValid(null)
    setError("")
  }

  const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  }
}`

  const loadSample = () => {
    setInputJson(sampleJson)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <FileCode className="h-8 w-8 text-primary" />
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
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">JSON Formatter & Validator</CardTitle>
              <p className="text-muted-foreground">Format, validate, and minify JSON data</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">Input JSON</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={loadSample}>
                        Load Sample
                      </Button>
                      {isValid !== null && (
                        <div className="flex items-center space-x-1">
                          {isValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${isValid ? "text-green-600" : "text-red-600"}`}>
                            {isValid ? "Valid" : "Invalid"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Paste your JSON here..."
                    value={inputJson}
                    onChange={(e) => {
                      setInputJson(e.target.value)
                      setIsValid(null)
                      setError("")
                    }}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
                  <div className="flex space-x-2">
                    <Button onClick={formatJson} disabled={!inputJson}>
                      Format
                    </Button>
                    <Button onClick={minifyJson} disabled={!inputJson}>
                      Minify
                    </Button>
                    <Button variant="outline" onClick={validateJson} disabled={!inputJson}>
                      Validate
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">Output</h3>
                    {outputJson && (
                      <Button variant="outline" size="sm" onClick={copyOutput}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={outputJson}
                    readOnly
                    placeholder="Formatted JSON will appear here..."
                    className="min-h-[400px] font-mono text-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">JSON Tools Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Format:</strong> Pretty-print JSON with proper indentation and line breaks
                  </div>
                  <div>
                    <strong>Minify:</strong> Remove whitespace and formatting to reduce file size
                  </div>
                  <div>
                    <strong>Validate:</strong> Check if JSON syntax is correct and properly structured
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
