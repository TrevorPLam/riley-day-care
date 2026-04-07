import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('Setting up test environment...')
  
  // Create test data directories
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const directories = [
    'testing-infrastructure/artifacts/test-results',
    'testing-infrastructure/artifacts/screenshots',
    'testing-infrastructure/artifacts/videos',
    'testing-infrastructure/artifacts/traces',
    'testing-infrastructure/visual'
  ]
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    } catch (error) {
      console.log(`Directory ${dir} already exists or failed to create`)
    }
  }
  
  // Setup test database or external services if needed
  // For example: seed test data, start mock servers, etc.
  
  // Verify the application is ready for testing
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Wait for the application to be ready
    await page.goto(process.env.BASE_URL || 'http://localhost:3000')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Check if the application is responding correctly
    const title = await page.title()
    if (!title.includes('Riley Day Care') && !title.includes('Day Care')) {
      throw new Error(`Application not ready. Found title: ${title}`)
    }
    
    console.log('Application is ready for testing')
  } catch (error) {
    console.error('Failed to setup test environment:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
  
  console.log('Test environment setup completed')
}

export default globalSetup
