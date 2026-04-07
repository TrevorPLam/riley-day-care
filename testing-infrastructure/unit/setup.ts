import { vi } from 'vitest'
import { beforeEach, afterEach } from 'vitest'

// Global test setup for all test files
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Reset any global state after each test
  vi.restoreAllMocks()
})

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
