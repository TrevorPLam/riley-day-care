import { type FullConfig } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

async function globalTeardown(config: FullConfig) {
  console.log('Cleaning up test environment...')

  const artifactsRoot = path.join('testing-infrastructure', 'artifacts')
  const testResultsDir = path.join(artifactsRoot, 'test-results')

  try {
    const files = await fs.readdir(testResultsDir)

    const dirsWithStats = await Promise.all(
      files.map(async (file) => {
        const dirPath = path.join(testResultsDir, file)
        const stats = await fs.stat(dirPath)
        return stats.isDirectory() ? { name: file, mtime: stats.mtime } : null
      })
    )

    const directories = dirsWithStats
      .filter((entry): entry is { name: string; mtime: Date } => entry !== null)
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    for (let i = 5; i < directories.length; i++) {
      const dirToRemove = path.join(testResultsDir, directories[i].name)
      await fs.rm(dirToRemove, { recursive: true, force: true })
      console.log(`Removed old test results: ${directories[i].name}`)
    }
  } catch {
    console.log('No old test results to clean up or cleanup failed')
  }

  try {
    await fs.mkdir(path.join(artifactsRoot, 'reports'), { recursive: true })

    const testSummary = {
      timestamp: new Date().toISOString(),
      config: {
        projects: config.projects?.length || 0,
        workers: config.workers
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: process.env.CI || 'false'
      }
    }

    await fs.writeFile(
      path.join(artifactsRoot, 'reports', 'playwright-summary.json'),
      JSON.stringify(testSummary, null, 2)
    )

    console.log('Test summary report generated')
  } catch (error) {
    console.log('Failed to generate test summary:', error)
  }

  console.log('Test environment cleanup completed')
}

export default globalTeardown
