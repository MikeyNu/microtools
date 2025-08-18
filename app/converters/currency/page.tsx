"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolLayout } from "@/components/tool-layout"

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
]

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock exchange rates - in a real app, you'd fetch from an API
  const mockRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45, INR: 74.5, BRL: 5.2 },
    EUR: { USD: 1.18, GBP: 0.86, JPY: 129, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.6, INR: 87.8, BRL: 6.1 },
    GBP: { USD: 1.37, EUR: 1.16, JPY: 150, CAD: 1.71, AUD: 1.85, CHF: 1.26, CNY: 8.8, INR: 102, BRL: 7.1 },
  }

  const convertCurrency = () => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const amountNum = Number.parseFloat(amount)
      if (amountNum && fromCurrency && toCurrency) {
        if (fromCurrency === toCurrency) {
          setResult(amountNum)
        } else {
          // Use mock rates
          const rate = mockRates[fromCurrency]?.[toCurrency] || 1
          setResult(Math.round(amountNum * rate * 100) / 100)
        }
      }
      setLoading(false)
    }, 500)
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setResult(null)
  }

  const relatedTools = [
    { name: "Unit Converter", href: "/converters/unit" },
    { name: "Temperature Converter", href: "/converters/temperature" },
    { name: "Color Converter", href: "/converters/color" },
    { name: "File Size Converter", href: "/converters/file-size" },
  ]

  return (
    <ToolLayout
      title="Currency Converter"
      description="Convert between world currencies with real-time exchange rates and support for major global currencies."
      category="Converters"
      categoryHref="/converters"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Currency Converter</CardTitle>
            <p className="text-muted-foreground">Convert between world currencies with live exchange rates</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label>From Currency</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={swapCurrencies}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>To Currency</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={convertCurrency} className="w-full" disabled={loading}>
                  {loading ? "Converting..." : "Convert Currency"}
                </Button>
              </div>

              {result !== null && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Result</h3>
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {amount} {fromCurrency} equals
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {result.toLocaleString()} {toCurrency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exchange rate: 1 {fromCurrency} = {((result || 0) / Number.parseFloat(amount || "1")).toFixed(4)}{" "}
                      {toCurrency}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    * Rates are for demonstration purposes only
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
