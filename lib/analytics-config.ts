// Analytics Configuration for ToolHub
// Comprehensive tracking for user behavior, tool usage, and ad performance

export const ANALYTICS_CONFIG = {
  // Google Analytics 4 Configuration
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    enabled: process.env.NODE_ENV === 'production',
    
    // Custom events for tool usage tracking
    events: {
      TOOL_USED: 'tool_used',
      TOOL_COMPLETED: 'tool_completed',
      CATEGORY_VIEWED: 'category_viewed',
      SEARCH_PERFORMED: 'search_performed',
      AD_CLICKED: 'ad_clicked',
      AD_VIEWED: 'ad_viewed',
      NEWSLETTER_SIGNUP: 'newsletter_signup',
      TOOL_SHARED: 'tool_shared',
      TOOL_BOOKMARKED: 'tool_bookmarked'
    },
    
    // Enhanced ecommerce for ad revenue tracking
    ecommerce: {
      currency: 'USD',
      trackAdRevenue: true,
      trackUserEngagement: true
    }
  },

  // AdSense Performance Tracking
  adSense: {
    trackImpressions: true,
    trackClicks: true,
    trackRevenue: true,
    
    // Ad placement performance metrics
    placements: {
      header: { id: 'header_ad', priority: 'high' },
      sidebar: { id: 'sidebar_ad', priority: 'high' },
      content: { id: 'content_ad', priority: 'medium' },
      footer: { id: 'footer_ad', priority: 'low' },
      inline: { id: 'inline_ad', priority: 'medium' }
    }
  },

  // User Behavior Tracking
  userBehavior: {
    trackScrollDepth: true,
    trackTimeOnPage: true,
    trackClickHeatmap: true,
    trackFormInteractions: true,
    trackToolUsagePatterns: true,
    
    // Session tracking
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    trackReturnVisitors: true,
    trackUserJourney: true
  },

  // Performance Monitoring
  performance: {
    trackPageLoadTime: true,
    trackToolLoadTime: true,
    trackAdLoadTime: true,
    trackCoreWebVitals: true,
    
    // Thresholds for performance alerts
    thresholds: {
      pageLoadTime: 3000, // 3 seconds
      toolLoadTime: 1000, // 1 second
      adLoadTime: 2000 // 2 seconds
    }
  },

  // Conversion Tracking
  conversions: {
    // Define what constitutes a conversion for ad revenue
    goals: {
      toolCompletion: { value: 0.10, currency: 'USD' },
      newsletterSignup: { value: 0.25, currency: 'USD' },
      toolShare: { value: 0.05, currency: 'USD' },
      returnVisit: { value: 0.15, currency: 'USD' }
    },
    
    // Funnel tracking
    funnels: {
      toolUsage: ['tool_viewed', 'tool_started', 'tool_completed'],
      engagement: ['page_view', 'tool_interaction', 'ad_view', 'ad_click']
    }
  }
};

