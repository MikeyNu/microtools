import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bitcoin, Shield, Calculator, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'
import { StructuredData } from '@/components/structured-data'
import { AdSensePlaceholder } from '@/components/adsense-placeholder'
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from '@/lib/adsense-config'

export const metadata: Metadata = {
  title: 'Crypto Tools - Bitcoin & Cryptocurrency Utilities | MicroTools',
  description: 'Free cryptocurrency tools including Bitcoin address validator, crypto price converter, and wallet generator. Secure and reliable crypto utilities.',
  keywords: 'crypto tools, bitcoin, cryptocurrency, address validator, wallet generator, crypto converter',
  openGraph: {
    title: 'Crypto Tools - Bitcoin & Cryptocurrency Utilities',
    description: 'Free cryptocurrency tools for Bitcoin and other cryptocurrencies',
    type: 'website',
  },
}

const cryptoTools = [
  {
    title: 'Bitcoin Address Validator',
    description: 'Validate Bitcoin addresses and check their format',
    href: '/crypto-tools/bitcoin-validator',
    icon: Bitcoin,
    badge: 'New',
    color: 'bg-orange-500'
  },
  {
    title: 'Crypto Price Converter',
    description: 'Convert between different cryptocurrencies and fiat currencies',
    href: '/crypto-tools/price-converter',
    icon: TrendingUp,
    badge: 'New',
    color: 'bg-green-500'
  },
  {
    title: 'Wallet Generator',
    description: 'Generate secure cryptocurrency wallet addresses',
    href: '/crypto-tools/wallet-generator',
    icon: Shield,
    badge: 'New',
    color: 'bg-blue-500'
  },
  {
    title: 'Hash Rate Calculator',
    description: 'Calculate mining profitability and hash rates',
    href: '/crypto-tools/hash-calculator',
    icon: Calculator,
    badge: 'New',
    color: 'bg-purple-500'
  }
]

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Crypto Tools', href: '/crypto-tools' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Crypto Tools',
  description: 'Free cryptocurrency tools including Bitcoin address validator, crypto price converter, and wallet generator',
  url: 'https://microtools.dev/crypto-tools',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: cryptoTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        name: tool.title,
        description: tool.description,
        url: `https://microtools.dev${tool.href}`
      }
    }))
  }
}

export default function CryptoToolsPage() {
  return (
    <>
      <StructuredData />
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Crypto Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Professional cryptocurrency tools for Bitcoin and other digital currencies. 
            Validate addresses, convert prices, and generate secure wallets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptoTools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${tool.color} text-white group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {tool.badge && (
                        <Badge variant="secondary">{tool.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer ad placement */}
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
    </>
  )
}