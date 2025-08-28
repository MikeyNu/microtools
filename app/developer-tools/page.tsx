import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code2, 
  FileJson, 
  Search, 
  Lock, 
  Hash, 
  Binary, 
  Link as LinkIcon,
  Braces,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Developer Tools - ToolHub',
  description: 'Essential developer utilities including JSON formatter, regex tester, Base64 encoder, hash generators, and more coding tools.',
  keywords: 'developer tools, JSON formatter, regex tester, Base64 encoder, hash generator, MD5, SHA256, coding utilities'
}

const developerTools = [
  {
    title: 'JSON Formatter & Validator',
    description: 'Format, validate, and beautify JSON data with syntax highlighting and error detection.',
    icon: FileJson,
    href: '/developer-tools/json-formatter',
    color: 'bg-blue-500',
    popular: true
  },
  {
    title: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching and explanation.',
    icon: Search,
    href: '/developer-tools/regex-tester',
    color: 'bg-green-500',
    popular: true
  },
  {
    title: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings for data transmission and storage.',
    icon: Binary,
    href: '/developer-tools/base64',
    color: 'bg-purple-500',
    popular: true
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other cryptographic hashes.',
    icon: Hash,
    href: '/developer-tools/hash-generator',
    color: 'bg-red-500',
    popular: true
  },
  {
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs for web development and API integration.',
    icon: LinkIcon,
    href: '/developer-tools/url-encoder',
    color: 'bg-orange-500'
  },
  {
    title: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens (JWT) for authentication debugging.',
    icon: Lock,
    href: '/developer-tools/jwt-decoder',
    color: 'bg-indigo-500'
  },
  {
    title: 'Code Formatter',
    description: 'Format and beautify HTML, CSS, JavaScript, and other code languages.',
    icon: Code2,
    href: '/developer-tools/code-formatter',
    color: 'bg-teal-500'
  },
  {
    title: 'API Tester',
    description: 'Test REST APIs with custom headers, parameters, and request bodies.',
    icon: Braces,
    href: '/developer-tools/api-tester',
    color: 'bg-pink-500'
  }
]

export default function DeveloperToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Developer Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Essential utilities for developers including JSON formatting, regex testing, 
            encoding/decoding tools, and hash generators.
          </p>
        </div>

        {/* Popular Tools Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Popular Developer Tools</h2>
              <p className="text-gray-600 mb-4">JSON Formatter, Regex Tester, Base64 Encoder, and Hash Generator</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">JSON</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Regex</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Base64</Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">Hash</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {developerTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${tool.color} bg-opacity-10`}>
                      <IconComponent className={`h-6 w-6 ${tool.color.replace('bg-', 'text-')}`} />
                    </div>
                    {tool.popular && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                    <Link href={tool.href} className="flex items-center justify-center gap-2">
                      Use Tool
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Code2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Code Processing</h3>
              <p className="text-sm text-gray-600">
                Format, validate, and process various code formats and data structures.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Security Tools</h3>
              <p className="text-sm text-gray-600">
                Generate hashes, encode/decode data, and work with security tokens.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Testing & Debugging</h3>
              <p className="text-sm text-gray-600">
                Test regular expressions, APIs, and debug various data formats.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Use Our Developer Tools */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Choose Our Developer Tools?</CardTitle>
            <CardDescription>
              Built by developers, for developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">No Installation Required</h4>
                    <p className="text-sm text-gray-600">All tools run in your browser - no downloads or setup needed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Lock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Privacy Focused</h4>
                    <p className="text-sm text-gray-600">All processing happens locally - your data never leaves your browser</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Code2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Developer Friendly</h4>
                    <p className="text-sm text-gray-600">Clean interfaces designed for productivity and ease of use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Always Updated</h4>
                    <p className="text-sm text-gray-600">Regular updates with new features and improvements</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Placeholder */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </div>
    </div>
  )
}