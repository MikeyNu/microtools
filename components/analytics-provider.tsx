'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { analytics, useAnalytics } from '@/lib/analytics-config';

// Analytics Context
const AnalyticsContext = createContext<ReturnType<typeof useAnalytics> | null>(null);

// Analytics Provider Component
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const analyticsHooks = useAnalytics();

  useEffect(() => {
    // Initialize analytics on client side
    if (typeof window !== 'undefined') {
      analytics.init();
      
      // Track initial page view
      analyticsHooks.trackCategoryView('homepage', 6); // 6 main categories
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={analyticsHooks}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics in components
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

// Google Analytics Script Component
export function GoogleAnalyticsScript() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  if (!measurementId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
}

// Page View Tracker Component
export function PageViewTracker({ 
  pageName, 
  category, 
  toolsCount 
}: { 
  pageName: string; 
  category?: string; 
  toolsCount?: number; 
}) {
  const analytics = useAnalyticsContext();

  useEffect(() => {
    // Track page view
    if (category && toolsCount !== undefined) {
      analytics.trackCategoryView(category, toolsCount);
    }
  }, [pageName, category, toolsCount, analytics]);

  return null;
}

// Tool Usage Tracker Hook
export function useToolTracker(toolName: string, category: string) {
  const analytics = useAnalyticsContext();

  const trackToolStart = () => {
    analytics.trackToolUsage(toolName, category, 'started');
  };

  const trackToolComplete = () => {
    analytics.trackToolUsage(toolName, category, 'completed');
  };

  const trackToolError = () => {
    analytics.trackToolUsage(toolName, category, 'error');
  };

  return {
    trackToolStart,
    trackToolComplete,
    trackToolError
  };
}

// Ad Interaction Tracker Hook
export function useAdTracker() {
  const analytics = useAnalyticsContext();

  const trackAdView = (placement: string, adUnitId?: string) => {
    analytics.trackAdInteraction(placement, 'viewed', adUnitId);
  };

  const trackAdClick = (placement: string, adUnitId?: string) => {
    analytics.trackAdInteraction(placement, 'clicked', adUnitId);
  };

  return {
    trackAdView,
    trackAdClick
  };
}

// Search Tracker Hook
export function useSearchTracker() {
  const analytics = useAnalyticsContext();

  const trackSearch = (query: string, resultsCount: number) => {
    analytics.trackSearch(query, resultsCount);
  };

  return { trackSearch };
}