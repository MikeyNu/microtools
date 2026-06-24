import type { Metadata } from "next"
import { Link, QrCode, Code, FileCode, Zap } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Web Tools - Essential Utilities for Developers | Micro Tools",
  description:
    "Comprehensive collection of web development tools including URL shortener, QR code generator, Base64 encoder, JSON formatter, and more. Free online utilities for developers.",
}

const tools = [
  {
    title: "URL Shortener",
    description: "Create short, shareable links from long URLs with custom aliases and analytics tracking",
    icon: Link,
    href: "/web-tools/url-shortener",
  },
  {
    title: "QR Code Generator",
    description: "Generate customizable QR codes for text, URLs, WiFi, and contact information",
    icon: QrCode,
    href: "/web-tools/qr-generator",
  },
  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 strings with support for files and images",
    icon: Code,
    href: "/web-tools/base64",
  },
  {
    title: "JSON Formatter",
    description: "Format, validate, minify and beautify JSON data with syntax highlighting",
    icon: FileCode,
    href: "/web-tools/json-formatter",
  },
  {
    title: "UUID Generator",
    description: "Generate unique identifiers (UUIDs) in various formats for applications",
    icon: Zap,
    href: "/web-tools/uuid-generator",
  },
]

export default function WebToolsPage() {
  return (
    <CategoryLayout
      title="Web Tools"
      description="QR codes, URL shortening, UUID generation, Base64 encoding, and JSON formatting for web developers."
      icon={Zap}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
