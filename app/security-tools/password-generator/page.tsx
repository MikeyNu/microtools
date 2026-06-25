"use client"

import { useMemo, useState } from "react"
import { Copy, KeyRound, RefreshCw, ShieldCheck } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

type CharacterSet = {
  key: keyof Options
  label: string
  chars: string
}

type Options = {
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
  requireEachType: boolean
}

const SETS: CharacterSet[] = [
  { key: "lowercase", label: "Lowercase", chars: "abcdefghijklmnopqrstuvwxyz" },
  { key: "uppercase", label: "Uppercase", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { key: "numbers", label: "Numbers", chars: "0123456789" },
  { key: "symbols", label: "Symbols", chars: "!@#$%^&*()-_=+[]{};:,.?/|~" },
]

const SIMILAR = /[il1Lo0O]/g
const AMBIGUOUS = /[{}[\]()/\\'"`,;:.<>]/g

function randomInt(max: number) {
  if (max <= 0) throw new Error("Invalid random range.")
  const array = new Uint32Array(1)
  const limit = Math.floor(0xffffffff / max) * max

  do {
    crypto.getRandomValues(array)
  } while (array[0] >= limit)

  return array[0] % max
}

function shuffle(chars: string[]) {
  const copy = [...chars]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function uniqueChars(value: string) {
  return Array.from(new Set(value.split(""))).join("")
}

function buildSets(options: Options) {
  return SETS.filter((set) => options[set.key]).map((set) => {
    let chars = set.chars
    if (options.excludeSimilar) chars = chars.replace(SIMILAR, "")
    if (options.excludeAmbiguous) chars = chars.replace(AMBIGUOUS, "")
    return { ...set, chars: uniqueChars(chars) }
  }).filter((set) => set.chars.length > 0)
}

function estimateEntropy(length: number, poolSize: number) {
  return Math.round(length * Math.log2(Math.max(poolSize, 1)))
}

function strengthFromEntropy(entropy: number) {
  if (entropy < 50) return { label: "Weak", value: 30 }
  if (entropy < 75) return { label: "Fair", value: 50 }
  if (entropy < 100) return { label: "Strong", value: 75 }
  return { label: "Very Strong", value: 100 }
}

function generateSecurePassword(length: number, options: Options) {
  const activeSets = buildSets(options)
  if (!activeSets.length) throw new Error("Select at least one character type.")
  if (options.requireEachType && length < activeSets.length) {
    throw new Error("Length must be at least the number of required character types.")
  }

  const pool = activeSets.map((set) => set.chars).join("")
  const output: string[] = []

  if (options.requireEachType) {
    for (const set of activeSets) {
      output.push(set.chars[randomInt(set.chars.length)])
    }
  }

  while (output.length < length) {
    output.push(pool[randomInt(pool.length)])
  }

  return shuffle(output).join("")
}

export default function SecurityPasswordGeneratorPage() {
  const [length, setLength] = useState([20])
  const [options, setOptions] = useState<Options>({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
    requireEachType: true,
  })
  const [passwords, setPasswords] = useState<string[]>([])
  const [error, setError] = useState("")
  const { toast } = useToast()

  const relatedTools = [
    { name: "Password Strength Checker", href: "/security-tools/password-checker" },
    { name: "Two-Factor Auth Generator", href: "/security-tools/2fa-generator" },
    { name: "Hash Generator", href: "/security-tools/hash-generator" },
    { name: "SSL Certificate Checker", href: "/security-tools/ssl-checker" },
  ]

  const activeSets = useMemo(() => buildSets(options), [options])
  const poolSize = activeSets.reduce((sum, set) => sum + set.chars.length, 0)
  const entropy = estimateEntropy(length[0], poolSize)
  const strength = strengthFromEntropy(entropy)

  const updateOption = (key: keyof Options, value: boolean) => {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  const generate = () => {
    setError("")

    try {
      const next = Array.from({ length: 5 }, () => generateSecurePassword(length[0], options))
      setPasswords(next)
      toast({ title: "Passwords generated" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate passwords."
      setPasswords([])
      setError(message)
      toast({ title: "Generator error", description: message, variant: "destructive" })
    }
  }

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast({ title: "Password copied" })
  }

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate high-entropy passwords locally with cryptographic browser randomness."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent" />
              Password Generator
            </CardTitle>
            <CardDescription>All generation happens in your browser using the Web Crypto API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Password Length: {length[0]}</Label>
                <Badge variant="secondary">{entropy} bits entropy</Badge>
              </div>
              <Slider value={length} onValueChange={setLength} min={8} max={128} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8</span>
                <span>128</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SETS.map((set) => (
                <label key={set.key} className="flex items-center gap-3 rounded-sm border border-border/80 bg-card/75 p-3">
                  <Checkbox checked={options[set.key]} onCheckedChange={(checked) => updateOption(set.key, checked === true)} />
                  <span className="text-sm font-medium">{set.label}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 rounded-sm border border-border/80 bg-card/75 p-3">
                <Checkbox
                  checked={options.excludeSimilar}
                  onCheckedChange={(checked) => updateOption("excludeSimilar", checked === true)}
                />
                <span className="text-sm font-medium">Exclude similar characters</span>
              </label>
              <label className="flex items-center gap-3 rounded-sm border border-border/80 bg-card/75 p-3">
                <Checkbox
                  checked={options.excludeAmbiguous}
                  onCheckedChange={(checked) => updateOption("excludeAmbiguous", checked === true)}
                />
                <span className="text-sm font-medium">Exclude punctuation that is easy to misread</span>
              </label>
              <label className="flex items-center gap-3 rounded-sm border border-border/80 bg-card/75 p-3 sm:col-span-2">
                <Checkbox
                  checked={options.requireEachType}
                  onCheckedChange={(checked) => updateOption("requireEachType", checked === true)}
                />
                <span className="text-sm font-medium">Require at least one character from each selected type</span>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Estimated Strength</Label>
                <span className="text-sm font-medium">{strength.label}</span>
              </div>
              <Progress value={strength.value} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={generate} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Passwords
            </Button>
          </CardContent>
        </Card>

        {!!passwords.length && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Generated Passwords
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {passwords.map((password, index) => (
                <div key={`${password}-${index}`} className="flex flex-col gap-2 sm:flex-row">
                  <Input value={password} readOnly className="font-mono" />
                  <Button variant="outline" onClick={() => copy(password)} className="sm:w-28">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
