"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function TextReverserPage() {
  const [inputText, setInputText] = useState("")
  const { toast } = useToast()

  const reversals = {
    characters: inputText.split("").reverse().join(""),
    words: inputText.split(" ").reverse().join(" "),
    lines: inputText.split("\n").reverse().join("\n"),
    wordsInPlace: inputText
      .split(" ")
      .map((word) => word.split("").reverse().join(""))
      .join(" "),
  }

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} text copied to clipboard`,
    })
  }

  return (
    <ToolLayout
      title="Text Reverser"
      description="Reverse text by characters, words, or lines"
      category="Text Tools"
      categoryHref="/text-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Text Reverser</CardTitle>
          <p className="text-muted-foreground">Reverse text in different ways - characters, words, or lines</p>
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

          <Tabs defaultValue="characters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="words">Words</TabsTrigger>
              <TabsTrigger value="lines">Lines</TabsTrigger>
              <TabsTrigger value="wordsInPlace">Words in Place</TabsTrigger>
            </TabsList>

            <TabsContent value="characters" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Reverse Characters</h3>
                <Button
                  variant="outline"
                  onClick={() => copyText(reversals.characters, "Reversed characters")}
                  disabled={!inputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg min-h-[120px] font-mono text-sm break-words">
                {reversals.characters || "Enter text above to see reversed characters"}
              </div>
              <p className="text-sm text-muted-foreground">Example: "Hello World" becomes "dlroW olleH"</p>
            </TabsContent>

            <TabsContent value="words" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Reverse Word Order</h3>
                <Button
                  variant="outline"
                  onClick={() => copyText(reversals.words, "Reversed words")}
                  disabled={!inputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg min-h-[120px] font-mono text-sm break-words">
                {reversals.words || "Enter text above to see reversed word order"}
              </div>
              <p className="text-sm text-muted-foreground">
                Example: "Hello World Test" becomes "Test World Hello"
              </p>
            </TabsContent>

            <TabsContent value="lines" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Reverse Line Order</h3>
                <Button
                  variant="outline"
                  onClick={() => copyText(reversals.lines, "Reversed lines")}
                  disabled={!inputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg min-h-[120px] font-mono text-sm break-words whitespace-pre-wrap">
                {reversals.lines || "Enter text above to see reversed line order"}
              </div>
              <p className="text-sm text-muted-foreground">
                Reverses the order of lines while keeping each line intact
              </p>
            </TabsContent>

            <TabsContent value="wordsInPlace" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">Reverse Each Word</h3>
                <Button
                  variant="outline"
                  onClick={() => copyText(reversals.wordsInPlace, "Words reversed in place")}
                  disabled={!inputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg min-h-[120px] font-mono text-sm break-words">
                {reversals.wordsInPlace || "Enter text above to see each word reversed"}
              </div>
              <p className="text-sm text-muted-foreground">Example: "Hello World" becomes "olleH dlroW"</p>
            </TabsContent>
          </Tabs>

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
