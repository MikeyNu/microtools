import type { Metadata } from 'next'
import { ToolLayout } from '@/components/tool-layout'
import { JSONFormatterTool } from './json-formatter-client'

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator - Developer Tools | Micro Tools',
  description:
    'Format, validate, and beautify JSON data with syntax highlighting and error detection. Free online JSON formatter with minify support.',
  keywords: 'json formatter, json validator, json beautifier, json minifier, format json online',
}

export default function JSONFormatterPage() {
  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, validate, and beautify JSON data. Detect syntax errors with precise line and column information."
      category="Developer Tools"
      categoryHref="/developer-tools"
      relatedTools={[
        { name: 'Regex Tester', href: '/developer-tools/regex-tester' },
        { name: 'Base64 Encoder/Decoder', href: '/developer-tools/base64' },
        { name: 'Hash Generator', href: '/developer-tools/hash-generator' },
        { name: 'JWT Decoder', href: '/developer-tools/jwt-decoder' },
        { name: 'CSS Minifier', href: '/developer-tools/css-minifier' },
      ]}
    >
      <JSONFormatterTool />
    </ToolLayout>
  )
}
