import { Zap, DollarSign, Ruler, Thermometer, Palette, HardDrive, ImageIcon, ArrowRight, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Free Online Converters - Currency, Unit, Temperature & More | ToolHub',
  description: 'Convert units, currencies, colors, and file formats instantly. Free online converters for currency, temperature, length, weight, and more.',
}

const converters = [
  {
    title: "Currency Converter",
    description: "Convert between world currencies with live exchange rates and historical data",
    icon: DollarSign,
    href: "/converters/currency",
    popular: true,
    color: "bg-green",
    features: ["Live rates", "180+ currencies", "Historical data"]
  },
  {
    title: "Unit Converter",
    description: "Convert length, weight, volume, area, and many other units",
    icon: Ruler,
    href: "/converters/unit",
    popular: true,
    color: "bg-blue",
    features: ["Multiple categories", "Precise calculations", "Common units"]
  },
  {
    title: "Temperature Converter",
    description: "Convert between Celsius, Fahrenheit, Kelvin, and Rankine",
    icon: Thermometer,
    href: "/converters/temperature",
    popular: true,
    color: "bg-red",
    features: ["4 temperature scales", "Instant conversion", "Scientific accuracy"]
  },
  {
    title: "Color Converter",
    description: "Convert HEX, RGB, HSL, CMYK and other color formats",
    icon: Palette,
    href: "/converters/color",
    popular: false,
    color: "bg-purple",
    features: ["Multiple formats", "Color preview", "Web safe colors"]
  },
  {
    title: "Image Converter",
    description: "Resize, compress and convert image formats (JPG, PNG, WebP)",
    icon: ImageIcon,
    href: "/converters/image",
    popular: true,
    color: "bg-orange",
    features: ["Format conversion", "Resize images", "Batch processing"]
  },
  {
    title: "File Size Converter",
    description: "Convert between bytes, KB, MB, GB, TB and other storage units",
    icon: HardDrive,
    href: "/converters/file-size",
    popular: false,
    color: "bg-gray",
    features: ["Binary & decimal", "All storage units", "Precise calculations"]
  },
]

export default function ConvertersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground hover:text-foreground transition-colors text-sm font-medium border-b-2 border-accent"
              >
                All Tools
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-6">
            Free Online Converters
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Convert units, currencies, colors, and file formats instantly. All converters work offline and are
            completely free to use with precise calculations.
          </p>
        </div>
      </section>

      {/* Converters Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {converters.map((converter, index) => {
                const IconComponent = converter.icon
                return (
                  <Card key={index} className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${converter.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-6 w-6 ${converter.color.replace('bg-', 'text-')}`} />
                        </div>
                        {converter.popular && (
                          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors duration-300">
                        {converter.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                        {converter.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {converter.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-0">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg transition-all duration-300">
                        <Link href={converter.href} className="flex items-center justify-center gap-2">
                          Use Converter
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Features Section */}
            <section className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-serif font-bold text-foreground mb-4">Why Use Our Converters?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">Fast, accurate, and reliable conversion tools</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Instant Results</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Get accurate conversions instantly without any delays or loading times.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-accent/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-10 w-10 text-accent-foreground" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Privacy Protected</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      All conversions happen locally in your browser. No data is sent to our servers.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="group text-center border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="bg-secondary/10 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-10 w-10 text-secondary-foreground" />
                    </div>
                    <h4 className="text-xl font-serif font-semibold text-foreground mb-3">Always Available</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Access our converters 24/7 from any device with a web browser.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* AdSense Placeholder */}
            <section className="mb-8">
              <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/20">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">Advertisement Space</p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
