import { cn } from "@/lib/utils"

type GlyphKey =
  | "ledger"
  | "scales"
  | "quill"
  | "book"
  | "cipher"
  | "palette"
  | "globe"
  | "spyglass"
  | "watch"
  | "frame"
  | "folio"
  | "cabinet"
  | "shield"
  | "compass"
  | "coin"
  | "telegraph"
  | "ledgerGraph"
  | "calendar"
  | "typecase"
  | "key"
  | "rotate"
  | "thermometer"
  | "ruler"
  | "receipt"
  | "home"
  | "chain"
  | "qr"
  | "prism"
  | "tag"
  | "sitemap"
  | "scissors"
  | "layers"
  | "heart"
  | "monogram"

type VictorianGlyphVariant = "seal" | "soft" | "plain"
type VictorianGlyphSize = "xs" | "sm" | "md" | "lg" | "xl"

interface VictorianGlyphProps {
  label: string
  category?: string
  variant?: VictorianGlyphVariant
  size?: VictorianGlyphSize
  className?: string
}

const CATEGORY_GLYPHS: Record<string, GlyphKey> = {
  Calculators: "ledger",
  Converters: "scales",
  "Text Tools": "quill",
  "Text Utilities": "book",
  "Developer Tools": "cipher",
  "Design Tools": "palette",
  "Web Tools": "globe",
  "SEO Tools": "spyglass",
  "Timestamp Tools": "watch",
  "Image Tools": "frame",
  "PDF Tools": "folio",
  "Data Tools": "cabinet",
  "Security Tools": "shield",
  "Math Tools": "compass",
  "Crypto Tools": "coin",
  "Network Tools": "telegraph",
  "Finance Tools": "ledgerGraph",
}

const sizeClasses: Record<VictorianGlyphSize, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
}

const variantClasses: Record<VictorianGlyphVariant, string> = {
  seal:
    "rounded-sm bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_rgba(255,254,250,0.24),inset_0_-10px_18px_rgba(23,19,16,0.10)]",
  soft:
    "rounded-sm border border-accent/25 bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(255,254,250,0.36)]",
  plain: "text-current",
}

const TOOL_GLYPH_RULES: Array<[RegExp, GlyphKey]> = [
  [/bmi|body|health|weight/, "heart"],
  [/mortgage|home/, "home"],
  [/tip|receipt|bill|split/, "receipt"],
  [/currency|money|exchange|dollar|fiat|price|bitcoin|crypto|compound|investment|interest|return|finance|loan/, "coin"],
  [/percentage|percent|statistics|graphing|chart|trend|roi/, "ledgerGraph"],
  [/age|date|calendar/, "calendar"],
  [/scientific|equation|matrix|math|unit|ruler|measurement/, "compass"],
  [/temperature|thermometer|celsius|fahrenheit|kelvin/, "thermometer"],
  [/file size|bytes|kilobyte|megabyte|gigabyte|database|sql|csv|yaml|xml|schema|data/, "cabinet"],
  [/color|palette|picker/, "palette"],
  [/gradient|harmony|complementary/, "prism"],
  [/image|webp|resize|crop|format converter/, "frame"],
  [/pdf|document|docx|word|file down|download/, "folio"],
  [/merge|split|layer/, "layers"],
  [/scissor|minify|minifier|compressor/, "scissors"],
  [/password|key|2fa|totp|authentication|otp|jwt|token/, "key"],
  [/ssl|certificate|security|lock|auth/, "shield"],
  [/hash|md5|sha|checksum/, "shield"],
  [/api|rest|request|headers/, "telegraph"],
  [/json|base64|binary|code|developer|braces/, "cipher"],
  [/reverse|rotate/, "rotate"],
  [/diff|compare/, "scales"],
  [/markdown|lorem|ipsum|placeholder/, "quill"],
  [/css|html|case|word counter|type|text/, "typecase"],
  [/url|shorten|link/, "chain"],
  [/qr|barcode/, "qr"],
  [/uuid|guid|web|globe|timezone|world/, "globe"],
  [/meta|tag/, "tag"],
  [/robots|sitemap|crawl|structured/, "sitemap"],
  [/regex|keyword|density|checker|lookup|search|seo|open graph/, "spyglass"],
  [/timestamp|epoch|timer|time/, "watch"],
  [/ip|dns|port|network|tcp/, "telegraph"],
  [/calculator/, "ledger"],
  [/converter|convert/, "scales"],
]

