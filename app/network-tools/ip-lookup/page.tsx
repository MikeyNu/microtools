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
      const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' })
      if (!response.ok) throw new Error(`IP detection returned ${response.status}`)
      const data = await response.json()
      setUserIP(data.ip)
      setIpAddress(data.ip)
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

  const fetchIPInfo = async (ip: string): Promise<IPInfo> => {
    try {
      const response = await fetch(`https://ipwhois.app/json/${encodeURIComponent(ip)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`ipwhois.app returned ${response.status}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'ipwhois.app did not return a result')

      return {
        ip: data.ip,
        type: data.type || (ip.includes(':') ? 'IPv6' : 'IPv4'),
        continent: data.continent || '',
        country: data.country || '',
        countryCode: data.country_code || '',
        region: data.region || '',
        city: data.city || '',
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
        timezone: data.timezone?.id || data.timezone || '',
        isp: data.connection?.isp || '',
        organization: data.connection?.org || data.connection?.isp || '',
        asn: data.connection?.asn ? `AS${data.connection.asn}` : '',
        asnOrg: data.connection?.org || '',
        isProxy: Boolean(data.security?.proxy),
        isVpn: Boolean(data.security?.vpn),
        isTor: Boolean(data.security?.tor),
        threatLevel: data.security?.proxy || data.security?.vpn || data.security?.tor ? 'Elevated' : 'Unknown',
      }
    } catch {
      const response = await fetch(`https://freeipapi.com/api/json/${encodeURIComponent(ip)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`FreeIPAPI returned ${response.status}`)
      const data = await response.json()

      return {
        ip: data.ipAddress || ip,
        type: data.ipVersion ? `IPv${data.ipVersion}` : (ip.includes(':') ? 'IPv6' : 'IPv4'),
        continent: data.continent || '',
        country: data.countryName || '',
        countryCode: data.countryCode || '',
        region: data.regionName || '',
        city: data.cityName || '',
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
        timezone: data.timeZone || '',
        isp: data.isp || '',
        organization: data.organization || data.isp || '',
        asn: data.asn || '',
        asnOrg: data.asnOrganization || data.organization || '',
        isProxy: false,
        isVpn: false,
        isTor: false,
        threatLevel: 'Unknown',
      }
    }
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
      const info = await fetchIPInfo(ipAddress.trim())
      setIpInfo(info)
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
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
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
                      {ipInfo.threatLevel === 'Unknown' ? 'Proxy not reported' : ipInfo.isProxy ? 'Proxy Detected' : 'No Proxy'}
                    </Badge>
                    <Badge variant={ipInfo.isVpn ? 'destructive' : 'default'}>
                      {ipInfo.threatLevel === 'Unknown' ? 'VPN not reported' : ipInfo.isVpn ? 'VPN Detected' : 'No VPN'}
                    </Badge>
                    <Badge variant={ipInfo.isTor ? 'destructive' : 'default'}>
                      {ipInfo.threatLevel === 'Unknown' ? 'Tor not reported' : ipInfo.isTor ? 'Tor Exit Node' : 'No Tor'}
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
