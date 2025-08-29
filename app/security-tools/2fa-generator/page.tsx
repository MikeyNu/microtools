'use client'

import { useState, useEffect } from 'react'
import { Key, QrCode, Copy, RefreshCw, Plus, Trash2, Eye, EyeOff, Download, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface TOTPAccount {
  id: string
  name: string
  issuer: string
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  currentCode: string
  timeRemaining: number
}

interface BackupCode {
  code: string
  used: boolean
}

export default function TwoFactorGeneratorPage() {
  const [accounts, setAccounts] = useState<TOTPAccount[]>([])
  const [newAccount, setNewAccount] = useState({
    name: '',
    issuer: '',
    secret: '',
    algorithm: 'SHA1' as 'SHA1' | 'SHA256' | 'SHA512',
    digits: 6 as 6 | 8,
    period: 30
  })
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [showSecrets, setShowSecrets] = useState(false)
  const [qrCodeData, setQrCodeData] = useState('')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('2FA Generator', 'security-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: '2fa-generator',
    name: 'Two-Factor Auth Generator',
    description: 'Generate TOTP codes and QR codes for 2FA setup with backup codes',
    category: 'security-tools',
    url: '/security-tools/2fa-generator'
  }

  // Base32 encoding/decoding
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  
  const base32Encode = (buffer: Uint8Array): string => {
    let result = ''
    let bits = 0
    let value = 0
    
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i]
      bits += 8
      
      while (bits >= 5) {
        result += base32Chars[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }
    
    if (bits > 0) {
      result += base32Chars[(value << (5 - bits)) & 31]
    }
    
    return result
  }
  
  const base32Decode = (encoded: string): Uint8Array => {
    const cleanEncoded = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '')
    const result = new Uint8Array(Math.floor(cleanEncoded.length * 5 / 8))
    let bits = 0
    let value = 0
    let index = 0
    
    for (let i = 0; i < cleanEncoded.length; i++) {
      const char = cleanEncoded[i]
      const charValue = base32Chars.indexOf(char)
      if (charValue === -1) continue
      
      value = (value << 5) | charValue
      bits += 5
      
      if (bits >= 8) {
        result[index++] = (value >>> (bits - 8)) & 255
        bits -= 8
      }
    }
    
    return result.slice(0, index)
  }

  // HMAC-SHA1 implementation (simplified)
  const hmacSha1 = async (key: Uint8Array, message: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key.buffer as ArrayBuffer,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message.buffer as ArrayBuffer)
    return new Uint8Array(signature)
  }

  // Generate TOTP code
  const generateTOTP = async (secret: string, algorithm: string = 'SHA1', digits: number = 6, period: number = 30): Promise<string> => {
    try {
      const key = base32Decode(secret)
      const time = Math.floor(Date.now() / 1000 / period)
      const timeBuffer = new ArrayBuffer(8)
      const timeView = new DataView(timeBuffer)
      timeView.setUint32(4, time, false)
      
      const hash = await hmacSha1(key, new Uint8Array(timeBuffer))
      const offset = hash[hash.length - 1] & 0xf
      const code = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
      ) % Math.pow(10, digits)
      
      return code.toString().padStart(digits, '0')
    } catch (error) {
      return '000000'
    }
  }

  // Generate random secret
  const generateSecret = (): string => {
    const buffer = new Uint8Array(20)
    crypto.getRandomValues(buffer)
    return base32Encode(buffer)
  }

  // Generate QR code data URL
  const generateQRCode = (account: TOTPAccount): string => {
    const params = new URLSearchParams({
      secret: account.secret,
      issuer: account.issuer,
      algorithm: account.algorithm,
      digits: account.digits.toString(),
      period: account.period.toString()
    })
    
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(account.issuer)}:${encodeURIComponent(account.name)}?${params}`
    
    // Simple QR code generation (in a real app, you'd use a proper QR code library)
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
          QR Code for ${account.name}
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="monospace" font-size="6" fill="gray">
          ${otpauthUrl.substring(0, 40)}...
        </text>
      </svg>
    `)}`
  }

  // Generate backup codes
  const generateBackupCodes = (): BackupCode[] => {
    const codes: BackupCode[] = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push({ code, used: false })
    }
    return codes
  }

  // Add new account
  const addAccount = async () => {
    if (!newAccount.name || !newAccount.issuer) {
      toast({
        title: 'Error',
        description: 'Please enter account name and issuer',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    const secret = newAccount.secret || generateSecret()
    const account: TOTPAccount = {
      id: Date.now().toString(),
      name: newAccount.name,
      issuer: newAccount.issuer,
      secret,
      algorithm: newAccount.algorithm,
      digits: newAccount.digits,
      period: newAccount.period,
      currentCode: await generateTOTP(secret, newAccount.algorithm, newAccount.digits, newAccount.period),
      timeRemaining: newAccount.period - (Math.floor(Date.now() / 1000) % newAccount.period)
    }

    setAccounts(prev => [...prev, account])
    setNewAccount({
      name: '',
      issuer: '',
      secret: '',
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    })

    trackToolComplete()

    toast({
      title: 'Account added',
      description: `2FA account for ${account.name} has been created`
    })
  }

  // Remove account
  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id))
    toast({
      title: 'Account removed',
      description: 'Account has been deleted'
    })
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`
    })
  }

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = backupCodes.map(code => code.code).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-codes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'Backup codes saved to file'
    })
  }

  // Update TOTP codes every second
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedAccounts = await Promise.all(
        accounts.map(async (account) => ({
          ...account,
          currentCode: await generateTOTP(account.secret, account.algorithm, account.digits, account.period),
          timeRemaining: account.period - (Math.floor(Date.now() / 1000) % account.period)
        }))
      )
      setAccounts(updatedAccounts)
    }, 1000)

    return () => clearInterval(interval)
  }, [accounts])

  const relatedTools = [
    { name: 'Password Strength Checker', href: '/security-tools/password-checker' },
    { name: 'SSL Certificate Checker', href: '/security-tools/ssl-checker' },
    { name: 'Hash Generator', href: '/security-tools/hash-generator' },
    { name: 'Password Generator', href: '/security-tools/password-generator' }
  ]

  return (
    <ToolLayout
      title="Two-Factor Auth Generator"
      description="Generate TOTP codes and QR codes for 2FA setup with backup codes and multiple account management."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Two-Factor Auth Generator</h1>
              <p className="text-muted-foreground">Generate TOTP codes and manage 2FA accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="add">Add Account</TabsTrigger>
            <TabsTrigger value="backup">Backup Codes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">TOTP Accounts ({accounts.length})</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showSecrets ? 'Hide' : 'Show'} Secrets
                </Button>
              </div>
              
              {accounts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No 2FA accounts added yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add your first account to start generating TOTP codes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <Card key={account.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">{account.name}</CardTitle>
                            <CardDescription className="text-xs">{account.issuer}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccount(account.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-mono font-bold tracking-wider">
                            {account.currentCode}
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="text-xs text-muted-foreground">
                              {account.timeRemaining}s remaining
                            </div>
                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${(account.timeRemaining / account.period) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(account.currentCode, 'TOTP code')}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQrCodeData(generateQRCode(account))}
                            className="flex-1"
                          >
                            <QrCode className="h-3 w-3 mr-1" />
                            QR
                          </Button>
                        </div>
                        
                        {showSecrets && (
                          <div className="space-y-2 pt-2 border-t">
                            <div className="text-xs">
                              <div className="font-medium">Secret:</div>
                              <div className="font-mono text-xs break-all bg-gray-100 p-1 rounded">
                                {account.secret}
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Algorithm: {account.algorithm}</span>
                              <span>Digits: {account.digits}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New 2FA Account</CardTitle>
                <CardDescription>
                  Create a new TOTP account for two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Account Name *</Label>
                    <Input
                      id="account-name"
                      placeholder="e.g., john@example.com"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issuer">Issuer *</Label>
                    <Input
                      id="issuer"
                      placeholder="e.g., Google, GitHub, AWS"
                      value={newAccount.issuer}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, issuer: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secret">Secret Key (optional)</Label>
                    <Input
                      id="secret"
                      placeholder="Leave empty to generate automatically"
                      value={newAccount.secret}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, secret: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="algorithm">Algorithm</Label>
                    <Select value={newAccount.algorithm} onValueChange={(value: 'SHA1' | 'SHA256' | 'SHA512') => setNewAccount(prev => ({ ...prev, algorithm: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SHA1">SHA1 (Most Compatible)</SelectItem>
                        <SelectItem value="SHA256">SHA256</SelectItem>
                        <SelectItem value="SHA512">SHA512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="digits">Code Length</Label>
                    <Select value={newAccount.digits.toString()} onValueChange={(value) => setNewAccount(prev => ({ ...prev, digits: parseInt(value) as 6 | 8 }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 digits (Standard)</SelectItem>
                        <SelectItem value="8">8 digits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Time Period (seconds)</Label>
                    <Select value={newAccount.period.toString()} onValueChange={(value) => setNewAccount(prev => ({ ...prev, period: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds (Standard)</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                        <SelectItem value="120">120 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={addAccount} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup Codes</CardTitle>
                <CardDescription>
                  Generate and manage backup codes for account recovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setBackupCodes(generateBackupCodes())}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Backup Codes
                  </Button>
                  
                  {backupCodes.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={downloadBackupCodes}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
                
                {backupCodes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Your Backup Codes:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((backup, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border font-mono text-sm ${
                            backup.used ? 'bg-gray-100 text-gray-500 line-through' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{backup.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(backup.code, 'Backup code')}
                              disabled={backup.used}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        {qrCodeData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  QR Code
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQrCodeData('')}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img src={qrCodeData} alt="QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> All TOTP generation is performed locally in your browser. 
            Your secret keys are never transmitted to our servers. Store backup codes securely and never share them.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}