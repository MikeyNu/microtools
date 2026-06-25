'use client'

import { useState, useCallback } from 'react'
import {
  FileCode,
  Copy,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  RotateCcw,
  Hash,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

const tool = {
  id: 'xml-formatter',
  name: 'XML Formatter',
  description: 'Format, minify, and validate XML with element and attribute statistics.',
  category: 'data-tools',
  url: '/data-tools/xml-formatter',
}

const relatedTools = [
  { name: 'JSON Formatter', href: '/data-tools/json-formatter' },
  { name: 'SQL Formatter', href: '/data-tools/sql-formatter' },
  { name: 'CSV to JSON', href: '/data-tools/csv-to-json' },
]

interface ValidationState {
  status: 'idle' | 'valid' | 'invalid'
  message: string
  elementCount: number
  attributeCount: number
}

function serializeNode(node: Node, indent: number, indentStr: string): string {
  const pad = indentStr.repeat(indent)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').trim()
    return text ? pad + text + '\n' : ''
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return pad + '<![CDATA[' + node.textContent + ']]>\n'
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return pad + '<!--' + node.textContent + '-->\n'
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction
    return pad + '<?' + pi.target + ' ' + pi.data + '?>\n'
  }

  if (node.nodeType === Node.DOCUMENT_NODE) {
    let result = ''
    node.childNodes.forEach((child) => {
      result += serializeNode(child, indent, indentStr)
    })
    return result
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    let tag = el.tagName

    // Build attribute string
    let attrStr = ''
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]
      attrStr += ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`
    }

    const children = Array.from(el.childNodes)
    const hasChildren = children.length > 0

    // Check if content is purely text (one text node)
    const isInline =
      children.length === 1 &&
      children[0].nodeType === Node.TEXT_NODE &&
      (children[0].textContent ?? '').trim().length > 0

    if (!hasChildren) {
      return pad + `<${tag}${attrStr} />\n`
    }

    if (isInline) {
      const text = (children[0].textContent ?? '').trim()
      return pad + `<${tag}${attrStr}>${text}</${tag}>\n`
    }

    let result = pad + `<${tag}${attrStr}>\n`
    children.forEach((child) => {
      result += serializeNode(child, indent + 1, indentStr)
    })
    result += pad + `</${tag}>\n`
    return result
  }

  return ''
}

function formatXml(xmlString: string, indentSize: number): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const indentStr = ' '.repeat(indentSize)

  // Build XML declaration if original had one
  const hasDeclaration = xmlString.trimStart().startsWith('<?xml')
  let output = hasDeclaration ? `<?xml version="1.0" encoding="UTF-8"?>\n` : ''

  // Serialize all children of the document (skip the xml declaration node itself)
  doc.childNodes.forEach((child) => {
    if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = child as ProcessingInstruction
      if (pi.target === 'xml') return // already handled above
    }
    output += serializeNode(child, 0, indentStr)
  })

  return output.trimEnd()
}

function minifyXml(xmlString: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  function minifyNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').trim()
    }
    if (node.nodeType === Node.CDATA_SECTION_NODE) {
      return '<![CDATA[' + node.textContent + ']]>'
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return ''
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction
      if (pi.target === 'xml') return ''
      return '<?' + pi.target + ' ' + pi.data.trim() + '?>'
    }
    if (node.nodeType === Node.DOCUMENT_NODE) {
      let result = ''
      node.childNodes.forEach((child) => {
        result += minifyNode(child)
      })
      return result
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      let attrStr = ''
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i]
        attrStr += ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`
      }
      const children = Array.from(el.childNodes)
      if (children.length === 0) return `<${el.tagName}${attrStr}/>`
      let inner = ''
      children.forEach((child) => {
        inner += minifyNode(child)
      })
      return `<${el.tagName}${attrStr}>${inner}</${el.tagName}>`
    }
    return ''
  }

  const hasDeclaration = xmlString.trimStart().startsWith('<?xml')
  let output = hasDeclaration ? '<?xml version="1.0" encoding="UTF-8"?>' : ''
  doc.childNodes.forEach((child) => {
    if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = child as ProcessingInstruction
      if (pi.target === 'xml') return
    }
    output += minifyNode(child)
  })
  return output
}

function countElements(node: Node): { elements: number; attributes: number } {
  let elements = 0
  let attributes = 0

  function walk(n: Node) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      elements++
      attributes += (n as Element).attributes.length
    }
    n.childNodes.forEach(walk)
  }

  walk(node)
  return { elements, attributes }
}

