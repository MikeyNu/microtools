'use client'

import { useState } from 'react'
import { Search, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface PortResult {
  port: number
  status: 'open' | 'closed' | 'filtered'
  service: string
  description: string
}

interface ScanResults {
  host: string
  totalPorts: number
  scannedPorts: number
  openPorts: PortResult[]
  closedPorts: PortResult[]
  filteredPorts: PortResult[]
  scanTime: number
}

export default function PortScannerPage() {
  const [host, setHost] = useState('')
  const [portRange, setPortRange] = useState('80,443,8080,8443')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanResults, setScanResults] = useState<ScanResults | null>(null)
  const [quickScan, setQuickScan] = useState(true)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Port Scanner', 'network-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Check whether selected HTTP and HTTPS ports are reachable from your browser',
    category: 'network-tools',
    url: '/network-tools/port-scanner'
  }

  // Common port services mapping
  const commonPorts: { [key: number]: { service: string; description: string } } = {
    21: { service: 'FTP', description: 'File Transfer Protocol' },
    22: { service: 'SSH', description: 'Secure Shell' },
    23: { service: 'Telnet', description: 'Telnet Protocol' },
    25: { service: 'SMTP', description: 'Simple Mail Transfer Protocol' },
    53: { service: 'DNS', description: 'Domain Name System' },
    80: { service: 'HTTP', description: 'Hypertext Transfer Protocol' },
    110: { service: 'POP3', description: 'Post Office Protocol v3' },
    143: { service: 'IMAP', description: 'Internet Message Access Protocol' },
    443: { service: 'HTTPS', description: 'HTTP Secure' },
    993: { service: 'IMAPS', description: 'IMAP over SSL' },
    995: { service: 'POP3S', description: 'POP3 over SSL' },
    3389: { service: 'RDP', description: 'Remote Desktop Protocol' },
    5432: { service: 'PostgreSQL', description: 'PostgreSQL Database' },
    3306: { service: 'MySQL', description: 'MySQL Database' },
    1433: { service: 'MSSQL', description: 'Microsoft SQL Server' },
    6379: { service: 'Redis', description: 'Redis Database' },
    27017: { service: 'MongoDB', description: 'MongoDB Database' }
  }

  const validateHost = (host: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    // Domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|org|net|edu|gov|mil|int|arpa|[a-z]{2})$/i
    // Localhost
    const localhostRegex = /^localhost$/i
    
    return ipv4Regex.test(host) || domainRegex.test(host) || localhostRegex.test(host)
  }

  const validatePortRange = (range: string): boolean => {
    try {
      parsePortRange(range)
      return true
    } catch {
      return false
    }
  }

  const parsePortRange = (range: string): number[] => {
    const ports = new Set<number>()
    const parts = range.split(',').map((part) => part.trim()).filter(Boolean)
    if (!parts.length) throw new Error('No ports supplied')

    for (const part of parts) {
      if (!/^\d+(-\d+)?$/.test(part)) throw new Error('Invalid port syntax')
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (start < 1 || end > 65535 || end < start) throw new Error('Invalid port range')
        for (let port = start; port <= end; port++) ports.add(port)
      } else {
        const port = Number(part)
        if (port < 1 || port > 65535) throw new Error('Invalid port')
        ports.add(port)
      }
    }

    return Array.from(ports).sort((a, b) => a - b)
  }

  const probeHttpPort = async (targetHost: string, port: number): Promise<PortResult['status']> => {
    const protocols = port === 443 || port === 8443 ? ['https'] : port === 80 || port === 8080 ? ['http'] : ['https', 'http']
    const timeoutMs = quickScan ? 1800 : 4000

    for (const protocol of protocols) {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
      try {
        await fetch(`${protocol}://${targetHost}:${port}/`, {
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        })
        window.clearTimeout(timeout)
        return 'open'
      } catch {
        window.clearTimeout(timeout)
      }
    }

    return 'filtered'
  }

  const scanPorts = async () => {
    if (!host.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a host or IP address',
        variant: 'destructive'
      })
      return
    }

    if (!validateHost(host.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter a valid host or IP address',
        variant: 'destructive'
      })
      return
    }

    if (!validatePortRange(portRange)) {
      toast({
        title: 'Error',
        description: 'Please enter ports as a comma list or range (e.g., 80,443 or 8000-8010)',
        variant: 'destructive'
      })
      return
    }

    const ports = parsePortRange(portRange)
    if (ports.length > 250) {
      toast({
        title: 'Error',
        description: 'Port range too large for a browser probe. Please scan 250 ports or fewer.',
        variant: 'destructive'
      })
      return
    }

    setScanning(true)
    setProgress(0)
    setScanResults(null)
    trackToolStart()

    try {
      const startTime = Date.now()
      const openPorts: PortResult[] = []
      const closedPorts: PortResult[] = []
      const filteredPorts: PortResult[] = []

      // Browsers cannot open raw TCP sockets, so each port is checked as an HTTP/HTTPS endpoint.
      for (let i = 0; i < ports.length; i++) {
        const port = ports[i]
        
        const status = await probeHttpPort(host.trim(), port)
        const portInfo = commonPorts[port] || { service: 'Unknown', description: 'Unknown service' }
        const result: PortResult = {
          port,
          status,
          service: portInfo.service,
          description: portInfo.description
        }
        
        if (status === 'open') openPorts.push(result)
        else if (status === 'closed') closedPorts.push(result)
        else filteredPorts.push(result)
        
        setProgress(((i + 1) / ports.length) * 100)
      }
      
      const scanTime = Date.now() - startTime
      
      const results: ScanResults = {
        host: host.trim(),
        totalPorts: ports.length,
        scannedPorts: ports.length,
        openPorts: openPorts.sort((a, b) => a.port - b.port),
        closedPorts: closedPorts.sort((a, b) => a.port - b.port),
        filteredPorts: filteredPorts.sort((a, b) => a.port - b.port),
        scanTime
      }
      
      setScanResults(results)
      trackToolComplete()
      
      toast({
        title: 'Scan Complete',
        description: `Found ${openPorts.length} browser-reachable HTTP service${openPorts.length === 1 ? '' : 's'} out of ${ports.length} ports checked`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to complete port scan',
        variant: 'destructive'
      })
    } finally {
      setScanning(false)
      setProgress(0)
    }
  }

  const setCommonPortRange = (range: string) => {
    setPortRange(range)
  }

  const relatedTools = [
    { name: 'IP Address Lookup', href: '/network-tools/ip-lookup' },
    { name: 'DNS Lookup', href: '/network-tools/dns-lookup' },
    { name: 'Ping Test', href: '/network-tools/ping-test' },
    { name: 'Whois Lookup', href: '/network-tools/whois-lookup' }
  ]

  return (
    <ToolLayout
      title="Port Scanner"
      description="Check whether common web ports are reachable from your browser. Raw TCP port scanning is not available in browsers."
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
            <CardTitle>Port Scanner Configuration</CardTitle>
            <CardDescription>
              Enter a host and ports to test for browser-reachable HTTP or HTTPS services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host or IP Address</Label>
                <Input
                  id="host"
                  placeholder="Enter host (e.g., google.com or 8.8.8.8)"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
              <Label htmlFor="port-range">Port Range</Label>
                <Input
                  id="port-range"
                  placeholder="Enter ports (e.g., 80,443 or 8000-8010)"
                  value={portRange}
                  onChange={(e) => setPortRange(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Common Port Ranges</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCommonPortRange('80,443,8080,8443')}
                >
                  Web ports
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCommonPortRange('21,22,23,25,53,80,110,143,443,993,995')}
                >
                  Well-known
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCommonPortRange('80,443,8080,8443')}
                >
                  Web Servers
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCommonPortRange('3306,5432,1433,27017,6379')}
                >
                  Databases
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="quick-scan" 
                checked={quickScan}
                onCheckedChange={(checked) => setQuickScan(checked as boolean)}
              />
              <Label htmlFor="quick-scan">Quick probe (shorter timeout)</Label>
            </div>
            
            <Button 
              onClick={scanPorts} 
              disabled={scanning || !host.trim() || !portRange.trim()}
              className="w-full"
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning... {progress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start HTTP Probe
                </>
              )}
            </Button>
            
            {scanning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning progress</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {scanResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Results for {scanResults.host}</CardTitle>
                <CardDescription>
                  Checked {scanResults.totalPorts} ports in {scanResults.scanTime}ms using browser HTTP probes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{scanResults.openPorts.length}</div>
                    <div className="text-sm text-muted-foreground">Reachable</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{scanResults.filteredPorts.length}</div>
                    <div className="text-sm text-muted-foreground">Not Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{scanResults.totalPorts}</div>
                    <div className="text-sm text-muted-foreground">Total Scanned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {scanResults.openPorts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    Open Ports ({scanResults.openPorts.length})
                  </CardTitle>
                  <CardDescription>
                    These ports responded to a browser HTTP/HTTPS probe. This does not prove raw TCP openness.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResults.openPorts.map((port, index) => (
                      <div key={index} className="border border-success/20 rounded-lg p-3 bg-success/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="default" className="bg-success">
                              Port {port.port}
                            </Badge>
                            <div>
                              <div className="font-medium">{port.service}</div>
                              <div className="text-sm text-muted-foreground">{port.description}</div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {scanResults.filteredPorts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    Not Confirmed ({scanResults.filteredPorts.length})
                  </CardTitle>
                  <CardDescription>
                    These ports did not respond to a browser HTTP/HTTPS probe, or the browser blocked the request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {scanResults.filteredPorts.slice(0, 20).map((port, index) => (
                      <Badge key={index} variant="secondary" className="justify-center">
                        {port.port}
                      </Badge>
                    ))}
                    {scanResults.filteredPorts.length > 20 && (
                      <Badge variant="outline" className="justify-center">
                        +{scanResults.filteredPorts.length - 20} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Browsers cannot perform raw TCP port scans. This tool only checks HTTP/HTTPS reachability, and only for hosts you own or have permission to test.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
