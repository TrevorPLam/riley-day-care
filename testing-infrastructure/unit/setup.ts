import { afterEach, beforeEach, expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

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

vi.mock('@/lib/email', () => ({
  sendEnrollmentEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    success: true,
    retryAfter: 0,
    remaining: 4,
    limit: 5,
    reset: Date.now() + 600000,
  }),
  createRateLimitHeaders: vi.fn().mockReturnValue({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': '4',
    'X-RateLimit-Reset': String(Date.now() + 600000),
  }),
}))

vi.mock('@/lib/csrf', () => ({
  generateCsrfToken: vi.fn().mockReturnValue('mock-csrf-token'),
  validateCsrfToken: vi.fn().mockResolvedValue(true),
  setCsrfCookie: vi.fn().mockResolvedValue('mock-csrf-token'),
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: {
    CTA_SCHEDULE_TOUR: 'cta_schedule_tour',
    FORM_ENROLLMENT_SUBMIT: 'form_enrollment_submit',
    PAGE_VIEW: 'page_view',
  },
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

afterEach(() => {
  vi.clearAllTimers()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})