// Analytics Helper Functions
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private isInitialized = false;

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  // Initialize analytics
  init() {
    if (this.isInitialized || !ANALYTICS_CONFIG.googleAnalytics.enabled) {
      return;
    }

    // Load Google Analytics
    this.loadGoogleAnalytics();
    
    // Initialize performance monitoring
    this.initPerformanceMonitoring();
    
    // Initialize user behavior tracking
    this.initUserBehaviorTracking();
    
    this.isInitialized = true;
  }

  // Load Google Analytics script
  private loadGoogleAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Track tool usage
  trackToolUsage(toolName: string, category: string, action: 'started' | 'completed' | 'error') {
    if (!this.isInitialized) return;

    const eventName = action === 'completed' ? 
      ANALYTICS_CONFIG.googleAnalytics.events.TOOL_COMPLETED : 
      ANALYTICS_CONFIG.googleAnalytics.events.TOOL_USED;

    this.trackEvent(eventName, {
      tool_name: toolName,
      tool_category: category,
      action: action,
      timestamp: new Date().toISOString()
    });

    // Track conversion if tool completed
    if (action === 'completed') {
      this.trackConversion('toolCompletion', toolName);
    }
  }

  // Track ad interactions
  trackAdInteraction(adPlacement: string, action: 'viewed' | 'clicked', adUnitId?: string) {
    if (!this.isInitialized) return;

    const eventName = action === 'clicked' ? 
      ANALYTICS_CONFIG.googleAnalytics.events.AD_CLICKED : 
      ANALYTICS_CONFIG.googleAnalytics.events.AD_VIEWED;

    this.trackEvent(eventName, {
      ad_placement: adPlacement,
      ad_unit_id: adUnitId,
      action: action,
      timestamp: new Date().toISOString()
    });
  }

  // Track search queries
  trackSearch(query: string, resultsCount: number) {
    if (!this.isInitialized) return;

    this.trackEvent(ANALYTICS_CONFIG.googleAnalytics.events.SEARCH_PERFORMED, {
      search_term: query,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Track category views
  trackCategoryView(category: string, toolsCount: number) {
    if (!this.isInitialized) return;

    this.trackEvent(ANALYTICS_CONFIG.googleAnalytics.events.CATEGORY_VIEWED, {
      category: category,
      tools_count: toolsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Track conversions
  private trackConversion(goalType: keyof typeof ANALYTICS_CONFIG.conversions.goals, itemName: string) {
    const goal = ANALYTICS_CONFIG.conversions.goals[goalType];
    if (!goal) return;

    this.trackEvent('conversion', {
      goal_type: goalType,
      item_name: itemName,
      value: goal.value,
      currency: goal.currency
    });
  }

  // Generic event tracking
  private trackEvent(eventName: string, parameters: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  }

  // Initialize performance monitoring
  private initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(this.sendToAnalytics);
        onFID(this.sendToAnalytics);
        onFCP(this.sendToAnalytics);
        onLCP(this.sendToAnalytics);
        onTTFB(this.sendToAnalytics);
      }).catch(() => {
        // Silently fail if web-vitals is not available
      });
    }

    // Track page load time
    window.addEventListener('load', () => {
      // Use modern Performance API
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        this.trackEvent('page_load_time', {
          load_time: loadTime,
          page: window.location.pathname
        });
      }
    });
  }

  // Send performance metrics to analytics
  private sendToAnalytics = (metric: any) => {
    this.trackEvent('web_vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id
    });
  };

  // Initialize user behavior tracking
  private initUserBehaviorTracking() {
    if (typeof window === 'undefined') return;

    // Track scroll depth
    if (ANALYTICS_CONFIG.userBehavior.trackScrollDepth) {
      this.initScrollTracking();
    }

    // Track time on page
    if (ANALYTICS_CONFIG.userBehavior.trackTimeOnPage) {
      this.initTimeTracking();
    }
  }

  // Initialize scroll depth tracking
  private initScrollTracking() {
    let maxScroll = 0;
    const trackingPoints = [25, 50, 75, 90, 100];
    const trackedPoints = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        trackingPoints.forEach(point => {
          if (scrollPercent >= point && !trackedPoints.has(point)) {
            trackedPoints.add(point);
            this.trackEvent('scroll_depth', {
              scroll_depth: point,
              page: window.location.pathname
            });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Initialize time tracking
  private initTimeTracking() {
    const startTime = Date.now();
    
    const trackTimeOnPage = () => {
      const timeSpent = Date.now() - startTime;
      this.trackEvent('time_on_page', {
        time_spent: Math.round(timeSpent / 1000), // in seconds
        page: window.location.pathname
      });
    };

    // Track when user leaves the page
    window.addEventListener('beforeunload', trackTimeOnPage);
    
    // Track periodically for long sessions
    setInterval(trackTimeOnPage, 60000); // every minute
  }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackToolUsage: analytics.trackToolUsage.bind(analytics),
    trackAdInteraction: analytics.trackAdInteraction.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackCategoryView: analytics.trackCategoryView.bind(analytics)
  };
};