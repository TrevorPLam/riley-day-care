import { test, expect } from '@playwright/test'

test.describe('Site Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate between main pages correctly', async ({ page }) => {
    // Test navigation to About page
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
    await expect(page.getByRole('heading', { name: /a calm, caring place for young children/i })).toBeVisible()

    // Test navigation to Programs page
    await page.click('text=Programs')
    await expect(page).toHaveURL('/programs')
    await expect(page.getByRole('heading', { name: /age-appropriate care for every stage/i })).toBeVisible()

    // Test navigation to Tuition page
    await page.click('text=Tuition')
    await expect(page).toHaveURL('/tuition')
    await expect(page.getByRole('heading', { name: /clear expectations for your family/i })).toBeVisible()

    // Test navigation to Contact page
    await page.click('text=Contact')
    await expect(page).toHaveURL('/contact')
    await expect(page.getByRole('heading', { name: /answer your questions/i })).toBeVisible()

    // Test navigation back to home
    await page.click('text=Riley Day Care', { timeout: 5000 })
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /a warm, licensed daycare in southeast dallas/i })).toBeVisible()
  })

  test('should handle direct URL navigation', async ({ page }) => {
    // Test direct navigation to each page
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: /a calm, caring place for young children/i })).toBeVisible()

    await page.goto('/programs')
    await expect(page.getByRole('heading', { name: /age-appropriate care for every stage/i })).toBeVisible()

    await page.goto('/tuition')
    await expect(page.getByRole('heading', { name: /clear expectations for your family/i })).toBeVisible()

    await page.goto('/contact')
    await expect(page.getByRole('heading', { name: /answer your questions/i })).toBeVisible()

    await page.goto('/enrollment')
    await expect(page.getByRole('heading', { name: /schedule a tour and check availability/i })).toBeVisible()

    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: /how we handle your information/i })).toBeVisible()
  })

  test('should show 404 page for invalid routes', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page')
    
    // Should show 404 page
    await expect(page.locator('text=Page not found')).toBeVisible()
    await expect(page.locator('text=The page you\'re looking for doesn\'t exist')).toBeVisible()
  })

  test('should maintain navigation state on page refresh', async ({ page }) => {
    // Navigate to a specific page
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
    
    // Refresh the page
    await page.reload()
    
    // Should still be on the same page
    await expect(page).toHaveURL('/about')
    await expect(page.locator('h1')).toContainText('About Riley Day Care')
  })

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Navigate through multiple pages
    await page.goto('/')
    await page.goto('/about')
    await page.click('text=Programs')
    await page.click('text=Tuition')
    
    // Verify we're on tuition page
    await expect(page).toHaveURL('/tuition')
    
    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/programs')
    
    // Go back again
    await page.goBack()
    await expect(page).toHaveURL('/about')
    
    // Go forward
    await page.goForward()
    await expect(page).toHaveURL('/programs')
    
    // Go forward again
    await page.goForward()
    await expect(page).toHaveURL('/tuition')
  })

  test('should scroll to enrollment section when CTA buttons are clicked', async ({ page }) => {
    // Go to home page
    await page.goto('/')
    
    // Click "Schedule a Tour" button
    await page.click('text=Schedule a Tour')
    
    // Should scroll to enrollment section
    const enrollmentSection = page.locator('#enrollment')
    await expect(enrollmentSection).toBeInViewport()
    
    // Go to tuition page and click CTA
    await page.goto('/tuition')
    await page.click('text=Request tuition details')
    
    // Should scroll to enrollment section
    await expect(enrollmentSection).toBeInViewport()
  })

  test('should display contact information correctly', async ({ page }) => {
    // Navigate to contact page
    await page.goto('/contact')
    
    // Verify contact information is displayed
    await expect(page.locator('text=1509 Haymarket Rd, Dallas, TX 75253')).toBeVisible()
    await expect(page.locator('text=(972) 286-0357')).toBeVisible()
    
    // Test phone number link
    const phoneLink = page.getByRole('link', { name: '(972) 286-0357' })
    await expect(phoneLink).toHaveAttribute('href', 'tel:19722860357')
  })

  test('should handle enrollment CTA from different pages', async ({ page }) => {
    // Test CTA from home page
    await page.goto('/')
    await page.click('text=Schedule a Tour')
    await expect(page).toHaveURL(/\/enrollment(#enrollment)?$/)

    // Test CTA from about page
    await page.goto('/about')
    await page.click('text=Schedule a Tour')
    await expect(page).toHaveURL(/\/enrollment(#enrollment)?$/)

    // Test CTA from programs page
    await page.goto('/programs')
    await page.click('text=Schedule a Tour')
    await expect(page).toHaveURL(/\/enrollment(#enrollment)?$/)
  })
})
