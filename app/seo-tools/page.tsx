import { BarChart3, Tags, FileText, MapIcon as Sitemap, Share2, Code2, Zap, ArrowRight, Shield, Clock, Search, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Free SEO Tools - Meta Tags, Keywords, Robots.txt & More | ToolHub',
  description: 'Professional SEO tools to optimize your website for search engines. Generate meta tags, analyze keywords, create robots.txt files, and boost your rankings.',
}

const seoTools = [
  {
    title: "Meta Tag Generator",
    description: "Generate HTML meta tags for better SEO and search engine visibility",
    icon: Tags,
    href: "/seo-tools/meta-generator",
    popular: true,
    color: "bg-blue",
    features: ["Title & description tags", "Viewport meta tags", "SEO optimization"]
  },
  {
    title: "Keyword Density Checker",
    description: "Analyze keyword density and optimize your content for better rankings",
    icon: BarChart3,
    href: "/seo-tools/keyword-density",
    popular: true,
    color: "bg-green",
    features: ["Keyword analysis", "Density calculation", "SEO recommendations"]
  },
  {
    title: "Robots.txt Generator",
    description: "Create robots.txt files to control search engine crawling",
    icon: FileText,
    href: "/seo-tools/robots-generator",
    popular: true,
    color: "bg-purple",
    features: ["Crawl directives", "Sitemap references", "Custom rules"]
  },
  {
    title: "Sitemap Generator",
    description: "Generate XML sitemaps to help search engines index your website",
    icon: Sitemap,
    href: "/seo-tools/sitemap-generator",
    popular: false,
    color: "bg-orange",
    features: ["XML sitemap", "URL priority", "Change frequency"]
  },
  {
    title: "Open Graph Generator",
    description: "Create Open Graph meta tags for better social media sharing",
    icon: Share2,
    href: "/seo-tools/open-graph",
    popular: true,
    color: "bg-red",
    features: ["Social media tags", "Image optimization", "Preview generation"]
  },
  {
    title: "Schema Markup Generator",
    description: "Generate structured data markup for rich search results",
    icon: Code2,
    href: "/seo-tools/schema-generator",
    popular: false,
    color: "bg-gray",
    features: ["JSON-LD format", "Rich snippets", "Schema validation"]
  },
]

export default function SEOToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              ToolHub
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/image-tools" className="text-muted-foreground hover:text-primary transition-colors">
                Image Tools
              </Link>
              <Link href="/pdf-tools" className="text-muted-foreground hover:text-primary transition-colors">
                PDF Tools
              </Link>
              <Link href="/text-utilities" className="text-muted-foreground hover:text-primary transition-colors">
                Text Tools
              </Link>
              <Link href="/calculators" className="text-muted-foreground hover:text-primary transition-colors">
                Calculators
              </Link>
              <Link href="/converters" className="text-muted-foreground hover:text-primary transition-colors">
                Converters
              </Link>
              <Link href="/developer-tools" className="text-muted-foreground hover:text-primary transition-colors">
                Developer
              </Link>
              <Link href="/seo-tools" className="text-primary font-medium">
                SEO Tools
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Search className="h-4 w-4" />
            SEO & Analytics Tools
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            SEO Tools
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional SEO tools to optimize your website for search engines. 
            <span className="text-primary font-medium">Improve rankings and boost visibility.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
              <Search className="mr-2 h-5 w-5" />
              Start Optimizing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Boost Rankings
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Fast Analysis
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Secure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Professional SEO Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimize your website for search engines with our comprehensive SEO toolkit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seoTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Link key={tool.title} href={tool.href} className="group block">
                  <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="relative z-10 text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${tool.color}-500/10 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`h-8 w-8 ${tool.color}-500 group-hover:text-primary transition-colors duration-300`} />
                      </div>
                      {tool.popular && (
                        <Badge variant="secondary" className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20">
                          Popular
                        </Badge>
                      )}
                      <CardTitle className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-0">
                      <div className="space-y-3 mb-6">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-300">
                        Use SEO Tool
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our SEO Tools */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose Our SEO Tools?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade SEO tools designed to boost your search engine rankings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Boost Rankings</h3>
              <p className="text-sm text-muted-foreground">Improve your search engine visibility and rankings</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 mb-4">
                <Search className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Deep Analysis</h3>
              <p className="text-sm text-muted-foreground">Comprehensive SEO analysis and recommendations</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Fast Results</h3>
              <p className="text-sm text-muted-foreground">Get instant SEO insights and optimizations</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 mb-4">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Privacy Focused</h3>
              <p className="text-sm text-muted-foreground">All analysis performed securely in your browser</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
