import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Compress, FileDown, Scissors, Merge, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Utilities | ToolHub',
  description: 'Free online PDF tools including PDF compressor, converter, merger, and splitter. Compress PDFs, convert to Word/Excel, merge multiple PDFs, and more.',
  keywords: 'PDF tools, PDF compressor, PDF converter, PDF merger, PDF splitter, compress PDF, PDF to Word, PDF to Excel',
}

const pdfTools = [
  {
    title: 'PDF Compressor',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Compress,
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional PDF utilities for all your document needs. Compress, convert, merge, and split PDF files with ease.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pdfTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    {tool.popular && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 mb-4">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={tool.href}>
                    <Button className="w-full group-hover:bg-blue-600 transition-colors">
                      Use Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our PDF Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">All files are processed securely and deleted after processing</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Compress className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">Maintain document quality while optimizing file size</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-gray-600 text-sm">Quick conversion and processing for all PDF operations</p>
            </div>
          </div>
        </div>

        {/* AdSense Placeholder */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </div>
    </div>
  )
}