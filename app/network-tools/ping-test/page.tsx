"use client"

import { useMemo, useState } from "react"
import { Activity, Copy, RefreshCw, Timer, WifiOff } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type PingResult = {
  sequence: number
  latency: number | null
  status: "ok" | "timeout" | "error"
  message: string
}

function normalizeTarget(value: string) {
  const trimmed = value.trim()
  if (!trimmed) throw new Error("Enter a host or URL.")
  if (/^(javascript|data|file):/i.test(trimmed)) throw new Error("Only HTTP and HTTPS targets are supported.")

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(candidate)

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS targets are supported.")
  }

  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new Error("Enter a full domain, IP address, or URL.")
  }

  return url
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[index]
}

async function probe(url: URL, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const probeUrl = new URL(url.toString())
  probeUrl.searchParams.set("__microtools_ping", `${Date.now()}-${Math.random().toString(16).slice(2)}`)
  const start = performance.now()

  try {
    await fetch(probeUrl.toString(), {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    })
    return Math.round(performance.now() - start)
  } finally {
    window.clearTimeout(timeout)
  }
}

export default function PingTestPage() {
  const [target, setTarget] = useState("example.com")
  const [count, setCount] = useState("5")
  const [timeoutMs, setTimeoutMs] = useState("5000")
  const [results, setResults] = useState<PingResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const relatedTools = [
    { name: "IP Address Lookup", href: "/network-tools/ip-lookup" },
    { name: "DNS Lookup", href: "/network-tools/dns-lookup" },
    { name: "Port Scanner", href: "/network-tools/port-scanner" },
    { name: "Whois Lookup", href: "/network-tools/whois-lookup" },
  ]

  const stats = useMemo(() => {
    const successful = results.filter((result) => result.status === "ok" && result.latency !== null)
    const latencies = successful.map((result) => result.latency as number)
    const sent = results.length
    const received = successful.length
    const loss = sent ? Math.round(((sent - received) / sent) * 100) : 0
    const average = latencies.length
      ? Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length)
      : 0

    return {
      sent,
      received,
      loss,
      min: latencies.length ? Math.min(...latencies) : 0,
      max: latencies.length ? Math.max(...latencies) : 0,
      average,
      p95: Math.round(percentile(latencies, 95)),
    }
  }, [results])

  const runPing = async () => {
    setError("")

    let url: URL
    try {
      url = normalizeTarget(target)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid target."
      setError(message)
      toast({ title: "Invalid target", description: message, variant: "destructive" })
      return
    }

    const probeCount = Number.parseInt(count, 10)
    const timeout = Number.parseInt(timeoutMs, 10)

    if (!Number.isInteger(probeCount) || probeCount < 1 || probeCount > 20) {
      setError("Probe count must be between 1 and 20.")
      return
    }

    if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 15000) {
      setError("Timeout must be between 1 and 15 seconds.")
      return
    }

    setRunning(true)
    setResults([])
    setProgress(0)

    const nextResults: PingResult[] = []
    for (let i = 1; i <= probeCount; i++) {
      try {
        const latency = await probe(url, timeout)
        nextResults.push({
          sequence: i,
          latency,
          status: "ok",
          message: `Response observed from ${url.hostname}`,
        })
      } catch (err) {
        const timedOut = err instanceof DOMException && err.name === "AbortError"
        nextResults.push({
          sequence: i,
          latency: null,
          status: timedOut ? "timeout" : "error",
          message: timedOut ? `Timed out after ${timeout} ms` : "Request failed or was blocked by the browser.",
        })
      }

      setResults([...nextResults])
      setProgress(Math.round((i / probeCount) * 100))
      if (i < probeCount) await new Promise((resolve) => window.setTimeout(resolve, 250))
    }

    setRunning(false)
    toast({ title: "Ping test complete" })
  }

  const copyResults = async () => {
    const text = [
      `HTTP ping: ${target}`,
      `Sent: ${stats.sent}, Received: ${stats.received}, Loss: ${stats.loss}%`,
      `Min/Avg/Max/P95: ${stats.min}/${stats.average}/${stats.max}/${stats.p95} ms`,
      "",
      ...results.map((result) =>
        `${result.sequence}. ${result.status.toUpperCase()} ${
          result.latency === null ? "-" : `${result.latency} ms`
        } - ${result.message}`
      ),
    ].join("\n")

    await navigator.clipboard.writeText(text)
    toast({ title: "Results copied" })
  }

  return (
    <ToolLayout
      title="Ping Test"
      description="Measure browser-observed HTTP latency to a host or URL with timeouts and packet-loss style summaries."
      category="Network Tools"
      categoryHref="/network-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Browsers cannot send raw ICMP packets, so this tool measures HTTP request latency from your browser.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-accent" />
              Target
            </CardTitle>
            <CardDescription>Use a domain, IP address, or full HTTP/HTTPS URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_140px_160px]">
              <div className="space-y-2">
                <Label htmlFor="target">Host or URL</Label>
                <Input
                  id="target"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Probes</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["3", "5", "10", "20"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeout</Label>
                <Select value={timeoutMs} onValueChange={setTimeoutMs}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000">3 seconds</SelectItem>
                    <SelectItem value="5000">5 seconds</SelectItem>
                    <SelectItem value="10000">10 seconds</SelectItem>
                    <SelectItem value="15000">15 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {running && <Progress value={progress} />}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={runPing} disabled={running} className="sm:min-w-36">
                <RefreshCw className="mr-2 h-4 w-4" />
                {running ? "Testing..." : "Run Test"}
              </Button>
              <Button variant="outline" onClick={copyResults} disabled={!results.length}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {!!results.length && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ["Sent", stats.sent],
                ["Received", stats.received],
                ["Loss", `${stats.loss}%`],
                ["Average", `${stats.average} ms`],
                ["Minimum", `${stats.min} ms`],
                ["P95", `${stats.p95} ms`],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-serif text-2xl font-semibold">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Probe Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.sequence}
                    className="flex flex-col gap-2 rounded-sm border border-border/80 bg-card/75 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">Probe {result.sequence}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.status === "ok" ? "secondary" : "destructive"}>
                        {result.status}
                      </Badge>
                      <span className="font-mono text-sm">
                        {result.latency === null ? "-" : `${result.latency} ms`}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
