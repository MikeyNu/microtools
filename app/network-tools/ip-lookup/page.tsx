'use client'

import { useState, useEffect } from 'react'
import { Globe, MapPin, Building, Wifi, Copy, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface IPInfo {
  ip: string
  type: string
  continent: string
  country: string
  countryCode: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  organization: string
  asn: string
  asnOrg: string
  isProxy: boolean
  isVpn: boolean
  isTor: boolean
  threatLevel: string
}

export default function IPLookupPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [userIP, setUserIP] = useState('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingUserIP, setLoadingUserIP] = useState(true)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('IP Address Lookup', 'network-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'ip-lookup',
    name: 'IP Address Lookup',
    description: 'Get detailed information about any IP address including location, ISP, and security details',
    category: 'network-tools',
    url: '/network-tools/ip-lookup'
  }

  useEffect(() => {
    detectUserIP()
  }, [])

  const detectUserIP = async () => {
    try {
      // Simulate getting user's IP (in real app, use a service like ipify.org)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUserIP = '203.0.113.42' // Example IP
      setUserIP(mockUserIP)
      setIpAddress(mockUserIP)
    } catch (error) {
      console.error('Failed to detect user IP:', error)
    } finally {
      setLoadingUserIP(false)
    }
  }

  const validateIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  const lookupIP = async () => {
    if (!ipAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an IP address',
        variant: 'destructive'
      })
      return
    }

    if (!validateIP(ipAddress.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter a valid IP address',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    trackToolStart()

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock IP information (in real app, use services like ipapi.co, ipgeolocation.io)
      const mockIPInfo: IPInfo = {
        ip: ipAddress.trim(),
        type: ipAddress.includes(':') ? 'IPv6' : 'IPv4',
        continent: 'North America',
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'Cloudflare, Inc.',
        organization: 'Cloudflare',
        asn: 'AS13335',
        asnOrg: 'Cloudflare, Inc.',
        isProxy: false,
        isVpn: false,
        isTor: false,
        threatLevel: 'Low'
      }
      
      // Randomize some data for demonstration
      const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Houston']
      const isps = ['Cloudflare, Inc.', 'Google LLC', 'Amazon.com, Inc.', 'Microsoft Corporation']
      
      mockIPInfo.city = cities[Math.floor(Math.random() * cities.length)]
      mockIPInfo.isp = isps[Math.floor(Math.random() * isps.length)]
      mockIPInfo.organization = mockIPInfo.isp
      mockIPInfo.latitude = 37.7749 + (Math.random() - 0.5) * 10
      mockIPInfo.longitude = -122.4194 + (Math.random() - 0.5) * 10
      
      setIpInfo(mockIPInfo)
      trackToolComplete()
      
      toast({
        title: 'Success',
        description: 'IP information retrieved successfully'
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to lookup IP information',
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

  const openInMaps = () => {
    if (ipInfo) {
      const url = `https://www.google.com/maps?q=${ipInfo.latitude},${ipInfo.longitude}`
      window.open(url, '_blank')
    }
  }

  const relatedTools = [
    { name: 'DNS Lookup', href: '/network-tools/dns-lookup' },
    { name: 'Port Scanner', href: '/network-tools/port-scanner' },
    { name: 'Ping Test', href: '/network-tools/ping-test' },
    { name: 'Whois Lookup', href: '/network-tools/whois-lookup' }
  ]

  return (
    <ToolLayout
      title="IP Address Lookup"
      description="Get detailed information about any IP address including geolocation, ISP details, and security information. Supports both IPv4 and IPv6 addresses."
      category="Network Tools"
      categoryHref="/network-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">IP Address Lookup</h1>
              <p className="text-muted-foreground">Get detailed information about any IP address</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>IP Address Lookup</CardTitle>
            <CardDescription>
              Enter an IP address to get detailed information including location, ISP, and security details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <div className="flex gap-2">
                <Input
                  id="ip-address"
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setIpAddress(userIP)}
                  disabled={loadingUserIP || !userIP}
                >
                  {loadingUserIP ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'My IP'
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={lookupIP} 
              disabled={loading || !ipAddress.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup IP Address
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {ipInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">IP Address</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{ipInfo.ip}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(ipInfo.ip, 'IP address')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ipInfo.country}</span>
                      <Badge variant="outline">{ipInfo.countryCode}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Region</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.region}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.city}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timezone</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.timezone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Latitude</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.latitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Longitude</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.longitude.toFixed(4)}</p>
                  </div>
                </div>
                
                <Button variant="outline" onClick={openInMaps} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ISP</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{ipInfo.isp}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(ipInfo.isp, 'ISP')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">{ipInfo.organization}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">ASN</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.asn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ASN Org</Label>
                    <p className="text-sm text-muted-foreground">{ipInfo.asnOrg}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Security Information</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={ipInfo.isProxy ? 'destructive' : 'default'}>
                      {ipInfo.isProxy ? 'Proxy Detected' : 'No Proxy'}
                    </Badge>
                    <Badge variant={ipInfo.isVpn ? 'destructive' : 'default'}>
                      {ipInfo.isVpn ? 'VPN Detected' : 'No VPN'}
                    </Badge>
                    <Badge variant={ipInfo.isTor ? 'destructive' : 'default'}>
                      {ipInfo.isTor ? 'Tor Exit Node' : 'No Tor'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Threat Level</Label>
                  <Badge 
                    variant={ipInfo.threatLevel === 'Low' ? 'default' : 
                            ipInfo.threatLevel === 'Medium' ? 'secondary' : 'destructive'}
                  >
                    {ipInfo.threatLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This tool provides geolocation and network information based on IP address databases. 
            The accuracy may vary, and the actual location might differ from the displayed results.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}