import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Shrink, Scale, ArrowRight, Palette, FileImage, Crop, Zap, Shield } from 'lucide-react'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from '@/lib/adsense-config'
import React from 'react'

export const metadata: Metadata = {
  title: 'Image Tools - Free Online Image Utilities | ToolHub',
  description: 'Free online image tools including image compressor, resizer, format converter, and WebP converter. Optimize and edit images easily.',
  keywords: 'image tools, image compressor, image resizer, WebP converter, image format converter, optimize images, compress images',
}

const imageTools = [
  {
    title: 'Image Compressor',
    description: 'Reduce image file size while maintaining quality',
    icon: Shrink,
    href: '/image-tools/compress',
    popular: true,
    features: ['Lossless compression', 'Multiple formats', 'Batch processing']
  },
  {
    title: 'Image Resizer',
    description: 'Resize images to specific dimensions or percentages',
    icon: Scale,
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/20"></div>
        <div className="absolute inset-0 geometric-bg"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-sans font-bold text-foreground mb-8 tracking-tight">
              Professional
              <span className="block text-transparent bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text mt-2">
                Image Tools
              </span>
            </h2>
            <p className="text-xl text-foreground/60 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform, optimize, and enhance your images with our suite of professional-grade tools. 
              Fast, secure, and completely free.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <React.Fragment key={index}>
                  <Link href={tool.href}>
                  <Card className="group relative h-full bg-card/40 border-border/30 hover:border-accent/40 transition-all duration-700 hover:scale-[1.03] backdrop-blur-md overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent"></div>

                    <CardHeader className="relative z-10 pb-6 pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-500">
                            <IconComponent className="h-7 w-7 text-accent" />
                          </div>
                          <div className="absolute -inset-2 bg-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        </div>
                        {tool.popular && (
                          <span className="text-sm text-foreground/50 bg-muted/40 px-4 py-2 rounded-full border border-border/20 backdrop-blur-sm">
                            Popular
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-sans text-2xl group-hover:text-accent transition-colors duration-500 mb-3 tracking-tight">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-foreground/60 text-base leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-8">
                      <div className="space-y-4">
                        {tool.features.slice(0, 3).map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="text-sm text-foreground/50 flex items-center group-hover:text-foreground/70 transition-colors duration-500"
                          >
                            <div className="w-2 h-2 bg-accent/50 rounded-full mr-4 group-hover:bg-accent transition-colors duration-500"></div>
                            {feature}
                          </div>
                        ))}
                        <div className="text-sm text-accent/80 font-medium pt-3 border-t border-border/20">
                          Use Tool →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                {/* Strategic ad placement after every 3rd tool */}
                {shouldDisplayAds() && (index + 1) % 3 === 0 && index < imageTools.length - 1 && (
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-sans font-bold text-foreground mb-6 tracking-tight">Why Choose Our Tools?</h3>
            <p className="text-foreground/60 text-xl max-w-3xl mx-auto leading-relaxed">
              Professional-grade image processing with enterprise features and consumer-friendly interfaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group text-center p-8 bg-card/30 border-border/30 hover:border-accent/40 hover:bg-card/50 transition-all duration-500 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-500">
                  <Shrink className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-sans font-bold text-foreground mb-4 text-xl tracking-tight">Smart Compression</h3>
                <p className="text-foreground/60 leading-relaxed">
                  Advanced algorithms reduce file size while preserving image quality using cutting-edge optimization techniques
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center p-8 bg-card/30 border-border/30 hover:border-accent/40 hover:bg-card/50 transition-all duration-500 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-500">
                  <Image className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-sans font-bold text-foreground mb-4 text-xl tracking-tight">Lightning Fast</h3>
                <p className="text-foreground/60 leading-relaxed">
                  Process images instantly with our optimized processing engine built for speed and efficiency
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center p-8 bg-card/30 border-border/30 hover:border-accent/40 hover:bg-card/50 transition-all duration-500 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-500">
                  <Palette className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-sans font-bold text-foreground mb-4 text-xl tracking-tight">100% Secure</h3>
                <p className="text-foreground/60 leading-relaxed">
                  All processing happens in your browser - your images never leave your device, ensuring complete privacy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <Card className="bg-card/30 border-border/30 backdrop-blur-sm rounded-2xl mb-12">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-sans font-bold text-foreground mb-4 tracking-tight">Supported Formats</CardTitle>
              <CardDescription className="text-foreground/60 text-lg max-w-2xl mx-auto">
                Our tools support all popular image formats for maximum compatibility and flexibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {['JPG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF', 'SVG', 'ICO', 'AVIF', 'HEIC'].map((format) => (
                  <div key={format} className="bg-accent/10 hover:bg-accent/20 rounded-xl p-4 text-center transition-colors duration-300 border border-border/20">
                    <span className="font-sans font-semibold text-foreground text-sm">{format}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
  )
}