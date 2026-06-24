import type { Metadata } from "next"
import { Bitcoin, TrendingUp, Shield, Calculator } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Crypto Tools - Bitcoin & Cryptocurrency Utilities | Micro Tools",
  description:
    "Free cryptocurrency tools including Bitcoin address validator, crypto price converter, and wallet generator. Secure and reliable crypto utilities.",
}

const tools = [
  {
    title: "Bitcoin Address Validator",
    description: "Validate Bitcoin addresses and check their format and checksum",
    icon: Bitcoin,
    href: "/crypto-tools/bitcoin-validator",
  },
  {
    title: "Crypto Price Converter",
    description: "Convert between different cryptocurrencies and fiat currencies",
    icon: TrendingUp,
    href: "/crypto-tools/price-converter",
  },
  {
    title: "Wallet Generator",
    description: "Generate secure cryptocurrency wallet addresses",
    icon: Shield,
    href: "/crypto-tools/wallet-generator",
  },
  {
    title: "Hash Rate Calculator",
    description: "Calculate mining profitability and hash rates",
    icon: Calculator,
    href: "/crypto-tools/hash-calculator",
  },
]

export default function CryptoToolsPage() {
  return (
    <CategoryLayout
      title="Crypto Tools"
      description="Bitcoin address validation, crypto price conversion, wallet generation, and mining calculators."
      icon={Bitcoin}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
