'use client';

import React, { useEffect, createContext, useContext, useState } from 'react';
import { ADSENSE_CONFIG } from '@/lib/adsense-config';

// AdSense Context
interface AdSenseContextType {
  isAdSenseLoaded: boolean;
  isAdBlockerDetected: boolean;
  adPerformance: Record<string, { impressions: number; clicks: number; ctr: number }>;
  trackAdImpression: (adUnitId: string, placement: string) => void;
  trackAdClick: (adUnitId: string, placement: string) => void;
}

const AdSenseContext = createContext<AdSenseContextType | null>(null);

// AdSense Provider Component
export function AdSenseProvider({ children }: { children: React.ReactNode }) {
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [adPerformance, setAdPerformance] = useState<Record<string, { impressions: number; clicks: number; ctr: number }>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize AdSense
    initializeAdSense();
    
    // Detect ad blocker
    detectAdBlocker();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
  }, []);

  const initializeAdSense = async () => {
    // Don't initialize if publisher ID is missing
    const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
    if (!publisherId || publisherId === 'pub-4745112150588316') {
      console.log('AdSense: Publisher ID not configured, skipping initialization');
      return;
    }

    const fullPublisherId = `ca-${publisherId}`;

    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${fullPublisherId}`;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          setIsAdSenseLoaded(true);
          
          // Enable auto ads if configured and not using placeholder IDs
          if (ADSENSE_CONFIG.optimization.autoAds && ADSENSE_CONFIG.publisherId !== 'ca-pub-4745112150588316') {
            (window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: fullPublisherId,
              enable_page_level_ads: true,
              overlays: { bottom: true }
            });
          }
        };
        
        script.onerror = () => {
          console.warn('AdSense script failed to load');
          setIsAdBlockerDetected(true);
        };
        
        document.head.appendChild(script);
      } else {
        setIsAdSenseLoaded(true);
      }
    } catch (error) {
      console.warn('AdSense initialization failed:', error);
      setIsAdBlockerDetected(true);
    }
  };

  const detectAdBlocker = () => {
    // Create a test ad element to detect ad blockers
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setIsAdBlockerDetected(true);
      }
      document.body.removeChild(testAd);
    }, 100);
  };

  const setupPerformanceMonitoring = () => {
    // Monitor ad load times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('googlesyndication') || entry.name.includes('adsbygoogle')) {
          console.log('Ad load time:', entry.duration);
          
          // Track slow ad loads
          if (entry.duration > 3000) { // 3 seconds threshold for slow ad loads
            console.warn('Slow ad load detected:', entry.duration + 'ms');
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  };

  const trackAdImpression = (adUnitId: string, placement: string) => {
    setAdPerformance(prev => {
      const current = prev[adUnitId] || { impressions: 0, clicks: 0, ctr: 0 };
      const updated = {
        ...current,
        impressions: current.impressions + 1
      };
      updated.ctr = updated.clicks / updated.impressions;
      
      return {
        ...prev,
        [adUnitId]: updated
      };
    });

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_impression', {
        ad_unit_id: adUnitId,
        ad_placement: placement,
        timestamp: new Date().toISOString()
      });
    }
  };

  const trackAdClick = (adUnitId: string, placement: string) => {
    setAdPerformance(prev => {
      const current = prev[adUnitId] || { impressions: 0, clicks: 0, ctr: 0 };
      const updated = {
        ...current,
        clicks: current.clicks + 1
      };
      updated.ctr = updated.clicks / updated.impressions;
      
      return {
        ...prev,
        [adUnitId]: updated
      };
    });

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_click', {
        ad_unit_id: adUnitId,
        ad_placement: placement,
        timestamp: new Date().toISOString()
      });
    }
  };

  const contextValue: AdSenseContextType = {
    isAdSenseLoaded,
    isAdBlockerDetected,
    adPerformance,
    trackAdImpression,
    trackAdClick
  };

  return (
    <AdSenseContext.Provider value={contextValue}>
      {children}
      {isAdBlockerDetected && <AdBlockerNotice />}
    </AdSenseContext.Provider>
  );
}

// Hook to use AdSense context
export function useAdSense() {
  const context = useContext(AdSenseContext);
  if (!context) {
    throw new Error('useAdSense must be used within an AdSenseProvider');
  }
  return context;
}

// Ad Blocker Notice Component
function AdBlockerNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">Ad Blocker Detected</p>
          <p className="text-xs mt-1">
            Please consider disabling your ad blocker to support our free tools.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-yellow-600 hover:text-yellow-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// AdSense Script Component
export function AdSenseScript() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (!publisherId || publisherId === 'pub-4745112150588316') {
    return null;
  }

  const fullPublisherId = `ca-${publisherId}`;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${fullPublisherId}`}
      crossOrigin="anonymous"
    />
  );
}

// Enhanced Ad Component with tracking
export function TrackedAd({ 
  adUnitId, 
  placement, 
  size = 'rectangle',
  className = '' 
}: { 
  adUnitId: string; 
  placement: string; 
  size?: string;
  className?: string;
}) {
  const { isAdSenseLoaded, isAdBlockerDetected, trackAdImpression, trackAdClick } = useAdSense();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAdSenseLoaded && !isAdBlockerDetected) {
      // Track impression when ad becomes visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            trackAdImpression(adUnitId, placement);
          }
        },
        { threshold: 0.5 }
      );

      const adElement = document.getElementById(`ad-${adUnitId}`);
      if (adElement) {
        observer.observe(adElement);
      }

      return () => observer.disconnect();
    }
  }, [isAdSenseLoaded, isAdBlockerDetected, adUnitId, placement, isVisible, trackAdImpression]);

  const handleAdClick = () => {
    trackAdClick(adUnitId, placement);
  };

  if (isAdBlockerDetected || ADSENSE_CONFIG.publisherId === 'ca-pub-4745112150588316' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600">Advertisement</p>
        <p className="text-xs text-gray-500 mt-1">Please disable ad blocker to support us</p>
      </div>
    );
  }

  return (
    <div 
      id={`ad-${adUnitId}`}
      className={className}
      onClick={handleAdClick}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Declare global types
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}