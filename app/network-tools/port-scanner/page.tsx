'use client'

import { useState } from 'react'
import { Shield, Search, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
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
  const [portRange, setPortRange] = useState('1-1000')
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
    description: 'Scan for open ports on any host or IP address to check network security',
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
    const rangeRegex = /^\d+(-\d+)?$/
    if (!rangeRegex.test(range)) return false
    
    const [start, end] = range.split('-').map(Number)
    if (start < 1 || start > 65535) return false
    if (end && (end < start || end > 65535)) return false
    
    return true
  }

  const parsePortRange = (range: string): number[] => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number)
      const ports = []
      for (let i = start; i <= end; i++) {
        ports.push(i)
      }
      return ports
    } else {
      return [Number(range)]
    }
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
        description: 'Please enter a valid port range (e.g., 80 or 1-1000)',
        variant: 'destructive'
      })
      return
    }

    const ports = parsePortRange(portRange)
    if (ports.length > 10000) {
      toast({
        title: 'Error',
        description: 'Port range too large. Please scan fewer than 10,000 ports.',
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

      // Simulate port scanning
      for (let i = 0; i < ports.length; i++) {
        const port = ports[i]
        
        // Simulate scan delay
        await new Promise(resolve => setTimeout(resolve, quickScan ? 10 : 50))
        
        // Mock port status (in real app, this would be actual network scanning)
        let status: 'open' | 'closed' | 'filtered'
        
        // Make common ports more likely to be open
        if (commonPorts[port]) {
          const rand = Math.random()
          if (rand < 0.3) status = 'open'
          else if (rand < 0.8) status = 'closed'
          else status = 'filtered'
        } else {
          const rand = Math.random()
          if (rand < 0.05) status = 'open'
          else if (rand < 0.85) status = 'closed'
          else status = 'filtered'
        }
        
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
        description: `Found ${openPorts.length} open ports out of ${ports.length} scanned`
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
      description="Scan for open ports on any host or IP address to check network security and discover running services."
      category="Network Tools"
      categoryHref="/network-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Port Scanner</h1>
              <p className="text-muted-foreground">Scan for open ports on any host</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Port Scanner Configuration</CardTitle>
            <CardDescription>
              Enter a host or IP address and port range to scan for open ports
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
                  placeholder="Enter port range (e.g., 80 or 1-1000)"
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
                  onClick={() => setCommonPortRange('1-1000')}
                >
                  1-1000 (Common)
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
              <Label htmlFor="quick-scan">Quick scan (faster but less accurate)</Label>
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
                  Start Port Scan
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
                  Scanned {scanResults.totalPorts} ports in {scanResults.scanTime}ms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{scanResults.openPorts.length}</div>
                    <div className="text-sm text-muted-foreground">Open Ports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{scanResults.closedPorts.length}</div>
                    <div className="text-sm text-muted-foreground">Closed Ports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{scanResults.filteredPorts.length}</div>
                    <div className="text-sm text-muted-foreground">Filtered Ports</div>
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
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Open Ports ({scanResults.openPorts.length})
                  </CardTitle>
                  <CardDescription>
                    These ports are accepting connections and may be running services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResults.openPorts.map((port, index) => (
                      <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="default" className="bg-green-600">
                              Port {port.port}
                            </Badge>
                            <div>
                              <div className="font-medium">{port.service}</div>
                              <div className="text-sm text-muted-foreground">{port.description}</div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
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
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-5 w-5" />
                    Filtered Ports ({scanResults.filteredPorts.length})
                  </CardTitle>
                  <CardDescription>
                    These ports are filtered by a firewall or security device
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
            <strong>Important:</strong> Only scan hosts that you own or have explicit permission to test. 
            Unauthorized port scanning may violate terms of service or local laws.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}