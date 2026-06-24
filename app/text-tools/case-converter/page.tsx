"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function CaseConverterPage() {
  const [inputText, setInputText] = useState("")
  const { toast } = useToast()

  const conversions = {
    uppercase: inputText.toUpperCase(),
    lowercase: inputText.toLowerCase(),
    titleCase: inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    sentenceCase: inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase(),
    camelCase: inputText
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, ""),
    pascalCase: inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, ""),
    snakeCase: inputText.toLowerCase().replace(/\s+/g, "_"),
    kebabCase: inputText.toLowerCase().replace(/\s+/g, "-"),
  }

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} text copied to clipboard`,
    })
  }

  const conversionOptions = [
    { key: "uppercase", label: "UPPERCASE", description: "ALL LETTERS IN UPPERCASE" },
    { key: "lowercase", label: "lowercase", description: "all letters in lowercase" },
    { key: "titleCase", label: "Title Case", description: "First Letter Of Each Word Capitalized" },
    { key: "sentenceCase", label: "Sentence case", description: "First letter capitalized, rest lowercase" },
    { key: "camelCase", label: "camelCase", description: "firstWordLowercaseRestCapitalized" },
    { key: "pascalCase", label: "PascalCase", description: "FirstLetterOfEachWordCapitalized" },
    { key: "snakeCase", label: "snake_case", description: "words_separated_by_underscores" },
    { key: "kebabCase", label: "kebab-case", description: "words-separated-by-hyphens" },
  ]

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between uppercase, lowercase, title case, camelCase, and more"
      category="Text Tools"
      categoryHref="/text-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Case Converter</CardTitle>
          <p className="text-muted-foreground">Convert text to different cases and formats</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversionOptions.map((option) => (
              <Card key={option.key} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-serif">{option.label}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(conversions[option.key as keyof typeof conversions], option.label)}
                      disabled={!inputText}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md min-h-[60px] font-mono text-sm break-words">
                    {conversions[option.key as keyof typeof conversions] || "Enter text above to see conversion"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setInputText("")} disabled={!inputText}>
              Clear Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
