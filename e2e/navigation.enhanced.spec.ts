import { test, expect } from './fixtures/test-fixtures'
import { devices } from '@playwright/test'

test.describe('Navigation Flow - Enterprise Grade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate between all main pages correctly', async ({ navigationPage }) => {
    // Test navigation to About page
    await navigationPage.navigateToAbout()
    await navigationPage.verifyCurrentPage('/about')
    await expect(navigationPage.page.getByRole('heading', { name: /a calm, caring place for young children/i })).toBeVisible()
    
    // Test navigation to Programs page
    await navigationPage.navigateToPrograms()
    await navigationPage.verifyCurrentPage('/programs')
    await expect(navigationPage.page.getByRole('heading', { name: /programs/i })).toBeVisible()
    
    // Test navigation to Tuition page
    await navigationPage.navigateToTuition()
    await navigationPage.verifyCurrentPage('/tuition')
    await expect(navigationPage.page.getByRole('heading', { name: /tuition/i })).toBeVisible()
    
    // Test navigation to Contact page
    await navigationPage.navigateToContact()
    await navigationPage.verifyCurrentPage('/contact')
    await expect(navigationPage.page.getByRole('heading', { name: /contact/i })).toBeVisible()
    
    // Test navigation back to home
    await navigationPage.navigateToHome()
    await navigationPage.verifyCurrentPage('/')
    await expect(navigationPage.page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  })

  test('should handle direct URL navigation and maintain state', async ({ page }) => {
    const pages = [
      { path: '/about', expectedHeading: /about/i },
      { path: '/programs', expectedHeading: /programs/i },
      { path: '/tuition', expectedHeading: /tuition/i },
      { path: '/contact', expectedHeading: /contact/i },
      { path: '/enrollment', expectedHeading: /enroll/i }
    ]
    
    for (const { path, expectedHeading } of pages) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible()
      
      // Test page refresh maintains state
      await page.reload()
      await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible()
    }
  })

  test('should show proper 404 page for invalid routes', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    await expect(page.getByText(/page not found|404/i)).toBeVisible()
    await expect(page.getByText(/the page you're looking for doesn't exist/i)).toBeVisible()
  })

  test('should handle browser back and forward navigation correctly', async ({ navigationPage }) => {
    // Navigate through multiple pages
    await navigationPage.navigateToAbout()
    await navigationPage.navigateToPrograms()
    await navigationPage.navigateToTuition()
    
    // Verify we're on tuition page
    await navigationPage.verifyCurrentPage('/tuition')
    
    // Go back
    await navigationPage.page.goBack()
    await navigationPage.verifyCurrentPage('/programs')
    
    // Go back again
    await navigationPage.page.goBack()
    await navigationPage.verifyCurrentPage('/about')
    
    // Go forward
    await navigationPage.page.goForward()
    await navigationPage.verifyCurrentPage('/programs')
    
    // Go forward again
    await navigationPage.page.goForward()
    await navigationPage.verifyCurrentPage('/tuition')
  })

  test('should scroll to enrollment section when CTA buttons are clicked', async ({ page }) => {
    await page.goto('/')
    
    // Click "Schedule a Tour" button
    await page.getByRole('button', { name: /schedule.*tour/i }).click()
    
    // Check if enrollment section is in viewport
    const enrollmentSection = page.locator('#enrollment')
    await expect(enrollmentSection).toBeInViewport()
    
    // Test from tuition page
    await page.goto('/tuition')
    await page.getByRole('button', { name: /request.*tuition/i }).click()
    await expect(enrollmentSection).toBeInViewport()
  })

  test('should display contact information correctly', async ({ navigationPage }) => {
    await navigationPage.navigateToContact()
    
    // Verify contact information is displayed
    await expect(navigationPage.page.getByText(/1509 Haymarket Rd, Dallas, TX 75253/i)).toBeVisible()
    await expect(navigationPage.page.getByText(/\(972\) 286-0357/i)).toBeVisible()
    
    // Test phone number link
    const phoneLink = navigationPage.page.getByRole('link', { name: /\(972\) 286-0357/i })
    await expect(phoneLink).toHaveAttribute('href', 'tel:(972) 286-0357')
  })

  test('should handle enrollment CTA from different pages', async ({ navigationPage }) => {
    const pages = ['/', '/about', '/programs']
    
    for (const pagePath of pages) {
      await navigationPage.page.goto(pagePath)
      
      // Find and click enrollment CTA
      const enrollmentCTA = navigationPage.page.getByRole('link', { name: /enrollment/i })
      await expect(enrollmentCTA).toBeVisible()
      await enrollmentCTA.click()
      
      // Verify navigation to enrollment page
      await navigationPage.verifyCurrentPage('/enrollment')
    }
  })
})

test.describe('Navigation Flow - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Test Tab navigation through main menu
    await page.keyboard.press('Tab')
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test Tab through navigation
    let tabCount = 0
    while (tabCount < 10) {
      await page.keyboard.press('Tab')
      const currentFocus = page.locator(':focus')
      
      // Check if we're still on the page (not jumped to content)
      const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase())
      if (tagName === 'a' || tagName === 'button') {
        tabCount++
      } else {
        break
      }
    }
    
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should have proper ARIA labels and landmarks', async ({ page }) => {
    await page.goto('/')
    
    // Check for main landmarks
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    
    // Check for proper navigation structure
    const nav = page.locator('nav')
    await expect(nav.getByRole('link').first()).toBeVisible()
    
    // Verify accessibility tree
    await expect(page.locator('body')).toBeAccessible()
  })

  test('should support screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Test that important elements have proper labels
    const navigation = page.locator('nav')
    await expect(navigation).toHaveAttribute('role', 'navigation')
    
    // Check that links have descriptive text
    const links = navigation.getByRole('link')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      expect(text?.trim()).toBeTruthy()
      expect(text?.trim()?.length).toBeGreaterThan(0)
    }
  })
})

test.describe('Navigation Flow - Mobile Responsive', () => {
  test.use({ ...devices['iPhone 13'] })

  test('should work correctly on mobile devices', async ({ navigationPage }) => {
    // Test mobile navigation
    await navigationPage.verifyNavigationExists()
    
    // Check if mobile menu is present (hamburger menu)
    const mobileMenuButton = navigationPage.page.locator('button[aria-label*="menu"], button[aria-label*="navigation"]')
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      
      // Wait for mobile menu to open
      await navigationPage.page.waitForTimeout(500)
      
      // Test navigation through mobile menu
      await navigationPage.navigateToAbout()
      await navigationPage.verifyCurrentPage('/about')
    } else {
      // If no mobile menu, test regular navigation
      await navigationPage.navigateToAbout()
      await navigationPage.verifyCurrentPage('/about')
    }
  })

  test('should be touch-friendly on mobile', async ({ navigationPage }) => {
    // Test that buttons and links are large enough for touch
    const buttons = navigationPage.page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()
      
      if (boundingBox) {
        // Buttons should be at least 44x44 pixels for touch
        expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})
