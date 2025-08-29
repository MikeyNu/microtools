import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Shield, Search, Zap, Wifi, Server } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  title: 'Network Tools - IP Lookup, DNS, Port Scanner | MicroTools',
  description: 'Free network tools including IP address lookup, DNS lookup, port scanner, and ping test. Professional networking utilities.',
  keywords: 'network tools, ip lookup, dns lookup, port scanner, ping test, network utilities',
  openGraph: {
    title: 'Network Tools - IP Lookup, DNS, Port Scanner',
    description: 'Free network tools for IP lookup, DNS resolution, and network diagnostics',
    type: 'website',
  },
}

const networkTools = [
  {
    title: 'IP Address Lookup',
    description: 'Get detailed information about any IP address including location and ISP',
    href: '/network-tools/ip-lookup',
    icon: Globe,
    badge: 'New',
    color: 'bg-blue-500'
  },
  {
    title: 'DNS Lookup',
    description: 'Perform DNS queries and resolve domain names to IP addresses',
    href: '/network-tools/dns-lookup',
    icon: Search,
    badge: 'New',
    color: 'bg-green-500'
  },
  {
    title: 'Port Scanner',
    description: 'Scan for open ports on any host or IP address',
    href: '/network-tools/port-scanner',
    icon: Shield,
    badge: 'New',
    color: 'bg-red-500'
  }
]

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Network Tools', href: '/network-tools' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Network Tools',
  description: 'Free network tools including IP address lookup, DNS lookup, port scanner, and ping test',
  url: 'https://microtools.dev/network-tools',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: networkTools.map((tool, index) => ({
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

export default function NetworkToolsPage() {
  return (
    <>
      <StructuredData />
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Network Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Professional network diagnostic tools for IP lookup, DNS resolution, port scanning, 
            and network connectivity testing. Essential utilities for network administrators and developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networkTools.map((tool) => {
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
    </>
  )
}