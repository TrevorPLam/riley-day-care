import { test, expect, type Page } from '@playwright/test'

const enrollmentUrl = /\/enrollment(?:#enrollment)?$/

async function fillEnrollmentForm(page: Page, overrides: Partial<{
  parentName: string
  childName: string
  childAge: string
  startDate: string
  phone: string
  email: string
  message: string
}> = {}) {
  const data = {
    parentName: 'John Doe',
    childName: 'Jane Doe',
    childAge: '3 years',
    startDate: '2026-06-01',
    phone: '(555) 123-4567',
    email: `john.doe+${Date.now()}@example.com`,
    message: 'Looking forward to learning more about Riley Day Care.',
    ...overrides,
  }

  await page.getByLabel(/Parent\/guardian name/i).fill(data.parentName)
  await page.getByLabel(/Child's name/i).fill(data.childName)
  await page.getByLabel(/Child's age/i).fill(data.childAge)
  await page.getByLabel(/Preferred start date/i).fill(data.startDate)
  await page.getByLabel(/^Phone$/i).fill(data.phone)
  await page.getByLabel(/^Email$/i).fill(data.email)
  await page.getByLabel(/Anything else you'd like us to know/i).fill(data.message)
}

test.describe('Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to enrollment page and submit form successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Schedule a Tour/i }).click()
    await expect(page).toHaveURL(enrollmentUrl)
    await expect(
      page.getByRole('heading', { level: 2, name: /Schedule a tour and check availability/i })
    ).toBeVisible()

    const submitButton = page.getByRole('button', { name: /Submit request/i })
    await expect(submitButton).toBeEnabled()

    await fillEnrollmentForm(page)
    await submitButton.click()

    await expect(page.getByText(/Thank you/i)).toBeVisible()
    await expect(page.getByText(/follow up soon/i)).toBeVisible()
  })

  test('should validate form fields and show error messages', async ({ page }) => {
    await page.goto('/enrollment')

    const submitButton = page.getByRole('button', { name: /Submit request/i })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await expect(page.getByText('Parent/guardian name is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/enrollment')
    await fillEnrollmentForm(page, { email: 'invalid-email' })

    await page.getByRole('button', { name: /Submit request/i }).click()

    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/enrollment')
    await fillEnrollmentForm(page, { phone: '123' })

    await page.getByRole('button', { name: /Submit request/i }).click()

    await expect(page.getByText('Phone number is too short')).toBeVisible()
  })

  test('should handle rate limiting', async ({ page }) => {
    test.skip(
      !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN,
      'Rate limiting is fail-open without Upstash configuration in local development.'
    )

    await page.goto('/enrollment')

    for (let i = 0; i < 6; i++) {
      await fillEnrollmentForm(page, { email: `john.doe+${i}@example.com` })
      await page.getByRole('button', { name: /Submit request/i }).click()

      if (i < 5) {
        await expect(page.getByText(/Thank you/i)).toBeVisible()
      }
    }

    await expect(page.getByText(/Too many attempts/i)).toBeVisible()
  })
})
