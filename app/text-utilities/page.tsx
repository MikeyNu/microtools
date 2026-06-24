import type { Metadata } from "next"
import { FileText, GitCompare, Link, Code, Type, Hash } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Text Utilities | Micro Tools",
  description:
    "Comprehensive text processing tools including markdown editor, text diff, URL encoder/decoder, HTML encoder/decoder, and more.",
  keywords: ["text tools", "markdown editor", "text diff", "url encoder", "html encoder", "text processing"],
}

const tools = [
  {
    title: "Markdown Editor",
    description: "Write and preview Markdown with live rendering, syntax highlighting, and export options",
    icon: FileText,
    href: "/text-utilities/markdown-editor",
  },
  {
    title: "Text Diff Tool",
    description: "Compare two texts and highlight differences with side-by-side or unified view",
    icon: GitCompare,
    href: "/text-utilities/text-diff",
  },
  {
    title: "URL Encoder/Decoder",
    description: "Encode and decode URLs with support for various encoding formats",
    icon: Link,
    href: "/text-utilities/url-encoder",
  },
  {
    title: "HTML Encoder/Decoder",
    description: "Encode and decode HTML entities for safe web content display",
    icon: Code,
    href: "/text-utilities/html-encoder",
  },
  {
    title: "Text Case Converter",
    description: "Convert text between different cases: uppercase, lowercase, title case, and more",
    icon: Type,
    href: "/text-utilities/case-converter",
  },
  {
    title: "Text Counter",
    description: "Count characters, words, paragraphs, and analyze text statistics",
    icon: Hash,
    href: "/text-utilities/text-counter",
  },
]

export default function TextUtilitiesPage() {
  return (
    <CategoryLayout
      title="Text Utilities"
      description="Markdown editor, text diff, URL and HTML encoding, and other text processing utilities."
      icon={FileText}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
