# Riley Day Care Marketing Site

A modern, responsive Next.js 15 marketing website for **Riley Day Care**, a licensed child care center in Southeast Dallas, TX.

## Business Information

- **Address**: 1509 Haymarket Rd, Dallas, TX 75253
- **Phone**: (972) 286-0357
- **Website**: Built with Next.js 15 and deployed for production

## Technology Stack

### Frontend Framework
- **Next.js 15.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5.6.0** - Type-safe development

### Styling & Design
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Custom color scheme**: Brand (#1d9aa5) and Accent (#f29f58) colors
- **Responsive design** optimized for mobile and desktop

### Backend & API
- **Next.js API Routes** - Server-side endpoints
- **CSRF Protection** - Security token validation
- **Rate Limiting** - Upstash Redis-based request throttling
- **Email Integration** - Nodemailer for enrollment notifications

### Analytics & Monitoring
- **Plausible Analytics** - Privacy-focused web analytics
- **Structured Data** - JSON-LD for SEO optimization
- **Cache Monitoring** - Advanced cache performance tracking

### Development Tools
- **ESLint 8.57.0** - Code linting and quality
- **PostCSS 8.4.0** - CSS processing
- **Autoprefixer 10.4.0** - CSS vendor prefixes

## Project Structure

```text
riley-day-care/
|-- app/                     # Next.js App Router pages
|   |-- api/                # API routes
|   |   |-- csrf/          # CSRF token endpoint
|   |   |-- enrollment/    # Enrollment form handler
|   |   `-- revalidate/    # Cache revalidation endpoint
|   |-- components/        # Page-specific components
|   |-- about/             # About page
|   |-- contact/           # Contact page
|   |-- enrollment/        # Enrollment flow
|   |-- faq/              # FAQ page
|   |-- programs/         # Programs page
|   |-- tuition/          # Tuition page
|   |-- privacy/          # Privacy policy
|   |-- layout.tsx        # Root layout
|   |-- page.tsx          # Home page
|   |-- error.tsx         # Error page
|   |-- global-error.tsx  # Global error boundary
|   |-- not-found.tsx     # 404 page
|   |-- robots.ts         # SEO robots configuration
|   `-- sitemap.ts        # Dynamic sitemap generation
|-- components/            # Shared components
|   |-- layout/           # Layout components
|   `-- shared/           # Reusable UI components
|-- testing-infrastructure/ # Canonical test infrastructure
|   |-- unit/             # Vitest unit test suites
|   |-- e2e/              # Playwright end-to-end test suites
|   |-- integration/      # Integration test suites
|   |-- config/           # Shared test configuration
|   |-- artifacts/        # Generated test outputs
|   `-- utils/           # Custom test utilities
|-- lib/                  # Utility libraries
|   |-- analytics.ts      # Analytics configuration
|   |-- cache.ts          # Advanced caching utilities
|   |-- csrf.ts          # CSRF protection
|   |-- email.ts         # Email sending
|   |-- monitoring.ts    # Cache monitoring and debugging
|   |-- ratelimit.ts     # Rate limiting
|   |-- seo/             # SEO utilities
|   `-- validation/      # Form validation schemas
|-- public/              # Static assets
|-- styles/              # Global CSS
|-- .env.example         # Environment variables template
|-- next.config.mjs      # Next.js configuration
|-- vitest.config.mts    # Vitest configuration
|-- playwright.config.ts # Playwright configuration
`-- tailwind.config.mjs  # Tailwind CSS configuration
```

## Testing Infrastructure

The repository uses `testing-infrastructure/` as the canonical test root.

- `testing-infrastructure/unit/` contains the Vitest suites that `vitest.config.mts` executes
- `testing-infrastructure/e2e/features/` contains the Playwright suites that `playwright.config.ts` executes
- `testing-infrastructure/artifacts/` is the single generated output root for coverage, JSON reports, HTML reports, screenshots, traces, and videos

### Testing Features
- **Advanced Coverage Thresholds**: Per-file thresholds for critical components
- **Environment-Based Configuration**: Auto-configures based on CI/development environment
- **Parallel Execution**: Optimized test parallelization with configurable workers
- **Cache Monitoring**: Built-in cache performance tracking and debugging
- **AI Healing Framework**: Infrastructure for self-healing tests (experimental)
- **Visual Regression**: Visual comparison testing capabilities
- **Performance Testing**: Automated performance benchmarking
- **Security Testing**: Security-focused test suites

## Key Features

### Security
- **CSRF Protection**: Prevents cross-site request forgery attacks
- **Rate Limiting**: Throttles API requests using Upstash Redis
- **Input Validation**: Zod schema validation for form submissions
- **Honeypot Fields**: Bot protection in enrollment forms
- **Secure Headers**: Proper security headers configuration

### Performance & Caching
- **Incremental Static Regeneration (ISR)**: Homepage revalidates every 30 minutes
- **Advanced Caching**: Tag-based cache invalidation system
- **Cache Monitoring**: Real-time cache performance tracking
- **Optimized Headers**: Configurable cache headers for different content types
- **Cache Analytics**: Hit/miss tracking and performance recommendations

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Semantic HTML5 and ARIA considerations
- **Performance**: Optimized images and Next.js built-in optimizations
- **SEO**: Structured data, meta tags, and sitemap generation
- **Error Handling**: Comprehensive error boundaries and logging

### Business Functionality
- **Enrollment Forms**: Secure form submission with email notifications
- **Contact Information**: Clear display of business location and contact details
- **Navigation**: Intuitive site structure for parents
- **Trust Signals**: Licensing information and testimonials

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd riley-day-care
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:

```bash
cp .env.example .env.local
```

1. Configure the following environment variables:

   - Email settings (SMTP configuration)
   - Upstash Redis (for rate limiting)
   - Plausible Analytics (optional)

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development & Production

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Unit Testing (Vitest)

- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run all unit tests once
- `npm run test:coverage` - Generate coverage report in `testing-infrastructure/artifacts/coverage`
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI interface
- `npm run test:unit` - Run unit tests from `testing-infrastructure/unit/`
- `npm run test:integration` - Run integration tests
- `npm run test:smoke` - Run smoke tests only
- `npm run test:critical` - Run critical tests only

### End-to-End Testing (Playwright)

- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run Playwright with UI
- `npm run test:e2e:debug` - Run Playwright in debug mode
- `npm run test:e2e:headed` - Run tests with visible browser
- `npm run test:e2e:mobile` - Run mobile-specific tests
- `npm run test:e2e:accessibility` - Run accessibility tests
- `npm run test:e2e:visual` - Run visual regression tests
- `npm run test:e2e:performance` - Run performance tests
- `npm run test:e2e:security` - Run security tests
- `npm run test:e2e:cross-browser` - Run tests across all browsers

### Combined Testing

- `npm run test:all` - Run unit tests and cross-browser E2E tests
- `npm run test:ci` - Run coverage and cross-browser E2E tests
- `npm run test:quality-gates` - Run full CI suite with performance and security tests

### Testing Utilities

- `npm run test:parallel` - Run tests with parallel execution stats
- `npm run test:cache-stats` - Print cache metadata
- `npm run test:optimize-cache` - Optimize test cache
- `npm run test:parallel-stats` - Print parallel execution statistics
- `npm run test:healing-stats` - Print self-healing statistics
- `npm run test:clean` - Remove generated test artifacts
- `npm run test:report` - Generate comprehensive test reports

### Playwright Setup

- `npm run playwright:install` - Install Playwright with dependencies
- `npm run playwright:install-browsers` - Install specific browsers
- `npm run playwright:update` - Update Playwright installation

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Analytics (Optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
PLAUSIBLE_API_HOST=https://plausible.io
```

## Deployment

The application is configured for deployment on Vercel and other Next.js-compatible platforms. Ensure all environment variables are properly configured in your hosting environment.

### Cache Configuration
- **API Routes**: Cached for 5 minutes with stale-while-revalidate
- **Static Assets**: Immutable caching with 1-year max-age
- **Images**: 24-hour cache with 48-hour stale-while-revalidate

## Analytics & Monitoring

- **Plausible Analytics**: Privacy-focused analytics for visitor tracking
- **Structured Data**: JSON-LD markup for search engine optimization
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Next.js built-in performance optimizations
- **Cache Monitoring**: Real-time cache performance tracking and recommendations

## Contributing

This is a proprietary marketing website. Please follow established coding standards:

- Use TypeScript for type safety
- Follow ESLint configuration
- Maintain responsive design principles
- Test all functionality before deployment
- Use the testing infrastructure for all new features

## License

Private - All rights reserved by Riley Day Care.

---

## Built with Love

Built for Riley Day Care families
