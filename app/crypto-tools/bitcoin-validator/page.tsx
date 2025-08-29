'use client'

import { useState } from 'react'
import { Bitcoin, CheckCircle, XCircle, Info, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface ValidationResult {
  isValid: boolean
  addressType: string
  network: string
  format: string
  details: string
}

export default function BitcoinValidatorPage() {
  const [address, setAddress] = useState('')
  const [results, setResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Bitcoin Address Validator', 'crypto-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'bitcoin-validator',
    name: 'Bitcoin Address Validator',
    description: 'Validate Bitcoin addresses and check their format and network type',
    category: 'crypto-tools',
    url: '/crypto-tools/bitcoin-validator'
  }

  // Bitcoin address validation functions
  const validateBase58 = (address: string): boolean => {
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
    return base58Regex.test(address)
  }

  const validateBech32 = (address: string): boolean => {
    const bech32Regex = /^(bc1|tb1)[a-zA-HJ-NP-Z0-9]{25,87}$/
    return bech32Regex.test(address)
  }

  const getAddressType = (address: string): { type: string; network: string; format: string } => {
    // Legacy P2PKH (starts with 1)
    if (address.startsWith('1')) {
      return { type: 'P2PKH (Pay-to-Public-Key-Hash)', network: 'Mainnet', format: 'Legacy' }
    }
    // Legacy P2SH (starts with 3)
    if (address.startsWith('3')) {
      return { type: 'P2SH (Pay-to-Script-Hash)', network: 'Mainnet', format: 'Legacy' }
    }
    // Testnet P2PKH (starts with m or n)
    if (address.startsWith('m') || address.startsWith('n')) {
      return { type: 'P2PKH (Pay-to-Public-Key-Hash)', network: 'Testnet', format: 'Legacy' }
    }
    // Testnet P2SH (starts with 2)
    if (address.startsWith('2')) {
      return { type: 'P2SH (Pay-to-Script-Hash)', network: 'Testnet', format: 'Legacy' }
    }
    // Bech32 Mainnet (starts with bc1)
    if (address.startsWith('bc1')) {
      if (address.length === 42) {
        return { type: 'P2WPKH (Pay-to-Witness-Public-Key-Hash)', network: 'Mainnet', format: 'Bech32' }
      } else if (address.length === 62) {
        return { type: 'P2WSH (Pay-to-Witness-Script-Hash)', network: 'Mainnet', format: 'Bech32' }
      } else {
        return { type: 'P2TR (Pay-to-Taproot)', network: 'Mainnet', format: 'Bech32m' }
      }
    }
    // Bech32 Testnet (starts with tb1)
    if (address.startsWith('tb1')) {
      if (address.length === 42) {
        return { type: 'P2WPKH (Pay-to-Witness-Public-Key-Hash)', network: 'Testnet', format: 'Bech32' }
      } else if (address.length === 62) {
        return { type: 'P2WSH (Pay-to-Witness-Script-Hash)', network: 'Testnet', format: 'Bech32' }
      } else {
        return { type: 'P2TR (Pay-to-Taproot)', network: 'Testnet', format: 'Bech32m' }
      }
    }
    
    return { type: 'Unknown', network: 'Unknown', format: 'Unknown' }
  }

  const validateSingleAddress = (addr: string): ValidationResult => {
    const trimmedAddr = addr.trim()
    
    if (!trimmedAddr) {
      return {
        isValid: false,
        addressType: 'Invalid',
        network: 'N/A',
        format: 'N/A',
        details: 'Empty address'
      }
    }

    // Check length constraints
    if (trimmedAddr.length < 26 || trimmedAddr.length > 90) {
      return {
        isValid: false,
        addressType: 'Invalid',
        network: 'N/A',
        format: 'N/A',
        details: 'Invalid length (must be 26-90 characters)'
      }
    }

    const { type, network, format } = getAddressType(trimmedAddr)
    
    let isValid = false
    let details = ''

    if (format === 'Legacy') {
      isValid = validateBase58(trimmedAddr)
      details = isValid ? 'Valid Base58 encoding' : 'Invalid Base58 encoding'
    } else if (format === 'Bech32' || format === 'Bech32m') {
      isValid = validateBech32(trimmedAddr)
      details = isValid ? 'Valid Bech32 encoding' : 'Invalid Bech32 encoding'
    } else {
      details = 'Unknown address format'
    }

    return {
      isValid,
      addressType: type,
      network,
      format,
      details
    }
  }

  const validateAddresses = () => {
    if (!address.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a Bitcoin address to validate',
        variant: 'destructive'
      })
      return
    }

    setIsValidating(true)
    trackToolStart()

    try {
      // Split by newlines for bulk validation
      const addresses = address.split('\n').filter(addr => addr.trim())
      const validationResults = addresses.map(validateSingleAddress)
      
      setResults(validationResults)
      trackToolComplete()
      
      const validCount = validationResults.filter(r => r.isValid).length
      toast({
        title: 'Validation Complete',
        description: `${validCount} of ${validationResults.length} addresses are valid`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to validate addresses',
        variant: 'destructive'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const copyResults = () => {
    const resultText = results.map((result, index) => 
      `Address ${index + 1}: ${result.isValid ? 'VALID' : 'INVALID'} - ${result.addressType} (${result.network})`
    ).join('\n')
    
    navigator.clipboard.writeText(resultText)
    toast({
      title: 'Copied!',
      description: 'Validation results copied to clipboard'
    })
  }

  const clearAll = () => {
    setAddress('')
    setResults([])
  }

  const relatedTools = [
    { name: 'Crypto Price Converter', href: '/crypto-tools/price-converter' },
    { name: 'Wallet Generator', href: '/crypto-tools/wallet-generator' },
    { name: 'Hash Generator', href: '/developer-tools/hash-generator' },
    { name: 'Base64 Encoder', href: '/developer-tools/base64' }
  ]

  return (
    <ToolLayout
      title="Bitcoin Address Validator"
      description="Validate Bitcoin addresses and check their format, network type, and encoding. Supports Legacy, SegWit, and Taproot addresses."
      category="Crypto Tools"
      categoryHref="/crypto-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-lg">
              <Bitcoin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bitcoin Address Validator</h1>
              <p className="text-muted-foreground">Validate Bitcoin addresses and check their format</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Address Validation</CardTitle>
            <CardDescription>
              Enter one or more Bitcoin addresses (one per line) to validate their format and network type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Bitcoin Address(es)</Label>
              <Textarea
                id="address"
                placeholder="Enter Bitcoin addresses (one per line)...\ne.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={validateAddresses} 
                disabled={isValidating || !address.trim()}
                className="flex-1"
              >
                {isValidating ? 'Validating...' : 'Validate Addresses'}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Validation Results</CardTitle>
                <Button variant="outline" size="sm" onClick={copyResults}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={result.isValid ? 'default' : 'destructive'}>
                          {result.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        Address {index + 1}
                      </code>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-muted-foreground">{result.addressType}</p>
                      </div>
                      <div>
                        <span className="font-medium">Network:</span>
                        <p className="text-muted-foreground">{result.network}</p>
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <p className="text-muted-foreground">{result.format}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="font-medium text-sm">Details:</span>
                      <p className="text-sm text-muted-foreground">{result.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported formats:</strong> Legacy (P2PKH, P2SH), SegWit (Bech32), and Taproot (Bech32m) addresses for both Mainnet and Testnet networks.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}