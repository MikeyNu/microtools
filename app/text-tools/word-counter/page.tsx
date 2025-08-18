"use client"

import { useState, useEffect } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function WordCounterPage() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, "").length
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
    const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    const readingTime = Math.ceil(words / 200) // Average reading speed: 200 words per minute

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
    })
  }, [text])

  const copyStats = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading time: ${stats.readingTime} min`

    navigator.clipboard.writeText(statsText)
    toast({
      title: "Copied!",
      description: "Text statistics copied to clipboard",
    })
  }

  const relatedTools = [
    { name: "Case Converter", href: "/text-tools/case-converter" },
    { name: "Text Reverser", href: "/text-tools/text-reverser" },
    { name: "Lorem Ipsum Generator", href: "/text-tools/lorem-ipsum" },
    { name: "Password Generator", href: "/text-tools/password-generator" },
  ]

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, paragraphs, and get reading time estimates for any text."
      category="Text Tools"
      categoryHref="/text-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Word Counter</CardTitle>
            <p className="text-muted-foreground">Count words, characters, sentences, and get reading time estimates</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Textarea
                  placeholder="Type or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[400px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setText("")}>
                    Clear Text
                  </Button>
                  <Button variant="outline" onClick={copyStats}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Stats
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold">Statistics</h3>
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Characters</div>
                    <div className="text-2xl font-bold text-primary">{stats.characters.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
                    <div className="text-2xl font-bold text-primary">{stats.charactersNoSpaces.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Words</div>
                    <div className="text-2xl font-bold text-accent">{stats.words.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Sentences</div>
                    <div className="text-xl font-semibold">{stats.sentences.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Paragraphs</div>
                    <div className="text-xl font-semibold">{stats.paragraphs.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Reading Time</div>
                    <div className="text-xl font-semibold text-accent">{stats.readingTime} min</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
