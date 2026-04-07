import { test, expect } from './fixtures/test-fixtures'
import { devices } from '@playwright/test'

test.describe('Enrollment Flow - Enterprise Grade', () => {
  test.beforeEach(async ({ enrollmentPage }) => {
    await enrollmentPage.navigateTo('/enrollment')
    await enrollmentPage.waitForPageLoad()
    await expect(enrollmentPage.page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should submit enrollment form successfully with valid data', async ({ enrollmentPage, testDataFactory }) => {
    const validData = testDataFactory.createValidEnrollmentData()
    
    await enrollmentPage.fillEnrollmentForm(validData)
    await enrollmentPage.submitForm()
    await enrollmentPage.waitForSuccessMessage()
    
    // Verify accessibility after submission
    await expect(enrollmentPage.page.locator('body')).toBeVisible()
  })

  test('should validate all required fields and show specific error messages', async ({ enrollmentPage, testDataFactory }) => {
    // Test empty form submission
    await enrollmentPage.submitForm()
    
    const errors = await enrollmentPage.getFormValidationErrors()
    expect(errors.length).toBeGreaterThan(0)
    
    // Should have errors for all required fields
    const expectedErrors = ['parent', 'child', 'age', 'date', 'phone', 'email']
    for (const errorType of expectedErrors) {
      const hasError = errors.some(error => 
        error.toLowerCase().includes(errorType.toLowerCase())
      )
      expect(hasError).toBe(true)
    }
  })

  test('should validate email format with specific error message', async ({ enrollmentPage, testDataFactory }) => {
    const invalidData = testDataFactory.createInvalidEnrollmentData('email', 'invalid-email')
    
    await enrollmentPage.fillEnrollmentForm(invalidData)
    await enrollmentPage.submitForm()
    await enrollmentPage.waitForErrorMessage()
    await expect(enrollmentPage.errorMessage).toContainText(/valid email/i)
  })

  test('should validate phone number format and length', async ({ enrollmentPage, testDataFactory }) => {
    const invalidData = testDataFactory.createInvalidEnrollmentData('phone', '123')
    
    await enrollmentPage.fillEnrollmentForm(invalidData)
    await enrollmentPage.submitForm()
    await enrollmentPage.verifyValidationError('phone')
  })

  test('should handle rate limiting gracefully', async ({ enrollmentPage, testDataFactory }) => {
    const validData = testDataFactory.createValidEnrollmentData()
    
    // Submit multiple times rapidly
    for (let i = 0; i < 6; i++) {
      await enrollmentPage.fillEnrollmentForm(validData)
      await enrollmentPage.submitForm()
      
      if (i >= 4) {
        // Should show rate limiting message
        await enrollmentPage.verifyValidationError('too many attempts')
        break
      }
    }
  })

  test('should maintain form data during validation errors', async ({ enrollmentPage, testDataFactory }) => {
    const validData = testDataFactory.createValidEnrollmentData()
    const invalidData = testDataFactory.createInvalidEnrollmentData('email', 'invalid-email')
    
    await enrollmentPage.fillEnrollmentForm(invalidData)
    await enrollmentPage.submitForm()
    await enrollmentPage.verifyValidationError('email')
    
    // Verify other fields still have their values
    const parentNameValue = await enrollmentPage.page.locator('input[name="parentName"]').inputValue()
    expect(parentNameValue).toBe(validData.parentName)
  })

  test('should be accessible on all devices', async ({ enrollmentPage, testDataFactory }, testInfo) => {
    const validData = testDataFactory.createValidEnrollmentData()
    
    // Test on different viewports
    const viewports = [
      { width: 375, height: 667 },  // iPhone
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ]
    
    for (const viewport of viewports) {
      await enrollmentPage.page.setViewportSize(viewport)
      await enrollmentPage.verifyPageLoaded()
      
      // Check accessibility
      await expect(enrollmentPage.page.locator('body')).toBeAccessible()
      
      // Verify form is usable
      await enrollmentPage.fillEnrollmentForm(validData)
      await expect(enrollmentPage.page.locator('button[type="submit"]')).toBeEnabled()
    }
  })
})

test.describe('Enrollment Flow - Cross Browser', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test.describe(`${browserName} browser`, () => {
      test.use({ 
        browserName: browserName as 'chromium' | 'firefox' | 'webkit',
        viewport: { width: 1280, height: 720 }
      })

      test('should work consistently across browsers', async ({ enrollmentPage, testDataFactory }) => {
        const validData = testDataFactory.createValidEnrollmentData()
        
        await enrollmentPage.navigateTo('/enrollment')
        await enrollmentPage.verifyPageLoaded()
        await enrollmentPage.fillEnrollmentForm(validData)
        await enrollmentPage.submitForm()
        await enrollmentPage.verifySubmissionSuccess()
      })
    })
  })
})

test.describe('Enrollment Flow - Visual Regression', () => {
  test('should look consistent across different states', async ({ enrollmentPage, testDataFactory }) => {
    await enrollmentPage.page.setViewportSize({ width: 1280, height: 720 })
    
    // Take screenshot of empty form
    await enrollmentPage.page.screenshot({ 
      path: 'visual-tests/enrollment-empty-form.png',
      fullPage: true 
    })
    
    // Fill form partially and take screenshot
    const partialData = testDataFactory.createValidEnrollmentData()
    delete partialData.message
    await enrollmentPage.fillEnrollmentForm(partialData)
    await enrollmentPage.page.screenshot({ 
      path: 'visual-tests/enrollment-partial-form.png',
      fullPage: true 
    })
    
    // Submit and take screenshot of success state
    await enrollmentPage.submitForm()
    await enrollmentPage.verifySubmissionSuccess()
    await enrollmentPage.page.screenshot({ 
      path: 'visual-tests/enrollment-success.png',
      fullPage: true 
    })
  })
})
