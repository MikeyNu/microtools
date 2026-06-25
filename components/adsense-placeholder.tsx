"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface AdSenseProps {
  size: "banner" | "rectangle" | "leaderboard" | "skyscraper" | "square" | "mobile-banner" | "large-rectangle"
  className?: string
  adSlot?: string
  adClient?: string
  responsive?: boolean
}

export function AdSensePlaceholder({ size, className = "", adSlot, adClient, responsive = true }: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const hasInitialized = useRef(false)
  
  const adSizes = {
    banner: { width: 728, height: 90, display: "728x90" },
    rectangle: { width: 300, height: 250, display: "300x250" },
    leaderboard: { width: 728, height: 90, display: "728x90" },
    skyscraper: { width: 160, height: 600, display: "160x600" },
    square: { width: 250, height: 250, display: "250x250" },
    "mobile-banner": { width: 320, height: 50, display: "320x50" },
    "large-rectangle": { width: 336, height: 280, display: "336x280" },
  }

  const sizeClasses = {
    banner: "h-24 w-full max-w-3xl mx-auto",
    rectangle: "h-64 w-80 mx-auto",
    leaderboard: "h-24 w-full max-w-3xl mx-auto",
    skyscraper: "h-96 w-40",
    square: "h-64 w-64 mx-auto",
    "mobile-banner": "h-12 w-80 mx-auto md:hidden",
    "large-rectangle": "h-72 w-84 mx-auto",
  }

  const currentSize = adSizes[size]

  useEffect(() => {
    // Only initialize ads in production with valid ad data
    if (process.env.NODE_ENV !== "production" || !adSlot || !adClient || hasInitialized.current) {
      return
    }

    // Wait for AdSense script to be available (loaded by AdSenseProvider)
    const initializeAd = () => {
      if (window.adsbygoogle && adRef.current && !hasInitialized.current) {
        try {
          hasInitialized.current = true
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (e) {
          console.error("AdSense error:", e)
          hasInitialized.current = false
        }
      }
    }

    // Check if AdSense is already loaded
    if (window.adsbygoogle) {
      initializeAd()
    } else {
      // Wait for AdSense script to load
      const checkInterval = setInterval(() => {
        if (window.adsbygoogle) {
          clearInterval(checkInterval)
          initializeAd()
        }
      }, 100)

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000)
      
      return () => clearInterval(checkInterval)
    }
  }, [adSlot, adClient])

  // Production AdSense component
  if (adSlot && adClient && process.env.NODE_ENV === "production") {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: responsive ? "block" : "inline-block",
            width: responsive ? "100%" : `${currentSize.width}px`,
            height: responsive ? "auto" : `${currentSize.height}px`,
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={responsive ? "auto" : undefined}
          data-full-width-responsive={responsive ? "true" : undefined}
        />
      </div>
    )
  }

  // Development placeholder
  return (
    <Card
      className={`${sizeClasses[size]} ${className} bg-card/70 border border-border/70 flex items-center justify-center shadow-none transition-colors duration-200 backdrop-blur-sm`}
    >
      <div className="text-center text-muted-foreground">
        <div className="font-serif text-sm font-medium mb-1">Advertisement</div>
        <div className="text-xs opacity-60 uppercase font-mono">
          {currentSize.display}
        </div>
        <div className="text-xs mt-1 opacity-40">AdSense Ready</div>
        {responsive && (
          <div className="text-xs mt-1 opacity-40">
            Responsive
          </div>
        )}
      </div>
    </Card>
  )
}

// Export for backward compatibility
export { AdSensePlaceholder as AdSenseAd }

// Declare global for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
