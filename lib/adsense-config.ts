// AdSense Configuration for ToolHub
// Replace with your actual AdSense Publisher ID and Ad Unit IDs

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (from environment variables)
  publisherId: `ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "pub-4745112150588316"}`,
  
  // Customer ID for support
  customerId: "962207481",
  
  // Ad Unit IDs for different placements (replace with actual IDs)
  adUnits: {
    // Header/Navigation area
    headerBanner: "1234567890",
    
    // Homepage placements
    homepageHero: "1234567891",
    homepageMiddle: "1234567892",
    homepageFooter: "1234567893",
    
    // Tool pages
    toolSidebar: "1234567894",
    toolContent: "1234567895",
    toolFooter: "1234567896",
    
    // Category pages
    categoryHeader: "1234567897",
    categoryGrid: "1234567898",
    
    // Mobile specific
    mobileSticky: "1234567899",
    mobileInline: "1234567900",
  },
  
  // Ad placement strategy for maximum revenue
  placements: {
    // High-performing ad sizes according to Google
    homepage: {
      hero: { size: "leaderboard", priority: "high" },
      middle: { size: "large-rectangle", priority: "high" },
      footer: { size: "rectangle", priority: "medium" },
    },
    
    toolPages: {
      sidebar: { size: "rectangle", priority: "high" },
      content: { size: "banner", priority: "medium" },
      footer: { size: "leaderboard", priority: "low" },
    },
    
    categoryPages: {
      header: { size: "leaderboard", priority: "high" },
      grid: { size: "rectangle", priority: "medium" },
    },
    
    mobile: {
      sticky: { size: "mobile-banner", priority: "high" },
      inline: { size: "rectangle", priority: "medium" },
    },
  },
  
  // Revenue optimization settings
  optimization: {
    // Enable auto ads for additional revenue
    autoAds: true,
    
    // Responsive ads for better mobile performance
    responsive: true,
    
    // Lazy loading for better page performance
    lazyLoad: true,
    
    // Ad refresh for single-page applications
    refreshOnNavigation: true,
    
    // Maximum load time threshold (in milliseconds)
    maxLoadTime: 3000,
  },
  
  // AdSense policies compliance
  compliance: {
    // Minimum content-to-ad ratio
    maxAdsPerPage: 3,
    
    // Ensure ads don't interfere with navigation
    minContentHeight: 250,
    
    // Privacy and GDPR compliance
    privacyPolicy: "/privacy",
    cookieConsent: true,
  },
}

// Helper function to get ad configuration
export function getAdConfig(placement: string, isMobile: boolean = false) {
  const config = ADSENSE_CONFIG.placements
  
  if (isMobile && config.mobile) {
    return config.mobile[placement as keyof typeof config.mobile]
  }
  
  // Find placement in any category
  for (const category of Object.values(config)) {
    if (typeof category === 'object' && category[placement as keyof typeof category]) {
      return category[placement as keyof typeof category]
    }
  }
  
  return null
}

// Helper function to get ad unit ID
export function getAdUnitId(placement: string): string {
  return ADSENSE_CONFIG.adUnits[placement as keyof typeof ADSENSE_CONFIG.adUnits] || ""
}

// Helper function to check if ads should be displayed
export function shouldDisplayAds(): boolean {
  // Don't show ads in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_SHOW_ADS === 'true'
  }
  
  // Don't show ads if using placeholder publisher ID
  if (ADSENSE_CONFIG.publisherId === 'ca-pub-4745112150588316') {
    return false
  }
  
  // Always show in production with valid publisher ID
  return true
}

// Ad performance tracking
export function trackAdPerformance(adUnit: string, event: 'impression' | 'click') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `ad_${event}`, {
      ad_unit: adUnit,
      event_category: 'advertising',
    })
  }
}

// Types for TypeScript
export type AdSize = 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'square' | 'mobile-banner' | 'large-rectangle'
export type AdPriority = 'high' | 'medium' | 'low'

export interface AdPlacement {
  size: AdSize
  priority: AdPriority
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}