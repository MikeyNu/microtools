'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { ArrowLeftRight, Eye, CheckCircle2, XCircle, Info, Palette } from 'lucide-react'

const toolObj = {
  id: 'contrast-checker',
  name: 'Color Contrast Checker',
  description: 'Check WCAG color contrast ratios for accessible design',
  category: 'design-tools',
  url: '/design-tools/contrast-checker',
}

const relatedTools = [
  { name: 'Color Picker', href: '/design-tools/color-picker' },
  { name: 'Color Palette Generator', href: '/design-tools/palette-generator' },
  { name: 'Gradient Generator', href: '/design-tools/gradient-generator' },
]

// Common color pair suggestions
const COLOR_SUGGESTIONS: { label: string; fg: string; bg: string }[] = [
  { label: 'Black on White', fg: '#000000', bg: '#FFFFFF' },
  { label: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
  { label: 'Navy on Light Blue', fg: '#1E3A5F', bg: '#EBF4FF' },
  { label: 'Dark Red on Cream', fg: '#7B1D1D', bg: '#FFF8F0' },
  { label: 'Dark Green on Mint', fg: '#14532D', bg: '#F0FDF4' },
  { label: 'Purple on Lavender', fg: '#4C1D95', bg: '#F5F3FF' },
  { label: 'Charcoal on Sand', fg: '#374151', bg: '#F9F5EE' },
  { label: 'White on Slate', fg: '#FFFFFF', bg: '#475569' },
]

// Convert hex to linearized sRGB channel value
function linearize(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

// Relative luminance per WCAG 2.x
function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return 0
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6})$/.test(hex)
}

function normalizeHex(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith('#')) return trimmed
  return '#' + trimmed
}

interface WCAGResult {
  label: string
  threshold: number
  pass: boolean
  description: string
}

function getWCAGResults(ratio: number): WCAGResult[] {
  return [
    {
      label: 'AA Normal',
      threshold: 4.5,
      pass: ratio >= 4.5,
      description: 'Body text, 18px regular or smaller',
    },
    {
      label: 'AA Large',
      threshold: 3.0,
      pass: ratio >= 3.0,
      description: 'Large text, 18px bold or 24px regular',
    },
    {
      label: 'AAA Normal',
      threshold: 7.0,
      pass: ratio >= 7.0,
      description: 'Enhanced body text requirement',
    },
    {
      label: 'AAA Large',
      threshold: 4.5,
      pass: ratio >= 4.5,
      description: 'Enhanced large text requirement',
    },
  ]
}

function getRatioLabel(ratio: number): { text: string; className: string } {
  if (ratio >= 7) return { text: 'Excellent', className: 'text-success' }
  if (ratio >= 4.5) return { text: 'Good', className: 'text-success' }
  if (ratio >= 3) return { text: 'Moderate', className: 'text-warning' }
  return { text: 'Poor', className: 'text-destructive' }
}

