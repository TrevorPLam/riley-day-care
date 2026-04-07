import { expect, vi, afterEach, beforeEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_PHONE: '(972) 286-0357',
    NEXT_PUBLIC_EMAIL: 'info@rileydaycare.com',
    NEXT_PUBLIC_ADDRESS: '1509 Haymarket Rd, Dallas, TX 75253',
    RESEND_API_KEY: 'test-api-key',
    RESEND_FROM_EMAIL: 'test@rileydaycare.com',
    REDIS_URL: 'redis://localhost:6379',
  },
}))

// Mock external dependencies
vi.mock('@/lib/email', () => ({
  sendEnrollmentEmail: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ 
    success: true, 
    remaining: 4, 
    reset: new Date(Date.now() + 60000) 
  }),
  createRateLimitHeaders: vi.fn().mockReturnValue({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': '4',
    'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
  }),
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: {
    CTA_SCHEDULE_TOUR: 'cta_schedule_tour',
    ENROLLMENT_SUBMITTED: 'enrollment_submitted',
    PAGE_VIEW: 'page_view',
  },
  trackEvent: vi.fn(),
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
  
  // Reset DOM
  document.body.innerHTML = ''
  
  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  })
  
  // Mock console methods to avoid noise in tests
  const originalConsole = { ...console }
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

// Global test cleanup
afterEach(() => {
  // Restore all mocks
  vi.restoreAllMocks()
  
  // Clean up any timers
  vi.clearAllTimers()
  
  // Reset DOM state
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

// Custom matchers for common assertions
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
      pass,
    }
  },
  toBeValidPhone(received: string) {
    const phoneRegex = /^[\d\s\-\+\(\)\.]+$/
    const pass = phoneRegex.test(received) && received.replace(/\D/g, '').length >= 10
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid phone number`
          : `expected ${received} to be a valid phone number`,
      pass,
    }
  },
})
