'use client'

import { useState, useCallback } from 'react'
import {
  Wallet,
  Key,
  ShieldAlert,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock,
  Hash,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

// ─── types ───────────────────────────────────────────────────────────────────

type Coin = 'bitcoin' | 'ethereum'

interface WalletData {
  coin: Coin
  privateKeyHex: string
  publicKeyHex: string
  address: string
}

// ─── deterministic helpers (browser-safe, demo only) ─────────────────────────

/** Convert a Uint8Array to a lowercase hex string */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * A lightweight, browser-only digest that resembles SHA-256 but is NOT
 * cryptographically secure.  It is used purely to derive the "public key"
 * and "address" demo values from the private-key bytes so the UI feels
 * realistic without shipping a full elliptic-curve library.
 *
 * The algorithm: two rounds of a 32-word Merkle–Damgård style mix using
 * prime-based constants, then a finalisation fold.  Output: 32 bytes.
 */
function demoDigest(input: Uint8Array): Uint8Array {
  // Seed constants: fractional parts of primes (similar spirit to SHA-256)
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  ]

  // Initial hash state
  let h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]

  // Pad input into 64-byte chunks
  const padded = new Uint8Array(Math.ceil((input.length + 9) / 64) * 64)
  padded.set(input)
  padded[input.length] = 0x80
  const bitLen = input.length * 8
  padded[padded.length - 4] = (bitLen >>> 24) & 0xff
  padded[padded.length - 3] = (bitLen >>> 16) & 0xff
  padded[padded.length - 2] = (bitLen >>> 8) & 0xff
  padded[padded.length - 1] = bitLen & 0xff

  const rot = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(64)
    for (let t = 0; t < 16; t++) {
      w[t] =
        (padded[i + t * 4] << 24) |
        (padded[i + t * 4 + 1] << 16) |
        (padded[i + t * 4 + 2] << 8) |
        padded[i + t * 4 + 3]
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rot(w[t - 15], 7) ^ rot(w[t - 15], 18) ^ (w[t - 15] >>> 3)
      const s1 = rot(w[t - 2], 17) ^ rot(w[t - 2], 19) ^ (w[t - 2] >>> 10)
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, hh] = h

    for (let t = 0; t < 32; t++) {
      const S1 = rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (hh + S1 + ch + K[t] + w[t]) >>> 0
      const S0 = rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0

      hh = g; g = f; f = e
      e = (d + temp1) >>> 0
      d = c; c = b; b = a
      a = (temp1 + temp2) >>> 0
    }

    h = [
      (h[0] + a) >>> 0, (h[1] + b) >>> 0,
      (h[2] + c) >>> 0, (h[3] + d) >>> 0,
      (h[4] + e) >>> 0, (h[5] + f) >>> 0,
      (h[6] + g) >>> 0, (h[7] + hh) >>> 0,
    ]
  }

  const out = new Uint8Array(32)
  h.forEach((word, i) => {
    out[i * 4]     = (word >>> 24) & 0xff
    out[i * 4 + 1] = (word >>> 16) & 0xff
    out[i * 4 + 2] = (word >>> 8) & 0xff
    out[i * 4 + 3] = word & 0xff
  })
  return out
}

/** Generate a wallet for display / educational purposes */
function generateWallet(coin: Coin): WalletData {
  // 1. Entropy: 32 cryptographically random bytes (the "private key")
  const privKeyBytes = new Uint8Array(32)
  crypto.getRandomValues(privKeyBytes)
  const privateKeyHex = toHex(privKeyBytes)

  // 2. Simplified "public key": double-digest of the private key bytes
  //    Real wallets use secp256k1 point multiplication — that requires an
  //    EC library we intentionally avoid here.
  const pubKeyBytes = demoDigest(demoDigest(privKeyBytes))
  const publicKeyHex =
    coin === 'bitcoin'
      ? '02' + toHex(pubKeyBytes.slice(0, 32))   // compressed-style prefix
      : '04' + toHex(pubKeyBytes)                 // uncompressed-style prefix

  // 3. Address: first 20 bytes of another digest round
  const addressBytes = demoDigest(pubKeyBytes).slice(0, 20)
  let address: string
  if (coin === 'bitcoin') {
    // P2PKH style: "1" + 20-byte hash (simplified — real encoding uses Base58Check)
    address = '1' + toHex(addressBytes)
  } else {
    // EIP-55 style: "0x" + 20-byte hex
    address = '0x' + toHex(addressBytes)
  }

  return { coin, privateKeyHex, publicKeyHex, address }
}

// ─── copy helper ─────────────────────────────────────────────────────────────

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

// ─── sub-components ──────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="shrink-0 p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Copy className={`h-3.5 w-3.5 ${copied ? 'text-success' : ''}`} />
    </button>
  )
}

function HexField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-start gap-2 bg-muted rounded-lg p-3">
        <code className="font-mono text-xs break-all flex-1 leading-relaxed text-foreground">
          {value}
        </code>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  )
}

// ─── flow diagram ─────────────────────────────────────────────────────────────

