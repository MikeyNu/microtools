"use client"

import { useState, useCallback } from "react"
import {
  Plus,
  Trash2,
  Download,
  Copy,
  FileCode2,
  Globe,
  CheckCircle,
  AlertCircle,
  Map,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolLayout } from "@/components/tool-layout"
import { FavoriteButton, ShareButton } from "@/components/user-engagement"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
type InputMode = "builder" | "manual"

interface PageEntry {
  id: string
  url: string
  priority: string
  changefreq: ChangeFreq
  lastmod: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANGEFREQ_OPTIONS: { value: ChangeFreq; label: string }[] = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
]

const PRIORITY_OPTIONS = [
  { value: "1.0", label: "1.0 — Highest" },
  { value: "0.9", label: "0.9" },
  { value: "0.8", label: "0.8 — High" },
  { value: "0.7", label: "0.7" },
  { value: "0.6", label: "0.6" },
  { value: "0.5", label: "0.5 — Default" },
  { value: "0.4", label: "0.4" },
  { value: "0.3", label: "0.3 — Low" },
  { value: "0.2", label: "0.2" },
  { value: "0.1", label: "0.1 — Lowest" },
  { value: "0.0", label: "0.0" },
]

const TOOL_OBJ = {
  id: "sitemap-generator",
  name: "XML Sitemap Generator",
  description: "Generate valid XML sitemaps for your website with priority, change frequency, and last modified date.",
  category: "seo-tools",
  url: "/seo-tools/sitemap-generator",
}

