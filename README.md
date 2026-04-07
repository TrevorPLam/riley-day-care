# Riley Day Care Marketing Site

A modern, responsive Next.js marketing website for **Riley Day Care**, a licensed child care center in Southeast Dallas, TX.

## 📍 Business Information

- **Address**: 1509 Haymarket Rd, Dallas, TX 75253
- **Phone**: (972) 286-0357
- **Website**: Built with Next.js 14 and deployed for production

## 🚀 Technology Stack

### Frontend Framework

- **Next.js 14.2.5** - React framework with App Router
- **React 18.3.1** - UI library
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

### Development Tools

- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## Project Structure

```text
riley-day-care/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── csrf/         # CSRF token endpoint
│   │   └── enrollment/   # Enrollment form handler
│   ├── components/        # Page-specific components
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   ├── enrollment/       # Enrollment flow
│   ├── faq/             # FAQ page
│   ├── programs/         # Programs page
│   ├── tuition/         # Tuition page
│   ├── privacy/         # Privacy policy
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/           # Shared components
│   ├── layout/          # Layout components
│   └── shared/          # Reusable UI components
├── testing-infrastructure/
│   ├── unit/            # Canonical Vitest test tree
│   ├── e2e/             # Canonical Playwright test tree
│   ├── artifacts/       # Generated coverage, reports, screenshots, and traces
│   ├── config/          # Shared browser, environment, and threshold config
│   └── utils/           # Custom reporters and supporting test utilities
├── lib/                 # Utility libraries
│   ├── analytics.ts     # Analytics configuration
│   ├── csrf.ts         # CSRF protection
│   ├── email.ts        # Email sending
│   ├── ratelimit.ts    # Rate limiting
│   ├── seo/           # SEO utilities
│   └── validation/    # Form validation schemas
├── public/             # Static assets
├── styles/             # Global CSS
└── .env.example        # Environment variables template
```

## Testing Layout

The repository now treats `testing-infrastructure/` as the canonical test root.

- `testing-infrastructure/unit/` contains the Vitest suites that `vitest.config.mts` executes.
- `testing-infrastructure/e2e/features/` contains the Playwright suites that `playwright.config.ts` executes.
- `testing-infrastructure/artifacts/` is the single generated output root for coverage, JSON reports, HTML reports, screenshots, traces, and videos.

Legacy root folders such as `__tests__/` and `e2e/` remain in the workspace today, but the active test configs do not target them.

## 🔧 Key Features

### Security

- **CSRF Protection**: Prevents cross-site request forgery attacks
- **Rate Limiting**: Throttles API requests using Upstash Redis
- **Input Validation**: Zod schema validation for form submissions
- **Secure Headers**: Proper security headers configuration

### User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Semantic HTML5 and ARIA considerations
- **Performance**: Optimized images and Next.js built-in optimizations
- **SEO**: Structured data, meta tags, and sitemap generation

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

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:run` - Run the canonical Vitest suite under `testing-infrastructure/unit/`
- `npm run test:coverage` - Generate unit coverage in `testing-infrastructure/artifacts/coverage`
- `npm run test:e2e` - Run the canonical Playwright suite under `testing-infrastructure/e2e/features/`
- `npm run test:cache-stats` - Print cache metadata for the testing utilities
- `npm run test:parallel-stats` - Print execution statistics for the parallel test planner
- `npm run test:clean` - Remove generated test artifacts from both canonical and legacy output folders

## 🔒 Environment Variables

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

## 🌐 Deployment

The application is configured for deployment on Vercel and other Next.js-compatible platforms. Ensure all environment variables are properly configured in your hosting environment.

## 📊 Analytics & Monitoring

- **Plausible Analytics**: Privacy-focused analytics for visitor tracking
- **Structured Data**: JSON-LD markup for search engine optimization
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Next.js built-in performance optimizations

## Contributing

This is a proprietary marketing website. Please follow established coding standards:

- Use TypeScript for type safety
- Follow ESLint configuration
- Maintain responsive design principles
- Test all functionality before deployment

## License

Private - All rights reserved by Riley Day Care.

---

## ❤️ Built with Love

Built for Riley Day Care families
