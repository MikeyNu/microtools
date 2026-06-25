export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  flag?: string
}

export interface CurrencyRateResponse {
  base: string
  rates: Record<string, number>
  lastUpdated: string
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'US' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR', flag: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: 'GBP', flag: 'GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY', flag: 'JP' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: 'CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: 'AU' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: 'CH' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CNY', flag: 'CN' },
  { code: 'INR', name: 'Indian Rupee', symbol: 'INR', flag: 'IN' },
  { code: 'KRW', name: 'South Korean Won', symbol: 'KRW', flag: 'KR' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: 'BR' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: 'MX' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: 'SG' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: 'NZ' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: 'SE' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: 'NO' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: 'DK' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'PLN', flag: 'PL' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: 'ZA' },
]

export async function fetchCurrencyRates(base: string): Promise<CurrencyRateResponse> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`Exchange-rate API returned ${response.status}`)

  const data = await response.json()
  if (data.result !== 'success' || !data.rates) {
    throw new Error(data['error-type'] || 'Exchange-rate API did not return rates')
  }

  return {
    base: data.base_code || base,
    rates: data.rates,
    lastUpdated: data.time_last_update_utc || new Date().toUTCString(),
  }
}

export function formatCurrencyAmount(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: Math.abs(amount) >= 1 ? 2 : 6,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${code}`
  }
}
