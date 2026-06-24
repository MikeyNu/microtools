import type { Metadata } from "next"
import { Globe, Search, Shield } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Network Tools - IP Lookup, DNS, Port Scanner | Micro Tools",
  description:
    "Free network tools including IP address lookup, DNS lookup, port scanner, and ping test. Professional networking utilities.",
}

const tools = [
  {
    title: "IP Address Lookup",
    description: "Get detailed information about any IP address including location and ISP",
    icon: Globe,
    href: "/network-tools/ip-lookup",
  },
  {
    title: "DNS Lookup",
    description: "Perform DNS queries and resolve domain names to IP addresses",
    icon: Search,
    href: "/network-tools/dns-lookup",
  },
  {
    title: "Port Scanner",
    description: "Scan for open ports on any host or IP address",
    icon: Shield,
    href: "/network-tools/port-scanner",
  },
]

export default function NetworkToolsPage() {
  return (
    <CategoryLayout
      title="Network Tools"
      description="IP lookup, DNS resolution, and port scanning for network diagnostics and debugging."
      icon={Globe}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
