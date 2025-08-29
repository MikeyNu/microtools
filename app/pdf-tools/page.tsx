import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shrink, FileDown, Scissors, Merge, ArrowRight, Zap, Shield } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                ToolHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900">
                Home
              </Link>
              <Link href="/calculators" className="text-gray-500 hover:text-gray-900">
                Calculators
              </Link>
              <Link href="/converters" className="text-gray-500 hover:text-gray-900">
                Converters
              </Link>
              <Link href="/text-utilities" className="text-gray-500 hover:text-gray-900">
                Text Tools
              </Link>
              <Link href="/image-tools" className="text-gray-500 hover:text-gray-900">
                Image Tools
              </Link>
              <Link href="/pdf-tools" className="text-gray-900 font-medium">
                PDF Tools
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional PDF Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive PDF utilities for all your document needs. Compress, convert, merge, and split PDF files with professional-grade tools.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <Card key={index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      {tool.popular && (
                        <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Link href={tool.href}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                        Use Tool
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our PDF Tools?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional-grade PDF processing with enterprise-level security and performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">All files are processed securely with end-to-end encryption and automatically deleted after processing</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shrink className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">High Quality</h3>
                <p className="text-gray-600 leading-relaxed">Advanced algorithms maintain document quality while optimizing file size and processing speed</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">Optimized processing engines deliver results in seconds, not minutes</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AdSense Placeholder */}
        <section className="text-center">
          <Card className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 shadow-lg">
            <CardContent className="py-12">
              <p className="text-gray-500 text-lg">Advertisement Space</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}