'use client'

import {
  Calculator, Palette, Type, Globe, BarChart3, Wrench,
  Zap, Clock, Image, FileText, Code2, Database, Shield,
  TrendingUp, Network, Bitcoin, BookOpen,
} from "lucide-react"
import Link from "next/link"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"
import { VictorianGlyph } from "@/components/victorian-glyph"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"

const toolCategories = [
  {
    title: "Calculators",
    description: "Math, finance, health, and everyday calculations",
    icon: Calculator,
    count: 8,
    href: "/calculators",
  },
  {
    title: "Converters",
    description: "Units, currencies, colors, and file formats",
    icon: Zap,
    count: 8,
    href: "/converters",
  },
  {
    title: "Text Tools",
    description: "Case conversion, word count, generators",
    icon: Type,
    count: 6,
    href: "/text-tools",
  },
  {
    title: "Text Utilities",
    description: "Markdown editor, diff, URL and HTML encoding",
    icon: BookOpen,
    count: 4,
    href: "/text-utilities",
  },
  {
    title: "Developer Tools",
    description: "JSON, regex, Base64, JWT, hash, CSS",
    icon: Code2,
    count: 9,
    href: "/developer-tools",
  },
  {
    title: "Design Tools",
    description: "Color picker, gradients, palettes",
    icon: Palette,
    count: 6,
    href: "/design-tools",
  },
  {
    title: "Web Tools",
    description: "QR codes, URL shortener, UUID generator",
    icon: Globe,
    count: 5,
    href: "/web-tools",
  },
  {
    title: "SEO Tools",
    description: "Meta tags, robots.txt, Open Graph, schema",
    icon: BarChart3,
    count: 6,
    href: "/seo-tools",
  },
  {
    title: "Timestamp Tools",
    description: "Unix, epoch, and timezone conversion",
    icon: Clock,
    count: 6,
    href: "/timestamp-tools",
  },
  {
    title: "Image Tools",
    description: "Compress, resize, convert, and WebP",
    icon: Image,
    count: 6,
    href: "/image-tools",
  },
  {
    title: "PDF Tools",
    description: "Compress and convert PDF files",
    icon: FileText,
    count: 6,
    href: "/pdf-tools",
  },
  {
    title: "Data Tools",
    description: "CSV to JSON, YAML converter, formatter",
    icon: Database,
    count: 6,
    href: "/data-tools",
  },
  {
    title: "Security Tools",
    description: "Password strength, 2FA, SSL, hashing",
    icon: Shield,
    count: 5,
    href: "/security-tools",
  },
  {
    title: "Math Tools",
    description: "Scientific calculator, equations, matrices, stats",
    icon: Calculator,
    count: 6,
    href: "/math-tools",
  },
  {
    title: "Crypto Tools",
    description: "Bitcoin validator, crypto price converter",
    icon: Bitcoin,
    count: 4,
    href: "/crypto-tools",
  },
  {
    title: "Network Tools",
    description: "IP lookup, DNS, ping, Whois, ports",
    icon: Network,
    count: 5,
    href: "/network-tools",
  },
  {
    title: "Finance Tools",
    description: "Compound interest, investment returns, currency",
    icon: TrendingUp,
    count: 6,
    href: "/finance-tools",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="border-b border-border/80 py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="font-serif font-bold text-5xl sm:text-6xl text-foreground leading-none mb-5 max-w-2xl tracking-tight">
            Every tool,<br /><em>already here.</em>
          </h1>
          <div className="w-12 h-0.5 bg-accent mb-5" />
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            76 free tools for developers, designers, and anyone who works on the web. No account, no install.
          </p>
        </div>
      </section>

      {/* ── Ad slot ──────────────────────────────────────────────── */}
      {shouldDisplayAds() && (
        <div className="border-b border-border/80 py-6 bg-card/35">
          <div className="container mx-auto px-4 sm:px-6 flex justify-center">
            <AdSensePlaceholder
              size="leaderboard"
              adClient={ADSENSE_CONFIG.publisherId}
              adSlot={getAdUnitId('homepageHero')}
              responsive={true}
            />
          </div>
        </div>
      )}

      {/* ── Sidebar + Grid ───────────────────────────────────────── */}
      <section className="py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-6 items-start">

            {/* ── Category sidebar ─────────────────────────────── */}
            <aside className="hidden lg:block w-44 flex-shrink-0 sticky top-20 self-start">
              <p className="text-xs font-serif text-muted-foreground uppercase mb-3 px-1">
                Categories
              </p>
              <nav className="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                {toolCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
                  >
                    <VictorianGlyph
                      label={cat.title}
                      variant="plain"
                      size="sm"
                      className="group-hover:text-accent transition-colors"
                    />
                    <span className="flex-1 truncate">{cat.title}</span>
                    <span className="text-xs font-mono tabular-nums opacity-40">{cat.count}</span>
                  </Link>
                ))}
              </nav>
            </aside>

            {/* ── Main content ─────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Mobile: horizontal category pill scroll */}
              <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-none">
                {toolCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-border/80 bg-card/95 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
                  >
                    <VictorianGlyph label={cat.title} variant="plain" size="sm" />
                    {cat.title}
                  </Link>
                ))}
              </div>

              {/* Category grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {toolCategories.map((category) => (
                    <Link key={category.href} href={category.href} className="group">
                      <div className="h-full rounded-md border border-border/80 bg-card/95 p-5 transition-all duration-200 hover:border-accent/50 hover:shadow-[0_12px_28px_rgba(23,19,16,0.08)]">
                        <div className="flex items-start justify-between mb-4">
                          <VictorianGlyph label={category.title} size="lg" />
                          <span className="text-xs font-mono text-muted-foreground tabular-nums">
                            {category.count}
                          </span>
                        </div>
                        <h2 className="font-serif font-semibold text-sm text-foreground mb-1.5 group-hover:text-accent transition-colors duration-200">
                          {category.title}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                ))}
              </div>

              {/* Ad slot inside main — below grid */}
              {shouldDisplayAds() && (
                <div className="mt-8 flex justify-center">
                  <AdSensePlaceholder
                    size="large-rectangle"
                    adClient={ADSENSE_CONFIG.publisherId}
                    adSlot={getAdUnitId('homepageMiddle')}
                    responsive={true}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/80 bg-card/95 mt-4">
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  viewBox="0 0 316.653 340.008"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-auto flex-shrink-0 text-accent"
                  aria-hidden="true"
                >
                  <polygon fill="currentColor" points="0 114.848 159.404 203.960 316.653 116.662 316.653 265.181 185.253 340.008 185.253 299.194 282.301 244.321 282.301 175.843 159.404 246.135 36.280 176.070 36.280 244.094 132.874 298.740 132.874 340.008 0 264.274 0 114.848" />
                  <path fill="currentColor" d="M159.290,0 L2.154,90.699 l157.249,87.525 157.250,-87.525 L159.290,0 Z M188.541,105.721 v-26.303 h-58.954 v26.303 h-19.727 v-30.157 c0-9.330,7.563-16.893,16.893-16.893 h65.757 c9.330,0,16.893,7.563,16.893,16.893 v30.157 h-20.861 Z" />
                </svg>
                <span className="font-serif font-bold text-foreground text-base leading-none">
                  Micro <span className="text-accent">Tools</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free utilities for developers, designers, and digital professionals.
              </p>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-serif text-muted-foreground uppercase mb-3">
                Categories
              </p>
              <ul className="space-y-2">
                {[
                  { label: "Calculators", href: "/calculators" },
                  { label: "Converters", href: "/converters" },
                  { label: "Developer Tools", href: "/developer-tools" },
                  { label: "Text Tools", href: "/text-tools" },
                  { label: "Design Tools", href: "/design-tools" },
                  { label: "SEO Tools", href: "/seo-tools" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More tools */}
            <div>
              <p className="text-xs font-serif text-muted-foreground uppercase mb-3">
                More Tools
              </p>
              <ul className="space-y-2">
                {[
                  { label: "Image Tools", href: "/image-tools" },
                  { label: "Security Tools", href: "/security-tools" },
                  { label: "Math Tools", href: "/math-tools" },
                  { label: "Finance Tools", href: "/finance-tools" },
                  { label: "Network Tools", href: "/network-tools" },
                  { label: "All Tools", href: "/tools" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-serif text-muted-foreground uppercase mb-3">
                Company
              </p>
              <ul className="space-y-2">
                {[
                  { label: "About", href: "/about" },
                  { label: "Privacy", href: "/privacy" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/80 pt-6">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Mikey Nu (Pty) Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
