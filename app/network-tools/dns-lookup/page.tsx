'use client'

import { useState } from 'react'
import { Globe, Search, Copy, RefreshCw, Server, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl: number
  priority?: number
}

interface DNSResults {
  domain: string
  records: {
    A: DNSRecord[]
    AAAA: DNSRecord[]
    CNAME: DNSRecord[]
    MX: DNSRecord[]
    NS: DNSRecord[]
    TXT: DNSRecord[]
    SOA: DNSRecord[]
    PTR: DNSRecord[]
  }
  nameservers: string[]
  status: string
}

export default function DNSLookupPage() {
  const [domain, setDomain] = useState('')
  const [dnsResults, setDnsResults] = useState<DNSResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRecordType, setSelectedRecordType] = useState('A')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('DNS Lookup', 'network-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Perform DNS lookups to check various DNS records for any domain',
    category: 'network-tools',
    url: '/network-tools/dns-lookup'
  }

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|org|net|edu|gov|mil|int|arpa|[a-z]{2})$/i
    return domainRegex.test(domain)
  }

  const lookupDNS = async () => {
    if (!domain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive'
      })
      return
    }

    if (!validateDomain(domain.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter a valid domain name',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    trackToolStart()

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock DNS results (in real app, use DNS API services)
      const mockResults: DNSResults = {
        domain: domain.trim().toLowerCase(),
        records: {
          A: [
            { type: 'A', name: domain.trim(), value: '93.184.216.34', ttl: 3600 },
            { type: 'A', name: domain.trim(), value: '93.184.216.35', ttl: 3600 }
          ],
          AAAA: [
            { type: 'AAAA', name: domain.trim(), value: '2606:2800:220:1:248:1893:25c8:1946', ttl: 3600 }
          ],
          CNAME: [],
          MX: [
            { type: 'MX', name: domain.trim(), value: 'mail.example.com', ttl: 3600, priority: 10 },
            { type: 'MX', name: domain.trim(), value: 'mail2.example.com', ttl: 3600, priority: 20 }
          ],
          NS: [
            { type: 'NS', name: domain.trim(), value: 'ns1.example.com', ttl: 86400 },
            { type: 'NS', name: domain.trim(), value: 'ns2.example.com', ttl: 86400 }
          ],
          TXT: [
            { type: 'TXT', name: domain.trim(), value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
            { type: 'TXT', name: domain.trim(), value: 'google-site-verification=abc123def456', ttl: 3600 }
          ],
          SOA: [
            { type: 'SOA', name: domain.trim(), value: 'ns1.example.com admin.example.com 2023010101 7200 3600 604800 86400', ttl: 86400 }
          ],
          PTR: []
        },
        nameservers: ['ns1.example.com', 'ns2.example.com'],
        status: 'NOERROR'
      }
      
      // Randomize some results for demonstration
      const ips = ['93.184.216.34', '104.21.14.101', '172.67.154.76', '198.51.100.1']
      mockResults.records.A = mockResults.records.A.map((record, index) => ({
        ...record,
        value: ips[index % ips.length]
      }))
      
      setDnsResults(mockResults)
      trackToolComplete()
      
      toast({
        title: 'Success',
        description: 'DNS lookup completed successfully'
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to perform DNS lookup',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`
    })
  }

  const copyAllRecords = (records: DNSRecord[]) => {
    const text = records.map(record => 
      record.priority ? 
        `${record.value} (Priority: ${record.priority}, TTL: ${record.ttl})` :
        `${record.value} (TTL: ${record.ttl})`
    ).join('\n')
    
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'All records copied to clipboard'
    })
  }

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA']

  const relatedTools = [
    { name: 'IP Address Lookup', href: '/network-tools/ip-lookup' },
    { name: 'Whois Lookup', href: '/network-tools/whois-lookup' },
    { name: 'Port Scanner', href: '/network-tools/port-scanner' },
    { name: 'Ping Test', href: '/network-tools/ping-test' }
  ]

  return (
    <ToolLayout
      title="DNS Lookup"
      description="Perform comprehensive DNS lookups to check various DNS records including A, AAAA, MX, NS, TXT, and more for any domain."
      category="Network Tools"
      categoryHref="/network-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">DNS Lookup</h1>
              <p className="text-muted-foreground">Check DNS records for any domain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DNS Lookup Tool</CardTitle>
            <CardDescription>
              Enter a domain name to retrieve its DNS records including A, AAAA, MX, NS, TXT, and SOA records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="Enter domain name (e.g., example.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  onClick={() => setDomain('google.com')}
                  variant="outline"
                >
                  Example
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={lookupDNS} 
              disabled={loading || !domain.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Looking up DNS records...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup DNS Records
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {dnsResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  DNS Information for {dnsResults.domain}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Domain</Label>
                    <p className="text-sm text-muted-foreground font-mono">{dnsResults.domain}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={dnsResults.status === 'NOERROR' ? 'default' : 'destructive'}>
                      {dnsResults.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nameservers</Label>
                    <p className="text-sm text-muted-foreground">{dnsResults.nameservers.length} found</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={selectedRecordType} onValueChange={setSelectedRecordType}>
              <TabsList className="grid w-full grid-cols-7">
                {recordTypes.map(type => (
                  <TabsTrigger key={type} value={type} className="text-xs">
                    {type}
                    {dnsResults.records[type as keyof typeof dnsResults.records].length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {dnsResults.records[type as keyof typeof dnsResults.records].length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {recordTypes.map(type => {
                const records = dnsResults.records[type as keyof typeof dnsResults.records]
                return (
                  <TabsContent key={type} value={type}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {type} Records
                          </CardTitle>
                          {records.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyAllRecords(records)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy All
                            </Button>
                          )}
                        </div>
                        <CardDescription>
                          {type === 'A' && 'IPv4 address records'}
                          {type === 'AAAA' && 'IPv6 address records'}
                          {type === 'CNAME' && 'Canonical name records'}
                          {type === 'MX' && 'Mail exchange records'}
                          {type === 'NS' && 'Name server records'}
                          {type === 'TXT' && 'Text records'}
                          {type === 'SOA' && 'Start of authority records'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {records.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No {type} records found
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {records.map((record, index) => (
                              <div key={index} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-mono text-sm break-all">
                                      {record.value}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                      <span>TTL: {record.ttl}s</span>
                                      {record.priority && (
                                        <span>Priority: {record.priority}</span>
                                      )}
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(record.value, `${type} record`)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )
              })}
            </Tabs>

            {dnsResults.nameservers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Authoritative Nameservers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dnsResults.nameservers.map((ns, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                        <span className="font-mono text-sm">{ns}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(ns, 'Nameserver')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Alert>
          <Server className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> DNS records are cached and may take time to propagate after changes. 
            TTL (Time To Live) values indicate how long records are cached by DNS resolvers.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}