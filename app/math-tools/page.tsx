import type { Metadata } from "next"
import { Calculator, TrendingUp, Grid3X3, BarChart3, PieChart, Sigma } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Math Tools - Free Online Mathematical Calculators and Utilities | Micro Tools",
  description:
    "Comprehensive collection of mathematical tools including scientific calculator, equation solver, matrix calculator, statistics calculator, and more. All tools are free and work in your browser.",
}

const tools = [
  {
    title: "Scientific Calculator",
    description: "Advanced calculator with trigonometric, logarithmic, and exponential functions",
    icon: Calculator,
    href: "/math-tools/scientific-calculator",
  },
  {
    title: "Equation Solver",
    description: "Solve linear, quadratic, cubic, and systems of equations step by step",
    icon: TrendingUp,
    href: "/math-tools/equation-solver",
  },
  {
    title: "Matrix Calculator",
    description: "Perform matrix operations including multiplication, determinant, and inverse",
    icon: Grid3X3,
    href: "/math-tools/matrix-calculator",
  },
  {
    title: "Statistics Calculator",
    description: "Calculate mean, median, mode, standard deviation, and statistical distributions",
    icon: BarChart3,
    href: "/math-tools/statistics-calculator",
  },
  {
    title: "Graphing Calculator",
    description: "Plot functions, analyze graphs, and visualize mathematical relationships",
    icon: PieChart,
    href: "/math-tools/graphing-calculator",
    comingSoon: true,
  },
  {
    title: "Unit Converter",
    description: "Convert between different units of measurement for length, weight, and temperature",
    icon: Sigma,
    href: "/math-tools/unit-converter",
  },
]

export default function MathToolsPage() {
  return (
    <CategoryLayout
      title="Math Tools"
      description="Scientific calculations, equation solving, matrix operations, and statistical analysis — all in the browser."
      icon={Calculator}
      toolCount={tools.filter((t) => !t.comingSoon).length}
      tools={tools}
    />
  )
}
