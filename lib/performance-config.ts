// Performance optimization configurations and utilities

// Cache configuration
export const CACHE_CONFIG = {
  // Tool results cache duration (in milliseconds)
  TOOL_RESULTS: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
  USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours
  
  // API response cache
  API_RESPONSES: 2 * 60 * 1000, // 2 minutes
  
  // Static content cache
  STATIC_CONTENT: 60 * 60 * 1000, // 1 hour
}

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  TOOL_EXECUTION: 3000, // Tool execution time (ms)
  PAGE_LOAD: 2000,      // Page load time (ms)
  API_RESPONSE: 1000,   // API response time (ms)
}

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  // Intersection Observer options
  rootMargin: '50px',
  threshold: 0.1,
  
  // Image loading
  imageQuality: 85,
  imageSizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  },
  
  // Component lazy loading
  componentDelay: 100, // ms
}

// Memory management
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  private maxSize: number
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }
  
  set(key: string, data: T, ttl: number): void {
    // Clean expired entries
    this.cleanup()
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  has(key: string): boolean {
    return this.get(key) !== null
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to track hits/misses for accurate calculation
    }
  }
}

// Global cache instances
export const toolResultsCache = new MemoryCache(50)
export const searchResultsCache = new MemoryCache(30)
export const apiResponseCache = new MemoryCache(100)

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  // Measure function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration)
      throw error
    }
  }
  
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration)
      throw error
    }
  }
  
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }
  
  getMetrics(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null
    
    const sorted = [...values].sort((a, b) => a - b)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }
  
  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }
  
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality = LAZY_LOADING_CONFIG.imageQuality
): string {
  // This would integrate with your image optimization service
  // For now, return the original URL
  return src
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return
  
  // Preload critical fonts
  const fontUrls: string[] = [
    // Add your critical font URLs here
  ]
  
  fontUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
  
  // Preload critical images
  const imageUrls: string[] = [
    // Add your critical image URLs here
  ]
  
  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = 'image'
    document.head.appendChild(link)
  })
}

// Bundle size optimization
export const BUNDLE_CONFIG = {
  // Code splitting points
  splitPoints: [
    'calculators',
    'converters',
    'text-tools',
    'design-tools',
    'web-tools',
    'seo-tools'
  ],
  
  // Lazy load these components
  lazyComponents: [
    'AdvancedCalculator',
    'ColorPicker',
    'ImageEditor',
    'CodeFormatter'
  ],
  
  // Critical CSS threshold
  criticalCssSize: 14 * 1024, // 14KB
}

// Web Vitals monitoring
export function initWebVitals() {
  if (typeof window === 'undefined') return
  
  // This would integrate with web-vitals library
  // For now, just set up basic performance observers
  
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as any // FID entries have processingStart property
        console.log('FID:', fidEntry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance()