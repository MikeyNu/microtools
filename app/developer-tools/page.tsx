import type { Metadata } from "next"
import { FileJson, Search, Lock, Hash, Binary, Link, Braces, Code2 } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Developer Tools - Micro Tools",
  description:
    "Essential developer utilities including JSON formatter, regex tester, Base64 encoder, hash generators, and more coding tools.",
  keywords:
    "developer tools, JSON formatter, regex tester, Base64 encoder, hash generator, MD5, SHA256, coding utilities",
}

const tools = [
  {
    title: "JSON Formatter & Validator",
    description: "Format, validate, and beautify JSON data with syntax highlighting and error detection",
    icon: FileJson,
    href: "/developer-tools/json-formatter",
  },
  {
    title: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching and explanation",
    icon: Search,
    href: "/developer-tools/regex-tester",
  },
  {
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings for data transmission and storage",
    icon: Binary,
    href: "/developer-tools/base64",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and other cryptographic hashes",
    icon: Hash,
    href: "/developer-tools/hash-generator",
  },
  {
    title: "URL Encoder/Decoder",
    description: "Encode and decode URLs for web development and API integration",
    icon: Link,
    href: "/developer-tools/url-encoder",
  },
  {
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens (JWT) for authentication debugging",
    icon: Lock,
    href: "/developer-tools/jwt-decoder",
  },
  {
    title: "Code Formatter",
    description: "Format and beautify HTML, CSS, JavaScript, and other code languages",
    icon: Code2,
    href: "/developer-tools/code-formatter",
  },
  {
    title: "API Tester",
    description: "Test REST APIs with custom headers, parameters, and request bodies",
    icon: Braces,
    href: "/developer-tools/api-tester",
  },
  {
    title: "CSS Minifier",
    description: "Minify and beautify CSS code to reduce file size and improve performance",
    icon: Code2,
    href: "/developer-tools/css-minifier",
  },
]

export default function DeveloperToolsPage() {
  return (
    <CategoryLayout
      title="Developer Tools"
      description="JSON, regex, Base64, JWT, hash generation, and code formatting. All processing runs locally in your browser."
      icon={Code2}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
