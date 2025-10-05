"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"
import { Minimize2, Download, Copy, RotateCw, FileCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CSSMinifierPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [stats, setStats] = useState({ original: 0, minified: 0, saved: 0, percent: 0 })
  const { toast } = useToast()

  const minifyCSS = () => {
    try {
      let css = input.trim()
      
      if (!css) {
        toast({ title: "Error", description: "Please enter CSS code", variant: "destructive" })
        return
      }

      const originalSize = new Blob([css]).size

      // Remove comments
      css = css.replace(/\/\*[\s\S]*?\*\//g, '')
      
      // Remove unnecessary whitespace
      css = css.replace(/\s+/g, ' ')
      
      // Remove spaces around special characters
      css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1')
      
      // Remove spaces after opening parentheses
      css = css.replace(/\(\s+/g, '(')
      css = css.replace(/\s+\)/g, ')')
      
      // Remove last semicolon in rule
      css = css.replace(/;}/g, '}')
      
      // Remove empty rules
      css = css.replace(/[^\}]+\{\}/g, '')
      
      // Trim
      css = css.trim()

      const minifiedSize = new Blob([css]).size
      const saved = originalSize - minifiedSize
      const percent = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0

      setOutput(css)
      setStats({
        original: originalSize,
        minified: minifiedSize,
        saved: saved,
        percent: percent
      })

      toast({ title: "CSS minified successfully!", description: `Saved ${percent}% (${saved} bytes)` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to minify CSS", variant: "destructive" })
    }
  }

  const beautifyCSS = () => {
    try {
      let css = input.trim()
      
      if (!css) {
        toast({ title: "Error", description: "Please enter CSS code", variant: "destructive" })
        return
      }

      // Add newlines after closing braces
      css = css.replace(/}/g, '}\n')
      
      // Add newlines after semicolons in rules
      css = css.replace(/;/g, ';\n  ')
      
      // Add newlines after opening braces
      css = css.replace(/{/g, ' {\n  ')
      
      // Clean up extra spaces
      css = css.replace(/\s+/g, ' ')
      
      // Fix indentation
      let formatted = ''
      let indent = 0
      const lines = css.split('\n')
      
      lines.forEach(line => {
        line = line.trim()
        if (line) {
          if (line.includes('}')) indent = Math.max(0, indent - 1)
          formatted += '  '.repeat(indent) + line + '\n'
          if (line.includes('{')) indent++
        }
      })

      setOutput(formatted.trim())
      toast({ title: "CSS beautified successfully!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to beautify CSS", variant: "destructive" })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast({ title: "Copied to clipboard!" })
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minified.css'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "File downloaded!" })
  }

  const loadExample = () => {
    const example = `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Button styles */
.button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
}

.button:hover {
  background-color: #2563eb;
  cursor: pointer;
}`
    setInput(example)
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setStats({ original: 0, minified: 0, saved: 0, percent: 0 })
  }

  const relatedTools = [
    { name: "JSON Formatter", href: "/developer-tools/json-formatter" },
    { name: "Base64 Encoder", href: "/developer-tools/base64" },
    { name: "Hash Generator", href: "/developer-tools/hash-generator" },
  ]

  return (
    <ToolLayout
      title="CSS Minifier"
      description="Minify and beautify CSS code to reduce file size and improve performance."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                CSS Input
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadExample}>
                  Load Example
                </Button>
                <Button variant="outline" size="sm" onClick={clear}>
                  <RotateCw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Paste your CSS code here</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder=".button { background: blue; padding: 10px; }"
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={minifyCSS} className="flex-1">
                <Minimize2 className="mr-2 h-4 w-4" />
                Minify CSS
              </Button>
              <Button onClick={beautifyCSS} variant="outline" className="flex-1">
                <FileCode className="mr-2 h-4 w-4" />
                Beautify CSS
              </Button>
            </div>
          </CardContent>
        </Card>

        {output && (
          <>
            {stats.original > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{stats.original}</div>
                      <div className="text-sm text-muted-foreground">Original (bytes)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{stats.minified}</div>
                      <div className="text-sm text-muted-foreground">Minified (bytes)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{stats.saved}</div>
                      <div className="text-sm text-muted-foreground">Saved (bytes)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{stats.percent}%</div>
                      <div className="text-sm text-muted-foreground">Reduction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Output</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadFile}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={output}
                  readOnly
                  rows={12}
                  className="font-mono text-sm bg-muted"
                />
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About CSS Minifier</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Minify CSS code to reduce file size and improve website loading speed. Also includes a
              beautifier to make minified CSS readable again.
            </p>
            <h3>Features:</h3>
            <ul>
              <li>Remove comments and unnecessary whitespace</li>
              <li>Compress CSS rules and selectors</li>
              <li>Calculate size reduction percentage</li>
              <li>Beautify minified CSS code</li>
              <li>Download minified CSS file</li>
              <li>Copy to clipboard with one click</li>
            </ul>
            <h3>Benefits of Minification:</h3>
            <ul>
              <li><strong>Faster Loading</strong> - Smaller files load quicker</li>
              <li><strong>Reduced Bandwidth</strong> - Save on data transfer costs</li>
              <li><strong>Better Performance</strong> - Improved Core Web Vitals</li>
              <li><strong>SEO Benefits</strong> - Faster sites rank better</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              <strong>Note:</strong> This tool performs basic minification. For production, consider using build
              tools like PostCSS, cssnano, or bundlers like Vite/Webpack for more advanced optimization.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

