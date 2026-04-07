/**
 * Browser Configuration Profiles
 * Optimized configurations for different testing scenarios
 */

export interface BrowserProfile {
  name: string
  platform: 'desktop' | 'mobile' | 'tablet'
  viewport: { width: number; height: number }
  userAgent?: string
  deviceScaleFactor?: number
  isMobile?: boolean
  hasTouch?: boolean
  locale?: string
  timezone?: string
  colorScheme?: 'light' | 'dark' | 'no-preference'
  reducedMotion?: 'reduce' | 'no-preference'
}

export const browserProfiles: Record<string, BrowserProfile> = {
  // Desktop browsers
  'chromium-desktop': {
    name: 'chromium',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'firefox-desktop': {
    name: 'firefox',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'webkit-desktop': {
    name: 'webkit',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'chromium-widescreen': {
    name: 'chromium',
    platform: 'desktop',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'chromium-dark': {
    name: 'chromium',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  },

  // Mobile browsers
  'mobile-chrome': {
    name: 'chromium',
    platform: 'mobile',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'mobile-safari': {
    name: 'webkit',
    platform: 'mobile',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'mobile-chrome-large': {
    name: 'chromium',
    platform: 'mobile',
    viewport: { width: 414, height: 896 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },

  // Tablet browsers
  'tablet-ipad': {
    name: 'webkit',
    platform: 'tablet',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
  'tablet-chrome': {
    name: 'chromium',
    platform: 'tablet',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },

  // Accessibility profiles
  'accessibility-high-contrast': {
    name: 'chromium',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'reduce'
  },
  'accessibility-large-text': {
    name: 'chromium',
    platform: 'desktop',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  }
}

export const browserSets = {
  // Standard cross-browser testing
  'cross-browser': [
    'chromium-desktop',
    'firefox-desktop',
    'webkit-desktop'
  ],

  // Responsive design testing
  'responsive': [
    'chromium-widescreen',
    'chromium-desktop',
    'tablet-ipad',
    'mobile-chrome'
  ],

  // Mobile-focused testing
  'mobile-first': [
    'mobile-chrome',
    'mobile-safari',
    'mobile-chrome-large',
    'chromium-desktop'
  ],

  // Accessibility testing
  'accessibility': [
    'chromium-desktop',
    'accessibility-high-contrast',
    'accessibility-large-text',
    'mobile-chrome'
  ],

  // Performance testing
  'performance': [
    'chromium-desktop',
    'chromium-widescreen'
  ],

  // Full comprehensive testing
  'comprehensive': [
    'chromium-desktop',
    'firefox-desktop',
    'webkit-desktop',
    'chromium-widescreen',
    'chromium-dark',
    'mobile-chrome',
    'mobile-safari',
    'mobile-chrome-large',
    'tablet-ipad',
    'accessibility-high-contrast'
  ]
}

export function getBrowserProfile(profileName: string): BrowserProfile {
  const profile = browserProfiles[profileName]
  if (!profile) {
    throw new Error(`Browser profile '${profileName}' not found`)
  }
  return profile
}

export function getBrowserSet(setName: string): BrowserProfile[] {
  const set = browserSets[setName as keyof typeof browserSets]
  if (!set) {
    throw new Error(`Browser set '${setName}' not found`)
  }
  return set.map(profileName => getBrowserProfile(profileName))
}

export function getAllProfiles(): BrowserProfile[] {
  return Object.values(browserProfiles)
}

export function getAllSets(): Record<string, string[]> {
  return browserSets as Record<string, string[]>
}
