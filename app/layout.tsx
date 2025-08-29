import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"
import { SEO_CONFIG } from "@/lib/seo-config"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { AdSenseProvider } from "@/components/adsense-provider"
import { StructuredData } from "@/components/structured-data"
import { Navbar } from "@/components/navbar"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: SEO_CONFIG.site.name,
  description: SEO_CONFIG.site.description,
  keywords: SEO_CONFIG.site.keywords.join(', '),
  authors: [{ name: SEO_CONFIG.site.author }],
  generator: "Next.js",
  applicationName: "ToolHub",
  referrer: "origin-when-cross-origin",
  creator: SEO_CONFIG.site.author,
  publisher: SEO_CONFIG.site.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SEO_CONFIG.site.url),
  alternates: {
    canonical: SEO_CONFIG.site.url,
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.site.locale,
    url: SEO_CONFIG.site.url,
    title: SEO_CONFIG.site.name,
    description: SEO_CONFIG.site.description,
    siteName: SEO_CONFIG.site.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.site.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.site.name,
    description: SEO_CONFIG.site.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={SEO_CONFIG.site.language} className={`${workSans.variable} ${openSans.variable} dark`}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        {/* Structured Data - Moved to prevent hydration mismatch */}
        
        {/* AdSense Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4745112150588316"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <StructuredData />
        <AnalyticsProvider>
          <AdSenseProvider>
            <Navbar />
            {children}
          </AdSenseProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
