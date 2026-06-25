import type { Metadata } from "next"
import { Lock, Key, Shield, Fingerprint } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Security Tools - Free Online Security & Privacy Tools | Micro Tools",
  description:
    "Comprehensive collection of free online security tools including password strength checker, two-factor authentication generator, SSL certificate checker, and more security utilities.",
}

const tools = [
  {
    title: "Password Strength Checker",
    description: "Analyze password strength and get detailed security recommendations",
    icon: Lock,
    href: "/security-tools/password-checker",
  },
  {
    title: "Two-Factor Auth Generator",
    description: "Generate TOTP codes and QR codes for two-factor authentication setup",
    icon: Key,
    href: "/security-tools/2fa-generator",
  },
  {
    title: "SSL Certificate Checker",
    description: "Verify SSL certificates and check security status, expiry, and chain",
    icon: Shield,
    href: "/security-tools/ssl-checker",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and other cryptographic hash values",
    icon: Fingerprint,
    href: "/security-tools/hash-generator",
  },
  {
    title: "Password Generator",
    description: "Generate high-entropy passwords with cryptographic browser randomness",
    icon: Key,
    href: "/security-tools/password-generator",
  },
]

export default function SecurityToolsPage() {
  return (
    <CategoryLayout
      title="Security Tools"
      description="Password analysis, 2FA generation, SSL checking, and cryptographic hashing. All runs locally."
      icon={Shield}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
