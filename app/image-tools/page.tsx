import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Compress, Resize, ArrowRight, Palette, FileImage, Crop } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Image Tools - Free Online Image Utilities | ToolHub',
  description: 'Free online image tools including image compressor, resizer, format converter, and WebP converter. Optimize and edit images easily.',
  keywords: 'image tools, image compressor, image resizer, WebP converter, image format converter, optimize images, compress images',
}

const imageTools = [
  {
    title: 'Image Compressor',
    description: 'Reduce image file size while maintaining quality',
    icon: Compress,
    href: '/image-tools/compress',
    popular: true,
    features: ['Lossless compression', 'Multiple formats', 'Batch processing']
  },
  {
    title: 'Image Resizer',
    description: 'Resize images to specific dimensions or percentages',
    icon: Resize,
    href: '/image-tools/resize',
    popular: true,
    features: ['Custom dimensions', 'Aspect ratio lock', 'Bulk resize']
  },
  {
    title: 'WebP Converter',
    description: 'Convert images to modern WebP format for faster loading',
    icon: FileImage,
    href: '/image-tools/webp-converter',
    popular: true,
    features: ['Next-gen format', 'Smaller file size', 'Better quality']
  },
  {
    title: 'Format Converter',
    description: 'Convert between JPG, PNG, GIF, BMP, and other formats',
    icon: ArrowRight,
    href: '/image-tools/format-converter',
    popular: false,
    features: ['Multiple formats', 'Quality control', 'Transparency support']
  },
  {
    title: 'Image Cropper',
    description: 'Crop images to focus on specific areas',
    icon: Crop,
    href: '/image-tools/crop',
    popular: false,
    features: ['Custom crop area', 'Aspect ratios', 'Preview mode']
  },
  {
    title: 'Background Remover',
    description: 'Remove backgrounds from images automatically',
    icon: Palette,
    href: '/image-tools/background-remover',
    popular: true,
    features: ['AI-powered', 'Transparent PNG', 'One-click removal']
  }
]

export default function ImageToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional image utilities for all your photo editing needs. Compress, resize, convert, and optimize images with ease.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {imageTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    {tool.popular && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
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
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={tool.href}>
                    <Button className="w-full group-hover:bg-purple-600 transition-colors">
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
            Why Choose Our Image Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">Maintain image quality while optimizing file size and format</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Compress className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Compression</h3>
              <p className="text-gray-600 text-sm">Advanced algorithms reduce file size without visible quality loss</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-gray-600 text-sm">Quick image processing with instant preview and download</p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supported Image Formats</CardTitle>
            <CardDescription>
              Our tools support all popular image formats for maximum compatibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['JPG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF', 'SVG', 'ICO', 'AVIF', 'HEIC'].map((format) => (
                <div key={format} className="bg-gray-100 rounded-lg p-3 text-center">
                  <span className="font-medium text-gray-700">{format}</span>
                </div>
              ))}
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