function FlowStep({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <span className="text-xs font-bold text-primary font-mono">{step}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

const tool = {
  id: 'wallet-generator',
  name: 'Crypto Wallet Demo',
  description:
    'Generate educational cryptocurrency keypair examples to understand how wallet creation works.',
  category: 'crypto-tools',
  url: '/crypto-tools/wallet-generator',
}

const relatedTools = [
  { name: 'Bitcoin Validator', href: '/crypto-tools/bitcoin-validator' },
  { name: 'Price Converter', href: '/crypto-tools/price-converter' },
  { name: 'Hash Generator', href: '/text-tools/hash-generator' },
]

export default function WalletGeneratorPage() {
  const [coin, setCoin] = useState<Coin>('bitcoin')
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showExplainer, setShowExplainer] = useState(false)

  const { trackToolStart, trackToolComplete } = useToolTracker(
    'Crypto Wallet Demo',
    'crypto-tools'
  )

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    trackToolStart()

    // Defer one tick so the button spin renders
    setTimeout(() => {
      const result = generateWallet(coin)
      setWallet(result)
      setIsGenerating(false)
      trackToolComplete()
    }, 80)
  }, [coin, trackToolStart, trackToolComplete])

  return (
    <ToolLayout
      title="Crypto Wallet Demo"
      description="Generate educational Bitcoin and Ethereum-style keypair examples to learn how wallet creation works."
      category="Crypto Tools"
      categoryHref="/crypto-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Engagement row */}
        <div className="flex justify-end gap-2">
          <FavoriteButton toolId={tool.id} />
          <ShareButton tool={tool} />
        </div>

        {/* Security warning — always visible, always first */}
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="space-y-1.5">
            <p className="font-semibold text-destructive">Educational use only — never use these keys for real funds.</p>
            <ul className="list-disc list-inside space-y-0.5 text-sm">
              <li>Never share or store a private key you intend to use.</li>
              <li>These keys are generated in your browser but use a simplified derivation, not production-grade elliptic-curve math.</li>
              <li>For real wallets, use a hardware wallet (Ledger, Trezor) or audited software (MetaMask, Bitcoin Core).</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Generator controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              Wallet Demo
            </CardTitle>
            <CardDescription>
              Select a cryptocurrency and click Generate. A fresh 32-byte private key is created
              using <code className="text-xs font-mono">crypto.getRandomValues()</code> — the same
              entropy source browsers use for secure tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coin-select">Cryptocurrency</Label>
              <Select
                value={coin}
                onValueChange={(v) => {
                  setCoin(v as Coin)
                  setWallet(null)
                }}
              >
                <SelectTrigger id="coin-select" className="w-48">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating…' : 'Generate Demo Keypair'}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {wallet && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-accent" />
                  Generated Keypair
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {wallet.coin === 'bitcoin' ? 'BTC-style demo' : 'ETH-style demo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Private key */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                    Private Key
                  </span>
                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5">Secret</Badge>
                </div>
                <div className="flex items-start gap-2 bg-muted rounded-lg p-3 border border-destructive/20">
                  <code className="font-mono text-xs break-all flex-1 leading-relaxed text-foreground">
                    {wallet.privateKeyHex}
                  </code>
                  <CopyButton value={wallet.privateKeyHex} label="private key" />
                </div>
                <p className="text-xs text-muted-foreground pl-0.5">
                  32 bytes of cryptographic randomness used as the educational private-key input.
                </p>
              </div>

              {/* Public key */}
              <HexField
                label="Public Key (demo derivation)"
                value={wallet.publicKeyHex}
                icon={<Hash className="h-3.5 w-3.5" />}
              />

              {/* Address */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Demo Address
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-muted rounded-lg p-3">
                  <code className="font-mono text-xs break-all flex-1 leading-relaxed text-foreground">
                    {wallet.address}
                  </code>
                  <CopyButton value={wallet.address} label="wallet address" />
                </div>
                <p className="text-xs text-muted-foreground pl-0.5">
                  Educational output only. This is not a valid production address for receiving funds.
                </p>
              </div>

            </CardContent>
          </Card>
        )}

        {/* How it works — collapsible */}
        <Card>
          <CardHeader className="pb-3">
            <button
              onClick={() => setShowExplainer((v) => !v)}
              className="flex items-center justify-between w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4 text-accent" />
                How Wallet Generation Works
              </CardTitle>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {showExplainer ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>
          </CardHeader>

          {showExplainer && (
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real crypto wallets follow this three-step derivation. This tool simulates the
                structure; actual production wallets use secp256k1 elliptic-curve math for step 2.
              </p>

              <div className="space-y-4">
                <FlowStep
                  step={1}
                  title="Entropy → Private Key"
                  description="A cryptographically secure random-number generator (CSPRNG) produces 32 bytes of entropy. In browsers this is crypto.getRandomValues(); on hardware wallets it comes from dedicated entropy hardware. This 256-bit number becomes the private key — the root of all wallet security."
                />
                <FlowStep
                  step={2}
                  title="Private Key → Public Key"
                  description="The private key is multiplied by a fixed generator point on the secp256k1 elliptic curve: pubKey = privKey × G. This one-way operation makes it computationally infeasible to reverse. The result is a 64-byte (uncompressed) or 32-byte (compressed) EC point."
                />
                <FlowStep
                  step={3}
                  title="Public Key → Address"
                  description="Bitcoin: RIPEMD-160(SHA-256(pubKey)), then Base58Check-encoded with a version byte. Ethereum: Keccak-256(pubKey), last 20 bytes, then mixed-case EIP-55 checksum applied. The address is what you share publicly to receive funds."
                />
              </div>

              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Why this demo differs from production:</strong> Step 2 here uses a
                  repeated hash digest instead of secp256k1 point multiplication, so the
                  public key and address shown are not mathematically valid Bitcoin or Ethereum
                  values. The entropy source (step 1) is genuine — 32 random bytes from your
                  browser — but the rest is illustrative only.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

      </div>
    </ToolLayout>
  )
}