export function getVictorianGlyphKey(label: string, category?: string): GlyphKey {
  const text = label.toLowerCase()

  if (CATEGORY_GLYPHS[label]) {
    return CATEGORY_GLYPHS[label]
  }

  for (const [pattern, glyph] of TOOL_GLYPH_RULES) {
    if (pattern.test(text)) return glyph
  }

  if (category && CATEGORY_GLYPHS[category]) {
    return CATEGORY_GLYPHS[category]
  }

  return "monogram"
}

export function VictorianGlyph({
  label,
  category,
  variant = "seal",
  size = "md",
  className,
}: VictorianGlyphProps) {
  const key = getVictorianGlyphKey(label, category)
  const framed = variant !== "plain"

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        className={cn(framed ? "size-[86%]" : "size-full")}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {framed && <Frame />}
        <GlyphShape glyph={key} label={label} />
      </svg>
    </span>
  )
}

function Frame() {
  return (
    <g opacity="0.84" strokeWidth="1.45">
      <rect x="6.5" y="6.5" width="35" height="35" rx="4.25" />
      <rect x="10" y="10" width="28" height="28" rx="2.25" opacity="0.5" />
      <path d="M16 6.5h16M16 41.5h16M6.5 16v16M41.5 16v16" opacity="0.55" />
      <path d="M11 14l3-3M34 11l3 3M37 34l-3 3M14 37l-3-3" opacity="0.72" />
    </g>
  )
}

