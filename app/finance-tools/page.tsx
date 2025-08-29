import { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, TrendingUp, DollarSign, PiggyBank, BarChart3, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Finance Tools - Free Financial Calculators & Investment Tools',
  description: 'Comprehensive collection of financial tools including compound interest calculator, investment return calculator, currency converter, and more financial planning utilities.',
  keywords: 'finance tools, financial calculator, compound interest, investment calculator, currency converter, financial planning, money tools',
  openGraph: {
    title: 'Finance Tools - Free Financial Calculators',
    description: 'Calculate compound interest, investment returns, currency conversions and more with our comprehensive financial tools.',
    type: 'website',
  },
}

const financeTools = [
  {
    title: 'Compound Interest Calculator',
    description: 'Calculate compound interest and see how your investments grow over time',
    href: '/finance-tools/compound-interest',
    icon: TrendingUp,
    category: 'Investment',
    features: ['Principal amount', 'Interest rate', 'Compounding frequency', 'Time period', 'Growth visualization']
  },
  {
    title: 'Investment Return Calculator',
    description: 'Calculate returns on your investments with different scenarios',
    href: '/finance-tools/investment-return',
    icon: BarChart3,
    category: 'Investment',
    features: ['Initial investment', 'Monthly contributions', 'Expected return', 'Investment timeline', 'Tax considerations']
  },
  {
    title: 'Currency Converter',
    description: 'Convert between different currencies with real-time exchange rates',
    href: '/finance-tools/currency-converter',
    icon: DollarSign,
    category: 'Currency',
    features: ['Real-time rates', '150+ currencies', 'Historical data', 'Rate alerts', 'Conversion history']
  },
  {
    title: 'Loan Calculator',
    description: 'Calculate loan payments, interest, and amortization schedules',
    href: '/finance-tools/loan-calculator',
    icon: Calculator,
    category: 'Loans',
    features: ['Monthly payments', 'Total interest', 'Amortization table', 'Extra payments', 'Loan comparison']
  },
  {
    title: 'Savings Calculator',
    description: 'Plan your savings goals and track progress over time',
    href: '/finance-tools/savings-calculator',
    icon: PiggyBank,
    category: 'Savings',
    features: ['Savings goals', 'Monthly deposits', 'Interest earnings', 'Goal timeline', 'Progress tracking']
  },
  {
    title: 'Retirement Calculator',
    description: 'Plan for retirement and calculate required savings',
    href: '/finance-tools/retirement-calculator',
    icon: Coins,
    category: 'Planning',
    features: ['Retirement age', 'Income replacement', 'Inflation adjustment', 'Social security', 'Portfolio allocation']
  }
]

const categories = ['All', 'Investment', 'Currency', 'Loans', 'Savings', 'Planning']

export default function FinanceToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-500 text-white rounded-xl">
              <DollarSign className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Finance Tools</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive financial calculators and tools to help you make informed decisions about 
            investments, loans, savings, and financial planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeTools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <Link key={index} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                            {tool.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
                      <ul className="text-xs space-y-1">
                        {tool.features.slice(0, 3).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                        {tool.features.length > 3 && (
                          <li className="text-muted-foreground">+{tool.features.length - 3} more features</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Why Use Our Finance Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="p-3 bg-green-100 text-green-600 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Accurate Calculations</h3>
              <p className="text-sm text-muted-foreground">
                Precise financial calculations using industry-standard formulas and methodologies.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 text-green-600 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Visual Insights</h3>
              <p className="text-sm text-muted-foreground">
                Interactive charts and graphs to help you visualize your financial projections.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 text-green-600 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <PiggyBank className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Financial Planning</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive tools to help you plan and achieve your financial goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}