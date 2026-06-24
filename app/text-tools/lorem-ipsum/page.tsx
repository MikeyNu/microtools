"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
]

export default function LoremIpsumPage() {
  const [count, setCount] = useState("3")
  const [type, setType] = useState("paragraphs")
  const [generatedText, setGeneratedText] = useState("")
  const { toast } = useToast()

  const generateLorem = () => {
    const numCount = Number.parseInt(count) || 1
    let result = ""

    if (type === "words") {
      const words = []
      for (let i = 0; i < numCount; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
      }
      result = words.join(" ")
    } else if (type === "sentences") {
      const sentences = []
      for (let i = 0; i < numCount; i++) {
        const sentenceLength = Math.floor(Math.random() * 15) + 5
        const words = []
        for (let j = 0; j < sentenceLength; j++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
        }
        const sentence = words.join(" ")
        sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".")
      }
      result = sentences.join(" ")
    } else {
      // paragraphs
      const paragraphs = []
      for (let i = 0; i < numCount; i++) {
        const sentenceCount = Math.floor(Math.random() * 5) + 3
        const sentences = []
        for (let j = 0; j < sentenceCount; j++) {
          const sentenceLength = Math.floor(Math.random() * 15) + 5
          const words = []
          for (let k = 0; k < sentenceLength; k++) {
            words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
          }
          const sentence = words.join(" ")
          sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".")
        }
        paragraphs.push(sentences.join(" "))
      }
      result = paragraphs.join("\n\n")
    }

    setGeneratedText(result)
  }

  const copyText = () => {
    navigator.clipboard.writeText(generatedText)
    toast({
      title: "Copied!",
      description: "Lorem ipsum text copied to clipboard",
    })
  }

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for designs and layouts"
      category="Text Tools"
      categoryHref="/text-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Lorem Ipsum Generator</CardTitle>
          <p className="text-muted-foreground">Generate placeholder text for your designs and layouts</p>
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
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateLorem} className="w-full">
                Generate Text
              </Button>
            </div>
          </div>

          {generatedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Generated Text</h3>
                <Button variant="outline" onClick={copyText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
              </div>
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-[300px] font-serif leading-relaxed"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">About Lorem Ipsum</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's
              standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
              it to make a type specimen book.
            </p>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