export default function ContrastCheckerPage() {
  const [fgHex, setFgHex] = useState('#171310')
  const [bgHex, setBgHex] = useState('#F4F0E8')
  const [fgInput, setFgInput] = useState('#171310')
  const [bgInput, setBgInput] = useState('#F4F0E8')

  const handleFgColorPicker = (value: string) => {
    setFgHex(value)
    setFgInput(value)
  }

  const handleBgColorPicker = (value: string) => {
    setBgHex(value)
    setBgInput(value)
  }

  const handleFgTextInput = (value: string) => {
    setFgInput(value)
    const normalized = normalizeHex(value)
    if (isValidHex(normalized)) {
      setFgHex(normalized)
    }
  }

  const handleBgTextInput = (value: string) => {
    setBgInput(value)
    const normalized = normalizeHex(value)
    if (isValidHex(normalized)) {
      setBgHex(normalized)
    }
  }

  const handleSwap = useCallback(() => {
    setFgHex(bgHex)
    setBgHex(fgHex)
    setFgInput(bgHex)
    setBgInput(fgHex)
  }, [fgHex, bgHex])

  const handleSuggestion = (fg: string, bg: string) => {
    setFgHex(fg)
    setBgHex(bg)
    setFgInput(fg)
    setBgInput(bg)
  }

  const fgValid = isValidHex(fgHex)
  const bgValid = isValidHex(bgHex)
  const bothValid = fgValid && bgValid

  const ratio = bothValid ? contrastRatio(fgHex, bgHex) : 0
  const ratioDisplay = ratio.toFixed(2)
  const wcagResults = bothValid ? getWCAGResults(ratio) : []
  const ratioLabel = bothValid ? getRatioLabel(ratio) : null

  return (
    <ToolLayout
      title="Color Contrast Checker"
      description="Verify WCAG 2.x contrast ratios for accessible foreground and background color combinations"
      category="Design Tools"
      categoryHref="/design-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="contrast-checker" />
          <ShareButton tool={toolObj} />
        </div>

        {/* Color inputs + ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Foreground color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-accent" />
                Foreground Color
              </CardTitle>
              <CardDescription>Text or icon color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <input
                    id="fg-color-picker"
                    type="color"
                    value={fgHex}
                    onChange={(e) => handleFgColorPicker(e.target.value)}
                    className="w-14 h-14 rounded-md border border-border cursor-pointer p-0.5 bg-card"
                    aria-label="Foreground color picker"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="fg-hex-input" className="text-xs text-muted-foreground uppercase tracking-wide">
                    Hex value
                  </Label>
                  <Input
                    id="fg-hex-input"
                    value={fgInput}
                    onChange={(e) => handleFgTextInput(e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-sm"
                    aria-label="Foreground hex color value"
                  />
                </div>
              </div>
              {!fgValid && fgInput.length > 0 && (
                <p className="text-xs text-destructive">Enter a valid 6-digit hex (e.g. #1A2B3C)</p>
              )}
            </CardContent>
          </Card>

          {/* Background color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Background Color
              </CardTitle>
              <CardDescription>Surface or container color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <input
                    id="bg-color-picker"
                    type="color"
                    value={bgHex}
                    onChange={(e) => handleBgColorPicker(e.target.value)}
                    className="w-14 h-14 rounded-md border border-border cursor-pointer p-0.5 bg-card"
                    aria-label="Background color picker"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="bg-hex-input" className="text-xs text-muted-foreground uppercase tracking-wide">
                    Hex value
                  </Label>
                  <Input
                    id="bg-hex-input"
                    value={bgInput}
                    onChange={(e) => handleBgTextInput(e.target.value)}
                    placeholder="#FFFFFF"
                    className="font-mono text-sm"
                    aria-label="Background hex color value"
                  />
                </div>
              </div>
              {!bgValid && bgInput.length > 0 && (
                <p className="text-xs text-destructive">Enter a valid 6-digit hex (e.g. #1A2B3C)</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleSwap}
            className="gap-2"
            aria-label="Swap foreground and background colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap Colors
          </Button>
        </div>

        {/* Ratio + WCAG results */}
        {bothValid && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                Contrast Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Big ratio display */}
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contrast Ratio</p>
                  <p className="text-4xl font-mono font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {ratioDisplay}<span className="text-xl text-muted-foreground font-normal">:1</span>
                  </p>
                </div>
                {ratioLabel && (
                  <Badge
                    variant="outline"
                    className={`text-base px-3 py-1 font-semibold border-current ${ratioLabel.className}`}
                  >
                    {ratioLabel.text}
                  </Badge>
                )}
              </div>

              {/* WCAG grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wcagResults.map((result) => (
                  <div
                    key={result.label}
                    className="flex items-start gap-3 bg-muted rounded-lg p-3"
                  >
                    {result.pass ? (
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{result.label}</span>
                        <span className={`text-xs font-medium ${result.pass ? 'text-success' : 'text-destructive'}`}>
                          {result.pass ? 'Pass' : 'Fail'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ≥ {result.threshold}:1
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {result.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live preview */}
        {bothValid && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-accent" />
                Live Preview
              </CardTitle>
              <CardDescription>How text appears at this color combination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-lg p-6 space-y-3 border border-border"
                style={{ backgroundColor: bgHex, color: fgHex }}
              >
                <p className="text-2xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Display Heading Text
                </p>
                <p className="text-lg font-semibold">
                  Subheading or UI Label
                </p>
                <p className="text-base leading-relaxed max-w-prose">
                  Body copy reads at this size. Legibility depends on both the contrast ratio and the text size — smaller, lighter type needs higher contrast to remain comfortable for extended reading.
                </p>
                <p className="text-sm">
                  Small text — captions, metadata, supporting labels.
                </p>
                <div className="flex gap-2 flex-wrap pt-1">
                  <span
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: fgHex, color: bgHex, borderColor: fgHex }}
                  >
                    Button (inverted)
                  </span>
                  <span
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ borderColor: fgHex, color: fgHex }}
                  >
                    Outline button
                  </span>
                </div>
              </div>

              {/* Color swatches row */}
              <div className="flex gap-3 items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: fgHex }}
                    aria-hidden="true"
                  />
                  <span className="font-mono">{fgHex}</span>
                  <span className="text-muted-foreground">foreground</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: bgHex }}
                    aria-hidden="true"
                  />
                  <span className="font-mono">{bgHex}</span>
                  <span className="text-muted-foreground">background</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              Common Color Pairs
            </CardTitle>
            <CardDescription>Click a pair to load it for inspection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLOR_SUGGESTIONS.map((suggestion) => {
                const r = contrastRatio(suggestion.fg, suggestion.bg)
                const passes = r >= 4.5
                const rLabel = getRatioLabel(r)
                return (
                  <button
                    key={suggestion.label}
                    onClick={() => handleSuggestion(suggestion.fg, suggestion.bg)}
                    className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-card hover:border-accent/50 hover:bg-secondary transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Load ${suggestion.label} — contrast ${r.toFixed(2)}:1`}
                  >
                    {/* Mini preview strip */}
                    <div
                      className="w-10 h-10 rounded shrink-0 border border-border flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: suggestion.bg, color: suggestion.fg }}
                      aria-hidden="true"
                    >
                      Aa
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{suggestion.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {r.toFixed(2)}:1
                        </span>
                        <span className={`text-xs font-medium ${rLabel.className}`}>
                          {rLabel.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <span
                        className="w-4 h-4 rounded-sm border border-border"
                        style={{ backgroundColor: suggestion.fg }}
                        aria-hidden="true"
                      />
                      <span
                        className="w-4 h-4 rounded-sm border border-border"
                        style={{ backgroundColor: suggestion.bg }}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reference card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              WCAG Contrast Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Level AA (minimum)</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex justify-between gap-2">
                    <span>Normal text (under 18px or non-bold)</span>
                    <span className="font-mono font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>4.5:1</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Large text (18px+ or 14px bold)</span>
                    <span className="font-mono font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>3.0:1</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>UI components &amp; graphical elements</span>
                    <span className="font-mono font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>3.0:1</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Level AAA (enhanced)</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex justify-between gap-2">
                    <span>Normal text (enhanced)</span>
                    <span className="font-mono font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>7.0:1</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Large text (enhanced)</span>
                    <span className="font-mono font-medium text-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>4.5:1</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  AAA is not required for all content. Aim for it in critical reading contexts — legal text, health information, long-form editorial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolLayout>
  )
}
