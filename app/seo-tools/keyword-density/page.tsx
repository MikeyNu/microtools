"use client"

import { useState } from "react"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ToolLayout } from "@/components/tool-layout"

interface KeywordData {
  word: string
  count: number
  density: number
}

export default function KeywordDensityPage() {
  const [text, setText] = useState("")
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [totalWords, setTotalWords] = useState(0)

  const analyzeKeywords = () => {
    if (!text.trim()) return

    // Clean and split text into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2) // Filter out words shorter than 3 characters

    const totalWordCount = words.length
    setTotalWords(totalWordCount)

    // Count word frequency
    const wordCount: Record<string, number> = {}
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    // Convert to array and calculate density
    const keywordData: KeywordData[] = Object.entries(wordCount)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / totalWordCount) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 keywords

    setKeywords(keywordData)
  }

  const getDensityColor = (density: number) => {
    if (density > 3) return "text-destructive"
    if (density > 2) return "text-warning"
    return "text-success"
  }

  const getDensityStatus = (density: number) => {
    if (density > 3) return "Too High"
    if (density > 2) return "High"
    if (density > 1) return "Good"
    return "Low"
  }

  return (
    <ToolLayout
      title="Keyword Density Checker"
      description="Analyze keyword density and frequency in your text"
      category="SEO Tools"
      categoryHref="/seo-tools"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Keyword Density Checker</CardTitle>
          <p className="text-muted-foreground">
            Analyze keyword density in your content for better SEO optimization
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="Paste your content here to analyze keyword density..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Word count:{" "}
                  {
                    text
                      .trim()
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  }
                </p>
              </div>
              <Button onClick={analyzeKeywords} className="w-full" disabled={!text.trim()}>
                Analyze Keywords
              </Button>
            </div>

            <div className="space-y-4">
              {keywords.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">Keyword Analysis</h3>
                    <div className="text-sm text-muted-foreground">Total words: {totalWords}</div>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {keywords.map((keyword, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{keyword.word}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">{keyword.count} times</span>
                            <span className={`text-sm font-semibold ${getDensityColor(keyword.density)}`}>
                              {keyword.density.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={Math.min(keyword.density * 10, 100)} className="flex-1" />
                          <span className={`text-xs ${getDensityColor(keyword.density)}`}>
                            {getDensityStatus(keyword.density)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-muted p-12 rounded-lg text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter text to analyze keyword density</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Keyword Density Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong className="text-success">Good (1-2%):</strong> Optimal keyword density for SEO
              </div>
              <div>
                <strong className="text-warning">High (2-3%):</strong> May be acceptable but monitor closely
              </div>
              <div>
                <strong className="text-destructive">Too High (3%+):</strong> Risk of keyword stuffing penalty
              </div>
              <div>
                <strong>Focus Keywords:</strong> Aim for 1-2% density for your main keywords
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
