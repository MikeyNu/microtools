'use client'
import { Calculator, Palette, Type, Globe, BarChart3, Wrench, Zap, Clock, Image, FileText, Code2, Database, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"
import { SearchComponent, PopularSearches } from "@/components/search-functionality"
import { useRef } from "react"

const toolCategories = [
  {
    title: "Calculators",
    description: "Mathematical and financial calculators",
    icon: Calculator,
    count: 6,
    href: "/calculators",
    tools: ["Basic Calculator", "Loan Calculator", "BMI Calculator", "Percentage Calculator"],
  },
  {
    title: "Converters",
    description: "Unit and format conversion tools",
    icon: Zap,
    count: 5,
    href: "/converters",
    tools: ["Currency Converter", "Unit Converter", "Temperature Converter", "Color Converter"],
  },
  {
    title: "Text Utilities",
    description: "Text processing and manipulation tools",
    icon: Type,
    count: 4,
    href: "/text-utilities",
    tools: ["Markdown Editor", "Text Diff Tool", "URL Encoder", "HTML Encoder"],
  },
  {
    title: "Design Tools",
    description: "Color, gradient and design utilities",
    icon: Palette,
    count: 3,
    href: "/design-tools",
    tools: ["Color Picker", "Gradient Generator", "Palette Generator"],
  },
  {
    title: "Developer Tools",
    description: "Essential development utilities",
    icon: Code2,
    count: 4,
    href: "/developer-tools",
    tools: ["JSON Formatter", "Regex Tester", "Base64 Encoder", "Hash Generator"],
  },
  {
    title: "Timestamp Tools",
    description: "Date and time conversion utilities",
    icon: Clock,
    count: 3,
    href: "/timestamp-tools",
    tools: ["Unix Converter", "Epoch Converter", "Timezone Converter"],
  },
  {
    title: "Image Tools",
    description: "Image processing and manipulation",
    icon: Image,
    count: 4,
    href: "/image-tools",
    tools: ["Image Compressor", "Format Converter", "Image Resizer", "WebP Converter"],
  },
  {
    title: "PDF Tools",
    description: "PDF processing and utilities",
    icon: FileText,
    count: 2,
    href: "/pdf-tools",
    tools: ["PDF Compressor", "PDF to Word Converter"],
  },
  {
    title: "Web Tools",
    description: "Website and development utilities",
    icon: Globe,
    count: 5,
    href: "/web-tools",
    tools: ["URL Shortener", "QR Generator", "Base64 Encoder", "JSON Formatter", "UUID Generator"],
  },
  {
    title: "SEO Tools",
    description: "Search engine optimization tools",
    icon: BarChart3,
    count: 5,
    href: "/seo-tools",
    tools: ["Meta Tag Generator", "Keyword Density", "Robots.txt Generator", "Open Graph Generator", "Schema Generator"],
  },
  {
    title: "Data Tools",
    description: "Data processing and validation utilities",
    icon: Database,
    count: 3,
    href: "/data-tools",
    tools: ["CSV to JSON Converter", "JSON Formatter", "YAML Converter"],
  },
  {
    title: "Security Tools",
    description: "Security and encryption utilities",
    icon: Shield,
    count: 4,
    href: "/security-tools",
    tools: ["Password Strength Checker", "Hash Generator", "Two-Factor Auth Generator", "SSL Certificate Checker"],
  },
  {
    title: "Math Tools",
    description: "Advanced mathematical calculators",
    icon: Calculator,
    count: 6,
    href: "/math-tools",
    tools: ["Scientific Calculator", "Equation Solver", "Matrix Calculator", "Statistics Calculator"],
  },
  {
    title: "Crypto Tools",
    description: "Cryptocurrency and blockchain utilities",
    icon: Globe,
    count: 2,
    href: "/crypto-tools",
    tools: ["Bitcoin Address Validator", "Crypto Price Converter"],
  },
  {
    title: "Network Tools",
    description: "Network analysis and testing tools",
    icon: Globe,
    count: 3,
    href: "/network-tools",
    tools: ["IP Address Lookup", "DNS Lookup", "Port Scanner"],
  },
  {
    title: "Finance Tools",
    description: "Financial calculators and tools",
    icon: Calculator,
    count: 3,
    href: "/finance-tools",
    tools: ["Compound Interest Calculator", "Investment Return Calculator", "Currency Converter"],
  },
  {
    title: "Text Tools",
    description: "Text processing and manipulation tools",
    icon: Type,
    count: 6,
    href: "/text-tools",
    tools: ["Case Converter", "Hash Generator", "Lorem Ipsum", "Password Generator", "Text Reverser", "Word Counter"],
  },
]

export default function HomePage() {
  const searchRef = useRef<{ setQuery: (query: string) => void }>(null);

  const handlePopularSearchSelect = (query: string) => {
    if (searchRef.current) {
      searchRef.current.setQuery(query);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/10 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm opacity-75"></div>
              </div>
              <h1 className="text-2xl font-sans font-bold text-foreground tracking-tight">ToolHub</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
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

            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/20"></div>
        <div className="absolute inset-0 geometric-bg"></div>

        <div className="absolute top-20 left-[10%] w-40 h-40 border border-accent/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-[15%] w-28 h-28 border border-accent/15 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-[20%] w-3 h-3 bg-accent/30 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/3 right-[25%] w-2 h-2 bg-accent/40 rounded-full animate-ping delay-700"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-sans font-bold text-foreground mb-10 leading-[0.9] tracking-tight">
              Your digital toolkit for
              <span className="block text-transparent bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text mt-2">
                smarter productivity
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/60 mb-14 max-w-4xl mx-auto leading-relaxed font-light">
              Access hundreds of professional-grade online tools designed for developers, designers, and digital
              professionals. Everything you need to boost productivity in one elegant platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <div className="relative w-full sm:w-96">
                <SearchComponent ref={searchRef} className="w-full" />
                <div className="mt-4">
                  <PopularSearches onSearchSelect={handlePopularSearchSelect} />
                </div>
              </div>
              <Link href="/tools">
                <Button
                  size="lg"
                  className="h-16 px-10 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl shadow-lg shadow-accent/20"
                >
                  Explore Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Ad Placement - Above the fold */}
      {shouldDisplayAds() && (
        <section className="py-8 bg-background/50">
          <div className="container mx-auto px-6">
            <div className="flex justify-center">
              <AdSensePlaceholder 
                size="leaderboard" 
                adClient={ADSENSE_CONFIG.publisherId}
                adSlot={getAdUnitId('homepageHero')}
                responsive={true}
              />
            </div>
          </div>
        </section>
      )}

      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-sans font-bold text-foreground mb-8 tracking-tight">
              Professional Tools
            </h3>
            <p className="text-foreground/60 text-xl max-w-3xl mx-auto leading-relaxed">
              Carefully crafted tools designed for professionals and enthusiasts who demand excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toolCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Link key={category.title} href={category.href}>
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
                        <span className="text-sm text-foreground/50 bg-muted/40 px-4 py-2 rounded-full border border-border/20 backdrop-blur-sm">
                          {category.count} tools
                        </span>
                      </div>
                      <CardTitle className="font-sans text-2xl group-hover:text-accent transition-colors duration-500 mb-3 tracking-tight">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-foreground/60 text-base leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-8">
                      <div className="space-y-4">
                        {category.tools.slice(0, 3).map((tool, toolIndex) => (
                          <div
                            key={toolIndex}
                            className="text-sm text-foreground/50 flex items-center group-hover:text-foreground/70 transition-colors duration-500"
                          >
                            <div className="w-2 h-2 bg-accent/50 rounded-full mr-4 group-hover:bg-accent transition-colors duration-500"></div>
                            {tool}
                          </div>
                        ))}
                        <div className="text-sm text-accent/80 font-medium pt-3 border-t border-border/20">
                          +{category.count - 3} more tools
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* High-performing middle placement */}
      {shouldDisplayAds() && (
        <section className="py-8 bg-card/10">
          <div className="container mx-auto px-6 flex justify-center">
            <AdSensePlaceholder 
              size="large-rectangle" 
              adClient={ADSENSE_CONFIG.publisherId}
              adSlot={getAdUnitId('homepageMiddle')}
              responsive={true}
            />
          </div>
        </section>
      )}

      <section className="py-20 bg-card/20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-sans font-bold text-foreground mb-6">Most Popular</h3>
            <p className="text-foreground/60 text-xl">Tools that professionals use every day</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Password Generator",
              "QR Code Generator",
              "Color Picker",
              "Unit Converter",
              "Word Counter",
              "Lorem Ipsum",
              "Hash Generator",
              "Base64 Encoder",
              "URL Shortener",
              "Image Resizer",
              "JSON Formatter",
              "CSS Minifier",
            ].map((tool, index) => (
              <Card
                key={index}
                className="group text-center p-6 bg-card/30 border-border/30 hover:border-accent/40 hover:bg-card/50 transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                <div className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                  {tool}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative geometric-bg">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl font-sans font-bold text-foreground mb-6">Stay in the Loop</h3>
            <p className="text-foreground/60 text-xl mb-10 leading-relaxed">
              Get notified about new tools, features, and productivity tips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Input
                placeholder="Enter your email address"
                className="w-full sm:w-80 h-12 bg-card/50 border-border/40 backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20"
              />
              <Button size="lg" className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer ad placement */}
      {shouldDisplayAds() && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex justify-center">
              <AdSensePlaceholder 
                size="rectangle" 
                adClient={ADSENSE_CONFIG.publisherId}
                adSlot={getAdUnitId('homepageFooter')}
                responsive={true}
              />
            </div>
          </div>
        </section>
      )}

      <footer className="bg-background border-t border-border/20 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <Wrench className="h-8 w-8 text-accent" />
                  <div className="absolute -inset-1 bg-accent/20 rounded-full blur-sm"></div>
                </div>
                <span className="text-2xl font-sans font-bold text-foreground">ToolHub</span>
              </div>
              <p className="text-foreground/60 text-lg leading-relaxed max-w-md">
                Professional-grade online tools designed to boost your productivity. Trusted by thousands of users
                worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-foreground mb-6 text-lg">Categories</h4>
              <ul className="space-y-3">
                {["Calculators", "Converters", "Text Tools", "Web Tools"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-foreground/60 hover:text-accent transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-foreground mb-6 text-lg">Company</h4>
              <ul className="space-y-3">
                {["About", "Privacy", "Terms", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-foreground/60 hover:text-accent transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/20 mt-12 pt-8 text-center">
            <p className="text-foreground/40">© 2025 ToolHub. Crafted for productivity enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
