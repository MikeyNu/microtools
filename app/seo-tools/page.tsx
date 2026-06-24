import type { Metadata } from "next"
import { Tags, BarChart3, FileText, Map, Share2, Code2 } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Free SEO Tools - Meta Tags, Keywords, Robots.txt & More | Micro Tools",
  description:
    "Professional SEO tools to optimize your website for search engines. Generate meta tags, analyze keywords, create robots.txt files, and boost your rankings.",
}

const tools = [
  {
    title: "Meta Tag Generator",
    description: "Generate HTML meta tags for better SEO and search engine visibility",
    icon: Tags,
    href: "/seo-tools/meta-generator",
  },
  {
    title: "Keyword Density Checker",
    description: "Analyze keyword density and optimize your content for better rankings",
    icon: BarChart3,
    href: "/seo-tools/keyword-density",
  },
  {
    title: "Robots.txt Generator",
    description: "Create robots.txt files to control search engine crawling",
    icon: FileText,
    href: "/seo-tools/robots-generator",
  },
  {
    title: "Sitemap Generator",
    description: "Generate XML sitemaps to help search engines index your website",
    icon: Map,
    href: "/seo-tools/sitemap-generator",
  },
  {
    title: "Open Graph Generator",
    description: "Create Open Graph meta tags for better social media sharing",
    icon: Share2,
    href: "/seo-tools/open-graph",
  },
  {
    title: "Schema Markup Generator",
    description: "Generate structured data markup for rich search results",
    icon: Code2,
    href: "/seo-tools/schema-generator",
  },
]

export default function SeoToolsPage() {
  return (
    <CategoryLayout
      title="SEO Tools"
      description="Meta tags, robots.txt, sitemaps, Open Graph, and schema markup — everything to make your site legible to search engines."
      icon={BarChart3}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
