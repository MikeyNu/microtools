'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, ArrowUpDown, DollarSign, Bitcoin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  lastUpdated: string
}

interface ConversionResult {
  fromAmount: number
  fromCurrency: string
  toAmount: number
  toCurrency: string
  rate: number
  timestamp: string
}

export default function CryptoPriceConverterPage() {
  const [fromAmount, setFromAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USD')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Crypto Price Converter', 'crypto-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'crypto-price-converter',
    name: 'Crypto Price Converter',
    description: 'Convert between cryptocurrencies and fiat currencies with real-time prices',
    category: 'crypto-tools',
    url: '/crypto-tools/price-converter'
  }

  // Mock price data (in a real app, this would come from an API like CoinGecko)
  const mockPrices: Record<string, CryptoPrice> = {
    BTC: { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change24h: 2.5, lastUpdated: new Date().toISOString() },
    ETH: { symbol: 'ETH', name: 'Ethereum', price: 2650.00, change24h: -1.2, lastUpdated: new Date().toISOString() },
    ADA: { symbol: 'ADA', name: 'Cardano', price: 0.485, change24h: 3.8, lastUpdated: new Date().toISOString() },
    DOT: { symbol: 'DOT', name: 'Polkadot', price: 7.25, change24h: -0.5, lastUpdated: new Date().toISOString() },
    LINK: { symbol: 'LINK', name: 'Chainlink', price: 14.80, change24h: 1.9, lastUpdated: new Date().toISOString() },
    LTC: { symbol: 'LTC', name: 'Litecoin', price: 72.50, change24h: 0.8, lastUpdated: new Date().toISOString() },
    XRP: { symbol: 'XRP', name: 'Ripple', price: 0.62, change24h: -2.1, lastUpdated: new Date().toISOString() },
    USD: { symbol: 'USD', name: 'US Dollar', price: 1.00, change24h: 0, lastUpdated: new Date().toISOString() },
    EUR: { symbol: 'EUR', name: 'Euro', price: 1.08, change24h: 0.1, lastUpdated: new Date().toISOString() },
    GBP: { symbol: 'GBP', name: 'British Pound', price: 1.27, change24h: -0.2, lastUpdated: new Date().toISOString() },
    JPY: { symbol: 'JPY', name: 'Japanese Yen', price: 0.0067, change24h: 0.3, lastUpdated: new Date().toISOString() }
  }

  const currencies = [
    { value: 'BTC', label: 'Bitcoin (BTC)', type: 'crypto' },
    { value: 'ETH', label: 'Ethereum (ETH)', type: 'crypto' },
    { value: 'ADA', label: 'Cardano (ADA)', type: 'crypto' },
    { value: 'DOT', label: 'Polkadot (DOT)', type: 'crypto' },
    { value: 'LINK', label: 'Chainlink (LINK)', type: 'crypto' },
    { value: 'LTC', label: 'Litecoin (LTC)', type: 'crypto' },
    { value: 'XRP', label: 'Ripple (XRP)', type: 'crypto' },
    { value: 'USD', label: 'US Dollar (USD)', type: 'fiat' },
    { value: 'EUR', label: 'Euro (EUR)', type: 'fiat' },
    { value: 'GBP', label: 'British Pound (GBP)', type: 'fiat' },
    { value: 'JPY', label: 'Japanese Yen (JPY)', type: 'fiat' }
  ]

  useEffect(() => {
    loadPrices()
  }, [])

  const loadPrices = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPrices(mockPrices)
      setLastUpdated(new Date().toLocaleString())
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load current prices',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const convertCurrency = () => {
    const amount = parseFloat(fromAmount)
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      })
      return
    }

    if (!prices[fromCurrency] || !prices[toCurrency]) {
      toast({
        title: 'Error',
        description: 'Price data not available for selected currencies',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    try {
      const fromPrice = prices[fromCurrency].price
      const toPrice = prices[toCurrency].price
      
      // Convert to USD first, then to target currency
      const usdValue = amount * fromPrice
      const convertedAmount = usdValue / toPrice
      const rate = fromPrice / toPrice

      const conversionResult: ConversionResult = {
        fromAmount: amount,
        fromCurrency,
        toAmount: convertedAmount,
        toCurrency,
        rate,
        timestamp: new Date().toLocaleString()
      }

      setResult(conversionResult)
      trackToolComplete()
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to convert currency',
        variant: 'destructive'
      })
    }
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'GBP' ? 'GBP' : currency === 'EUR' ? 'EUR' : 'USD'
      }).format(price)
    } else if (currency === 'JPY') {
      return `¥${price.toFixed(2)}`
    } else {
      return price.toLocaleString('en-US', { maximumFractionDigits: 8 })
    }
  }

  const relatedTools = [
    { name: 'Bitcoin Address Validator', href: '/crypto-tools/bitcoin-validator' },
    { name: 'Wallet Generator', href: '/crypto-tools/wallet-generator' },
    { name: 'Currency Converter', href: '/converters/currency' },
    { name: 'Percentage Calculator', href: '/calculators/percentage' }
  ]

  return (
    <ToolLayout
      title="Crypto Price Converter"
      description="Convert between cryptocurrencies and fiat currencies with real-time market prices. Support for Bitcoin, Ethereum, and major altcoins."
      category="Crypto Tools"
      categoryHref="/crypto-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Crypto Price Converter</h1>
              <p className="text-muted-foreground">Convert between cryptocurrencies and fiat currencies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Currency Converter</CardTitle>
                <Button variant="outline" size="sm" onClick={loadPrices} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Convert between cryptocurrencies and fiat currencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-currency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Cryptocurrencies</div>
                      {currencies.filter(c => c.type === 'crypto').map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Fiat Currencies</div>
                      {currencies.filter(c => c.type === 'fiat').map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={swapCurrencies}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="to-currency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Cryptocurrencies</div>
                      {currencies.filter(c => c.type === 'crypto').map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Fiat Currencies</div>
                      {currencies.filter(c => c.type === 'fiat').map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={convertCurrency} className="w-full" disabled={loading}>
                Convert
              </Button>
              
              {lastUpdated && (
                <p className="text-xs text-muted-foreground text-center">
                  Prices last updated: {lastUpdated}
                </p>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(result.toAmount, result.toCurrency)} {result.toCurrency}
                  </div>
                  <div className="text-muted-foreground">
                    {result.fromAmount} {result.fromCurrency} =
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Exchange Rate: 1 {result.fromCurrency} = {formatPrice(result.rate, result.toCurrency)} {result.toCurrency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Converted at: {result.timestamp}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {Object.keys(prices).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Prices</CardTitle>
              <CardDescription>Live cryptocurrency and fiat currency prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(prices).filter(price => price.symbol !== 'USD').map((price) => (
                  <div key={price.symbol} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {currencies.find(c => c.value === price.symbol)?.type === 'crypto' ? (
                          <Bitcoin className="h-4 w-4 text-orange-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">{price.symbol}</span>
                      </div>
                      <Badge variant={price.change24h >= 0 ? 'default' : 'destructive'}>
                        {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{price.name}</div>
                    <div className="font-bold">{formatPrice(price.price, 'USD')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Prices are simulated for demonstration. In a production environment, this would connect to real-time cryptocurrency APIs like CoinGecko or CoinMarketCap.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}