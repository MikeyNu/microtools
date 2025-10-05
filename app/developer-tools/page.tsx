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
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from '@/lib/adsense-config'
import React from 'react'

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
  },
  {
    title: 'CSS Minifier',
    description: 'Minify and beautify CSS code to reduce file size and improve performance.',
    icon: Code2,
    href: '/developer-tools/css-minifier',
    color: 'bg-cyan-500',
    popular: true
  }
]

export default function DeveloperToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-6">
            Developer Tools & Utilities
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Essential utilities for developers including JSON formatting, regex testing, 
            encoding/decoding tools, and hash generators. All tools run locally in your browser.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Popular Tools Banner */}
            <Card className="mb-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Most Popular Developer Tools</h3>
                  <p className="text-muted-foreground mb-6">JSON Formatter, Regex Tester, Base64 Encoder, and Hash Generator</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">JSON</Badge>
                    <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">Regex</Badge>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-secondary/20">Base64</Badge>
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">Hash</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {developerTools.map((tool, index) => {
                const IconComponent = tool.icon
                return (
                  <React.Fragment key={index}>
                    <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${tool.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-6 w-6 ${tool.color.replace('bg-', 'text-')}`} />
                        </div>
                        {tool.popular && (
                          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors duration-300">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative pt-0">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg transition-all duration-300">
                        <Link href={tool.href} className="flex items-center justify-center gap-2">
                          Use Tool
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Strategic ad placement after every 3rd tool */}
                  {shouldDisplayAds() && (index + 1) % 3 === 0 && index < developerTools.length - 1 && (
                    <div className="md:col-span-2 lg:col-span-3 flex justify-center py-8">
                      <AdSensePlaceholder 
                        size="banner" 
                        adClient={ADSENSE_CONFIG.publisherId}
                        adSlot={getAdUnitId('categoryInline')}
                        responsive={true}
                      />
                    </div>
                  )}
                </React.Fragment>
                )
              })}
            </div>

            {/* Features Section */}
            <section className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-serif font-bold text-foreground mb-4">Developer Tool Categories</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive tools for every aspect of development</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Code2 className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Code Processing</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Format, validate, and process various code formats and data structures with precision.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-accent/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-10 w-10 text-accent-foreground" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Security Tools</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Generate hashes, encode/decode data, and work with security tokens safely.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-secondary/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Search className="h-10 w-10 text-secondary-foreground" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Testing & Debugging</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Test regular expressions, APIs, and debug various data formats efficiently.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Why Use Our Developer Tools */}
            <section className="mb-16">
              <Card className="border-2 border-border/50 bg-gradient-to-br from-card via-card/50 to-muted/20">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-serif font-bold text-foreground mb-3">Why Choose Our Developer Tools?</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    Built by developers, for developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                          <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-2">No Installation Required</h4>
                          <p className="text-muted-foreground leading-relaxed">All tools run in your browser - no downloads or setup needed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-accent/10 p-3 rounded-xl">
                          <Shield className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-2">Privacy Focused</h4>
                          <p className="text-muted-foreground leading-relaxed">All processing happens locally - your data never leaves your browser</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-secondary/10 p-3 rounded-xl">
                          <Code2 className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-2">Developer Friendly</h4>
                          <p className="text-muted-foreground leading-relaxed">Clean interfaces designed for productivity and ease of use</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-destructive/10 p-3 rounded-xl">
                          <Search className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-2">Always Updated</h4>
                          <p className="text-muted-foreground leading-relaxed">Regular updates with new features and improvements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Footer ad for category page */}
            {shouldDisplayAds() && (
              <section className="py-12">
                <div className="container mx-auto px-4">
                  <div className="flex justify-center">
                    <AdSensePlaceholder 
                      size="large-rectangle" 
                      adClient={ADSENSE_CONFIG.publisherId}
                      adSlot={getAdUnitId('categoryFooter')}
                      responsive={true}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}