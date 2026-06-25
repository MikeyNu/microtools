'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  AlignLeft,
  Search,
  BarChart2,
  Hash,
  Clock,
  Mic,
  BookOpen,
  Type,
  AlignJustify,
  Minus,
  RefreshCw,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

const toolObj = {
  id: 'text-counter',
  name: 'Text Counter',
  description: 'Count characters, words, sentences, and more. Analyze keyword density and reading time for any text.',
  category: 'text-utilities',
  url: '/text-utilities/text-counter',
}

const relatedTools = [
  { name: 'Case Converter', href: '/text-utilities/case-converter' },
  { name: 'Word Counter', href: '/text-tools/word-counter' },
  { name: 'Text Reverser', href: '/text-tools/text-reverser' },
]

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This sentence is a classic pangram used to display typefaces. Typography is the art of arranging type to make written language legible, readable, and appealing.

Good typography uses space, weight, and structure to guide the reader's eye. Well-crafted text respects the reader's time by making information easy to absorb.

Whether you are writing a blog post, an academic paper, or a short story, understanding how your text is composed helps you communicate more clearly.`

interface TextStats {
  charsWithSpaces: number
  charsWithoutSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  uniqueWords: number
  avgWordLength: number
  avgSentenceLength: number
  readingTime: number
  speakingTime: number
}

interface WordFreq {
  word: string
  count: number
  density: number
}

function computeStats(text: string, includeSpaces: boolean): TextStats {
  const charsWithSpaces = text.length
  const charsWithoutSpaces = text.replace(/\s/g, '').length

  const wordMatches = text.trim() === '' ? [] : text.trim().match(/\b\w+\b/g) || []
  const words = wordMatches.length

  // Sentences: split on .!? followed by space or end
  const sentenceMatches = text.trim() === '' ? [] : text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentences = sentenceMatches.length

  const paragraphMatches = text.trim() === '' ? [] : text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphs = paragraphMatches.length

  const lineMatches = text === '' ? [] : text.split('\n')
  const lines = lineMatches.length

  const uniqueWords = new Set(wordMatches.map(w => w.toLowerCase())).size

  const totalWordLength = wordMatches.reduce((sum, w) => sum + w.length, 0)
  const avgWordLength = words > 0 ? totalWordLength / words : 0

  const avgSentenceLength = sentences > 0 ? words / sentences : 0

  // 200 wpm reading, 130 wpm speaking
  const readingTime = words / 200
  const speakingTime = words / 130

  return {
    charsWithSpaces,
    charsWithoutSpaces: includeSpaces ? charsWithSpaces : charsWithoutSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    readingTime,
    speakingTime,
  }
}

function computeWordFrequency(text: string): WordFreq[] {
  const wordMatches = text.trim() === '' ? [] : text.trim().match(/\b[a-zA-Z]{2,}\b/g) || []
  const total = wordMatches.length
  if (total === 0) return []

  const freq: Record<string, number> = {}
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','as','is','was','are','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may',
    'might','shall','can','this','that','these','those','it','its','we',
    'our','you','your','he','she','they','their','his','her','me','my',
    'us','him','who','what','which','when','where','how','if','so','not',
    'no','up','out','all','over','just','also','than','then','there',
  ])

  for (const w of wordMatches) {
    const lower = w.toLowerCase()
    if (!stopWords.has(lower)) {
      freq[lower] = (freq[lower] || 0) + 1
    }
  }

  return Object.entries(freq)
    .map(([word, count]) => ({
      word,
      count,
      density: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function computeCharFrequency(text: string): { char: string; count: number }[] {
  if (text.trim() === '') return []
  const freq: Record<string, number> = {}
  for (const ch of text) {
    if (/[a-zA-Z]/.test(ch)) {
      const lower = ch.toLowerCase()
      freq[lower] = (freq[lower] || 0) + 1
    }
  }
  return Object.entries(freq)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`
  }
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function TextCounterPage() {
  const [text, setText] = useState('')
  const [includeSpaces, setIncludeSpaces] = useState(true)
  const [searchWord, setSearchWord] = useState('')
  const [showAllChars, setShowAllChars] = useState(false)

  const stats = useMemo(() => computeStats(text, includeSpaces), [text, includeSpaces])
  const wordFreq = useMemo(() => computeWordFrequency(text), [text])
  const charFreq = useMemo(() => computeCharFrequency(text), [text])

  const searchCount = useMemo(() => {
    if (!searchWord.trim() || text.trim() === '') return 0
    const regex = new RegExp(`\\b${searchWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    return (text.match(regex) || []).length
  }, [text, searchWord])

  const maxCharCount = charFreq.length > 0 ? charFreq[0].count : 1
  const displayedChars = showAllChars ? charFreq : charFreq.slice(0, 8)

  const statCards = [
    {
      label: includeSpaces ? 'Characters (with spaces)' : 'Characters (without spaces)',
      value: includeSpaces ? stats.charsWithSpaces : stats.charsWithoutSpaces,
      icon: <Type className="h-4 w-4" />,
      accent: false,
    },
    {
      label: 'Words',
      value: stats.words,
      icon: <AlignLeft className="h-4 w-4" />,
      accent: true,
    },
    {
      label: 'Sentences',
      value: stats.sentences,
      icon: <AlignJustify className="h-4 w-4" />,
      accent: false,
    },
    {
      label: 'Paragraphs',
      value: stats.paragraphs,
      icon: <BookOpen className="h-4 w-4" />,
      accent: false,
    },
    {
      label: 'Lines',
      value: stats.lines,
      icon: <Minus className="h-4 w-4" />,
      accent: false,
    },
    {
      label: 'Unique Words',
      value: stats.uniqueWords,
      icon: <Hash className="h-4 w-4" />,
      accent: false,
    },
    {
      label: 'Avg. Word Length',
      value: stats.avgWordLength,
      icon: <BarChart2 className="h-4 w-4" />,
      accent: false,
      suffix: ' chars',
    },
    {
      label: 'Avg. Sentence Length',
      value: stats.avgSentenceLength,
      icon: <BarChart2 className="h-4 w-4" />,
      accent: false,
      suffix: ' words',
    },
    {
      label: 'Reading Time',
      value: formatTime(stats.readingTime),
      icon: <Clock className="h-4 w-4" />,
      accent: false,
      isString: true,
    },
    {
      label: 'Speaking Time',
      value: formatTime(stats.speakingTime),
      icon: <Mic className="h-4 w-4" />,
      accent: false,
      isString: true,
    },
  ]

  return (
    <ToolLayout
      title="Text Counter"
      description="Analyze any text in detail — character counts, readability metrics, keyword density, and more."
      category="Text Utilities"
      categoryHref="/text-utilities"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="text-counter" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlignLeft className="h-5 w-5 text-accent" />
                Your Text
              </CardTitle>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground">
                  <div
                    role="checkbox"
                    aria-checked={includeSpaces}
                    tabIndex={0}
                    onClick={() => setIncludeSpaces(v => !v)}
                    onKeyDown={e => e.key === ' ' && setIncludeSpaces(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      includeSpaces ? 'bg-accent border-accent' : 'bg-muted border-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        includeSpaces ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </div>
                  Include spaces in char count
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setText(''); setSearchWord('') }}
                  disabled={text === ''}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="gap-1.5"
                >
                  Load Sample
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type your text here to begin analysis..."
              className="min-h-48 resize-y font-sans text-sm leading-relaxed"
              autoFocus
            />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-5 w-5 text-accent" />
              Statistics
            </CardTitle>
            <CardDescription>Live metrics computed from your text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {statCards.map((s, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-lg p-3 flex flex-col gap-1 min-w-0"
                >
                  <div className={`flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase ${s.accent ? 'text-accent' : 'text-muted-foreground'}`}>
                    {s.icon}
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className="font-serif text-xl font-bold text-foreground tabular-nums leading-tight">
                    {s.isString
                      ? s.value
                      : typeof s.value === 'number'
                        ? s.value.toLocaleString()
                        : s.value}
                    {!s.isString && 'suffix' in s && (
                      <span className="text-xs font-sans font-normal text-muted-foreground">{s.suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search + Highlight Count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-5 w-5 text-accent" />
              Word Search
            </CardTitle>
            <CardDescription>Find how many times a specific word appears in your text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1 max-w-sm">
                <Label htmlFor="search-word" className="text-sm mb-1.5 block">Search for a word</Label>
                <Input
                  id="search-word"
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  placeholder="e.g. quick"
                  className="font-mono"
                />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                {searchWord.trim() !== '' && (
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold text-accent tabular-nums">
                      {searchCount}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {searchCount === 1 ? 'occurrence' : 'occurrences'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Frequent Words */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-5 w-5 text-accent" />
                Most Frequent Words
              </CardTitle>
              <CardDescription>Top 10 content words (excluding common stop words)</CardDescription>
            </CardHeader>
            <CardContent>
              {wordFreq.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Enter text above to see word frequency.
                </p>
              ) : (
                <div className="space-y-2">
                  {wordFreq.map((item, i) => {
                    const maxCount = wordFreq[0].count
                    const barWidth = Math.round((item.count / maxCount) * 100)
                    return (
                      <div key={item.word} className="flex items-center gap-2">
                        <span className="w-4 text-xs text-muted-foreground tabular-nums text-right select-none">
                          {i + 1}
                        </span>
                        <span className="w-28 font-mono text-sm text-foreground truncate">
                          {item.word}
                        </span>
                        <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-accent/25 rounded"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="w-7 text-xs tabular-nums text-foreground font-medium text-right">
                          {item.count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keyword Density */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-5 w-5 text-accent" />
                Keyword Density
              </CardTitle>
              <CardDescription>Percentage share of top 10 content words in total word count</CardDescription>
            </CardHeader>
            <CardContent>
              {wordFreq.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Enter text above to see keyword density.
                </p>
              ) : (
                <div className="space-y-2">
                  {wordFreq.map((item, i) => (
                    <div key={item.word} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 text-xs text-muted-foreground tabular-nums text-right select-none shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-mono text-sm text-foreground truncate">
                          {item.word}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className="tabular-nums font-mono text-xs px-2 py-0"
                        >
                          {item.density.toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                          {item.count}×
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Character Frequency */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Type className="h-5 w-5 text-accent" />
                  Character Frequency
                </CardTitle>
                <CardDescription className="mt-1">Distribution of letters in your text (case-insensitive)</CardDescription>
              </div>
              {charFreq.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllChars(v => !v)}
                  className="gap-1.5 text-muted-foreground"
                >
                  {showAllChars ? (
                    <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" /> Show all {charFreq.length}</>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {charFreq.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Enter text above to see character distribution.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {displayedChars.map(item => {
                  const pct = Math.round((item.count / maxCharCount) * 100)
                  return (
                    <div key={item.char} className="bg-muted rounded-lg p-2.5 flex flex-col items-center gap-1">
                      <span className="font-mono font-bold text-lg text-foreground uppercase leading-none">
                        {item.char}
                      </span>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent/50 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
