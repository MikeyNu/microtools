'use client'

import { useState, useCallback } from 'react'
import { Cpu, Zap, DollarSign, TrendingUp, TrendingDown, RotateCcw, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'

// ─── Types ───────────────────────────────────────────────────────────────────

type HashUnit = 'H/s' | 'KH/s' | 'MH/s' | 'GH/s' | 'TH/s' | 'PH/s'
type CoinId = 'bitcoin' | 'ethereum'

interface MiningResults {
  dailyCoins: number
  monthlyCoins: number
  yearlyCoins: number
  dailyRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
  dailyPowerCost: number
  monthlyPowerCost: number
  yearlyPowerCost: number
  dailyProfit: number
  monthlyProfit: number
  yearlyProfit: number
  breakEvenElectricity: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HASH_UNIT_MULTIPLIERS: Record<HashUnit, number> = {
  'H/s':  1,
  'KH/s': 1e3,
  'MH/s': 1e6,
  'GH/s': 1e9,
  'TH/s': 1e12,
  'PH/s': 1e15,
}

const COIN_OPTIONS: { id: CoinId; label: string; blockTime: number }[] = [
  { id: 'bitcoin',  label: 'Bitcoin (BTC)',  blockTime: 600  }, // 10 min
  { id: 'ethereum', label: 'Ethereum (ETH)', blockTime: 12   }, // ~12 s
]

const tool = {
  id: 'hash-rate-calculator',
  name: 'Hash Rate Calculator',
  description: 'Estimate daily, monthly, and yearly mining profitability based on your hash rate, power consumption, electricity cost, and network conditions.',
  category: 'crypto-tools',
  url: '/crypto-tools/hash-calculator',
}

const relatedTools = [
  { name: 'Bitcoin Validator',  href: '/crypto-tools/bitcoin-validator' },
  { name: 'Price Converter',    href: '/crypto-tools/price-converter' },
  { name: 'Hash Generator',     href: '/text-tools/hash-generator' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toHashPerSecond(value: number, unit: HashUnit): number {
  return value * HASH_UNIT_MULTIPLIERS[unit]
}

/**
 * Core mining math:
 *
 *   blocksPerDay   = 86400 / blockTime
 *   networkHashHs  = difficulty * 2^32 / blockTime  (SHA-256 / Ethash approximation)
 *   minerShare     = minerHashHs / networkHashHs
 *   coinsPerDay    = blocksPerDay * blockReward * minerShare
 */
function calculate(
  hashRate: number,
  hashUnit: HashUnit,
  powerW: number,
  electricityRate: number,
  difficulty: number,
  blockReward: number,
  coinPrice: number,
  blockTime: number,
): MiningResults {
  const minerHashHs   = toHashPerSecond(hashRate, hashUnit)
  // Standard difficulty-to-hashrate conversion (works for both BTC SHA-256 and ETH ethash)
  const networkHashHs = (difficulty * Math.pow(2, 32)) / blockTime
  const blocksPerDay  = 86400 / blockTime
  const minerShare    = minerHashHs / networkHashHs

  const dailyCoins    = blocksPerDay * blockReward * minerShare
  const monthlyCoins  = dailyCoins * 30
  const yearlyCoins   = dailyCoins * 365

  const dailyRevenue   = dailyCoins  * coinPrice
  const monthlyRevenue = monthlyCoins * coinPrice
  const yearlyRevenue  = yearlyCoins  * coinPrice

  // Power cost: kWh = Watts / 1000 * hours
  const dailyKwh       = (powerW / 1000) * 24
  const dailyPowerCost = dailyKwh * electricityRate
  const monthlyPowerCost = dailyPowerCost * 30
  const yearlyPowerCost  = dailyPowerCost * 365

  const dailyProfit   = dailyRevenue   - dailyPowerCost
  const monthlyProfit = monthlyRevenue - monthlyPowerCost
  const yearlyProfit  = yearlyRevenue  - yearlyPowerCost

  // Break-even electricity cost ($/kWh) at which daily profit = 0
  // dailyRevenue = dailyKwh * breakEven  →  breakEven = dailyRevenue / dailyKwh
  const breakEvenElectricity = dailyKwh > 0 ? dailyRevenue / dailyKwh : 0

  return {
    dailyCoins, monthlyCoins, yearlyCoins,
    dailyRevenue, monthlyRevenue, yearlyRevenue,
    dailyPowerCost, monthlyPowerCost, yearlyPowerCost,
    dailyProfit, monthlyProfit, yearlyProfit,
    breakEvenElectricity,
  }
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtCoin(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n) < 0.00001) return n.toExponential(4)
  return n.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProfitRow({
  label,
  coins,
  revenue,
  powerCost,
  profit,
  coinSymbol,
}: {
  label: string
  coins: number
  revenue: number
  powerCost: number
  profit: number
  coinSymbol: string
}) {
  const isProfit = profit >= 0
  return (
    <div className="grid grid-cols-4 gap-3 py-3 border-b border-border/50 last:border-0 text-sm tabular-nums">
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-right">
        <div className="font-medium text-foreground">{fmtCoin(coins)}</div>
        <div className="text-xs text-muted-foreground">{coinSymbol}</div>
      </div>
      <div className="text-right">
        <div className="font-medium text-foreground">${fmt(revenue)}</div>
        <div className="text-xs text-destructive">−${fmt(powerCost)} pwr</div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${isProfit ? 'text-success' : 'text-destructive'}`}>
          {isProfit ? '+' : ''}${fmt(profit)}
        </div>
        <div className="text-xs text-muted-foreground">{isProfit ? 'profit' : 'loss'}</div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HashRateCalculatorPage() {
  // Inputs
  const [hashRate,         setHashRate]         = useState('100')
  const [hashUnit,         setHashUnit]         = useState<HashUnit>('TH/s')
  const [powerW,           setPowerW]           = useState('3250')
  const [electricityRate,  setElectricityRate]  = useState('0.12')
  const [selectedCoin,     setSelectedCoin]     = useState<CoinId>('bitcoin')
  const [difficulty,       setDifficulty]       = useState('83148355189239')
  const [blockReward,      setBlockReward]      = useState('3.125')
  const [coinPrice,        setCoinPrice]        = useState('67000')

  // State
  const [results,  setResults]  = useState<MiningResults | null>(null)
  const [hasError, setHasError] = useState(false)

  const coinMeta = COIN_OPTIONS.find(c => c.id === selectedCoin)!
  const coinSymbol = selectedCoin === 'bitcoin' ? 'BTC' : 'ETH'

  // Prefill sensible defaults when the coin changes
  const handleCoinChange = useCallback((id: CoinId) => {
    setSelectedCoin(id)
    setResults(null)
    if (id === 'bitcoin') {
      setDifficulty('83148355189239')
      setBlockReward('3.125')
      setHashUnit('TH/s')
      setHashRate('100')
      setPowerW('3250')
    } else {
      setDifficulty('17592186044416') // approximate Ethereum classic-era value
      setBlockReward('2')
      setHashUnit('GH/s')
      setHashRate('500')
      setPowerW('1200')
    }
  }, [])

  const handleCalculate = () => {
    const hr  = parseFloat(hashRate)
    const pw  = parseFloat(powerW)
    const er  = parseFloat(electricityRate)
    const dif = parseFloat(difficulty)
    const br  = parseFloat(blockReward)
    const cp  = parseFloat(coinPrice)

    if (
      isNaN(hr) || hr <= 0 ||
      isNaN(pw) || pw < 0  ||
      isNaN(er) || er < 0  ||
      isNaN(dif) || dif <= 0 ||
      isNaN(br) || br <= 0 ||
      isNaN(cp) || cp <= 0
    ) {
      setHasError(true)
      setResults(null)
      return
    }

    setHasError(false)
    const res = calculate(hr, hashUnit, pw, er, dif, br, cp, coinMeta.blockTime)
    setResults(res)
  }

  const handleReset = () => {
    setResults(null)
    setHasError(false)
    handleCoinChange('bitcoin')
    setElectricityRate('0.12')
    setCoinPrice('67000')
  }

  return (
    <ToolLayout
      title="Hash Rate Calculator"
      description="Estimate mining profitability for Bitcoin and Ethereum. Enter your rig's hash rate, power draw, and local electricity cost to see projected earnings."
      category="Crypto Tools"
      categoryHref="/crypto-tools"
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Engagement */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        {/* ── Inputs ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-4 text-accent" />
              Rig &amp; Network Parameters
            </CardTitle>
            <CardDescription>
              Set your hardware specs and current network conditions for the selected coin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Coin selector */}
            <div className="space-y-1.5">
              <Label htmlFor="coin-select">Coin</Label>
              <Select value={selectedCoin} onValueChange={(v) => handleCoinChange(v as CoinId)}>
                <SelectTrigger id="coin-select" className="w-full sm:w-64">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {COIN_OPTIONS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hash rate */}
            <div className="space-y-1.5">
              <Label htmlFor="hash-rate">Hash Rate</Label>
              <div className="flex gap-2">
                <Input
                  id="hash-rate"
                  type="number"
                  min="0"
                  step="any"
                  value={hashRate}
                  onChange={e => setHashRate(e.target.value)}
                  className="flex-1"
                  placeholder="e.g. 100"
                />
                <Select value={hashUnit} onValueChange={(v) => setHashUnit(v as HashUnit)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(HASH_UNIT_MULTIPLIERS) as HashUnit[]).map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Power + electricity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="power-w">Power Consumption (Watts)</Label>
                <Input
                  id="power-w"
                  type="number"
                  min="0"
                  step="1"
                  value={powerW}
                  onChange={e => setPowerW(e.target.value)}
                  placeholder="e.g. 3250"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="electricity">Electricity Cost ($/kWh)</Label>
                <Input
                  id="electricity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={electricityRate}
                  onChange={e => setElectricityRate(e.target.value)}
                  placeholder="e.g. 0.12"
                />
              </div>
            </div>

            {/* Network + economics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Network Difficulty</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  step="any"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  placeholder="e.g. 83148355189239"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="block-reward">Block Reward ({coinSymbol}/block)</Label>
                <Input
                  id="block-reward"
                  type="number"
                  min="0"
                  step="any"
                  value={blockReward}
                  onChange={e => setBlockReward(e.target.value)}
                  placeholder="e.g. 3.125"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coin-price">Coin Price ($/coin)</Label>
                <Input
                  id="coin-price"
                  type="number"
                  min="0"
                  step="any"
                  value={coinPrice}
                  onChange={e => setCoinPrice(e.target.value)}
                  placeholder="e.g. 67000"
                />
              </div>
            </div>

            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please fill in all fields with valid positive numbers before calculating.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleCalculate} className="flex-1 sm:flex-none sm:w-44">
                <Calculator className="size-4" />
                Calculate
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* ── Results ── */}
        {results && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Daily */}
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">Daily</Badge>
                  </div>
                  <div className="space-y-1 tabular-nums">
                    <div className="text-2xl font-bold font-serif leading-none">
                      <span className={results.dailyProfit >= 0 ? 'text-success' : 'text-destructive'}>
                        {results.dailyProfit >= 0 ? '+' : ''}${fmt(results.dailyProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">net profit / loss</div>
                    <div className="pt-2 space-y-0.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">${fmt(results.dailyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Power cost</span>
                        <span className="font-medium text-destructive">−${fmt(results.dailyPowerCost)}</span>
                      </div>
                      <div className="flex justify-between pt-0.5 border-t border-border/50">
                        <span className="text-muted-foreground">Coins mined</span>
                        <span className="font-medium">{fmtCoin(results.dailyCoins)} {coinSymbol}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly */}
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">Monthly</Badge>
                  </div>
                  <div className="space-y-1 tabular-nums">
                    <div className="text-2xl font-bold font-serif leading-none">
                      <span className={results.monthlyProfit >= 0 ? 'text-success' : 'text-destructive'}>
                        {results.monthlyProfit >= 0 ? '+' : ''}${fmt(results.monthlyProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">net profit / loss</div>
                    <div className="pt-2 space-y-0.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">${fmt(results.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Power cost</span>
                        <span className="font-medium text-destructive">−${fmt(results.monthlyPowerCost)}</span>
                      </div>
                      <div className="flex justify-between pt-0.5 border-t border-border/50">
                        <span className="text-muted-foreground">Coins mined</span>
                        <span className="font-medium">{fmtCoin(results.monthlyCoins)} {coinSymbol}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yearly */}
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">Yearly</Badge>
                  </div>
                  <div className="space-y-1 tabular-nums">
                    <div className="text-2xl font-bold font-serif leading-none">
                      <span className={results.yearlyProfit >= 0 ? 'text-success' : 'text-destructive'}>
                        {results.yearlyProfit >= 0 ? '+' : ''}${fmt(results.yearlyProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">net profit / loss</div>
                    <div className="pt-2 space-y-0.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">${fmt(results.yearlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Power cost</span>
                        <span className="font-medium text-destructive">−${fmt(results.yearlyPowerCost)}</span>
                      </div>
                      <div className="flex justify-between pt-0.5 border-t border-border/50">
                        <span className="text-muted-foreground">Coins mined</span>
                        <span className="font-medium">{fmtCoin(results.yearlyCoins)} {coinSymbol}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Detailed breakdown table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.dailyProfit >= 0
                    ? <TrendingUp className="size-4 text-success" />
                    : <TrendingDown className="size-4 text-destructive" />
                  }
                  Full Breakdown
                </CardTitle>
                <CardDescription>Coins mined, gross revenue, power cost, and net result per period.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[420px]">
                    {/* Header row */}
                    <div className="grid grid-cols-4 gap-3 pb-2 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div>Period</div>
                      <div className="text-right">Coins</div>
                      <div className="text-right">Revenue / Power</div>
                      <div className="text-right">Net Profit</div>
                    </div>
                    <ProfitRow
                      label="Daily"
                      coins={results.dailyCoins}
                      revenue={results.dailyRevenue}
                      powerCost={results.dailyPowerCost}
                      profit={results.dailyProfit}
                      coinSymbol={coinSymbol}
                    />
                    <ProfitRow
                      label="Monthly"
                      coins={results.monthlyCoins}
                      revenue={results.monthlyRevenue}
                      powerCost={results.monthlyPowerCost}
                      profit={results.monthlyProfit}
                      coinSymbol={coinSymbol}
                    />
                    <ProfitRow
                      label="Yearly"
                      coins={results.yearlyCoins}
                      revenue={results.yearlyRevenue}
                      powerCost={results.yearlyPowerCost}
                      profit={results.yearlyProfit}
                      coinSymbol={coinSymbol}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Break-even card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-4 text-warning" />
                  Break-Even Electricity Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Your mining becomes profitable when your electricity cost is at or below:
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      At your current rate of <strong>${fmt(parseFloat(electricityRate), 4)}/kWh</strong>{' '}
                      {parseFloat(electricityRate) <= results.breakEvenElectricity
                        ? 'you are operating profitably.'
                        : 'you are operating at a loss.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold font-serif tabular-nums">
                      <span className={
                        parseFloat(electricityRate) <= results.breakEvenElectricity
                          ? 'text-success'
                          : 'text-destructive'
                      }>
                        ${fmt(results.breakEvenElectricity, 4)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">per kWh</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </>
        )}

        {/* Info note */}
        <Alert>
          <DollarSign className="size-4" />
          <AlertDescription>
            <strong>Estimates only.</strong> Results assume stable difficulty, constant coin price, and no mining pool fees. Real earnings vary with difficulty adjustments, price volatility, hardware downtime, and pool fees (typically 1–3%). Always verify current network difficulty and coin price from a live source before making investment decisions.
          </AlertDescription>
        </Alert>

      </div>
    </ToolLayout>
  )
}
