'use client'

import { Calculator, Palette, Type, Globe, BarChart3, Wrench, Zap, Search, Filter, Clock, Image, FileText, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"
import { SearchComponent } from "@/components/search-functionality"
import { useState, useMemo } from "react"

const allTools = [
  // Calculators
  {
    name: "Basic Calculator",
    description: "Simple arithmetic calculator for everyday calculations",
    category: "Calculators",
    href: "/calculators/basic",
    icon: Calculator,
    popular: true,
  },
  {
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index and health status",
    category: "Calculators",
    href: "/calculators/bmi",
    icon: Calculator,
    popular: true,
  },
  {
    name: "Loan Calculator",
    description: "Calculate loan payments, interest, and amortization",
    category: "Calculators",
    href: "/calculators/loan",
    icon: Calculator,
  },
  {
    name: "Mortgage Calculator",
    description: "Calculate mortgage payments and total interest",
    category: "Calculators",
    href: "/calculators/mortgage",
    icon: Calculator,
  },
  {
    name: "Percentage Calculator",
    description: "Calculate percentages, increases, and decreases",
    category: "Calculators",
    href: "/calculators/percentage",
    icon: Calculator,
  },
  {
    name: "Tip Calculator",
    description: "Calculate tips and split bills easily",
    category: "Calculators",
    href: "/calculators/tip",
    icon: Calculator,
  },

  // Converters
  {
    name: "Currency Converter",
    description: "Convert between different currencies with live rates",
    category: "Converters",
    href: "/converters/currency",
    icon: Zap,
    popular: true,
  },
  {
    name: "Unit Converter",
    description: "Convert between different units of measurement",
    category: "Converters",
    href: "/converters/unit",
    icon: Zap,
  },
  {
    name: "Temperature Converter",
    description: "Convert between Celsius, Fahrenheit, and Kelvin",
    category: "Converters",
    href: "/converters/temperature",
    icon: Zap,
  },
  {
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, and other color formats",
    category: "Converters",
    href: "/converters/color",
    icon: Zap,
  },
  {
    name: "File Size Converter",
    description: "Convert between bytes, KB, MB, GB, and TB",
    category: "Converters",
    href: "/converters/file-size",
    icon: Zap,
  },

  // Text Utilities
  {
    name: "Markdown Editor",
    description: "Write and preview Markdown with live rendering",
    category: "Text Utilities",
    href: "/text-utilities/markdown-editor",
    icon: Type,
    popular: true,
  },
  {
    name: "Text Diff Tool",
    description: "Compare two texts and highlight differences",
    category: "Text Utilities",
    href: "/text-utilities/text-diff",
    icon: Type,
    popular: true,
  },
  {
    name: "URL Encoder/Decoder",
    description: "Encode and decode URLs with various formats",
    category: "Text Utilities",
    href: "/text-utilities/url-encoder",
    icon: Type,
  },
  {
    name: "HTML Encoder/Decoder",
    description: "Encode and decode HTML entities safely",
    category: "Text Utilities",
    href: "/text-utilities/html-encoder",
    icon: Type,
  },
  {
    name: "Word Counter",
    description: "Count words, characters, and paragraphs in text",
    category: "Text Utilities",
    href: "/text-tools/word-counter",
    icon: Type,
  },
  {
    name: "Case Converter",
    description: "Convert text to uppercase, lowercase, title case, etc.",
    category: "Text Utilities",
    href: "/text-tools/case-converter",
    icon: Type,
  },
  {
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text for design and development",
    category: "Text Utilities",
    href: "/text-tools/lorem-ipsum",
    icon: Type,
  },

  // Developer Tools
  {
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data",
    category: "Developer Tools",
    href: "/developer-tools/json-formatter",
    icon: Code2,
    popular: true,
  },
  {
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    category: "Developer Tools",
    href: "/developer-tools/regex-tester",
    icon: Code2,
    popular: true,
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings",
    category: "Developer Tools",
    href: "/developer-tools/base64",
    icon: Code2,
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256, and other hashes",
    category: "Developer Tools",
    href: "/developer-tools/hash-generator",
    icon: Code2,
  },
  {
    name: "Password Generator",
    description: "Generate secure passwords with custom options",
    category: "Developer Tools",
    href: "/developer-tools/password-generator",
    icon: Code2,
  },

  // Timestamp Tools
  {
    name: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates",
    category: "Timestamp Tools",
    href: "/timestamp-tools/unix-converter",
    icon: Clock,
    popular: true,
  },
  {
    name: "Date Calculator",
    description: "Calculate differences between dates",
    category: "Timestamp Tools",
    href: "/timestamp-tools/date-calculator",
    icon: Clock,
  },
  {
    name: "Timezone Converter",
    description: "Convert times between different timezones",
    category: "Timestamp Tools",
    href: "/timestamp-tools/timezone-converter",
    icon: Clock,
  },
  {
    name: "Time Formatter",
    description: "Format dates and times in various formats",
    category: "Timestamp Tools",
    href: "/timestamp-tools/time-formatter",
    icon: Clock,
  },

  // Image Tools
  {
    name: "Image Compressor",
    description: "Compress images to reduce file size",
    category: "Image Tools",
    href: "/image-tools/compressor",
    icon: Image,
    popular: true,
  },
  {
    name: "Image Format Converter",
    description: "Convert between different image formats",
    category: "Image Tools",
    href: "/image-tools/format-converter",
    icon: Image,
  },
  {
    name: "Image Resizer",
    description: "Resize images to specific dimensions",
    category: "Image Tools",
    href: "/image-tools/resizer",
    icon: Image,
  },
  {
    name: "Image Cropper",
    description: "Crop images to desired dimensions",
    category: "Image Tools",
    href: "/image-tools/cropper",
    icon: Image,
  },

  // PDF Tools
  {
    name: "PDF Merger",
    description: "Merge multiple PDF files into one",
    category: "PDF Tools",
    href: "/pdf-tools/merger",
    icon: FileText,
    popular: true,
  },
  {
    name: "PDF Splitter",
    description: "Split PDF files into separate pages",
    category: "PDF Tools",
    href: "/pdf-tools/splitter",
    icon: FileText,
  },
  {
    name: "PDF to Image",
    description: "Convert PDF pages to image files",
    category: "PDF Tools",
    href: "/pdf-tools/to-image",
    icon: FileText,
  },
  {
    name: "PDF Compressor",
    description: "Compress PDF files to reduce size",
    category: "PDF Tools",
    href: "/pdf-tools/compressor",
    icon: FileText,
  },

  // Web Tools
  {
    name: "QR Code Generator",
    description: "Generate QR codes for URLs, text, and more",
    category: "Web Tools",
    href: "/web-tools/qr-generator",
    icon: Globe,
    popular: true,
  },
  {
    name: "URL Shortener",
    description: "Shorten long URLs for easy sharing",
    category: "Web Tools",
    href: "/web-tools/url-shortener",
    icon: Globe,
  },
  {
    name: "UUID Generator",
    description: "Generate unique identifiers (UUIDs)",
    category: "Web Tools",
    href: "/web-tools/uuid-generator",
    icon: Globe,
  },

  // SEO Tools
  {
    name: "Meta Tag Generator",
    description: "Generate HTML meta tags for SEO optimization",
    category: "SEO Tools",
    href: "/seo-tools/meta-generator",
    icon: BarChart3,
  },
  {
    name: "Open Graph Generator",
    description: "Generate Open Graph meta tags for social media",
    category: "SEO Tools",
    href: "/seo-tools/open-graph",
    icon: BarChart3,
  },
  {
    name: "Robots.txt Generator",
    description: "Generate robots.txt files for search engines",
    category: "SEO Tools",
    href: "/seo-tools/robots-generator",
    icon: BarChart3,
  },
  {
    name: "Schema Markup Generator",
    description: "Generate structured data markup for SEO",
    category: "SEO Tools",
    href: "/seo-tools/schema-generator",
    icon: BarChart3,
  },
  {
    name: "Keyword Density Checker",
    description: "Analyze keyword density in your content",
    category: "SEO Tools",
    href: "/seo-tools/keyword-density",
    icon: BarChart3,
  },
]

const categories = [
  { name: "All", count: allTools.length },
  { name: "Calculators", count: allTools.filter(tool => tool.category === "Calculators").length },
  { name: "Converters", count: allTools.filter(tool => tool.category === "Converters").length },
  { name: "Text Utilities", count: allTools.filter(tool => tool.category === "Text Utilities").length },
  { name: "Developer Tools", count: allTools.filter(tool => tool.category === "Developer Tools").length },
  { name: "Timestamp Tools", count: allTools.filter(tool => tool.category === "Timestamp Tools").length },
  { name: "Image Tools", count: allTools.filter(tool => tool.category === "Image Tools").length },
  { name: "PDF Tools", count: allTools.filter(tool => tool.category === "PDF Tools").length },
  { name: "Web Tools", count: allTools.filter(tool => tool.category === "Web Tools").length },
  { name: "SEO Tools", count: allTools.filter(tool => tool.category === "SEO Tools").length },
]

export default function AllToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTools = useMemo(() => {
    let filtered = allTools
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/10 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm opacity-75"></div>
                </div>
                <h1 className="text-2xl font-sans font-bold text-foreground tracking-tight">ToolHub</h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground hover:text-foreground transition-colors text-sm font-medium border-b-2 border-accent"
              >
                All Tools
              </Link>
              <Link
                href="/about"
                className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            All Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {selectedCategory === "All" && !searchQuery ? (
              `Browse our complete collection of ${allTools.length}+ free online tools. Find exactly what you need for your projects.`
            ) : (
              `Showing ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} ${selectedCategory !== "All" ? `in ${selectedCategory}` : ''} ${searchQuery ? `matching "${searchQuery}"` : ''}`
            )}
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* AdSense Banner */}
        {shouldDisplayAds() && (
          <div className="mb-12">
            <AdSensePlaceholder
              size="leaderboard"
              adSlot={getAdUnitId('headerBanner')}
              adClient={ADSENSE_CONFIG.publisherId}
              className="mx-auto"
            />
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                className="text-sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedCategory === category.name ? filteredTools.length : category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card key={tool.name} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 hover:border-accent/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex gap-1">
                      {tool.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tool.description}
                  </CardDescription>
                  <Link href={tool.href}>
                    <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      Use Tool
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tools found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? `No tools match "${searchQuery}"` : `No tools in ${selectedCategory} category`}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* AdSense Rectangle */}
        {shouldDisplayAds() && (
          <div className="mb-12">
            <AdSensePlaceholder
              size="rectangle"
              adSlot={getAdUnitId('toolContent')}
              adClient={ADSENSE_CONFIG.publisherId}
              className="mx-auto"
            />
          </div>
        )}

        {/* Popular Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Calculators",
                description: "Mathematical and financial calculators",
                icon: Calculator,
                href: "/calculators",
                count: allTools.filter(tool => tool.category === "Calculators").length,
              },
              {
                title: "Converters",
                description: "Unit and format conversion tools",
                icon: Zap,
                href: "/converters",
                count: allTools.filter(tool => tool.category === "Converters").length,
              },
              {
                title: "Text Tools",
                description: "Text manipulation and generation",
                icon: Type,
                href: "/text-tools",
                count: allTools.filter(tool => tool.category === "Text Tools").length,
              },
              {
                title: "Web Tools",
                description: "Website and development utilities",
                icon: Globe,
                href: "/web-tools",
                count: allTools.filter(tool => tool.category === "Web Tools").length,
              },
              {
                title: "SEO Tools",
                description: "Search engine optimization tools",
                icon: BarChart3,
                href: "/seo-tools",
                count: allTools.filter(tool => tool.category === "SEO Tools").length,
              },
            ].map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.title} href={category.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 hover:border-accent/50 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-accent" />
                        </div>
                        <Badge variant="secondary">
                          {category.count} tools
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold group-hover:text-accent transition-colors">
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground">
                        {category.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer AdSense */}
      {shouldDisplayAds() && (
        <div className="container mx-auto px-6 py-8">
          <AdSensePlaceholder
            size="leaderboard"
            adSlot={getAdUnitId('toolFooter')}
            adClient={ADSENSE_CONFIG.publisherId}
            className="mx-auto"
          />
        </div>
      )}
    </div>
  )
}