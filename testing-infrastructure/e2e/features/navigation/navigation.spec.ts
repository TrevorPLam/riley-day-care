import { test, expect } from '@playwright/test'

const enrollmentUrl = /\/enrollment(?:#enrollment)?$/

test.describe('Site Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate between main pages correctly', async ({ page }) => {
    await page.getByRole('link', { name: /^Programs$/i }).click()
    await expect(page).toHaveURL('/programs')
    await expect(
      page.getByRole('heading', { level: 2, name: /Age-appropriate care for every stage/i })
    ).toBeVisible()

    await page.getByRole('link', { name: /^Tuition$/i }).click()
    await expect(page).toHaveURL('/tuition')
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /Clear expectations for your family.s schedule and budget/i,
      })
    ).toBeVisible()

    await page.getByRole('link', { name: /^Enrollment$/i }).click()
    await expect(page).toHaveURL('/enrollment')
    await expect(
      page.getByRole('heading', { level: 2, name: /Schedule a tour and check availability/i })
    ).toBeVisible()

    await page.getByRole('link', { name: /^FAQ$/i }).click()
    await expect(page).toHaveURL('/faq')
    await expect(
      page.getByRole('heading', { level: 2, name: /Answers to common questions from Dallas families/i })
    ).toBeVisible()

    await page.getByRole('link', { name: /^Contact$/i }).click()
    await expect(page).toHaveURL('/contact')
    await expect(
      page.getByRole('heading', { level: 2, name: /We.re here to answer your questions/i })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Riley Day Care' }).click()
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /A warm, licensed daycare in Southeast Dallas where your child can grow and thrive/i,
      })
    ).toBeVisible()
  })

  test('should handle direct URL navigation', async ({ page }) => {
    await page.goto('/about')
    await expect(
      page.getByRole('heading', { level: 2, name: /A calm, caring place for young children/i })
    ).toBeVisible()

    await page.goto('/programs')
    await expect(
      page.getByRole('heading', { level: 2, name: /Age-appropriate care for every stage/i })
    ).toBeVisible()

    await page.goto('/tuition')
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /Clear expectations for your family.s schedule and budget/i,
      })
    ).toBeVisible()

    await page.goto('/contact')
    await expect(
      page.getByRole('heading', { level: 2, name: /We.re here to answer your questions/i })
    ).toBeVisible()

    await page.goto('/enrollment')
    await expect(
      page.getByRole('heading', { level: 2, name: /Schedule a tour and check availability/i })
    ).toBeVisible()

    await page.goto('/privacy')
    await expect(
      page.getByRole('heading', { level: 2, name: /How we handle your information/i })
    ).toBeVisible()
  })

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/non-existent-page')

    await expect(page.getByRole('heading', { level: 1, name: /Page not found/i })).toBeVisible()
    await expect(page.getByText(/The page you're looking for doesn't exist/i)).toBeVisible()
  })

  test('should maintain navigation state on page refresh', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL('/about')

    await page.reload()

    await expect(page).toHaveURL('/about')
    await expect(
      page.getByRole('heading', { level: 2, name: /A calm, caring place for young children/i })
    ).toBeVisible()
  })

  test('should handle browser back and forward navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^Programs$/i }).click()
    await expect(page).toHaveURL('/programs')

    await page.getByRole('link', { name: /^Tuition$/i }).click()
    await expect(page).toHaveURL('/tuition')

    await page.getByRole('link', { name: /^Contact$/i }).click()

    await expect(page).toHaveURL('/contact')

    await page.goBack()
    await expect(page).toHaveURL('/tuition')

    await page.goBack()
    await expect(page).toHaveURL('/programs')

    await page.goForward()
    await expect(page).toHaveURL('/tuition')

    await page.goForward()
    await expect(page).toHaveURL('/contact')
  })

  test('should scroll to enrollment section when CTA buttons are clicked', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Schedule a Tour/i }).click()
    await expect(page).toHaveURL(enrollmentUrl)

    const enrollmentSection = page.locator('#enrollment')
    await expect(enrollmentSection).toBeInViewport()

    await page.goto('/tuition')
    await page.getByRole('button', { name: /Request tuition details/i }).click()
    await expect(page).toHaveURL(enrollmentUrl)
    await expect(enrollmentSection).toBeInViewport()
  })

  test('should display contact information correctly', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByText('1509 Haymarket Rd', { exact: true })).toBeVisible()
    await expect(page.getByText('Dallas, TX 75253', { exact: true })).toBeVisible()

    const phoneLink = page.getByRole('link', { name: /\(972\) 286-0357/i }).first()
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toHaveAttribute('href', 'tel:19722860357')
  })

  test('should handle enrollment CTA from different pages', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Schedule a Tour/i }).click()
    await expect(page).toHaveURL(enrollmentUrl)

    await page.goto('/about')
    await page.getByRole('link', { name: /^Enrollment$/i }).click()
    await expect(page).toHaveURL('/enrollment')

    await page.goto('/programs')
    await page.getByRole('link', { name: /^Enrollment$/i }).click()
    await expect(page).toHaveURL('/enrollment')
  })
})
