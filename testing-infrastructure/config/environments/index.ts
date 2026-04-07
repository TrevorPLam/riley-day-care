/**
 * Environment-specific configuration files
 * These files provide inheritance and override capabilities
 */

export const developmentConfig = {
  name: 'development',
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3000/api',
  database: {
    host: 'localhost',
    port: 5432,
    name: 'riley_daycare_dev',
    ssl: false
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0
  },
  email: {
    from: 'test@rileydaycare.com',
    provider: 'mock'
  },
  features: {
    hotReload: true,
    debugMode: true,
    mockExternalServices: true,
    skipAuth: false
  },
  timeouts: {
    api: 5000,
    pageLoad: 10000,
    element: 5000
  },
  logging: {
    level: 'debug',
    console: true,
    file: false
  }
}

export const stagingConfig = {
  ...developmentConfig,
  name: 'staging',
  baseUrl: 'https://staging.rileydaycare.com',
  apiBaseUrl: 'https://staging.rileydaycare.com/api',
  database: {
    host: 'staging-db.rileydaycare.com',
    port: 5432,
    name: 'riley_daycare_staging',
    ssl: true
  },
  redis: {
    host: 'staging-redis.rileydaycare.com',
    port: 6379,
    db: 1
  },
  email: {
    from: 'staging@rileydaycare.com',
    provider: 'resend'
  },
  features: {
    hotReload: false,
    debugMode: false,
    mockExternalServices: false,
    skipAuth: false
  },
  timeouts: {
    api: 10000,
    pageLoad: 15000,
    element: 8000
  },
  logging: {
    level: 'info',
    console: false,
    file: true
  }
}

export const productionConfig = {
  ...stagingConfig,
  name: 'production',
  baseUrl: 'https://rileydaycare.com',
  apiBaseUrl: 'https://rileydaycare.com/api',
  database: {
    host: 'prod-db.rileydaycare.com',
    port: 5432,
    name: 'riley_daycare_production',
    ssl: true
  },
  redis: {
    host: 'prod-redis.rileydaycare.com',
    port: 6379,
    db: 2
  },
  email: {
    from: 'info@rileydaycare.com',
    provider: 'resend'
  },
  features: {
    hotReload: false,
    debugMode: false,
    mockExternalServices: false,
    skipAuth: false
  },
  timeouts: {
    api: 15000,
    pageLoad: 20000,
    element: 10000
  },
  logging: {
    level: 'error',
    console: false,
    file: true
  }
}

export type EnvironmentConfig = typeof developmentConfig
