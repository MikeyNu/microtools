import type { Metadata } from "next"
import { FileText, Type, Shuffle, Key, RotateCcw, Hash } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Free Text Tools - Word Counter, Case Converter, Password Generator | Micro Tools",
  description:
    "Professional text manipulation and generation tools for writers, developers, and content creators. Count words, convert case, generate passwords, and more.",
}

const tools = [
  {
    title: "Word Counter",
    description: "Count words, characters, paragraphs, and estimate reading time",
    icon: FileText,
    href: "/text-tools/word-counter",
  },
  {
    title: "Case Converter",
    description: "Convert text to uppercase, lowercase, title case, and more formats",
    icon: Type,
    href: "/text-tools/case-converter",
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for your designs and mockups",
    icon: Shuffle,
    href: "/text-tools/lorem-ipsum",
  },
  {
    title: "Password Generator",
    description: "Generate secure passwords with customizable strength options",
    icon: Key,
    href: "/text-tools/password-generator",
  },
  {
    title: "Text Reverser",
    description: "Reverse text, words, or entire sentences with various options",
    icon: RotateCcw,
    href: "/text-tools/text-reverser",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256, and other cryptographic hashes",
    icon: Hash,
    href: "/text-tools/hash-generator",
  },
]

export default function TextToolsPage() {
  return (
    <CategoryLayout
      title="Text Tools"
      description="Case conversion, word counting, password generation, and text transformation. Everything for working with text."
      icon={Type}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
