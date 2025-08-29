'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ArrowUpDown, TrendingUp, RefreshCw, Copy, Clock } from 'lucide-react'
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

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

interface ConversionHistory {
  id: string
  amount: number
  from: Currency
  to: Currency
  rate: number
  result: number
  timestamp: string
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('100')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Currency Converter', 'finance-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert between different currencies with real-time exchange rates',
    category: 'finance-tools',
    url: '/finance-tools/currency-converter'
  }

  // Popular currencies with flags
  const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' }
  ]

  // Mock exchange rates (in real app, fetch from API like exchangerate-api.com)
  const mockExchangeRates: { [key: string]: number } = {
    'USD-EUR': 0.85,
    'USD-GBP': 0.73,
    'USD-JPY': 110.0,
    'USD-CAD': 1.25,
    'USD-AUD': 1.35,
    'USD-CHF': 0.92,
    'USD-CNY': 6.45,
    'USD-INR': 74.5,
    'USD-KRW': 1180.0,
    'USD-BRL': 5.2,
    'USD-MXN': 20.1,
    'USD-SGD': 1.35,
    'USD-NZD': 1.42,
    'USD-SEK': 8.6,
    'USD-NOK': 8.8,
    'USD-DKK': 6.4,
    'USD-PLN': 3.9,
    'USD-RUB': 73.5,
    'USD-ZAR': 14.8
  }

  const getExchangeRate = async (from: string, to: string): Promise<number> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (from === to) return 1
    
    // Check direct rate
    const directRate = mockExchangeRates[`${from}-${to}`]
    if (directRate) return directRate
    
    // Check inverse rate
    const inverseRate = mockExchangeRates[`${to}-${from}`]
    if (inverseRate) return 1 / inverseRate
    
    // Convert through USD
    const fromUsdRate = from === 'USD' ? 1 : (mockExchangeRates[`USD-${from}`] ? 1 / mockExchangeRates[`USD-${from}`] : 1)
    const toUsdRate = to === 'USD' ? 1 : mockExchangeRates[`USD-${to}`] || 1
    
    return fromUsdRate * toUsdRate
  }

  const convertCurrency = async () => {
    const amountNum = parseFloat(amount)
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      })
      return
    }

    if (fromCurrency === toCurrency) {
      setConvertedAmount(amountNum)
      setExchangeRate({
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        lastUpdated: new Date().toISOString()
      })
      return
    }

    setLoading(true)
    trackToolStart()

    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency)
      const result = amountNum * rate
      
      const exchangeRateData: ExchangeRate = {
        from: fromCurrency,
        to: toCurrency,
        rate,
        lastUpdated: new Date().toISOString()
      }
      
      setExchangeRate(exchangeRateData)
      setConvertedAmount(result)
      
      // Add to history
      const fromCurrencyData = currencies.find(c => c.code === fromCurrency)!
      const toCurrencyData = currencies.find(c => c.code === toCurrency)!
      
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        amount: amountNum,
        from: fromCurrencyData,
        to: toCurrencyData,
        rate,
        result,
        timestamp: new Date().toISOString()
      }
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10
      
      trackToolComplete()
      
      toast({
        title: 'Conversion Complete',
        description: `${formatCurrency(amountNum, fromCurrencyData)} = ${formatCurrency(result, toCurrencyData)}`
      })
    } catch (error) {
      trackToolError()
      toast({
        title: 'Error',
        description: 'Failed to get exchange rate',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const copyResult = () => {
    if (convertedAmount && exchangeRate) {
      const fromCurrencyData = currencies.find(c => c.code === fromCurrency)!
      const toCurrencyData = currencies.find(c => c.code === toCurrency)!
      const text = `${formatCurrency(parseFloat(amount), fromCurrencyData)} = ${formatCurrency(convertedAmount, toCurrencyData)}`
      navigator.clipboard.writeText(text)
      toast({
        title: 'Copied!',
        description: 'Conversion result copied to clipboard'
      })
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Auto-convert when inputs change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      const timer = setTimeout(() => {
        convertCurrency()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [amount, fromCurrency, toCurrency])

  const relatedTools = [
    { name: 'Compound Interest Calculator', href: '/finance-tools/compound-interest' },
    { name: 'Investment Return Calculator', href: '/finance-tools/investment-return' },
    { name: 'Crypto Price Converter', href: '/crypto-tools/price-converter' },
    { name: 'Loan Calculator', href: '/calculators/loan' }
  ]

  return (
    <ToolLayout
      title="Currency Converter"
      description="Convert between different currencies with real-time exchange rates and conversion history."
      category="Finance Tools"
      categoryHref="/finance-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Currency Converter</h1>
              <p className="text-muted-foreground">Convert between world currencies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Currency Conversion</CardTitle>
                <CardDescription>
                  Enter amount and select currencies to convert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="from-currency">From</Label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                              <span className="text-muted-foreground">- {currency.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={swapCurrencies}
                      className="rounded-full"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="to-currency">To</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                              <span className="text-muted-foreground">- {currency.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={convertCurrency} 
                  disabled={loading || !amount}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Convert Currency
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {convertedAmount !== null && exchangeRate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Conversion Result</span>
                    <Button variant="outline" size="sm" onClick={copyResult}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold">
                      {formatCurrency(convertedAmount, currencies.find(c => c.code === toCurrency)!)}
                    </div>
                    
                    <div className="text-muted-foreground">
                      {formatCurrency(parseFloat(amount), currencies.find(c => c.code === fromCurrency)!)} = 
                      {formatCurrency(convertedAmount, currencies.find(c => c.code === toCurrency)!)}
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <Badge variant="outline">
                        1 {fromCurrency} = {exchangeRate.rate.toFixed(4)} {toCurrency}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated {formatTime(exchangeRate.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Conversions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {item.from.flag} {item.amount} {item.from.code}
                          </span>
                          <span className="text-muted-foreground">
                            {formatTime(item.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {item.to.flag} {item.result.toFixed(2)} {item.to.code}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Rate: 1 {item.from.code} = {item.rate.toFixed(4)} {item.to.code}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Pairs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { from: 'USD', to: 'EUR' },
                    { from: 'USD', to: 'GBP' },
                    { from: 'EUR', to: 'GBP' },
                    { from: 'USD', to: 'JPY' },
                    { from: 'USD', to: 'CAD' }
                  ].map((pair, index) => {
                    const fromCur = currencies.find(c => c.code === pair.from)!
                    const toCur = currencies.find(c => c.code === pair.to)!
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setFromCurrency(pair.from)
                          setToCurrency(pair.to)
                        }}
                      >
                        <span className="mr-2">{fromCur.flag}</span>
                        {pair.from}
                        <ArrowUpDown className="h-3 w-3 mx-2" />
                        <span className="mr-2">{toCur.flag}</span>
                        {pair.to}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Exchange rates are updated regularly but may not reflect real-time market rates. 
            For actual transactions, please check with your financial institution.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}