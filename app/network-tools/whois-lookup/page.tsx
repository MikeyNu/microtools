"use client"

import { useMemo, useState } from "react"
import { Copy, Globe, RefreshCw, Search } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type RdapEvent = {
  eventAction?: string
  eventDate?: string
}

type RdapEntity = {
  roles?: string[]
  vcardArray?: [string, Array<[string, Record<string, unknown>, string, string]>]
}

type RdapResponse = {
  objectClassName?: string
  handle?: string
  ldhName?: string
  unicodeName?: string
  status?: string[]
  events?: RdapEvent[]
  entities?: RdapEntity[]
  nameservers?: Array<{ ldhName?: string; unicodeName?: string }>
  notices?: Array<{ title?: string; description?: string[] }>
  links?: Array<{ rel?: string; href?: string }>
}

function normalizeDomain(input: string) {
  const trimmed = input.trim()
  if (!trimmed) throw new Error("Enter a domain name.")
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "").split(/[/?#]/)[0]
  const domain = withoutProtocol.toLowerCase().replace(/\.$/, "")

  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/i.test(domain)) {
    throw new Error("Enter a valid domain such as example.com.")
  }

  return domain
}

function getEvent(events: RdapEvent[] | undefined, names: string[]) {
  return events?.find((event) => event.eventAction && names.includes(event.eventAction.toLowerCase()))?.eventDate
}

function formatDate(value?: string) {
  if (!value) return "Not provided"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getEntityName(entity: RdapEntity) {
  const entries = entity.vcardArray?.[1] ?? []
  const fn = entries.find((entry) => entry[0] === "fn")?.[3]
  const org = entries.find((entry) => entry[0] === "org")?.[3]
  return fn || org || "Unnamed entity"
}

export default function WhoisLookupPage() {
  const [domain, setDomain] = useState("example.com")
  const [result, setResult] = useState<RdapResponse | null>(null)
  const [rawJson, setRawJson] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const relatedTools = [
    { name: "DNS Lookup", href: "/network-tools/dns-lookup" },
    { name: "IP Address Lookup", href: "/network-tools/ip-lookup" },
    { name: "Ping Test", href: "/network-tools/ping-test" },
    { name: "Port Scanner", href: "/network-tools/port-scanner" },
  ]

  const summary = useMemo(() => {
    if (!result) return null

    const registrar = result.entities?.find((entity) => entity.roles?.includes("registrar"))
    const registrant = result.entities?.find((entity) => entity.roles?.includes("registrant"))

    return {
      domain: result.ldhName || result.unicodeName || domain,
      handle: result.handle || "Not provided",
      registrar: registrar ? getEntityName(registrar) : "Not provided",
      registrant: registrant ? getEntityName(registrant) : "Not provided",
      registered: formatDate(getEvent(result.events, ["registration"])),
      updated: formatDate(getEvent(result.events, ["last changed", "last update of rdap database"])),
      expires: formatDate(getEvent(result.events, ["expiration"])),
      statuses: result.status ?? [],
      nameservers: result.nameservers?.map((server) => server.ldhName || server.unicodeName).filter(Boolean) ?? [],
    }
  }, [domain, result])

  const lookup = async () => {
    setError("")

    let normalized: string
    try {
      normalized = normalizeDomain(domain)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid domain."
      setError(message)
      toast({ title: "Invalid domain", description: message, variant: "destructive" })
      return
    }

    setLoading(true)
    setResult(null)
    setRawJson("")

    try {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(normalized)}`, {
        headers: { accept: "application/rdap+json, application/json" },
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error("No RDAP record was found for this domain.")
        throw new Error(`RDAP lookup failed with status ${response.status}.`)
      }

      const data = (await response.json()) as RdapResponse
      setDomain(normalized)
      setResult(data)
      setRawJson(JSON.stringify(data, null, 2))
      toast({ title: "Lookup complete" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete the lookup."
      setError(message)
      toast({ title: "Lookup failed", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast({ title: `${label} copied` })
  }

  return (
    <ToolLayout
      title="Whois Lookup"
      description="Look up domain registration details through RDAP, the structured modern replacement for public Whois data."
      category="Network Tools"
      categoryHref="/network-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Domain Lookup
            </CardTitle>
            <CardDescription>Use a domain name, with or without protocol.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="example.com"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={lookup} disabled={loading} className="sm:min-w-36">
                <RefreshCw className="mr-2 h-4 w-4" />
                {loading ? "Looking up..." : "Lookup"}
              </Button>
              <Button variant="outline" onClick={() => copy(rawJson, "RDAP JSON")} disabled={!rawJson}>
                <Copy className="mr-2 h-4 w-4" />
                Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" />
                    {summary.domain}
                  </CardTitle>
                  <Badge variant="secondary">{result?.objectClassName ?? "domain"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  ["Registry Handle", summary.handle],
                  ["Registrar", summary.registrar],
                  ["Registrant", summary.registrant],
                  ["Registered", summary.registered],
                  ["Updated", summary.updated],
                  ["Expires", summary.expires],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-sm border border-border/80 bg-card/75 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 break-words font-medium">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {summary.statuses.length ? (
                    summary.statuses.map((status) => (
                      <Badge key={status} variant="outline">
                        {status}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No status values returned.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nameservers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {summary.nameservers.length ? (
                    summary.nameservers.map((server) => (
                      <div key={server} className="rounded-sm border border-border/80 bg-card/75 p-2 font-mono text-sm">
                        {server}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No nameservers returned.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Raw RDAP JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={rawJson} readOnly className="min-h-80 font-mono text-xs" />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
