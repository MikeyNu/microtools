'use client'

import { useEffect, useCallback } from 'react'

// Tool tracking hook for analytics and user engagement
export function useToolTracker() {
  const trackToolStart = useCallback(() => {
    // Track when user starts using a tool
    if (typeof window !== 'undefined') {
      // Google Analytics event tracking
      if (window.gtag) {
        window.gtag('event', 'tool_start', {
          event_category: 'tool_usage',
          event_label: window.location.pathname
        })
      }
      
      // Custom analytics tracking
      console.log('Tool started:', window.location.pathname)
    }
  }, [])

  const trackToolComplete = useCallback((result?: any) => {
    // Track when user completes a calculation/conversion
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'tool_complete', {
          event_category: 'tool_usage',
          event_label: window.location.pathname,
          value: 1
        })
      }
      
      console.log('Tool completed:', window.location.pathname, result)
    }
  }, [])

  const trackToolError = useCallback((error: string) => {
    // Track errors for debugging and improvement
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'tool_error', {
          event_category: 'tool_usage',
          event_label: window.location.pathname,
          description: error
        })
      }
      
      console.error('Tool error:', window.location.pathname, error)
    }
  }, [])

  const trackToolShare = useCallback((method: string) => {
    // Track when users share tool results
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'tool_share', {
          event_category: 'engagement',
          event_label: window.location.pathname,
          method: method
        })
      }
      
      console.log('Tool shared:', window.location.pathname, method)
    }
  }, [])

  return {
    trackToolStart,
    trackToolComplete,
    trackToolError,
    trackToolShare
  }
}

// Global gtag type declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}