import type { Metadata } from "next"
import { FileText, Code, Database, CheckCircle } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Data Tools - Free Online Data Processing & Conversion Tools | Micro Tools",
  description:
    "Free online data tools for converting, formatting, and validating data. CSV to JSON converter, XML formatter, SQL formatter, and more.",
}

const tools = [
  {
    title: "CSV to JSON Converter",
    description: "Convert CSV files to JSON format with customizable delimiter and header options",
    icon: FileText,
    href: "/data-tools/csv-to-json",
  },
  {
    title: "XML Formatter",
    description: "Format and beautify XML documents with proper indentation and validation",
    icon: Code,
    href: "/data-tools/xml-formatter",
  },
  {
    title: "SQL Formatter",
    description: "Format and beautify SQL queries for better readability across multiple dialects",
    icon: Database,
    href: "/data-tools/sql-formatter",
  },
  {
    title: "Data Validator",
    description: "Validate JSON, XML, CSV and other data formats with detailed error reporting",
    icon: CheckCircle,
    href: "/data-tools/data-validator",
  },
  {
    title: "JSON Formatter",
    description: "Format, validate and minify JSON data with tree view and syntax highlighting",
    icon: Code,
    href: "/data-tools/json-formatter",
  },
  {
    title: "YAML Converter",
    description: "Convert between YAML and JSON formats with syntax validation",
    icon: FileText,
    href: "/data-tools/yaml-converter",
  },
]

export default function DataToolsPage() {
  return (
    <CategoryLayout
      title="Data Tools"
      description="CSV, JSON, XML, YAML, and SQL conversion and formatting. Clean data in, clean data out."
      icon={Database}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
