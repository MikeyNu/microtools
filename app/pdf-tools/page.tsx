import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shrink, FileDown, Scissors, Merge, ArrowRight, Zap, Shield } from 'lucide-react'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Utilities | ToolHub',
  description: 'Free online PDF tools including PDF compressor, converter, merger, and splitter. Compress PDFs, convert to Word/Excel, merge multiple PDFs, and more.',
  keywords: 'PDF tools, PDF compressor, PDF converter, PDF merger, PDF splitter, compress PDF, PDF to Word, PDF to Excel',
}

const pdfTools = [
  {
    title: 'PDF Compressor',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Shrink,
    href: '/pdf-tools/compress',
    popular: true,
    features: ['Lossless compression', 'Batch processing', 'No file size limit']
  },
  {
    title: 'PDF to Word',
    description: 'Convert PDF files to editable Word documents',
    icon: FileText,
    href: '/pdf-tools/pdf-to-word',
    popular: true,
    features: ['Maintains formatting', 'OCR support', 'Fast conversion']
  },
  {
    title: 'PDF to Excel',
    description: 'Extract tables and data from PDF to Excel',
    icon: FileDown,
    href: '/pdf-tools/pdf-to-excel',
    popular: false,
    features: ['Table extraction', 'Data preservation', 'Multiple sheets']
  },
  {
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one document',
    icon: Merge,
    href: '/pdf-tools/merge',
    popular: true,
    features: ['Unlimited files', 'Custom order', 'Page range selection']
  },
  {
    title: 'Split PDF',
    description: 'Split large PDF files into smaller documents',
    icon: Scissors,
    href: '/pdf-tools/split',
    popular: false,
    features: ['Page range split', 'Extract pages', 'Bulk splitting']
  },
  {
    title: 'PDF Converter',
    description: 'Convert PDFs to various formats (JPG, PNG, etc.)',
    icon: ArrowRight,
    href: '/pdf-tools/convert',
    popular: false,
    features: ['Multiple formats', 'High quality', 'Batch conversion']
  }
]

export default function PDFToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Professional PDF Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive PDF utilities for all your document needs. Compress, convert, merge, and split PDF files with professional-grade tools.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <React.Fragment key={index}>
                  <Card className="group bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-xl group-hover:from-accent group-hover:to-accent/90 transition-all duration-300">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        {tool.popular && (
                          <span className="bg-gradient-to-r from-accent to-accent/80 text-white text-xs font-medium px-3 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Link href={tool.href}>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-white border-0 transition-all duration-300">
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  {/* AdSense after every 3rd tool */}
                  {(index + 1) % 3 === 0 && index < pdfTools.length - 1 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <AdSensePlaceholder 
                        size="rectangle"
                        className="my-8"
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </section>

        {/* Footer AdSense */}
        <section className="mb-8">
          <AdSensePlaceholder 
            size="large-rectangle"
            className="mx-auto"
          />
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our PDF Tools?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade PDF processing with enterprise-level security and performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Secure & Private</h3>
                <p className="text-muted-foreground leading-relaxed">All files are processed securely with end-to-end encryption and automatically deleted after processing</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shrink className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">High Quality</h3>
                <p className="text-muted-foreground leading-relaxed">Advanced algorithms maintain document quality while optimizing file size and processing speed</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">Optimized processing engines deliver results in seconds, not minutes</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}