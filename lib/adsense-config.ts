// AdSense Configuration for ToolHub
// IMPORTANT: Replace all placeholder values with your actual AdSense IDs before production deployment
//
// TO SETUP:
// 1. Get your Publisher ID from AdSense Account > Account Information
// 2. Create ad units in AdSense > Ads > By ad unit
// 3. Replace all placeholder IDs below with your real ad unit IDs
// 4. Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID in your .env.local file

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (REQUIRED from environment variables)
  publisherId: `ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`,

  // Customer ID for support
  customerId: "962207481",

  // Ad Unit IDs for different placements
  // REPLACE THESE PLACEHOLDER VALUES WITH YOUR REAL AD UNIT IDs FROM ADSENSE
  adUnits: {
    // Header/Navigation area - Create as "Display ad" 728x90 or responsive
    headerBanner:
      process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",

    // Homepage placements - Create as responsive display ads
    homepageHero:
      process.env.NEXT_PUBLIC_ADSENSE_HOMEPAGE_HERO ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    homepageMiddle:
      process.env.NEXT_PUBLIC_ADSENSE_HOMEPAGE_MIDDLE ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    homepageFooter:
      process.env.NEXT_PUBLIC_ADSENSE_HOMEPAGE_FOOTER ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",

    // Tool pages - Create as sidebar (300x250) and content (728x90) ads
    toolSidebar:
      process.env.NEXT_PUBLIC_ADSENSE_TOOL_SIDEBAR ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    toolContent:
      process.env.NEXT_PUBLIC_ADSENSE_TOOL_CONTENT ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    toolFooter:
      process.env.NEXT_PUBLIC_ADSENSE_TOOL_FOOTER ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",

    // Category pages - Create as responsive display ads
    categoryHeader:
      process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_HEADER ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    categoryInline:
      process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_INLINE ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    categoryGrid:
      process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_GRID ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    categoryFooter:
      process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_FOOTER ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",

    // Mobile specific - Create as mobile banner ads (320x50, 300x250)
    mobileSticky:
      process.env.NEXT_PUBLIC_ADSENSE_MOBILE_STICKY ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
    mobileInline:
      process.env.NEXT_PUBLIC_ADSENSE_MOBILE_INLINE ||
      "REPLACE_WITH_REAL_AD_UNIT_ID",
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
};

// Helper function to get ad configuration
export function getAdConfig(placement: string, isMobile: boolean = false) {
  const config = ADSENSE_CONFIG.placements;

  if (isMobile && config.mobile) {
    return config.mobile[placement as keyof typeof config.mobile];
  }

  // Find placement in any category
  for (const category of Object.values(config)) {
    if (
      typeof category === "object" &&
      category[placement as keyof typeof category]
    ) {
      return category[placement as keyof typeof category];
    }
  }

  return null;
}

// Helper function to get ad unit ID
export function getAdUnitId(placement: string): string {
  return (
    ADSENSE_CONFIG.adUnits[placement as keyof typeof ADSENSE_CONFIG.adUnits] ||
    ""
  );
}

// Helper function to check if ads should be displayed
export function shouldDisplayAds(): boolean {
  // Don't show ads in development unless explicitly enabled
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_SHOW_ADS === "true";
  }

  // Don't show ads if using placeholder IDs or if publisher ID is missing
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (
    !publisherId ||
    publisherId === "pub-4745112150588316" ||
    publisherId === "YOUR_REAL_PUBLISHER_ID_HERE" ||
    Object.values(ADSENSE_CONFIG.adUnits).some(
      (id) =>
        id.startsWith("1234567890") ||
        id.startsWith("REPLACE_WITH_REAL_AD_UNIT_ID"),
    )
  ) {
    console.warn(
      "AdSense: Using placeholder IDs - ads disabled. Please configure real AdSense IDs.",
    );
    return false;
  }

  // Always show in production with valid publisher ID
  return true;
}

// Ad performance tracking
export function trackAdPerformance(
  adUnit: string,
  event: "impression" | "click",
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", `ad_${event}`, {
      ad_unit: adUnit,
      event_category: "advertising",
    });
  }
}

// Types for TypeScript
export type AdSize =
  | "banner"
  | "rectangle"
  | "leaderboard"
  | "skyscraper"
  | "square"
  | "mobile-banner"
  | "large-rectangle";
export type AdPriority = "high" | "medium" | "low";

export interface AdPlacement {
  size: AdSize;
  priority: AdPriority;
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
