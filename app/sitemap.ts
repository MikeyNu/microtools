import type { MetadataRoute } from "next"

// Required for static export
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://toolhub.com"

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/privacy",
    "/terms",
    "/calculators",
    "/converters",
    "/text-tools",
    "/web-tools",
    "/seo-tools",
    "/network-tools",
    "/security-tools",
  ]

  // Calculator pages
  const calculatorPages = [
    "/calculators/basic",
    "/calculators/loan",
    "/calculators/bmi",
    "/calculators/percentage",
    "/calculators/tip",
    "/calculators/mortgage",
  ]

  // Converter pages
  const converterPages = [
    "/converters/currency",
    "/converters/unit",
    "/converters/temperature",
    "/converters/color",
    "/converters/file-size",
    "/converters/binary",
    "/converters/hex",
    "/converters/image",
  ]

  // Text tool pages
  const textToolPages = [
    "/text-tools/word-counter",
    "/text-tools/case-converter",
    "/text-tools/lorem-ipsum",
    "/text-tools/password-generator",
    "/text-tools/text-reverser",
    "/text-tools/hash-generator",
  ]

  // Web tool pages
  const webToolPages = [
    "/web-tools/url-shortener",
    "/web-tools/qr-generator",
    "/web-tools/base64",
    "/web-tools/json-formatter",
    "/web-tools/uuid-generator",
  ]

  // SEO tool pages
  const seoToolPages = [
    "/seo-tools/meta-generator",
    "/seo-tools/keyword-density",
    "/seo-tools/robots-generator",
    "/seo-tools/open-graph",
    "/seo-tools/schema-generator",
    "/seo-tools/sitemap-generator",
  ]

  const networkPages = [
    "/network-tools/ip-lookup",
    "/network-tools/dns-lookup",
    "/network-tools/port-scanner",
    "/network-tools/ping-test",
    "/network-tools/whois-lookup",
  ]

  const securityPages = [
    "/security-tools/password-checker",
    "/security-tools/password-generator",
    "/security-tools/2fa-generator",
    "/security-tools/ssl-checker",
    "/security-tools/hash-generator",
  ]

  const allPages = [
    ...staticPages,
    ...calculatorPages,
    ...converterPages,
    ...textToolPages,
    ...webToolPages,
    ...seoToolPages,
    ...networkPages,
    ...securityPages,
  ]

  return allPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page === "" ? 1 : 0.8,
  }))
}
