import type { Metadata } from "next"
import { Minimize2, FileText, FileDown, Layers, Scissors, ArrowRight } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "PDF Tools - Free Online PDF Utilities | Micro Tools",
  description:
    "Free online PDF tools including PDF compressor, converter, merger, and splitter. Compress PDFs, convert to Word/Excel, merge multiple PDFs, and more.",
}

const tools = [
  {
    title: "PDF Compressor",
    description: "Reduce PDF file size while maintaining quality",
    icon: Minimize2,
    href: "/pdf-tools/compress",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents with formatting preserved",
    icon: FileText,
    href: "/pdf-tools/pdf-to-word",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables and data from PDFs into Excel spreadsheets",
    icon: FileDown,
    href: "/pdf-tools/pdf-to-excel",
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into one document with custom page order",
    icon: Layers,
    href: "/pdf-tools/merge",
  },
  {
    title: "Split PDF",
    description: "Split large PDF files into smaller documents by page range",
    icon: Scissors,
    href: "/pdf-tools/split",
  },
  {
    title: "PDF Converter",
    description: "Convert PDFs to various formats including JPG and PNG",
    icon: ArrowRight,
    href: "/pdf-tools/convert",
  },
]

export default function PdfToolsPage() {
  return (
    <CategoryLayout
      title="PDF Tools"
      description="Compress, convert, merge, and split PDF files. Fast and private — no files are uploaded to our servers."
      icon={FileText}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
