import { BarChart3, Tags, FileText, MapIcon as Sitemap, Share2, Code2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const seoTools = [
  {
    title: "Meta Tag Generator",
    description: "Generate HTML meta tags for better SEO",
    icon: Tags,
    href: "/seo-tools/meta-generator",
    popular: true,
  },
  {
    title: "Keyword Density Checker",
    description: "Analyze keyword density in your content",
    icon: BarChart3,
    href: "/seo-tools/keyword-density",
    popular: true,
  },
  {
    title: "Robots.txt Generator",
    description: "Create robots.txt files for search engines",
    icon: FileText,
    href: "/seo-tools/robots-generator",
    popular: true,
  },
  {
    title: "Sitemap Generator",
    description: "Generate XML sitemaps for your website",
    icon: Sitemap,
    href: "/seo-tools/sitemap-generator",
    popular: false,
  },
  {
    title: "Open Graph Generator",
    description: "Create Open Graph meta tags for social media",
    icon: Share2,
    href: "/seo-tools/open-graph",
    popular: true,
  },
  {
    title: "Schema Markup Generator",
    description: "Generate structured data markup",
    icon: Code2,
    href: "/seo-tools/schema-generator",
    popular: false,
  },
]

export default function SEOToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-primary font-medium">SEO Tools</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">SEO & Analytics Tools</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional SEO tools to optimize your website for search engines. Improve rankings, analyze performance,
            and boost your online visibility.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seoTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Link key={tool.title} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group relative">
                    {tool.popular && (
                      <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <IconComponent className="h-12 w-12 text-accent mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-base">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-sm text-accent font-medium">Use Tool →</div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
