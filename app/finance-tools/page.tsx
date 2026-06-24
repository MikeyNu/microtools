import type { Metadata } from "next"
import { TrendingUp, BarChart3, DollarSign, Calculator, PiggyBank, Coins } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Finance Tools - Free Financial Calculators & Investment Tools | Micro Tools",
  description:
    "Comprehensive collection of financial tools including compound interest calculator, investment return calculator, currency converter, and more financial planning utilities.",
}

const tools = [
  {
    title: "Compound Interest Calculator",
    description: "Calculate compound interest and see how your investments grow over time",
    icon: TrendingUp,
    href: "/finance-tools/compound-interest",
  },
  {
    title: "Investment Return Calculator",
    description: "Calculate returns on your investments with different contribution scenarios",
    icon: BarChart3,
    href: "/finance-tools/investment-return",
  },
  {
    title: "Currency Converter",
    description: "Convert between different currencies with real-time exchange rates",
    icon: DollarSign,
    href: "/finance-tools/currency-converter",
  },
  {
    title: "Loan Calculator",
    description: "Calculate loan payments, interest, and full amortization schedules",
    icon: Calculator,
    href: "/finance-tools/loan-calculator",
  },
  {
    title: "Savings Calculator",
    description: "Plan your savings goals and track projected progress over time",
    icon: PiggyBank,
    href: "/finance-tools/savings-calculator",
  },
  {
    title: "Retirement Calculator",
    description: "Plan for retirement and calculate required savings with inflation adjustment",
    icon: Coins,
    href: "/finance-tools/retirement-calculator",
  },
]

export default function FinanceToolsPage() {
  return (
    <CategoryLayout
      title="Finance Tools"
      description="Compound interest, investment returns, loan amortization, and retirement planning calculators."
      icon={TrendingUp}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
