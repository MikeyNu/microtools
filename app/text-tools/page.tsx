import { Type, FileText, Key, Shuffle, RotateCcw, Hash, Zap, ArrowRight, Shield, Clock, Edit, Wand2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Free Text Tools - Word Counter, Case Converter, Password Generator | ToolHub',
  description: 'Professional text manipulation and generation tools for writers, developers, and content creators. Count words, convert case, generate passwords, and more.',
}

const textTools = [
  {
    title: "Word Counter",
    description: "Count words, characters, paragraphs, and estimate reading time",
    icon: FileText,
    href: "/text-tools/word-counter",
    popular: true,
    color: "bg-blue",
    features: ["Word count", "Character count", "Reading time"]
  },
  {
    title: "Case Converter",
    description: "Convert text to uppercase, lowercase, title case, and more formats",
    icon: Type,
    href: "/text-tools/case-converter",
    popular: true,
    color: "bg-green",
    features: ["Multiple cases", "Instant conversion", "Bulk processing"]
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for your designs and mockups",
    icon: Shuffle,
    href: "/text-tools/lorem-ipsum",
    popular: true,
    color: "bg-purple",
    features: ["Custom length", "Paragraph control", "Word variations"]
  },
  {
    title: "Password Generator",
    description: "Generate secure passwords with customizable strength options",
    icon: Key,
    href: "/text-tools/password-generator",
    popular: true,
    color: "bg-red",
    features: ["Custom length", "Character sets", "Security options"]
  },
  {
    title: "Text Reverser",
    description: "Reverse text, words, or entire sentences with various options",
    icon: RotateCcw,
    href: "/text-tools/text-reverser",
    popular: false,
    color: "bg-orange",
    features: ["Text reversal", "Word reversal", "Line reversal"]
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256, and other cryptographic hashes",
    icon: Hash,
    href: "/text-tools/hash-generator",
    popular: false,
    color: "bg-gray",
    features: ["Multiple algorithms", "Instant hashing", "Secure processing"]
  },
]

export default function TextToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Type className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ToolHub
              </h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link href="/calculators" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Calculators
              </Link>
              <Link href="/converters" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Converters
              </Link>
              <span className="text-primary font-semibold px-3 py-1 bg-primary/10 rounded-full">
                Text Tools
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
            <Edit className="h-4 w-4" />
            <span>Professional Text Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Text & Generator
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Tools
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Powerful text manipulation and generation tools for writers, developers, and content creators. 
            Process text instantly with our comprehensive suite of utilities.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Instant Processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Privacy Focused</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Wand2 className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Easy to Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Choose Your Text Tool</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select from our comprehensive collection of text processing and generation tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {textTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Card key={tool.title} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
                  {tool.popular && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl ${tool.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-8 w-8 ${tool.color}-500`} />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Link href={tool.href}>
                      <Button className="w-full group/btn">
                        <span>Use Tool</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Text Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Why Choose Our Text Tools?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade text processing with privacy and performance in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl mb-2">Lightning Fast</CardTitle>
                <CardDescription>
                  All processing happens instantly in your browser. No waiting, no delays.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl mb-2">Privacy First</CardTitle>
                <CardDescription>
                  Your text never leaves your device. Complete privacy and security guaranteed.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl mb-2">Always Available</CardTitle>
                <CardDescription>
                  Access our tools 24/7 from any device. No downloads or installations required.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* AdSense Placeholder */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <div className="text-sm font-medium mb-1">Advertisement</div>
                <div className="text-xs">AdSense Placeholder - 728x90</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
