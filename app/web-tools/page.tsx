import { Globe, LinkIcon, Code, QrCode, ImageIcon, Minimize, FileCode, Zap, ArrowRight, Clock, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import NextLink from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Web Tools - Essential Utilities for Developers | ToolHub",
  description: "Comprehensive collection of web development tools including URL shortener, QR code generator, Base64 encoder, JSON formatter, and more. Free online utilities for developers.",
  keywords: "web tools, URL shortener, QR code generator, Base64 encoder, JSON formatter, developer tools, online utilities",
}

const webTools = [
  {
    title: "URL Shortener",
    description: "Create short, shareable links from long URLs with custom aliases and analytics tracking",
    icon: LinkIcon,
    href: "/web-tools/url-shortener",
    popular: true,
    color: "bg-blue-500",
    features: ["Custom aliases", "Click analytics", "Bulk shortening"]
  },
  {
    title: "QR Code Generator",
    description: "Generate customizable QR codes for text, URLs, WiFi, and contact information",
    icon: QrCode,
    href: "/web-tools/qr-generator",
    popular: true,
    color: "bg-green-500",
    features: ["Multiple formats", "Custom styling", "High resolution"]
  },
  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 strings with support for files and images",
    icon: Code,
    href: "/web-tools/base64",
    popular: true,
    color: "bg-purple-500",
    features: ["File encoding", "Image support", "Batch processing"]
  },
  {
    title: "JSON Formatter",
    description: "Format, validate, minify and beautify JSON data with syntax highlighting",
    icon: FileCode,
    href: "/web-tools/json-formatter",
    popular: true,
    color: "bg-orange-500",
    features: ["Syntax validation", "Pretty printing", "Error detection"]
  },
  {
    title: "Image Resizer",
    description: "Resize images and convert between formats while maintaining quality",
    icon: ImageIcon,
    href: "/web-tools/image-resizer",
    popular: false,
    color: "bg-pink-500",
    features: ["Quality control", "Format conversion", "Batch resize"]
  },
  {
    title: "CSS Minifier",
    description: "Minify and compress CSS code to reduce file size and improve performance",
    icon: Minimize,
    href: "/web-tools/css-minifier",
    popular: false,
    color: "bg-indigo-500",
    features: ["Size reduction", "Comment removal", "Whitespace optimization"]
  },
  {
    title: "HTML Encoder",
    description: "Encode and decode HTML entities for safe web content display",
    icon: Globe,
    href: "/web-tools/html-encoder",
    popular: false,
    color: "bg-teal-500",
    features: ["Entity conversion", "Safe encoding", "Bulk processing"]
  },
  {
    title: "UUID Generator",
    description: "Generate unique identifiers (UUIDs) in various formats for applications",
    icon: Zap,
    href: "/web-tools/uuid-generator",
    popular: false,
    color: "bg-yellow-500",
    features: ["Multiple versions", "Bulk generation", "Custom formats"]
  },
]

export default function WebToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NextLink href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Globe className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </NextLink>
            <nav className="hidden md:flex items-center space-x-6">
              <NextLink href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Home
              </NextLink>
              <NextLink href="/calculators" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Calculators
              </NextLink>
              <NextLink href="/converters" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Converters
              </NextLink>
              <NextLink href="/text-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Text Tools
              </NextLink>
              <span className="text-sm font-medium text-primary">Web Tools</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium mb-6">
            <Globe className="mr-2 h-4 w-4" />
            Web Development Tools
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Web & Utility
            <span className="text-primary"> Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Essential tools for developers, designers, and web professionals. Streamline your workflow with our
            comprehensive collection of web utilities and development tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Always Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Choose Your Tool</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade web tools designed for developers, designers, and digital professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {webTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Card key={tool.title} className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/30" />
                  <div className="relative">
                    {tool.popular && (
                      <Badge className="absolute -top-1 -right-1 z-10 bg-primary text-primary-foreground">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${tool.color} bg-opacity-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`h-8 w-8 ${tool.color.replace('bg-', 'text-')}`} />
                      </div>
                      <CardTitle className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        {tool.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-muted-foreground">
                            <div className={`w-1.5 h-1.5 rounded-full ${tool.color} mr-2`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <NextLink href={tool.href}>
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </NextLink>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Web Tools */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Why Choose Our Web Tools?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools trusted by developers and designers worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 bg-opacity-10 mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                All processing happens locally in your browser. Your data never leaves your device.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 bg-opacity-10 mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized algorithms ensure quick processing even for large files and complex operations.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500 bg-opacity-10 mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Always Available</h3>
              <p className="text-muted-foreground">
                Access our tools 24/7 from any device. No downloads or installations required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Placeholder */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">AdSense Placeholder</p>
          </div>
        </div>
      </section>
    </div>
  )
}
