// Environment variable validation using Zod
// This ensures type-safe environment variables at runtime

import { z } from 'zod'

const envSchema = z.object({
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // AdSense
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: z.string().optional(),
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_SHOW_ADS: z.string().optional().transform(val => val === 'true'),
  
  // SEO Verification
  NEXT_PUBLIC_GOOGLE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_YANDEX_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_YAHOO_VERIFICATION: z.string().optional(),
  
  // Search Console
  NEXT_PUBLIC_GSC_ID: z.string().optional(),
  NEXT_PUBLIC_BING_ID: z.string().optional(),
  
  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env)
    
    if (!parsed.success) {
      console.error('❌ Invalid environment variables:')
      console.error(parsed.error.flatten().fieldErrors)
      
      // In development, just warn. In production, this would throw
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables')
      }
    }
    
    return parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>)
  } catch (error) {
    console.error('Error validating environment variables:', error)
    return {} as z.infer<typeof envSchema>
  }
}

export const env = validateEnv()

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>

// Helper function to check if ads should be shown
export const shouldShowAds = (): boolean => {
  return (
    env.NEXT_PUBLIC_SHOW_ADS === true &&
    !!env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID &&
    env.NODE_ENV === 'production'
  )
}

// Helper to check if analytics is enabled
export const isAnalyticsEnabled = (): boolean => {
  return (
    env.NODE_ENV === 'production' &&
    !!(env.NEXT_PUBLIC_GA_MEASUREMENT_ID || env.NEXT_PUBLIC_GA_ID)
  )
}

