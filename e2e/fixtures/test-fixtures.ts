import { test as base, expect } from '@playwright/test'

// Test data factory for creating consistent test data
export class TestDataFactory {
  static createValidEnrollmentData(overrides = {}) {
    return {
      parentName: 'John Doe',
      childName: 'Jane Doe',
      childAge: '3 years',
      startDate: '2024-06-01',
      phone: '(555) 123-4567',
      email: 'john.doe@example.com',
      message: 'Looking forward to joining your daycare!',
      ...overrides
    }
  }

  static createInvalidEnrollmentData(field: string, invalidValue: any) {
    const validData = this.createValidEnrollmentData()
    return { ...validData, [field]: invalidValue }
  }

  static createMultipleEnrollmentRequests(count: number) {
    return Array.from({ length: count }, (_, index) => 
      this.createValidEnrollmentData({
        parentName: `Parent ${index + 1}`,
        childName: `Child ${index + 1}`,
        email: `parent${index + 1}@example.com`
      })
    )
  }
}

// Custom test fixtures with page objects
type TestFixtures = {
  enrollmentPage: import('../page-objects/BasePage').EnrollmentPage
  navigationPage: import('../page-objects/BasePage').NavigationPage
  testDataFactory: typeof TestDataFactory
}

export const test = base.extend<TestFixtures>({
  enrollmentPage: async ({ page }, use) => {
    const { EnrollmentPage } = await import('../page-objects/BasePage')
    const enrollmentPage = new EnrollmentPage(page)
    await use(enrollmentPage)
  },

  navigationPage: async ({ page }, use) => {
    const { NavigationPage } = await import('../page-objects/BasePage')
    const navigationPage = new NavigationPage(page)
    await use(navigationPage)
  },

  testDataFactory: async ({}, use) => {
    await use(TestDataFactory)
  }
})

// Custom assertions for common patterns
export const customExpect = {
  async toHaveValidFormStructure(page: any) {
    const inputs = await page.locator('input, textarea, select').all()
    expect(inputs.length).toBeGreaterThan(0)
    
    for (const input of inputs) {
      const hasLabel = await input.locator('xpath=./ancestor::*[contains(@role, "label")] or ./preceding-sibling::label or ./following-sibling::label').count()
      expect(hasLabel).toBeGreaterThan(0)
    }
  },

  async toHaveAccessibleNavigation(page: any) {
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
    
    const links = nav.getByRole('link')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      await expect(link).toHaveAttribute('href')
      await expect(link).not.toBeEmpty()
    }
  },

  async toHaveSuccessfulSubmission(page: any) {
    const successIndicators = [
      page.getByText(/thank you/i),
      page.getByText(/enrollment received/i),
      page.getByText(/we'll contact you/i),
      page.getByText(/submission successful/i)
    ]
    
    let found = false
    for (const indicator of successIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        found = true
        break
      }
    }
    
    expect(found).toBe(true)
  }
}

// Re-export expect with custom assertions
export { expect }
