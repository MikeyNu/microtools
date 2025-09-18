'use client';

import { useEffect, useState } from 'react';
import { shouldDisplayAds } from '@/lib/adsense-config';

export function AdSenseVisualTest() {
  const [adSenseStatus, setAdSenseStatus] = useState({
    isLoading: true,
    isConfigured: false,
    publisherId: '',
    hasScript: false,
    canDisplay: false
  });

  useEffect(() => {
    const checkAdSense = () => {
      const canDisplay = shouldDisplayAds();
      const hasScript = typeof window !== 'undefined' && !!window.adsbygoogle;
      const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '';
      
      setAdSenseStatus({
        isLoading: false,
        isConfigured: !!publisherId,
        publisherId: `ca-${publisherId}`,
        hasScript,
        canDisplay
      });
    };

    // Check immediately and after 2 seconds
    checkAdSense();
    const timer = setTimeout(checkAdSense, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (adSenseStatus.isLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        🔍 AdSense Live Status
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Publisher ID:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            adSenseStatus.isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {adSenseStatus.publisherId || 'Not configured'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Script Loaded:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            adSenseStatus.hasScript ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {adSenseStatus.hasScript ? '✅ Yes' : '⏳ Loading...'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Can Display Ads:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            adSenseStatus.canDisplay ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {adSenseStatus.canDisplay ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Test Instructions:</strong> Open DevTools → Network tab → Look for 
          <code className="bg-blue-100 px-1 rounded">googlesyndication.com</code> requests
        </p>
      </div>

      {/* Actual AdSense ad slot for testing */}
      {adSenseStatus.canDisplay && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Test Ad Slot:</h4>
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
            <p className="text-gray-500 text-sm mb-2">
              AdSense Auto Ads should appear here
            </p>
            <div className="text-xs text-gray-400">
              (May be blank in localhost - this is normal)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}