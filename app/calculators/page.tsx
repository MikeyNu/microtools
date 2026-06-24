import type { Metadata } from "next"
import { Calculator, DollarSign, Heart, Percent, Receipt, Home } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Free Online Calculators - Math, Finance, Health & More | Micro Tools",
  description:
    "Professional calculators for math, finance, health, and everyday calculations. Free online tools including loan calculator, BMI calculator, and more.",
}

const tools = [
  {
    title: "Basic Calculator",
    description: "Standard calculator for everyday math operations and calculations",
    icon: Calculator,
    href: "/calculators/basic",
  },
  {
    title: "Loan Calculator",
    description: "Calculate loan payments, interest rates, and amortization schedules",
    icon: DollarSign,
    href: "/calculators/loan",
  },
  {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and health recommendations",
    icon: Heart,
    href: "/calculators/bmi",
  },
  {
    title: "Percentage Calculator",
    description: "Calculate percentages, percentage changes, and ratios",
    icon: Percent,
    href: "/calculators/percentage",
  },
  {
    title: "Tip Calculator",
    description: "Calculate tips and split bills among multiple people",
    icon: Receipt,
    href: "/calculators/tip",
  },
  {
    title: "Mortgage Calculator",
    description: "Calculate monthly mortgage payments and total interest costs",
    icon: Home,
    href: "/calculators/mortgage",
  },
  {
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, days and more",
    icon: Calculator,
    href: "/calculators/age",
  },
  {
    title: "Date Calculator",
    description: "Calculate differences between dates or add/subtract time",
    icon: Calculator,
    href: "/calculators/date",
  },
]

export default function CalculatorsPage() {
  return (
    <CategoryLayout
      title="Calculators"
      description="Math, finance, health, and everyday calculations. All run locally in your browser."
      icon={Calculator}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
