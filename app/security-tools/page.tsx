import { Metadata } from 'next'
import { Shield, Key, Lock, Eye, AlertTriangle, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ToolLayout } from '@/components/tool-layout'

export const metadata: Metadata = {
  title: 'Security Tools - Free Online Security & Privacy Tools',
  description: 'Comprehensive collection of free online security tools including password strength checker, two-factor authentication generator, SSL certificate checker, and more security utilities.',
  keywords: 'security tools, password checker, 2FA generator, SSL checker, encryption, cybersecurity, privacy tools',
  openGraph: {
    title: 'Security Tools - Free Online Security & Privacy Tools',
    description: 'Comprehensive collection of free online security tools for password management, authentication, and SSL verification.',
    type: 'website',
  },
}

const securityTools = [
  {
    title: 'Password Strength Checker',
    description: 'Analyze password strength and get security recommendations',
    href: '/security-tools/password-checker',
    icon: Lock,
    badge: 'Popular',
    features: ['Strength analysis', 'Security tips', 'Breach detection', 'Password generator']
  },
  {
    title: 'Two-Factor Auth Generator',
    description: 'Generate TOTP codes and QR codes for 2FA setup',
    href: '/security-tools/2fa-generator',
    icon: Key,
    badge: 'Essential',
    features: ['TOTP generation', 'QR code creation', 'Backup codes', 'Multiple accounts']
  },
  {
    title: 'SSL Certificate Checker',
    description: 'Verify SSL certificates and check security status',
    href: '/security-tools/ssl-checker',
    icon: Shield,
    badge: 'Professional',
    features: ['Certificate validation', 'Expiry alerts', 'Chain analysis', 'Security rating']
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256 and other hash values',
    href: '/security-tools/hash-generator',
    icon: Fingerprint,
    badge: 'Developer',
    features: ['Multiple algorithms', 'File hashing', 'Verification', 'Batch processing']
  },
  {
    title: 'Password Generator',
    description: 'Create secure passwords with customizable options',
    href: '/security-tools/password-generator',
    icon: Eye,
    badge: 'Utility',
    features: ['Custom length', 'Character sets', 'Pronounceable', 'Bulk generation']
  },
  {
    title: 'Security Audit',
    description: 'Comprehensive security assessment and recommendations',
    href: '/security-tools/security-audit',
    icon: AlertTriangle,
    badge: 'Advanced',
    features: ['Vulnerability scan', 'Best practices', 'Compliance check', 'Risk assessment']
  }
]

const relatedCategories = [
  { name: 'Network Tools', href: '/network-tools' },
  { name: 'Developer Tools', href: '/developer-tools' },
  { name: 'Data Tools', href: '/data-tools' },
  { name: 'Crypto Tools', href: '/crypto-tools' }
]

export default function SecurityToolsPage() {
  return (
    <ToolLayout
      title="Security Tools"
      description="Comprehensive collection of free online security tools for password management, authentication, SSL verification, and cybersecurity analysis."
      category="Security Tools"
      categoryHref="/security-tools"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-red-500 text-white rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Security Tools</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Protect your digital assets with our comprehensive suite of security tools. 
            From password analysis to SSL verification, ensure your online safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityTools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-red-600 transition-colors">
                            {tool.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tool.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Key Features:</h4>
                      <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
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

        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-8 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Why Security Matters</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            In today's digital landscape, security is paramount. Our tools help you maintain strong passwords, 
            verify certificates, and implement best practices to protect your data and privacy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">256-bit</div>
              <div className="text-sm text-muted-foreground">Encryption Standard</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-muted-foreground">Data Stored</div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Security Tools',
            description: 'Comprehensive collection of free online security tools for password management, authentication, and SSL verification.',
            url: 'https://micro-tools.vercel.app/security-tools',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: securityTools.map((tool, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'WebApplication',
                  name: tool.title,
                  description: tool.description,
                  url: `https://micro-tools.vercel.app${tool.href}`,
                  applicationCategory: 'SecurityApplication'
                }
              }))
            }
          })
        }}
      />
    </ToolLayout>
  )
}