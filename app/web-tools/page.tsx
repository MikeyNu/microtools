import { Globe, LinkIcon, Code, QrCode, ImageIcon, Minimize, FileCode, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NextLink from "next/link"

const webTools = [
  {
    title: "URL Shortener",
    description: "Create short, shareable links from long URLs",
    icon: LinkIcon,
    href: "/web-tools/url-shortener",
    popular: true,
  },
  {
    title: "QR Code Generator",
    description: "Generate QR codes for text, URLs, and more",
    icon: QrCode,
    href: "/web-tools/qr-generator",
    popular: true,
  },
  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 strings",
    icon: Code,
    href: "/web-tools/base64",
    popular: true,
  },
  {
    title: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    icon: FileCode,
    href: "/web-tools/json-formatter",
    popular: true,
  },
  {
    title: "Image Resizer",
    description: "Resize images and convert formats",
    icon: ImageIcon,
    href: "/web-tools/image-resizer",
    popular: false,
  },
  {
    title: "CSS Minifier",
    description: "Minify and compress CSS code",
    icon: Minimize,
    href: "/web-tools/css-minifier",
    popular: false,
  },
  {
    title: "HTML Encoder",
    description: "Encode and decode HTML entities",
    icon: Globe,
    href: "/web-tools/html-encoder",
    popular: false,
  },
  {
    title: "UUID Generator",
    description: "Generate unique identifiers (UUIDs)",
    icon: Zap,
    href: "/web-tools/uuid-generator",
    popular: false,
  },
]

export default function WebToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NextLink href="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </NextLink>
            <nav className="flex items-center space-x-4">
              <NextLink href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </NextLink>
              <span className="text-primary font-medium">Web Tools</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Web & Utility Tools</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Essential tools for developers, designers, and web professionals. Streamline your workflow with our
            collection of web utilities.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {webTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <NextLink key={tool.title} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group relative">
                    {tool.popular && (
                      <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <IconComponent className="h-12 w-12 text-accent mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <CardTitle className="font-serif text-lg group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-sm text-accent font-medium">Use Tool →</div>
                    </CardContent>
                  </Card>
                </NextLink>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
