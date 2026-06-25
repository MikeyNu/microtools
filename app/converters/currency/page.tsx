"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolLayout } from "@/components/tool-layout"
import { CURRENCIES, fetchCurrencyRates, formatCurrencyAmount } from "@/lib/currency-rates"

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const convertCurrency = async () => {
    const amountNum = Number.parseFloat(amount)
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      setError("Enter a valid non-negative amount.")
      setResult(null)
      setRate(null)
      return
    }

    setLoading(true)
    setError("")

    try {
      if (fromCurrency === toCurrency) {
        setRate(1)
        setResult(amountNum)
        setLastUpdated(new Date().toUTCString())
        return
      }

      const data = await fetchCurrencyRates(fromCurrency)
      const nextRate = data.rates[toCurrency]
      if (!nextRate) throw new Error(`No exchange rate was returned for ${toCurrency}.`)

      setRate(nextRate)
      setResult(amountNum * nextRate)
      setLastUpdated(data.lastUpdated)
    } catch (err) {
      setResult(null)
      setRate(null)
      setError(err instanceof Error ? err.message : "Failed to fetch exchange rates.")
    } finally {
      setLoading(false)
    }
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
                      {CURRENCIES.map((currency) => (
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
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={convertCurrency} className="w-full" disabled={loading}>
                  {loading ? "Fetching live rate..." : "Convert Currency"}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {result !== null && rate !== null && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Result</h3>
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {amount} {fromCurrency} equals
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatCurrencyAmount(result, toCurrency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exchange rate: 1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Rates from open.er-api.com. Last updated: {lastUpdated}
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