function GlyphShape({ glyph, label }: { glyph: GlyphKey; label: string }) {
  switch (glyph) {
    case "ledger":
      return (
        <g strokeWidth="2">
          <path d="M16 15.5h15.5c2 0 3.5 1.5 3.5 3.5v14.5H18.5c-2 0-3.5-1.5-3.5-3.5V17c0-.8.2-1.2 1-1.5Z" />
          <path d="M20 15.5v18M24 21h7M24 26h7M24 31h5" opacity="0.72" />
          <path d="M13 19.5h5M13 24h5M13 28.5h5" opacity="0.45" />
        </g>
      )
    case "scales":
      return (
        <g strokeWidth="2">
          <path d="M24 14v20M17 34h14M20 18h8" />
          <path d="M15 20l-5 9h10l-5-9ZM33 20l-5 9h10l-5-9Z" />
          <path d="M15 20h18" opacity="0.72" />
        </g>
      )
    case "quill":
      return (
        <g strokeWidth="2">
          <path d="M14 34c7-2 17-13 20-24-12 2-21 9-22 20 3-3 8-7 14-9" />
          <path d="M17 31l-5 5M21 28l-7 1M24 24l-7-1M28 19l-6-2" opacity="0.58" />
        </g>
      )
    case "book":
      return (
        <g strokeWidth="2">
          <path d="M12 16.5c4-2 8-2 12 1v18c-4-3-8-3-12-1v-18Z" />
          <path d="M24 17.5c4-3 8-3 12-1v18c-4-2-8-2-12 1v-18Z" />
          <path d="M16 21h4M16 26h4M28 21h4M28 26h4" opacity="0.55" />
        </g>
      )
    case "cipher":
      return (
        <g strokeWidth="2">
          <path d="M20 15c-4 0-5 3-3 6 1.2 1.8 1.2 4.2 0 6-2 3 0 6 3 6" />
          <path d="M28 15c4 0 5 3 3 6-1.2 1.8-1.2 4.2 0 6 2 3 0 6-3 6" />
          <path d="M23 20h2M22 24h4M23 28h2" opacity="0.64" />
        </g>
      )
    case "palette":
      return (
        <g strokeWidth="2">
          <path d="M24 13c-7 0-12 4.8-12 11.2C12 31 17.5 35 23.4 35h2.2c2 0 2.8-2.4 1.4-3.7-.9-.8-.4-2.3.9-2.3h2.6c3.5 0 5.5-2.3 5.5-5.4C36 17.5 31 13 24 13Z" />
          <circle cx="19" cy="21" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="25" cy="18.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="30" cy="23" r="1.2" fill="currentColor" stroke="none" />
          <path d="M17 31c3-2 6-2 9 0" opacity="0.55" />
        </g>
      )
    case "globe":
      return (
        <g strokeWidth="2">
          <circle cx="24" cy="22" r="10" />
          <path d="M14 22h20M24 12c3 3 4.5 6.3 4.5 10S27 29 24 32M24 12c-3 3-4.5 6.3-4.5 10S21 29 24 32" />
          <path d="M19 36h10M24 32v4" opacity="0.7" />
        </g>
      )
    case "spyglass":
      return (
        <g strokeWidth="2">
          <circle cx="21" cy="21" r="7" />
          <path d="M26 26l8 8M17 21h8M21 17v8" opacity="0.58" />
          <path d="M32 14l1.5 3 3 .5-2.2 2.1.5 3-2.8-1.4-2.8 1.4.5-3-2.2-2.1 3-.5L32 14Z" opacity="0.7" />
        </g>
      )
    case "watch":
      return (
        <g strokeWidth="2">
          <circle cx="24" cy="25" r="10" />
          <path d="M20 12h8M24 12v3M24 25v-6M24 25l5 3" />
          <path d="M17 17l-2-2M31 17l2-2M19 35h10" opacity="0.58" />
        </g>
      )
    case "frame":
      return (
        <g strokeWidth="2">
          <rect x="13" y="14" width="22" height="20" rx="1.5" />
          <path d="M17 30l5-6 4 4 3-3 4 5" />
          <circle cx="29" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <path d="M16 17h16M16 34h16" opacity="0.42" />
        </g>
      )
    case "folio":
      return (
        <g strokeWidth="2">
          <path d="M17 12h12l5 5v19H17V12Z" />
          <path d="M29 12v6h5M21 23h9M21 28h9M21 33h6" opacity="0.68" />
          <path d="M14 16h3M14 21h3M14 26h3M14 31h3" opacity="0.42" />
        </g>
      )
    case "cabinet":
      return (
        <g strokeWidth="2">
          <rect x="14" y="14" width="20" height="21" rx="1.5" />
          <path d="M14 21h20M14 28h20M21 17h6M21 24h6M21 31h6" />
          <path d="M17 35v3M31 35v3" opacity="0.55" />
        </g>
      )
    case "shield":
      return (
        <g strokeWidth="2">
          <path d="M24 12l10 4v7c0 6-4 10.5-10 13-6-2.5-10-7-10-13v-7l10-4Z" />
          <path d="M24 21v7M20 22c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5" />
          <circle cx="24" cy="28" r="1" fill="currentColor" stroke="none" />
        </g>
      )
    case "compass":
      return (
        <g strokeWidth="2">
          <path d="M24 13l-8 23M24 13l8 23M18.5 29h11M20 20l8 4" />
          <circle cx="24" cy="13" r="2" />
          <path d="M14 34c6 3 14 3 20 0" opacity="0.58" />
        </g>
      )
    case "coin":
      return (
        <g strokeWidth="2">
          <circle cx="24" cy="24" r="11" />
          <circle cx="24" cy="24" r="7" opacity="0.45" />
          <path d="M21 18v12M21 18h5c2 0 3 1 3 2.7 0 1.4-.8 2.3-2.2 2.6 1.8.3 2.8 1.4 2.8 3.1 0 2-1.4 3.6-4 3.6H21M19 18h3M19 30h3" />
        </g>
      )
    case "telegraph":
      return (
        <g strokeWidth="2">
          <path d="M13 30l11-12 11 12M24 18v17M18 35h12" />
          <circle cx="13" cy="30" r="2.2" />
          <circle cx="24" cy="18" r="2.2" />
          <circle cx="35" cy="30" r="2.2" />
          <path d="M18 25h12" opacity="0.5" />
        </g>
      )
    case "ledgerGraph":
      return (
        <g strokeWidth="2">
          <path d="M14 15h20v20H14V15Z" />
          <path d="M18 30l5-6 4 3 5-8" />
          <path d="M18 20h4M18 25h2M18 34h12" opacity="0.48" />
        </g>
      )
    case "calendar":
      return (
        <g strokeWidth="2">
          <rect x="13" y="15" width="22" height="20" rx="2" />
          <path d="M18 12v6M30 12v6M13 21h22" />
          <path d="M18 26h2M23 26h2M28 26h2M18 31h2M23 31h2M28 31h2" opacity="0.62" />
        </g>
      )
    case "typecase":
      return (
        <g strokeWidth="2">
          <rect x="13" y="14" width="22" height="21" rx="1.5" />
          <path d="M13 21h22M13 28h22M20 14v21M28 14v21" opacity="0.58" />
          <path d="M18 31l2-6 2 6M18.8 29h2.4M29 19h2.5M29 24h3.5" />
        </g>
      )
    case "key":
      return (
        <g strokeWidth="2">
          <circle cx="18" cy="24" r="5" />
          <path d="M23 24h12M29 24v4M33 24v-3" />
          <circle cx="18" cy="24" r="1.4" fill="currentColor" stroke="none" />
          <path d="M15 16c3-2 6-2 9 0" opacity="0.45" />
        </g>
      )
    case "rotate":
      return (
        <g strokeWidth="2">
          <path d="M20 15l-5 5 5 5" />
          <path d="M15 20h14c4 0 7 3 7 7s-3 7-7 7H16" />
          <path d="M21 27l7 5M28 27l-7 5" opacity="0.58" />
        </g>
      )
    case "thermometer":
      return (
        <g strokeWidth="2">
          <path d="M22 26.5V15a4 4 0 0 1 8 0v11.5a7 7 0 1 1-8 0Z" />
          <path d="M26 18v12" />
          <path d="M17 17h-3M17 23h-3M17 29h-3" opacity="0.58" />
        </g>
      )
    case "ruler":
      return (
        <g strokeWidth="2">
          <path d="M14 31l17-17 4 4-17 17-4-4Z" />
          <path d="M20 28l-2-2M24 24l-2-2M28 20l-2-2M31 23l-1-1M23 31l-1-1" opacity="0.65" />
        </g>
      )
    case "receipt":
      return (
        <g strokeWidth="2">
          <path d="M16 13h16v22l-4-2-4 2-4-2-4 2V13Z" />
          <path d="M20 20h8M20 25h8M20 30h5" opacity="0.68" />
          <circle cx="29" cy="30" r="1.4" fill="currentColor" stroke="none" />
        </g>
      )
    case "home":
      return (
        <g strokeWidth="2">
          <path d="M13 24l11-10 11 10" />
          <path d="M17 22v13h14V22" />
          <path d="M22 35v-7h4v7M15 29h-2M35 29h-2" opacity="0.62" />
        </g>
      )
    case "chain":
      return (
        <g strokeWidth="2">
          <path d="M21 18l2-2a6 6 0 0 1 8.5 8.5l-3 3a6 6 0 0 1-8.5 0" />
          <path d="M27 30l-2 2a6 6 0 0 1-8.5-8.5l3-3a6 6 0 0 1 8.5 0" />
          <path d="M20 28l8-8" opacity="0.6" />
        </g>
      )
    case "qr":
      return (
        <g strokeWidth="2">
          <rect x="13" y="13" width="8" height="8" rx="1" />
          <rect x="27" y="13" width="8" height="8" rx="1" />
          <rect x="13" y="27" width="8" height="8" rx="1" />
          <path d="M27 27h3v3h-3zM33 27h2M27 33h2M31 31h4v4M16 16h2M30 16h2M16 30h2" />
        </g>
      )
    case "prism":
      return (
        <g strokeWidth="2">
          <path d="M15 34l9-19 9 19H15Z" />
          <path d="M12 21h9M27 21h9M29 16l5-4M31 27l6 2M19 27l-6 2" opacity="0.58" />
          <path d="M24 15v19" opacity="0.42" />
        </g>
      )
    case "tag":
      return (
        <g strokeWidth="2">
          <path d="M14 14h13l8 8-13 13-8-8V14Z" />
          <circle cx="21" cy="21" r="2" />
          <path d="M25 27l5-5M22 30l3-3" opacity="0.58" />
        </g>
      )
    case "sitemap":
      return (
        <g strokeWidth="2">
          <rect x="18" y="12" width="12" height="7" rx="1.5" />
          <rect x="11" y="29" width="10" height="7" rx="1.5" />
          <rect x="27" y="29" width="10" height="7" rx="1.5" />
          <path d="M24 19v5M16 29v-5h16v5" />
        </g>
      )
    case "scissors":
      return (
        <g strokeWidth="2">
          <circle cx="16" cy="31" r="4" />
          <circle cx="16" cy="17" r="4" />
          <path d="M20 19l15 15M20 29l15-15" />
          <path d="M22 24h5" opacity="0.5" />
        </g>
      )
    case "layers":
      return (
        <g strokeWidth="2">
          <path d="M24 13l13 7-13 7-13-7 13-7Z" />
          <path d="M13 27l11 6 11-6M13 33l11 6 11-6" opacity="0.62" />
        </g>
      )
    case "heart":
      return (
        <g strokeWidth="2">
          <path d="M24 35s-10-6.5-10-14a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7.5-10 14-10 14Z" />
          <path d="M16 25h5l2-4 3 8 2-4h4" opacity="0.62" />
        </g>
      )
    default:
      return <Monogram label={label} />
  }
}

function Monogram({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "M"

  return (
    <text
      x="24"
      y="31"
      textAnchor="middle"
      fontFamily="Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
      fontSize="21"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      {initial}
    </text>
  )
}
