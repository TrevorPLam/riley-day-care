import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

// Validate environment variables before anything else runs
function validateEnvironment() {
  const requiredVars = [
    'NODE_ENV',
    'EMAIL_HOST',
    'EMAIL_PORT', 
    'EMAIL_USER',
    'EMAIL_PASS',
    'ENROLLMENT_NOTIFICATIONS_TO',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('\x1b[1m\x1b[31m\u26a0\ufe0f Environment variables validation failed\x1b[0m');
    console.error('');
    missing.forEach(varName => {
      console.error(`  \x1b[31m${varName}\x1b[0m: is required but not set`);
    });
    console.error('');
    console.error('Please check your .env.local file and ensure all required variables are set.');
    console.error('See .env.example for a list of required environment variables.');
    process.exit(1);
  }
  
  // Validate specific formats
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url && !url.startsWith('http')) {
    console.error('\x1b[1m\x1b[31m\u26a0\ufe0f Environment variables validation failed\x1b[0m');
    console.error(`  \x1b[31mNEXT_PUBLIC_SITE_URL\x1b[0m: must be a valid URL starting with http/https`);
    process.exit(1);
  }
  
  console.log('Environment variables validated successfully');
}

validateEnvironment();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Cache configuration for API routes and static assets
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=172800',
          },
        ],
      },
    ];
  },
};

// Apply bundle analyzer first, then Sentry
const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Don't auto-open browser
});

export default withSentryConfig(bundleAnalyzerConfig(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "trevor-lam",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
