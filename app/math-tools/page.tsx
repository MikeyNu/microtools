import { Calculator, TrendingUp, Grid3X3, BarChart3, PieChart, Sigma } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Metadata } from 'next'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from '@/lib/adsense-config'

export const metadata: Metadata = {
  title: 'Math Tools - Free Online Mathematical Calculators and Utilities',
  description: 'Comprehensive collection of mathematical tools including scientific calculator, equation solver, matrix calculator, statistics calculator, and more. All tools are free and work in your browser.',
  keywords: 'math tools, calculator, scientific calculator, equation solver, matrix calculator, statistics, mathematical utilities, online math tools',
  openGraph: {
    title: 'Math Tools - Free Online Mathematical Calculators',
    description: 'Professional mathematical tools for calculations, equations, matrices, and statistics. Free online utilities for students, engineers, and professionals.',
    type: 'website',
  },
}

const tools = [
  {
    title: 'Scientific Calculator',
    description: 'Advanced calculator with trigonometric, logarithmic, and exponential functions',
    href: '/math-tools/scientific-calculator',
    icon: Calculator,
    badge: 'Popular',
    features: ['Trigonometric functions', 'Logarithms', 'Exponentials', 'Constants']
  },
  {
    title: 'Equation Solver',
    description: 'Solve linear, quadratic, cubic, and system of equations step by step',
    href: '/math-tools/equation-solver',
    icon: TrendingUp,
    badge: 'New',
    features: ['Linear equations', 'Quadratic equations', 'System solving', 'Step-by-step']
  },
  {
    title: 'Matrix Calculator',
    description: 'Perform matrix operations including multiplication, determinant, and inverse',
    href: '/math-tools/matrix-calculator',
    icon: Grid3X3,
    features: ['Matrix operations', 'Determinant', 'Inverse', 'Eigenvalues']
  },
  {
    title: 'Statistics Calculator',
    description: 'Calculate mean, median, mode, standard deviation, and statistical distributions',
    href: '/math-tools/statistics-calculator',
    icon: BarChart3,
    features: ['Descriptive stats', 'Distributions', 'Hypothesis testing', 'Regression']
  },
  {
    title: 'Graphing Calculator',
    description: 'Plot functions, analyze graphs, and visualize mathematical relationships',
    href: '/math-tools/graphing-calculator',
    icon: PieChart,
    badge: 'Coming Soon',
    features: ['Function plotting', 'Multiple graphs', 'Zoom & pan', 'Export graphs']
  },
  {
    title: 'Unit Converter',
    description: 'Convert between different units of measurement for length, weight, temperature',
    href: '/math-tools/unit-converter',
    icon: Sigma,
    features: ['Length conversion', 'Weight & mass', 'Temperature', 'Area & volume']
  }
]

export default function MathToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl">
            <Calculator className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Math Tools</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Professional mathematical tools and calculators for students, engineers, and professionals. 
          Solve equations, perform calculations, and analyze data with our comprehensive suite of math utilities.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tools.map((tool, index) => {
          const Icon = tool.icon
          const isComingSoon = tool.badge === 'Coming Soon'
          
          return isComingSoon ? (
            <div key={index}>
              <Card className={`h-full transition-all duration-200 ${
                isComingSoon 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    {tool.badge && (
                      <Badge 
                        variant={tool.badge === 'New' ? 'default' : 'secondary'}
                        className={tool.badge === 'New' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tool.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Link key={index} href={tool.href}>
              <Card className={`h-full transition-all duration-200 ${
                isComingSoon 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    {tool.badge && (
                      <Badge 
                        variant={tool.badge === 'New' ? 'default' : 'secondary'}
                        className={tool.badge === 'New' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tool.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <Calculator className="h-8 w-8 mx-auto mb-3 text-blue-500" />
          <h3 className="font-semibold mb-2">Basic Calculations</h3>
          <p className="text-sm text-muted-foreground">
            Arithmetic operations, percentages, and basic mathematical functions
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold mb-2">Advanced Math</h3>
          <p className="text-sm text-muted-foreground">
            Trigonometry, calculus, complex numbers, and advanced functions
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <Grid3X3 className="h-8 w-8 mx-auto mb-3 text-purple-500" />
          <h3 className="font-semibold mb-2">Linear Algebra</h3>
          <p className="text-sm text-muted-foreground">
            Matrix operations, vector calculations, and linear transformations
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <BarChart3 className="h-8 w-8 mx-auto mb-3 text-orange-500" />
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Data analysis, probability distributions, and statistical tests
          </p>
        </Card>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Choose Our Math Tools?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our mathematical tools are designed for accuracy, ease of use, and comprehensive functionality.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Calculator className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Accurate Calculations</h3>
            <p className="text-sm text-muted-foreground">
              High-precision arithmetic with support for complex mathematical operations
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Step-by-Step Solutions</h3>
            <p className="text-sm text-muted-foreground">
              Detailed explanations and step-by-step solutions for learning
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Visual Results</h3>
            <p className="text-sm text-muted-foreground">
              Graphs, charts, and visual representations of mathematical concepts
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-8">Perfect for Students, Engineers & Professionals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-blue-600">Students</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Homework assistance</li>
              <li>• Exam preparation</li>
              <li>• Concept verification</li>
              <li>• Learning support</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 text-green-600">Engineers</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Technical calculations</li>
              <li>• Design verification</li>
              <li>• Unit conversions</li>
              <li>• Statistical analysis</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 text-purple-600">Professionals</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Data analysis</li>
              <li>• Financial modeling</li>
              <li>• Research calculations</li>
              <li>• Quality control</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Math Tools - Online Mathematical Calculators",
            "description": "Free online mathematical tools including scientific calculator, equation solver, matrix calculator, and statistics calculator.",
            "url": "https://micro-tools.vercel.app/math-tools",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Math Tools Suite",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          })
        }}
      />
    </div>
  )
}

{shouldDisplayAds() && (
  <section className="py-8 bg-background">
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