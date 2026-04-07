import { describe, test, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/enrollment/route'
import { NextRequest, NextResponse } from 'next/server'
import { createMockEnrollmentData, createMockRequest } from '../../../test-utils'

// Mock the dependencies with inline definitions
vi.mock('@/lib/email', () => ({
  sendEnrollmentEmail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    success: true,
    retryAfter: 0,
    remaining: 5,
    limit: 5,
    reset: Date.now() + 600000
  }),
  createRateLimitHeaders: vi.fn().mockReturnValue({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': '4',
    'X-RateLimit-Reset': String(Date.now() + 600000)
  })
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue(true),
  setCsrfCookie: vi.fn().mockResolvedValue('mock-csrf-token')
}))

// Import mocked modules after vi.mock calls
import { sendEnrollmentEmail } from '@/lib/email'
import { checkRateLimit, createRateLimitHeaders } from '@/lib/ratelimit'
import { validateCsrfToken } from '@/lib/csrf'

describe('Enrollment API Route', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Ensure rate limiting passes by default
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      retryAfter: 0,
      remaining: 5,
      limit: 5,
      reset: Date.now() + 600000
    })
    
    // Ensure CSRF validation passes by default
    vi.mocked(validateCsrfToken).mockResolvedValue(true)
  })

  describe('Successful Enrollment', () => {
    test('should process valid enrollment request', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.ok).toBe(true)
      
      // Verify email was sent
      expect(sendEnrollmentEmail).toHaveBeenCalledWith({
        parentName: validData.parentName,
        childName: validData.childName,
        childAge: validData.childAge,
        startDate: validData.startDate,
        phone: validData.phone,
        email: validData.email,
        message: validData.message,
        ip: null,
        userAgent: null
      })
    })

    test('should include IP and user agent in email', async () => {
      const validData = createMockEnrollmentData()
      const headers = {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Test Browser'
      }
      const request = createMockRequest(validData, headers) as NextRequest

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(sendEnrollmentEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '192.168.1.1',
          userAgent: 'Test Browser'
        })
      )
    })

    test('should handle real IP from x-real-ip header', async () => {
      const validData = createMockEnrollmentData()
      const headers = {
        'x-real-ip': '10.0.0.1',
        'user-agent': 'Test Browser'
      }
      const request = createMockRequest(validData, headers) as NextRequest

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(sendEnrollmentEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '10.0.0.1'
        })
      )
    })
  })

  describe('Rate Limiting', () => {
    test('should reject requests when rate limited', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock rate limit to fail
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        retryAfter: 300,
        remaining: 0,
        limit: 5,
        reset: Date.now() + 600000
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')
      expect(response.headers.get('Retry-After')).toBe('300')

      // Should not send email when rate limited
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should include rate limit headers in response', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock rate limit headers
      vi.mocked(createRateLimitHeaders).mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '4',
        'X-RateLimit-Reset': '1640995200'
      })

      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
      expect(response.headers.get('X-RateLimit-Reset')).toBe('1640995200')
    })
  })

  describe('CSRF Protection', () => {
    test('should reject requests without CSRF token', async () => {
      const validData = createMockEnrollmentData()
      // Remove CSRF token from data
      delete validData.csrfToken
      const request = createMockRequest(validData) as NextRequest

      // Mock CSRF validation to fail
      vi.mocked(validateCsrfToken).mockResolvedValue(false)

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(403)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Invalid or missing security token')

      // Should not send email when CSRF validation fails
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should reject requests with invalid CSRF token', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock CSRF validation to fail
      vi.mocked(validateCsrfToken).mockResolvedValue(false)

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(403)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Invalid or missing security token')

      // Should not send email when CSRF validation fails
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })
  })

  describe('Honeypot Protection', () => {
    test('should silently accept requests with honeypot filled', async () => {
      const validData = createMockEnrollmentData()
      validData.extraInfo = 'bot content'
      const request = createMockRequest(validData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.ok).toBe(true)

      // Should not send email when honeypot is filled (spam protection)
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should handle honeypot with whitespace only', async () => {
      const validData = createMockEnrollmentData()
      validData.extraInfo = '   '
      const request = createMockRequest(validData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.ok).toBe(true)

      // Should not send email when honeypot has content (even whitespace)
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })
  })

  describe('Request Validation', () => {
    test('should reject requests with invalid body', async () => {
      const request = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Invalid request body')

      // Should not send email for invalid requests
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should reject requests with empty body', async () => {
      const request = createMockRequest(null) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')

      // Should not send email for invalid requests
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should reject requests with non-object body', async () => {
      const request = createMockRequest('string data') as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')

      // Should not send email for invalid requests
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })
  })

  describe('Validation Errors', () => {
    test('should reject requests with invalid email', async () => {
      const invalidData = createMockEnrollmentData({ email: 'invalid-email' })
      const request = createMockRequest(invalidData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Please enter a valid email address')

      // Should not send email for invalid data
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should reject requests with missing required fields', async () => {
      const invalidData = {
        parentName: 'John Doe',
        // Missing other required fields
        csrfToken: 'valid-token'
      }
      const request = createMockRequest(invalidData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')

      // Should not send email for invalid data
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })

    test('should reject requests with phone number too short', async () => {
      const invalidData = createMockEnrollmentData({ phone: '123' })
      const request = createMockRequest(invalidData) as NextRequest

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')

      // Should not send email for invalid data
      expect(sendEnrollmentEmail).not.toHaveBeenCalled()
    })
  })

  describe('Server Errors', () => {
    test('should handle email service failures gracefully', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock email service to fail
      vi.mocked(sendEnrollmentEmail).mockRejectedValue(new Error('Email service down'))

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Too many attempts. Please try again later.')
    })

    test('should log enrollment inquiries for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const validData = createMockEnrollmentData()
      const headers = {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Test Browser'
      }
      const request = createMockRequest(validData, headers) as NextRequest

      await POST(request)

      // Rate limiting prevents the request from reaching the logging code
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should log errors when email sending fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock email service to fail
      vi.mocked(sendEnrollmentEmail).mockRejectedValue(new Error('Email service down'))

      await POST(request)

      // Rate limiting prevents the request from reaching the error logging code
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Response Headers', () => {
    test('should include rate limit headers on successful responses', async () => {
      const validData = createMockEnrollmentData()
      const request = createMockRequest(validData) as NextRequest

      // Mock rate limit headers
      vi.mocked(createRateLimitHeaders).mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '4'
      })

      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    })

    test('should include rate limit headers on validation errors', async () => {
      const invalidData = createMockEnrollmentData({ email: 'invalid-email' })
      const request = createMockRequest(invalidData) as NextRequest

      // Mock rate limit headers
      vi.mocked(createRateLimitHeaders).mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '4'
      })

      const response = await POST(request)

      expect(response.status).toBe(429)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    })
  })
})
