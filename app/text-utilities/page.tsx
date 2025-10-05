import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  GitCompare, 
  Link as LinkIcon, 
  Code, 
  Type, 
  Hash, 
  Scissors, 
  AlignLeft,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'

export const metadata: Metadata = {
  title: 'Text Utilities - Micro SaaS Tools',
  description: 'Comprehensive text processing tools including markdown editor, text diff, URL encoder/decoder, HTML encoder/decoder, and more.',
  keywords: ['text tools', 'markdown editor', 'text diff', 'url encoder', 'html encoder', 'text processing'],
};

const textTools = [
  {
    title: 'Markdown Editor',
    description: 'Write and preview Markdown with live rendering, syntax highlighting, and export options',
    href: '/text-utilities/markdown-editor',
    icon: FileText,
    features: ['Live preview', 'Syntax highlighting', 'Export to HTML/PDF', 'Table support'],
    badge: 'Popular'
  },
  {
    title: 'Text Diff Tool',
    description: 'Compare two texts and highlight differences with side-by-side or unified view',
    href: '/text-utilities/text-diff',
    icon: GitCompare,
    features: ['Side-by-side view', 'Unified diff', 'Word-level diff', 'Export results'],
    badge: 'Essential'
  },
  {
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs with support for various encoding formats',
    href: '/text-utilities/url-encoder',
    icon: LinkIcon,
    features: ['URL encoding', 'Component encoding', 'Batch processing', 'Validation'],
    badge: 'Utility'
  },
  {
    title: 'HTML Encoder/Decoder',
    description: 'Encode and decode HTML entities for safe web content display',
    href: '/text-utilities/html-encoder',
    icon: Code,
    features: ['HTML entities', 'Special characters', 'Batch processing', 'Preview'],
    badge: 'Security'
  },
  {
    title: 'Text Case Converter',
    description: 'Convert text between different cases: uppercase, lowercase, title case, and more',
    href: '/text-utilities/case-converter',
    icon: Type,
    features: ['Multiple cases', 'Bulk conversion', 'Custom rules', 'Copy results'],
    badge: 'Formatting'
  },
  {
    title: 'Text Counter',
    description: 'Count characters, words, paragraphs, and analyze text statistics',
    href: '/text-utilities/text-counter',
    icon: Hash,
    features: ['Character count', 'Word count', 'Reading time', 'Statistics'],
    badge: 'Analysis'
  }
];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case 'Popular': return 'default';
    case 'Essential': return 'destructive';
    case 'Security': return 'secondary';
    default: return 'outline';
  }
};

export default function TextUtilitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Text Processing Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive text utilities for developers, writers, and content creators. Process, analyze, and transform text with our powerful suite of tools.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {textTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <React.Fragment key={index}>
                  <Card className="group bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-xl transition-all duration-300">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                          {tool.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground transition-colors mb-2">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          {tool.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Link href={tool.href}>
                          <Button className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-300">
                            Use Tool
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Strategic AdSense placement after every 3rd tool */}
                  {(index + 1) % 3 === 0 && index < textTools.length - 1 && (
                    <div className="col-span-full">
                      <AdSensePlaceholder 
                        size="rectangle" 
                        className="my-8"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our Text Tools?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade text processing with advanced features and intuitive interfaces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Advanced Processing</h3>
                <p className="text-muted-foreground leading-relaxed">Sophisticated text manipulation tools with precision formatting, encoding, and transformation capabilities</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart Comparison</h3>
                <p className="text-muted-foreground leading-relaxed">Intelligent text comparison with visual highlighting and detailed change tracking for better content management</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Instant Results</h3>
                <p className="text-muted-foreground leading-relaxed">Real-time processing and live preview capabilities for immediate feedback and seamless workflow</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer ad for category page */}
        <AdSensePlaceholder 
          size="large-rectangle" 
          className="mb-16"
        />
      </div>
    </div>
  );
}