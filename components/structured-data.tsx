"use client"

import { useEffect } from "react"
import { SEO_CONFIG } from "@/lib/seo-config"

export function StructuredData() {
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === "undefined") return

    // Check if structured data scripts already exist
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    if (existingScripts.length > 0) return

    // Add website structured data
    const websiteScript = document.createElement('script')
    websiteScript.type = 'application/ld+json'
    websiteScript.textContent = JSON.stringify(SEO_CONFIG.structuredData.website)
    document.head.appendChild(websiteScript)

    // Add organization structured data
    const organizationScript = document.createElement('script')
    organizationScript.type = 'application/ld+json'
    organizationScript.textContent = JSON.stringify(SEO_CONFIG.structuredData.organization)
    document.head.appendChild(organizationScript)

    // Cleanup function
    return () => {
      // Remove scripts when component unmounts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      scripts.forEach(script => {
        if (script.textContent?.includes('ToolHub')) {
          script.remove()
        }
      })
    }
  }, [])

  return null // This component doesn't render anything
}