const RELATED_TOOLS = [
  { name: "Robots.txt Generator", href: "/seo-tools/robots-generator" },
  { name: "Meta Tag Generator", href: "/seo-tools/meta-generator" },
  { name: "Schema Generator", href: "/seo-tools/schema-generator" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function todayIso() {
  return new Date().toISOString().split("T")[0]
}

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim())
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildXml(entries: { loc: string; lastmod: string; changefreq: string; priority: string }[]): string {
  const indent = "  "
  const urlTags = entries
    .map((e) => {
      const lines = [
        `${indent}<url>`,
        `${indent}${indent}<loc>${escapeXml(e.loc)}</loc>`,
        `${indent}${indent}<lastmod>${e.lastmod}</lastmod>`,
        `${indent}${indent}<changefreq>${e.changefreq}</changefreq>`,
        `${indent}${indent}<priority>${e.priority}</priority>`,
        `${indent}</url>`,
      ]
      return lines.join("\n")
    })
    .join("\n")

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    urlTags,
    `</urlset>`,
  ].join("\n")
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SitemapGeneratorPage() {
  const [inputMode, setInputMode] = useState<InputMode>("builder")
  const [baseUrl, setBaseUrl] = useState("https://example.com")
  const [pages, setPages] = useState<PageEntry[]>([
    { id: makeId(), url: "/", priority: "1.0", changefreq: "weekly", lastmod: todayIso() },
    { id: makeId(), url: "/about", priority: "0.8", changefreq: "monthly", lastmod: todayIso() },
    { id: makeId(), url: "/privacy", priority: "0.7", changefreq: "monthly", lastmod: todayIso() },
  ])
  const [manualUrls, setManualUrls] = useState("")
  const [defaultPriority, setDefaultPriority] = useState("0.5")
  const [defaultChangefreq, setDefaultChangefreq] = useState<ChangeFreq>("weekly")
  const [generatedXml, setGeneratedXml] = useState("")
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [pageCount, setPageCount] = useState<number | null>(null)

  // ── Page row mutations ──

  const addPage = () => {
    setPages((prev) => [
      ...prev,
      { id: makeId(), url: "", priority: "0.5", changefreq: "weekly", lastmod: todayIso() },
    ])
  }

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePage = useCallback((id: string, field: keyof Omit<PageEntry, "id">, value: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }, [])

  // ── Generate ──

  const generate = () => {
    const newErrors: string[] = []

    if (!isValidUrl(baseUrl)) {
      newErrors.push("Base URL is not valid. Example: https://example.com")
    }

    let entries: { loc: string; lastmod: string; changefreq: string; priority: string }[] = []

    if (inputMode === "builder") {
      const trimmedBase = baseUrl.replace(/\/$/, "")
      pages.forEach((p, i) => {
        const path = p.url.trim()
        if (!path) {
          newErrors.push(`Row ${i + 1}: URL path is empty.`)
          return
        }
        const full = path.startsWith("http") ? path : `${trimmedBase}${path.startsWith("/") ? "" : "/"}${path}`
        if (!isValidUrl(full)) {
          newErrors.push(`Row ${i + 1}: "${full}" is not a valid URL.`)
          return
        }
        entries.push({
          loc: full,
          lastmod: p.lastmod || todayIso(),
          changefreq: p.changefreq,
          priority: p.priority,
        })
      })
    } else {
      // manual mode
      const trimmedBase = baseUrl.replace(/\/$/, "")
      const lines = manualUrls
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)

      if (lines.length === 0) {
        newErrors.push("Please enter at least one URL.")
      }

      lines.forEach((line, i) => {
        const full = line.startsWith("http") ? line : `${trimmedBase}${line.startsWith("/") ? "" : "/"}${line}`
        if (!isValidUrl(full)) {
          newErrors.push(`Line ${i + 1}: "${full}" is not a valid URL.`)
          return
        }
        entries.push({
          loc: full,
          lastmod: todayIso(),
          changefreq: defaultChangefreq,
          priority: defaultPriority,
        })
      })
    }

    setErrors(newErrors)

    if (newErrors.length === 0 && entries.length > 0) {
      setGeneratedXml(buildXml(entries))
      setPageCount(entries.length)
    } else {
      setGeneratedXml("")
      setPageCount(null)
    }
  }

  const handleCopy = async () => {
    if (!generatedXml) return
    await navigator.clipboard.writeText(generatedXml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!generatedXml) return
    const blob = new Blob([generatedXml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sitemap.xml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <ToolLayout
      title="XML Sitemap Generator"
      description="Generate valid XML sitemaps for better search engine indexing. Add pages with priority, change frequency, and last modified date."
      category="SEO Tools"
      categoryHref="/seo-tools"
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        {/* Engagement buttons */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId="sitemap-generator" />
          <ShareButton tool={TOOL_OBJ} />
        </div>

        {/* Configuration card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Site Configuration
            </CardTitle>
            <CardDescription>
              Set your base URL and choose how you want to enter your pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Base URL */}
            <div className="space-y-1.5">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                type="url"
                placeholder="https://example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The root domain of your website. Relative paths in the builder will be resolved against this.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="space-y-1.5">
              <Label>Input Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={inputMode === "builder" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("builder")}
                >
                  Page Builder
                </Button>
                <Button
                  variant={inputMode === "manual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("manual")}
                >
                  Paste URLs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Builder mode */}
        {inputMode === "builder" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-accent" />
                Pages
              </CardTitle>
              <CardDescription>
                Add each page with its path, priority, and change frequency. Paths starting with / are appended to the base URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Column headers */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_120px_140px_140px_36px] gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                <span>URL Path</span>
                <span>Last Modified</span>
                <span>Change Freq</span>
                <span>Priority</span>
                <span></span>
              </div>

              <div className="space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_140px_36px] gap-2 items-start sm:items-center p-3 sm:p-0 bg-muted/40 sm:bg-transparent rounded-md sm:rounded-none"
                  >
                    {/* Mobile label */}
                    <span className="text-xs text-muted-foreground sm:hidden font-medium">
                      Page {index + 1}
                    </span>

                    <div className="space-y-1">
                      <Label htmlFor={`url-${page.id}`} className="sr-only">
                        URL path for page {index + 1}
                      </Label>
                      <Input
                        id={`url-${page.id}`}
                        placeholder="/about"
                        value={page.url}
                        onChange={(e) => updatePage(page.id, "url", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`lastmod-${page.id}`} className="sr-only">
                        Last modified for page {index + 1}
                      </Label>
                      <Input
                        id={`lastmod-${page.id}`}
                        type="date"
                        value={page.lastmod}
                        onChange={(e) => updatePage(page.id, "lastmod", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="sr-only">Change frequency for page {index + 1}</Label>
                      <Select
                        value={page.changefreq}
                        onValueChange={(v) => updatePage(page.id, "changefreq", v as ChangeFreq)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANGEFREQ_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="sr-only">Priority for page {index + 1}</Label>
                      <Select
                        value={page.priority}
                        onValueChange={(v) => updatePage(page.id, "priority", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePage(page.id)}
                      disabled={pages.length === 1}
                      aria-label={`Remove page ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addPage} className="mt-2">
                <Plus className="h-4 w-4" />
                Add Page
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Manual / paste mode */}
        {inputMode === "manual" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-accent" />
                Paste URLs
              </CardTitle>
              <CardDescription>
                Enter one URL or path per line. Default priority and change frequency apply to all.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="manual-urls">URLs (one per line)</Label>
                <Textarea
                  id="manual-urls"
                  placeholder={`/\n/about\n/blog\n/contact\nhttps://example.com/products`}
                  value={manualUrls}
                  onChange={(e) => setManualUrls(e.target.value)}
                  className="min-h-[160px] font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Change Frequency</Label>
                  <Select
                    value={defaultChangefreq}
                    onValueChange={(v) => setDefaultChangefreq(v as ChangeFreq)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANGEFREQ_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Default Priority</Label>
                  <Select
                    value={defaultPriority}
                    onValueChange={setDefaultPriority}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate button */}
        <div className="flex items-center gap-3">
          <Button onClick={generate} size="default">
            <FileCode2 className="h-4 w-4" />
            Generate Sitemap
          </Button>
          {pageCount !== null && errors.length === 0 && (
            <Badge variant="secondary" className="font-mono tabular-nums">
              {pageCount} {pageCount === 1 ? "URL" : "URLs"}
            </Badge>
          )}
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="space-y-1 mt-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Output */}
        {generatedXml && errors.length === 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Generated XML Sitemap
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download sitemap.xml
                  </Button>
                </div>
              </div>
              {pageCount !== null && (
                <p className="text-sm text-muted-foreground">
                  {pageCount} {pageCount === 1 ? "URL entry" : "URL entries"} — ready to upload to your server root.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Textarea
                  value={generatedXml}
                  readOnly
                  className="min-h-[320px] font-mono text-xs leading-relaxed resize-y"
                  aria-label="Generated XML sitemap"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-accent" />
              Sitemap Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Priority guide</p>
                <ul className="space-y-1">
                  <li><span className="font-mono tabular-nums">1.0</span> — Homepage</li>
                  <li><span className="font-mono tabular-nums">0.8</span> — Key landing pages</li>
                  <li><span className="font-mono tabular-nums">0.5</span> — Standard content</li>
                  <li><span className="font-mono tabular-nums">0.3</span> — Archived / low-value</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">Deployment checklist</p>
                <ul className="space-y-1">
                  <li>Upload to <span className="font-mono">yoursite.com/sitemap.xml</span></li>
                  <li>Reference it in your <span className="font-mono">robots.txt</span></li>
                  <li>Submit via Google Search Console</li>
                  <li>Re-generate whenever you add pages</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
