import { Calculator, DollarSign, Heart, Percent, Receipt, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const calculators = [
  {
    title: "Basic Calculator",
    description: "Standard calculator for everyday math",
    icon: Calculator,
    href: "/calculators/basic",
    popular: true,
  },
  {
    title: "Loan Calculator",
    description: "Calculate loan payments and interest",
    icon: DollarSign,
    href: "/calculators/loan",
    popular: true,
  },
  {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index",
    icon: Heart,
    href: "/calculators/bmi",
    popular: true,
  },
  {
    title: "Percentage Calculator",
    description: "Calculate percentages and percentage changes",
    icon: Percent,
    href: "/calculators/percentage",
    popular: false,
  },
  {
    title: "Tip Calculator",
    description: "Calculate tips and split bills",
    icon: Receipt,
    href: "/calculators/tip",
    popular: true,
  },
  {
    title: "Mortgage Calculator",
    description: "Calculate monthly mortgage payments",
    icon: Home,
    href: "/calculators/mortgage",
    popular: false,
  },
]

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-primary font-medium">Calculators</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Free Online Calculators</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional calculators for math, finance, health, and everyday calculations. All tools are free and work
            directly in your browser.
          </p>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => {
              const IconComponent = calc.icon
              return (
                <Link key={calc.title} href={calc.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group relative">
                    {calc.popular && (
                      <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <IconComponent className="h-12 w-12 text-accent mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                        {calc.title}
                      </CardTitle>
                      <CardDescription className="text-base">{calc.description}</CardDescription>
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
