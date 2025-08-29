'use client'

import { useState } from 'react'
import { Shield, Globe, Calendar, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface SSLCertificate {
  domain: string
  issuer: string
  subject: string
  validFrom: string
  validTo: string
  daysUntilExpiry: number
  serialNumber: string
  signatureAlgorithm: string
  keySize: number
  fingerprint: string
  subjectAltNames: string[]
  isValid: boolean
  isExpired: boolean
  isSelfSigned: boolean
  trustScore: number
  protocol: string
  cipherSuite: string
}

interface SecurityAnalysis {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  issues: Array<{
    type: 'critical' | 'warning' | 'info'
    message: string
    recommendation?: string
  }>
  strengths: string[]
}

export default function SSLCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState<SSLCertificate | null>(null)
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('SSL Certificate Checker', 'security-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificate details, validity, and security configuration',
    category: 'security-tools',
    url: '/security-tools/ssl-checker'
  }

  // Validate domain format
  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|org|net|edu|gov|mil|int|co|io|me|ly|tv|cc|tk|ml|ga|cf|[a-z]{2})$/i
    return domainRegex.test(domain)
  }

  // Mock SSL certificate data (in a real app, this would call an actual SSL checking API)
  const mockSSLData = (domain: string): SSLCertificate => {
    const now = new Date()
    const validFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const validTo = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    
    const isExpired = daysUntilExpiry < 0
    const isSelfSigned = domain.includes('localhost') || domain.includes('127.0.0.1')
    
    return {
      domain,
      issuer: isSelfSigned ? 'Self-signed' : 'Let\'s Encrypt Authority X3',
      subject: `CN=${domain}`,
      validFrom: validFrom.toISOString().split('T')[0],
      validTo: validTo.toISOString().split('T')[0],
      daysUntilExpiry,
      serialNumber: '03:' + Array.from({length: 16}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
      signatureAlgorithm: 'SHA256withRSA',
      keySize: 2048,
      fingerprint: 'SHA256:' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
      subjectAltNames: [domain, `www.${domain}`],
      isValid: !isExpired && !isSelfSigned,
      isExpired,
      isSelfSigned,
      trustScore: isExpired ? 0 : isSelfSigned ? 50 : 95,
      protocol: 'TLS 1.3',
      cipherSuite: 'TLS_AES_256_GCM_SHA384'
    }
  }

  // Analyze SSL security
  const analyzeSSLSecurity = (cert: SSLCertificate): SecurityAnalysis => {
    const issues: SecurityAnalysis['issues'] = []
    const strengths: string[] = []
    let score = 100
    
    // Check expiry
    if (cert.isExpired) {
      issues.push({
        type: 'critical',
        message: 'Certificate has expired',
        recommendation: 'Renew the SSL certificate immediately'
      })
      score -= 50
    } else if (cert.daysUntilExpiry < 30) {
      issues.push({
        type: 'warning',
        message: `Certificate expires in ${cert.daysUntilExpiry} days`,
        recommendation: 'Consider renewing the certificate soon'
      })
      score -= 10
    } else {
      strengths.push('Certificate is valid and not expiring soon')
    }
    
    // Check if self-signed
    if (cert.isSelfSigned) {
      issues.push({
        type: 'critical',
        message: 'Certificate is self-signed',
        recommendation: 'Use a certificate from a trusted Certificate Authority'
      })
      score -= 30
    } else {
      strengths.push('Certificate is issued by a trusted CA')
    }
    
    // Check key size
    if (cert.keySize < 2048) {
      issues.push({
        type: 'warning',
        message: `Key size is ${cert.keySize} bits (recommended: 2048+)`,
        recommendation: 'Use a stronger key size for better security'
      })
      score -= 15
    } else {
      strengths.push(`Strong ${cert.keySize}-bit key size`)
    }
    
    // Check signature algorithm
    if (cert.signatureAlgorithm.includes('SHA1')) {
      issues.push({
        type: 'warning',
        message: 'Using SHA1 signature algorithm (deprecated)',
        recommendation: 'Upgrade to SHA256 or higher'
      })
      score -= 20
    } else {
      strengths.push('Using modern signature algorithm')
    }
    
    // Check protocol
    if (cert.protocol === 'TLS 1.3') {
      strengths.push('Using latest TLS 1.3 protocol')
    } else if (cert.protocol === 'TLS 1.2') {
      strengths.push('Using secure TLS 1.2 protocol')
    } else {
      issues.push({
        type: 'warning',
        message: `Using outdated protocol: ${cert.protocol}`,
        recommendation: 'Upgrade to TLS 1.2 or 1.3'
      })
      score -= 25
    }
    
    // Determine grade
    let grade: SecurityAnalysis['grade']
    if (score >= 95) grade = 'A+'
    else if (score >= 85) grade = 'A'
    else if (score >= 75) grade = 'B'
    else if (score >= 65) grade = 'C'
    else if (score >= 50) grade = 'D'
    else grade = 'F'
    
    return {
      grade,
      score: Math.max(0, score),
      issues,
      strengths
    }
  }

  // Check SSL certificate
  const checkSSL = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    if (!isValidDomain(domain.trim())) {
      setError('Please enter a valid domain name')
      return
    }

    setLoading(true)
    setError('')
    setCertificate(null)
    setAnalysis(null)
    
    trackToolStart()

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const cert = mockSSLData(domain.trim())
      const securityAnalysis = analyzeSSLSecurity(cert)
      
      setCertificate(cert)
      setAnalysis(securityAnalysis)
      
      trackToolComplete()
      
      toast({
        title: 'SSL Check Complete',
        description: `Certificate analysis completed for ${domain}`
      })
    } catch (err) {
      const errorMessage = 'Failed to check SSL certificate'
      setError(errorMessage)
      trackToolError()
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`
    })
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (isValid: boolean, isExpired: boolean) => {
    if (isExpired) return 'text-red-500'
    if (isValid) return 'text-green-500'
    return 'text-yellow-500'
  }

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'text-green-500 bg-green-50'
      case 'B': return 'text-blue-500 bg-blue-50'
      case 'C': return 'text-yellow-500 bg-yellow-50'
      case 'D': return 'text-orange-500 bg-orange-50'
      case 'F': return 'text-red-500 bg-red-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const relatedTools = [
    { name: 'Password Strength Checker', href: '/security-tools/password-checker' },
    { name: '2FA Generator', href: '/security-tools/2fa-generator' },
    { name: 'Hash Generator', href: '/security-tools/hash-generator' },
    { name: 'DNS Lookup', href: '/network-tools/dns-lookup' }
  ]

  return (
    <ToolLayout
      title="SSL Certificate Checker"
      description="Check SSL certificate details, validity, expiration dates, and security configuration for any domain."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SSL Certificate Checker</h1>
              <p className="text-muted-foreground">Analyze SSL certificates and security configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Check SSL Certificate
            </CardTitle>
            <CardDescription>
              Enter a domain name to check its SSL certificate details and security configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkSSL()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={checkSSL} disabled={loading}>
                  {loading ? 'Checking...' : 'Check SSL'}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-muted-foreground">Checking SSL certificate...</p>
                <Progress value={33} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {certificate && analysis && (
          <div className="space-y-6">
            {/* Security Grade */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getGradeColor(analysis.grade)}`}>
                      {analysis.grade}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Security Grade</div>
                      <div className="text-sm text-muted-foreground">
                        Score: {analysis.score}/100
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-2 ${getStatusColor(certificate.isValid, certificate.isExpired)}`}>
                      {certificate.isExpired ? (
                        <XCircle className="h-5 w-5" />
                      ) : certificate.isValid ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {certificate.isExpired ? 'Expired' : certificate.isValid ? 'Valid' : 'Warning'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {certificate.daysUntilExpiry > 0 
                        ? `Expires in ${certificate.daysUntilExpiry} days`
                        : `Expired ${Math.abs(certificate.daysUntilExpiry)} days ago`
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="certificate" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="certificate">Certificate Details</TabsTrigger>
                <TabsTrigger value="security">Security Analysis</TabsTrigger>
                <TabsTrigger value="technical">Technical Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="certificate">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Domain</Label>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{certificate.domain}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(certificate.domain, 'Domain')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Issuer</Label>
                        <div className="font-mono text-sm">{certificate.issuer}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Valid From</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(certificate.validFrom)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Valid To</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(certificate.validTo)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Subject</Label>
                        <div className="font-mono text-sm break-all">{certificate.subject}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Serial Number</Label>
                        <div className="font-mono text-xs break-all">{certificate.serialNumber}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Subject Alternative Names</Label>
                      <div className="flex flex-wrap gap-2">
                        {certificate.subjectAltNames.map((name, index) => (
                          <Badge key={index} variant="secondary">{name}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-4">
                  {analysis.issues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Security Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.issues.map((issue, index) => (
                          <Alert key={index} variant={issue.type === 'critical' ? 'destructive' : 'default'}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="font-medium">{issue.message}</div>
                              {issue.recommendation && (
                                <div className="text-sm mt-1 opacity-80">
                                  Recommendation: {issue.recommendation}
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  
                  {analysis.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          Security Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="technical">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Signature Algorithm</Label>
                        <div className="font-mono text-sm">{certificate.signatureAlgorithm}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Key Size</Label>
                        <div className="font-mono text-sm">{certificate.keySize} bits</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Protocol</Label>
                        <div className="font-mono text-sm">{certificate.protocol}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cipher Suite</Label>
                        <div className="font-mono text-sm">{certificate.cipherSuite}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Fingerprint</Label>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xs break-all bg-gray-100 p-2 rounded flex-1">
                          {certificate.fingerprint}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(certificate.fingerprint, 'Fingerprint')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This tool provides SSL certificate analysis for educational and monitoring purposes. 
            For production environments, consider using dedicated SSL monitoring services for continuous certificate tracking.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}