function parseAndValidate(xmlString: string): {
  doc: Document | null
  error: string | null
  errorLine: number | null
} {
  if (!xmlString.trim()) {
    return { doc: null, error: 'Input is empty.', errorLine: null }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const parseError = doc.querySelector('parsererror')

  if (parseError) {
    const errorText = parseError.textContent ?? 'Unknown parse error'
    // Try to extract line number from common browser error messages
    const lineMatch = errorText.match(/[Ll]ine[:\s]+(\d+)/i)
    const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : null
    // Clean up the error message
    const cleanError = errorText
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 200)
    return { doc: null, error: cleanError, errorLine: lineNum }
  }

  return { doc, error: null, errorLine: null }
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101" genre="fiction">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price currency="USD">44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102" genre="fantasy">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price currency="USD">5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`

export default function XmlFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState<'2' | '4'>('2')
  const [validation, setValidation] = useState<ValidationState>({
    status: 'idle',
    message: '',
    elementCount: 0,
    attributeCount: 0,
  })
  const [copied, setCopied] = useState(false)
  const [activeAction, setActiveAction] = useState<'format' | 'minify' | null>(null)

  const handleFormat = useCallback(() => {
    const { doc, error, errorLine } = parseAndValidate(input)
    if (!doc) {
      setValidation({
        status: 'invalid',
        message: error ?? 'Invalid XML',
        elementCount: 0,
        attributeCount: 0,
      })
      setOutput('')
      setActiveAction(null)
      return
    }

    const { elements, attributes } = countElements(doc)
    const formatted = formatXml(input, parseInt(indentSize, 10))
    setOutput(formatted)
    setActiveAction('format')
    setValidation({
      status: 'valid',
      message: 'XML is well-formed.',
      elementCount: elements,
      attributeCount: attributes,
    })
  }, [input, indentSize])

  const handleMinify = useCallback(() => {
    const { doc, error } = parseAndValidate(input)
    if (!doc) {
      setValidation({
        status: 'invalid',
        message: error ?? 'Invalid XML',
        elementCount: 0,
        attributeCount: 0,
      })
      setOutput('')
      setActiveAction(null)
      return
    }

    const { elements, attributes } = countElements(doc)
    const minified = minifyXml(input)
    setOutput(minified)
    setActiveAction('minify')
    setValidation({
      status: 'valid',
      message: 'XML is well-formed.',
      elementCount: elements,
      attributeCount: attributes,
    })
  }, [input])

  const handleValidate = useCallback(() => {
    const { doc, error } = parseAndValidate(input)
    if (!doc) {
      setValidation({
        status: 'invalid',
        message: error ?? 'Invalid XML',
        elementCount: 0,
        attributeCount: 0,
      })
      return
    }
    const { elements, attributes } = countElements(doc)
    setValidation({
      status: 'valid',
      message: 'XML is well-formed and valid.',
      elementCount: elements,
      attributeCount: attributes,
    })
  }, [input])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setValidation({ status: 'idle', message: '', elementCount: 0, attributeCount: 0 })
    setActiveAction(null)
  }, [])

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_XML)
    setOutput('')
    setValidation({ status: 'idle', message: '', elementCount: 0, attributeCount: 0 })
    setActiveAction(null)
  }, [])

  return (
    <ToolLayout
      title="XML Formatter"
      description="Format, minify, and validate XML documents. See element and attribute counts at a glance."
      category="Data Tools"
      categoryHref="/data-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {/* Engagement buttons */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        {/* Controls row */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="indent-size">Indent size</Label>
                <Select
                  value={indentSize}
                  onValueChange={(v) => setIndentSize(v as '2' | '4')}
                >
                  <SelectTrigger id="indent-size" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat} disabled={!input.trim()}>
                  <Maximize2 className="size-4" />
                  Format
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMinify}
                  disabled={!input.trim()}
                >
                  <Minimize2 className="size-4" />
                  Minify
                </Button>
                <Button
                  variant="outline"
                  onClick={handleValidate}
                  disabled={!input.trim()}
                >
                  <CheckCircle className="size-4" />
                  Validate
                </Button>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  Sample
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <RotateCcw className="size-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation result */}
        {validation.status !== 'idle' && (
          <Alert variant={validation.status === 'invalid' ? 'destructive' : 'default'}>
            {validation.status === 'valid' ? (
              <CheckCircle className="size-4 text-success" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertDescription>
              {validation.status === 'valid' ? (
                <span className="text-success">{validation.message}</span>
              ) : (
                validation.message
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {validation.status === 'valid' && (
          <div className="flex flex-wrap gap-3">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-2 min-w-[120px]">
              <Tag className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide leading-none mb-1">
                  Elements
                </p>
                <p className="text-lg font-semibold font-variant-numeric tabular-nums text-foreground leading-none">
                  {validation.elementCount}
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4 flex items-center gap-2 min-w-[120px]">
              <Hash className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide leading-none mb-1">
                  Attributes
                </p>
                <p className="text-lg font-semibold font-variant-numeric tabular-nums text-foreground leading-none">
                  {validation.attributeCount}
                </p>
              </div>
            </div>
            {activeAction && (
              <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                <Badge variant="outline" className="text-accent border-accent/40">
                  {activeAction === 'format' ? 'Formatted' : 'Minified'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCode className="size-4 text-muted-foreground" />
                XML Input
              </CardTitle>
              <CardDescription>Paste your XML document here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="xml-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (validation.status !== 'idle') {
                    setValidation({ status: 'idle', message: '', elementCount: 0, attributeCount: 0 })
                    setActiveAction(null)
                  }
                }}
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element attribute="value">text</element>\n</root>`}
                className="min-h-[400px] font-mono text-sm resize-y"
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCode className="size-4 text-muted-foreground" />
                Output
                {output && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {activeAction === 'format'
                  ? `Prettified with ${indentSize} spaces`
                  : activeAction === 'minify'
                  ? 'Whitespace removed'
                  : 'Result appears here after formatting or minifying'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="xml-output"
                value={output}
                readOnly
                placeholder="Output will appear here"
                className="min-h-[400px] font-mono text-sm resize-y bg-muted/40"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}
