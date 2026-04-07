import { chromium, type FullConfig } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

async function globalSetup(config: FullConfig) {
  console.log('Setting up test environment...')

  const artifactsRoot = path.join('testing-infrastructure', 'artifacts')
  const directories = [
    artifactsRoot,
    path.join(artifactsRoot, 'playwright-report'),
    path.join(artifactsRoot, 'test-results'),
    path.join(artifactsRoot, 'screenshots'),
    path.join(artifactsRoot, 'videos'),
    path.join(artifactsRoot, 'traces'),
    path.join(artifactsRoot, 'visual'),
  ]

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    } catch {
      console.log(`Directory ${dir} already exists or failed to create`)
    }
  }

  if (process.argv.includes('--list')) {
    console.log('Skipping application health check during Playwright test discovery')
    return
  }

  const baseURL = String(config.projects[0]?.use?.baseURL || 'http://localhost:3000')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

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
