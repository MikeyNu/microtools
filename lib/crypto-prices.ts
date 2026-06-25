export interface CryptoAsset {
  symbol: string
  id: string
  name: string
}

export interface CryptoPrice {
  symbol: string
  name: string
  usd: number
  change24h: number | null
  lastUpdated: number | null
}

export const CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: 'BTC', id: 'bitcoin', name: 'Bitcoin' },
  { symbol: 'ETH', id: 'ethereum', name: 'Ethereum' },
  { symbol: 'USDT', id: 'tether', name: 'Tether' },
  { symbol: 'BNB', id: 'binancecoin', name: 'BNB' },
  { symbol: 'SOL', id: 'solana', name: 'Solana' },
  { symbol: 'XRP', id: 'ripple', name: 'XRP' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin' },
  { symbol: 'ADA', id: 'cardano', name: 'Cardano' },
  { symbol: 'AVAX', id: 'avalanche-2', name: 'Avalanche' },
  { symbol: 'DOT', id: 'polkadot', name: 'Polkadot' },
]

export async function fetchCryptoPrices(): Promise<Record<string, CryptoPrice>> {
  const ids = CRYPTO_ASSETS.map((asset) => asset.id).join(',')
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
    { cache: 'no-store' }
  )

  if (!response.ok) throw new Error(`CoinGecko returned ${response.status}`)
  const data = await response.json()

  return CRYPTO_ASSETS.reduce<Record<string, CryptoPrice>>((acc, asset) => {
    const row = data[asset.id]
    if (row?.usd) {
      acc[asset.symbol] = {
        symbol: asset.symbol,
        name: asset.name,
        usd: row.usd,
        change24h: typeof row.usd_24h_change === 'number' ? row.usd_24h_change : null,
        lastUpdated: typeof row.last_updated_at === 'number' ? row.last_updated_at : null,
      }
    }
    return acc
  }, {})
}
