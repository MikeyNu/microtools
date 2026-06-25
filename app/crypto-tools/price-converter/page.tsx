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
import { CRYPTO_ASSETS, fetchCryptoPrices, type CryptoPrice } from '@/lib/crypto-prices'
import { fetchCurrencyRates } from '@/lib/currency-rates'

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
  const [fiatRates, setFiatRates] = useState<Record<string, number>>({ USD: 1 })
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

  const currencies = [
    ...CRYPTO_ASSETS.map((asset) => ({
      value: asset.symbol,
      label: `${asset.name} (${asset.symbol})`,
      type: 'crypto',
    })),
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
      const [cryptoData, fiatData] = await Promise.all([
        fetchCryptoPrices(),
        fetchCurrencyRates('USD'),
      ])
      setPrices(cryptoData)
      setFiatRates({ USD: 1, ...fiatData.rates })
      const latestTimestamp = Math.max(
        ...Object.values(cryptoData)
          .map((price) => price.lastUpdated || 0)
          .filter(Boolean)
      )
      setLastUpdated(
        Number.isFinite(latestTimestamp) && latestTimestamp > 0
          ? new Date(latestTimestamp * 1000).toLocaleString()
          : new Date().toLocaleString()
      )
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load current market prices',
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

    const fromUsdPrice = getUsdPrice(fromCurrency)
    const toUsdPrice = getUsdPrice(toCurrency)

    if (!fromUsdPrice || !toUsdPrice) {
      toast({
        title: 'Error',
        description: 'Price data not available for selected currencies',
        variant: 'destructive'
      })
      return
    }

    trackToolStart()

    try {
      // Convert to USD first, then to target currency
      const usdValue = amount * fromUsdPrice
      const convertedAmount = usdValue / toUsdPrice
      const rate = fromUsdPrice / toUsdPrice

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

  const getUsdPrice = (currency: string): number | null => {
    if (prices[currency]) return prices[currency].usd
    if (currency === 'USD') return 1
    const usdToFiat = fiatRates[currency]
    return usdToFiat ? 1 / usdToFiat : null
  }

  const relatedTools = [
    { name: 'Bitcoin Address Validator', href: '/crypto-tools/bitcoin-validator' },
    { name: 'Wallet Demo', href: '/crypto-tools/wallet-generator' },
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
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
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
                {Object.values(prices).map((price) => (
                  <div key={price.symbol} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {currencies.find(c => c.value === price.symbol)?.type === 'crypto' ? (
                          <Bitcoin className="h-4 w-4 text-warning" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-success" />
                        )}
                        <span className="font-medium">{price.symbol}</span>
                      </div>
                      <Badge variant={(price.change24h ?? 0) >= 0 ? 'default' : 'destructive'}>
                        {price.change24h !== null ? `${price.change24h >= 0 ? '+' : ''}${price.change24h.toFixed(2)}%` : 'n/a'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{price.name}</div>
                    <div className="font-bold">{formatPrice(price.usd, 'USD')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Cryptocurrency prices are fetched from CoinGecko and fiat rates from open.er-api.com. Market data can move quickly, so confirm with your exchange before trading.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}
