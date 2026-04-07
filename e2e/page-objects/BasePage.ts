import { test, expect } from '@playwright/test'

// Base Page Object Model class
export abstract class BasePage {
  constructor(protected page: any) {}

  // Common utility methods
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` })
  }

  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle)
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url)
    await this.waitForPageLoad()
  }
}

// Enrollment Page Object
export class EnrollmentPage extends BasePage {
  // Locators
  private readonly formTitle = this.page.getByRole('heading', { name: 'Enroll Your Child' })
  private readonly parentNameInput = this.page.getByLabel(/parent.*name/i)
  private readonly childNameInput = this.page.getByLabel(/child.*name/i)
  private readonly childAgeInput = this.page.getByLabel(/child.*age/i)
  private readonly startDateInput = this.page.getByLabel(/start.*date/i)
  private readonly phoneInput = this.page.getByLabel(/phone/i)
  private readonly emailInput = this.page.getByLabel(/email/i)
  private readonly messageTextarea = this.page.getByLabel(/message/i)
  private readonly submitButton = this.page.getByRole('button', { name: /submit|enroll/i })
  private readonly successMessage = this.page.getByText(/thank you|enrollment received/i)

  // Page methods
  async verifyPageLoaded(): Promise<void> {
    await expect(this.formTitle).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async fillEnrollmentForm(data: {
    parentName: string
    childName: string
    childAge: string
    startDate: string
    phone: string
    email: string
    message?: string
  }): Promise<void> {
    await this.parentNameInput.fill(data.parentName)
    await this.childNameInput.fill(data.childName)
    await this.childAgeInput.fill(data.childAge)
    await this.startDateInput.fill(data.startDate)
    await this.phoneInput.fill(data.phone)
    await this.emailInput.fill(data.email)
    
    if (data.message) {
      await this.messageTextarea.fill(data.message)
    }
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click()
  }

  async verifySubmissionSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 })
  }

  async verifyValidationError(expectedError: string): Promise<void> {
    await expect(this.page.getByText(expectedError)).toBeVisible()
  }

  async getFormValidationErrors(): Promise<string[]> {
    const errorElements = await this.page.locator('[role="alert"], .error, .text-red-600').all()
    const errors: string[] = []
    
    for (const element of errorElements) {
      const text = await element.textContent()
      if (text && text.trim()) {
        errors.push(text.trim())
      }
    }
    
    return errors
  }
}

// Navigation Page Object
export class NavigationPage extends BasePage {
  // Locators
  private readonly navigationLinks = this.page.getByRole('navigation').getByRole('link')
  private readonly homeLink = this.page.getByRole('link', { name: /home|riley day care/i })
  private readonly aboutLink = this.page.getByRole('link', { name: /about/i })
  private readonly programsLink = this.page.getByRole('link', { name: /programs/i })
  private readonly tuitionLink = this.page.getByRole('link', { name: /tuition/i })
  private readonly contactLink = this.page.getByRole('link', { name: /contact/i })
  private readonly enrollmentLink = this.page.getByRole('link', { name: /enroll/i })

  // Page methods
  async navigateToHome(): Promise<void> {
    await this.homeLink.click()
    await this.waitForPageLoad()
  }

  async navigateToAbout(): Promise<void> {
    await this.aboutLink.click()
    await this.waitForPageLoad()
  }

  async navigateToPrograms(): Promise<void> {
    await this.programsLink.click()
    await this.waitForPageLoad()
  }

  async navigateToTuition(): Promise<void> {
    await this.tuitionLink.click()
    await this.waitForPageLoad()
  }

  async navigateToContact(): Promise<void> {
    await this.contactLink.click()
    await this.waitForPageLoad()
  }

  async navigateToEnrollment(): Promise<void> {
    await this.enrollmentLink.click()
    await this.waitForPageLoad()
  }

  async verifyCurrentPage(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(url => url.pathname === expectedPath)
  }

  async verifyNavigationExists(): Promise<void> {
    await expect(this.navigationLinks.first()).toBeVisible()
  }

  async verifyAccessibility(): Promise<void> {
    // Basic accessibility checks
    await expect(this.homeLink).toHaveAttribute('href')
    await expect(this.aboutLink).toHaveAttribute('href')
    await expect(this.programsLink).toHaveAttribute('href')
    await expect(this.tuitionLink).toHaveAttribute('href')
    await expect(this.contactLink).toHaveAttribute('href')
    await expect(this.enrollmentLink).toHaveAttribute('href')
  }
}
