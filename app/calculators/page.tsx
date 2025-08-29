import { Calculator, DollarSign, Heart, Percent, Receipt, Home, Zap, ArrowRight, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import React from "react"
import { Metadata } from "next"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"

export const metadata: Metadata = {
  title: 'Free Online Calculators - Math, Finance, Health & More | ToolHub',
  description: 'Professional calculators for math, finance, health, and everyday calculations. Free online tools including loan calculator, BMI calculator, and more.',
}

const calculators = [
  {
    title: "Basic Calculator",
    description: "Standard calculator for everyday math operations and calculations",
    icon: Calculator,
    href: "/calculators/basic",
    popular: true,
    color: "bg-blue",
    features: ["Basic operations", "Memory functions", "History"]
  },
  {
    title: "Loan Calculator",
    description: "Calculate loan payments, interest rates, and amortization schedules",
    icon: DollarSign,
    href: "/calculators/loan",
    popular: true,
    color: "bg-green",
    features: ["Monthly payments", "Interest calculation", "Amortization"]
  },
  {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and health recommendations",
    icon: Heart,
    href: "/calculators/bmi",
    popular: true,
    color: "bg-red",
    features: ["BMI calculation", "Health categories", "Recommendations"]
  },
  {
    title: "Percentage Calculator",
    description: "Calculate percentages, percentage changes, and ratios",
    icon: Percent,
    href: "/calculators/percentage",
    popular: false,
    color: "bg-purple",
    features: ["Percentage of", "Percentage change", "Ratios"]
  },
  {
    title: "Tip Calculator",
    description: "Calculate tips and split bills among multiple people",
    icon: Receipt,
    href: "/calculators/tip",
    popular: true,
    color: "bg-orange",
    features: ["Tip calculation", "Bill splitting", "Per person cost"]
  },
  {
    title: "Mortgage Calculator",
    description: "Calculate monthly mortgage payments and total interest costs",
    icon: Home,
    href: "/calculators/mortgage",
    popular: false,
    color: "bg-gray",
    features: ["Monthly payments", "Total interest", "Payment schedule"]
  },
]

export default function CalculatorsPage() {
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
              <Link href="/calculators" className="text-primary font-medium">
                Calculators
              </Link>
              <Link href="/converters" className="text-muted-foreground hover:text-primary transition-colors">
                Converters
              </Link>
              <Link href="/developer-tools" className="text-muted-foreground hover:text-primary transition-colors">
                Developer
              </Link>
              <Link href="/color-tools" className="text-muted-foreground hover:text-primary transition-colors">
                Colors
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
            <Calculator className="h-4 w-4" />
            Professional Calculators
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Online Calculators
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional calculators for math, finance, health, and everyday calculations. 
            <span className="text-primary font-medium">Fast, accurate, and free.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
              <Calculator className="mr-2 h-5 w-5" />
              Start Calculating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Secure
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Fast
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                24/7 Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Professional Calculators
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our collection of specialized calculators designed for accuracy and ease of use
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calculators.map((calc, index) => {
              const IconComponent = calc.icon
              return (
                <React.Fragment key={calc.title}>
                  <Link href={calc.href} className="group block">
                    <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="relative z-10 text-center pb-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${calc.color}-500/10 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-8 w-8 ${calc.color}-500 group-hover:text-primary transition-colors duration-300`} />
                        </div>
                        {calc.popular && (
                          <Badge variant="secondary" className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20">
                            Popular
                          </Badge>
                        )}
                        <CardTitle className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {calc.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {calc.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-0">
                        <div className="space-y-3 mb-6">
                          {calc.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-300">
                          Use Calculator
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Strategic ad placement after every 3rd calculator */}
                  {shouldDisplayAds() && (index + 1) % 3 === 0 && index < calculators.length - 1 && (
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

      {/* Why Choose Our Calculators */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose Our Calculators?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade calculators designed for accuracy, speed, and ease of use
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Instant calculations with optimized algorithms</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 mb-4">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">All calculations performed locally in your browser</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
                <Calculator className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Professional Grade</h3>
              <p className="text-sm text-muted-foreground">Accurate calculations for professional use</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 mb-4">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Always Available</h3>
              <p className="text-sm text-muted-foreground">24/7 access from any device, anywhere</p>
            </Card>
          </div>
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
