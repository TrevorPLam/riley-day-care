import { vi, expect } from 'vitest'

// Mock factory for creating consistent test data
export const createMockEnrollmentData = (overrides = {}) => ({
  parentName: 'John Doe',
  childName: 'Jane Doe',
  childAge: '3 years',
  startDate: '2024-06-01',
  phone: '(555) 123-4567',
  email: 'john.doe@example.com',
  message: 'Looking forward to joining your daycare!',
  ...overrides,
})

// Mock factory for invalid test data
export const createInvalidEnrollmentData = (field: string, value: any) => {
  const validData = createMockEnrollmentData()
  return { ...validData, [field]: value }
}

// Mock Next.js request/response objects
export const createMockRequest = (body: any, headers: Record<string, string> = {}) => ({
  json: vi.fn().mockResolvedValue(body),
  headers: new Headers(headers),
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.headers = new Map()
  return res
}

// Mock FormData for form submissions
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  return formData
}

// Test helpers for validation
export const expectValidationToPass = (schema: any, data: any) => {
  const result = schema.safeParse(data)
  expect(result.success).toBe(true)
  return result.data
}

export const expectValidationToFail = (schema: any, data: any, expectedError?: string) => {
  const result = schema.safeParse(data)
  expect(result.success).toBe(false)
  if (expectedError) {
    expect(result.error.issues[0].message).toContain(expectedError)
  }
  return result.error
}

// Mock environment variables
export const setMockEnvVars = (vars: Record<string, string>) => {
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value
  })
}

export const clearMockEnvVars = (vars: string[]) => {
  vars.forEach(key => {
    delete process.env[key]
  })
}

// Async test utilities
export const waitFor = (condition: () => boolean, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      try {
        if (condition()) {
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'))
        } else {
          setTimeout(check, 100)
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    }
    
    check()
  })
}

// Mock email service
export const mockEmailService = {
  sendEnrollmentEmail: vi.fn().mockResolvedValue(undefined),
  reset: () => {
    mockEmailService.sendEnrollmentEmail.mockClear()
  }
}

// Mock rate limiting
export const mockRateLimit = {
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
  }),
  reset: () => {
    mockRateLimit.checkRateLimit.mockClear()
    mockRateLimit.createRateLimitHeaders.mockClear()
  }
}

// Mock CSRF protection
export const mockCsrf = {
  validateCsrfToken: vi.fn().mockResolvedValue(true),
  setCsrfCookie: vi.fn().mockResolvedValue('mock-csrf-token'),
  reset: () => {
    mockCsrf.validateCsrfToken.mockClear()
    mockCsrf.setCsrfCookie.mockClear()
  }
}
