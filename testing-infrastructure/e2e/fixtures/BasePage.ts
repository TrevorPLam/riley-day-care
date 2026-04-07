/**
 * Base page objects for Playwright E2E testing
 * Provides reusable page interaction methods
 */

import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(public page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `testing-infrastructure/artifacts/screenshots/${name}-${Date.now()}.png` });
  }

  async checkAccessibility() {
    // Basic accessibility checks can be added here
    // For now, just ensure the page is visible
    await expect(this.page.locator('body')).toBeVisible();
  }
}

export class EnrollmentPage extends BasePage {
  get parentNameInput() { return this.page.locator('input[name="parentName"]'); }
  get childNameInput() { return this.page.locator('input[name="childName"]'); }
  get childAgeInput() { return this.page.locator('input[name="childAge"]'); }
  get startDateInput() { return this.page.locator('input[name="startDate"]'); }
  get phoneInput() { return this.page.locator('input[name="phone"]'); }
  get emailInput() { return this.page.locator('input[name="email"]'); }
  get messageInput() { return this.page.locator('textarea[name="message"]'); }
  get submitButton() { return this.page.locator('button[type="submit"]'); }
  get successMessage() { return this.page.locator('[data-testid="success-message"]'); }
  get errorMessage() { return this.page.locator('[data-testid="error-message"]'); }

  async fillEnrollmentForm(data: {
    parentName: string;
    childName: string;
    childAge: string;
    startDate: string;
    phone: string;
    email: string;
    message?: string;
  }) {
    await this.parentNameInput.fill(data.parentName);
    await this.childNameInput.fill(data.childName);
    await this.childAgeInput.fill(data.childAge);
    await this.startDateInput.fill(data.startDate);
    await this.phoneInput.fill(data.phone);
    await this.emailInput.fill(data.email);
    
    if (data.message) {
      await this.messageInput.fill(data.message);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async waitForSuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async waitForErrorMessage() {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }
}

export class NavigationPage extends BasePage {
  get homeLink() { return this.page.locator('a[href="/"]'); }
  get aboutLink() { return this.page.locator('a[href="/about"]'); }
  get contactLink() { return this.page.locator('a[href="/contact"]'); }
  get enrollmentLink() { return this.page.locator('a[href="/enrollment"]'); }
  get tuitionLink() { return this.page.locator('a[href="/tuition"]'); }

  async navigateToHome() {
    await this.homeLink.click();
  }

  async navigateToAbout() {
    await this.aboutLink.click();
  }

  async navigateToContact() {
    await this.contactLink.click();
  }

  async navigateToEnrollment() {
    await this.enrollmentLink.click();
  }

  async navigateToTuition() {
    await this.tuitionLink.click();
  }

  async verifyNavigationLinks() {
    await expect(this.homeLink).toBeVisible();
    await expect(this.aboutLink).toBeVisible();
    await expect(this.contactLink).toBeVisible();
    await expect(this.enrollmentLink).toBeVisible();
    await expect(this.tuitionLink).toBeVisible();
  }
}
