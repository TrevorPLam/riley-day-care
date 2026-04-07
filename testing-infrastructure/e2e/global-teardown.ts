import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Cleaning up test environment...')
  
  // Clean up test data if needed
  // For example: clear test database, stop mock servers, etc.
  
  // Clean up temporary files
  const fs = await import('fs/promises')
  const path = await import('path')
  
  // Clean up old test results (keep last 5 runs)
  try {
    const testResultsDir = 'testing-infrastructure/artifacts/test-results'
    const files = await fs.readdir(testResultsDir)
    
    // Get only directories (test run folders)
    const directories = files.filter(async (file) => {
      const filePath = path.join(testResultsDir, file)
      const stats = await fs.stat(filePath)
      return stats.isDirectory()
    })
    
    // Sort by modification time and keep only the most recent 5
    const dirsWithStats = await Promise.all(
      directories.map(async (dir) => {
        const dirPath = path.join(testResultsDir, dir)
        const stats = await fs.stat(dirPath)
        return { name: dir, mtime: stats.mtime }
      })
    )
    
    dirsWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    
    // Remove old directories
    for (let i = 5; i < dirsWithStats.length; i++) {
      const dirToRemove = path.join(testResultsDir, dirsWithStats[i].name)
      await fs.rm(dirToRemove, { recursive: true, force: true })
      console.log(`Removed old test results: ${dirsWithStats[i].name}`)
    }
  } catch (error) {
    console.log('No old test results to clean up or cleanup failed')
  }
  
  // Generate test summary report
  try {
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
      'testing-infrastructure/artifacts/test-summary.json',
      JSON.stringify(testSummary, null, 2)
    )
    
    console.log('Test summary report generated')
  } catch (error) {
    console.log('Failed to generate test summary:', error)
  }
  
  console.log('Test environment cleanup completed')
}

export default globalTeardown
