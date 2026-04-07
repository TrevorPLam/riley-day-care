import { test, expect } from '@playwright/test'

test.describe('Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to enrollment page and submit form successfully', async ({ page }) => {
    // Navigate to enrollment page
    await page.click('text=Enroll Now')
    await expect(page).toHaveURL('/enrollment')
    
    // Verify page loads correctly
    await expect(page.getByRole('heading', { name: 'Schedule a tour and check availability.' })).toBeVisible()
    
    // Fill out the enrollment form
    await page.fill('input[name="parentName"]', 'John Doe')
    await page.fill('input[name="childName"]', 'Jane Doe')
    await page.fill('input[name="childAge"]', '3 years')
    await page.fill('input[name="startDate"]', '2024-06-01')
    await page.fill('input[name="phone"]', '(555) 123-4567')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('textarea[name="message"]', 'Looking forward to joining your daycare!')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('text=Thank you for your inquiry')).toBeVisible()
    await expect(page.locator('text=We will contact you within 24 hours')).toBeVisible()
  })

  test('should validate form fields and show error messages', async ({ page }) => {
    // Navigate to enrollment page
    await page.click('text=Enroll Now')
    await expect(page).toHaveURL('/enrollment')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Parent/guardian name is required')).toBeVisible()
    await expect(page.locator('text=Child\'s name is required')).toBeVisible()
    await expect(page.locator('text=Child\'s age is required')).toBeVisible()
    await expect(page.locator('text=Preferred start date is required')).toBeVisible()
    await expect(page.locator('text=Phone number is required')).toBeVisible()
    await expect(page.locator('text=Email address is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    // Navigate to enrollment page
    await page.click('text=Enroll Now')
    
    // Fill form with invalid email
    await page.fill('input[name="parentName"]', 'John Doe')
    await page.fill('input[name="childName"]', 'Jane Doe')
    await page.fill('input[name="childAge"]', '3 years')
    await page.fill('input[name="startDate"]', '2024-06-01')
    await page.fill('input[name="phone"]', '(555) 123-4567')
    await page.fill('input[name="email"]', 'invalid-email')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Should show email validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    // Navigate to enrollment page
    await page.click('text=Enroll Now')
    
    // Fill form with invalid phone
    await page.fill('input[name="parentName"]', 'John Doe')
    await page.fill('input[name="childName"]', 'Jane Doe')
    await page.fill('input[name="childAge"]', '3 years')
    await page.fill('input[name="startDate"]', '2024-06-01')
    await page.fill('input[name="phone"]', '123')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Should show phone validation error
    await expect(page.locator('text=Phone number is too short')).toBeVisible()
  })

  test('should handle rate limiting', async ({ page }) => {
    // Navigate to enrollment page
    await page.click('text=Enroll Now')
    
    // Fill out valid form
    await page.fill('input[name="parentName"]', 'John Doe')
    await page.fill('input[name="childName"]', 'Jane Doe')
    await page.fill('input[name="childAge"]', '3 years')
    await page.fill('input[name="startDate"]', '2024-06-01')
    await page.fill('input[name="phone"]', '(555) 123-4567')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    
    // Submit multiple times quickly to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }
    
    // Should eventually show rate limiting message
    await expect(page.locator('text=Too many attempts')).toBeVisible()
  })
})
