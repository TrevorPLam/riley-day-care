# Riley Day Care - Development TODO

> Generated from comprehensive codebase analysis - April 2026
> Based on Next.js 14.2.5, React 18.3.1, and Tailwind CSS 3.4.0 best practices

---

## Task-01: Fix Critical Duplicate Export in Privacy Page

**Status:** ✅ COMPLETED - P0

- [x] Remove duplicate PrivacyPage component export from privacy/page.tsx

### Subtasks

- [x] **Task-01-01:** Delete lines 88-132 (second export block) in `@/app/privacy/page.tsx`
- [x] **Task-01-02:** Verify first export block (lines 12-87) is complete and functional
- [x] **Task-01-03:** Run `npm run build` to confirm no build errors
- [x] **Task-01-04:** Verify `/privacy` route renders correctly in dev server

### Related Files

- `@/app/privacy/page.tsx` - Contains duplicate export (lines 88-132 must be removed)
- `@/app/layout.tsx` - Contains navigation link to privacy page

### Definition of Done

- [x] Build completes without "duplicate export" error
- [x] `/privacy` route loads without 500 error
- [x] Privacy policy content displays correctly
- [x] No TypeScript errors in the file
- [x] No ESLint warnings in the file

### Out of Scope

- Content updates to privacy policy (only fixing the structural bug)
- Styling changes
- Adding new sections to privacy page
- SEO metadata changes
- Accessibility improvements beyond basic functionality

### Strict Rules to Follow

1. **NO refactoring** of the first export block's code - only delete the duplicate
2. **NO content changes** - preserve exact text from the first export
3. **Preserve imports** - do not modify import statements
4. **Test immediately** - verify in dev server before marking complete
5. **Single file change only** - do not modify other files in this task

### Existing Code Patterns

```typescript
// Current pattern in first export (lines 12-87)
export default function PrivacyPage() {
  return (
    <Section>
      <Container className="space-y-8 text-sm leading-relaxed text-slate-700">
        <SectionHeader eyebrow="Privacy Policy" title="How we handle your information." />
        {/* content */}
      </Container>
    </Section>
  );
}
```

### Advanced Code Patterns

None applicable - this is a bug fix task requiring minimal intervention.

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Combining both exports into one | Would require content decisions, out of scope |
| Refactoring while fixing | Increases risk, makes review harder |
| Using "export { PrivacyPage }" | Not needed, default export is correct |
| Adding "use client" | Not needed, this is a static page |

---

## Task-02: Fix Server/Client Component Boundary in Homepage

**Status:** ✅ COMPLETED - P0

- [x] Resolve Server Component using client-side APIs (document, onClick, trackEvent)

### Subtasks

- [x] **Task-02-01:** Create new file `@/app/components/EnrollmentCTA.tsx` with "use client" directive
- [x] **Task-02-02:** Extract Button with onClick handler from `@/app/page.tsx:36-44` to EnrollmentCTA
- [x] **Task-02-03:** Import and render EnrollmentCTA in `@/app/page.tsx` in place of inline Button
- [x] **Task-02-04:** Remove unused `scrollToEnrollment` function from `@/app/page.tsx:14-17`
- [x] **Task-02-05:** Verify homepage loads without "document is not defined" error
- [x] **Task-02-06 (bonus):** Also extracted phone link onClick to `PhoneLink.tsx` Client Component

### Related Files

- `@/app/page.tsx` - Currently has event handlers in Server Component (lines 36-44, 14-17)
- `@/components/shared/Button.tsx` - Already has "use client", can be used inside client component
- `@/lib/analytics.ts` - trackEvent function uses window.plausible (browser-only)

### Definition of Done

- [x] Homepage renders without runtime errors
- [x] "Schedule a Tour" button still scrolls to enrollment section
- [x] Plausible analytics event still fires on button click
- [x] No console errors in dev server
- [x] `npm run build` completes successfully
- [x] Button maintains existing styling and behavior

### Out of Scope

- Changing scroll behavior or animation
- Modifying analytics event names
- Refactoring Button component itself
- Converting entire page to Client Component (only the interactive button)
- Any changes to Tuition page button (similar issue there but separate task)

### Strict Rules to Follow

1. **Minimal client boundary** - Only the interactive button becomes a Client Component
2. **Preserve all behavior** - Scroll animation, analytics tracking must continue working
3. **Pass props explicitly** - No prop drilling, keep component self-contained
4. **Remove dead code** - Delete the unused scrollToEnrollment function
5. **Follow existing patterns** - Use same component structure as other shared components

### Existing Code Patterns

```typescript
// Button component pattern (from @/components/shared/Button.tsx)
"use client";
export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// Current problematic pattern in page.tsx
export default function HomePage() {  // Server Component
  return (
    <Button onClick={() => {  // ❌ Error: onClick in Server Component
      trackEvent(ANALYTICS_EVENTS.CTA_SCHEDULE_TOUR);
      scrollToEnrollment();
    }}>Schedule a Tour</Button>
  );
}
```

### Advanced Code Patterns

```typescript
// Recommended: Interleaving pattern
// EnrollmentCTA.tsx
"use client";
export function EnrollmentCTA() {
  const scrollToEnrollment = () => {
    document.getElementById("enrollment")?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <Button onClick={() => {
      trackEvent(ANALYTICS_EVENTS.CTA_SCHEDULE_TOUR);
      scrollToEnrollment();
    }}>
      Schedule a Tour
    </Button>
  );
}

// page.tsx (Server Component)
import { EnrollmentCTA } from "@/app/components/EnrollmentCTA";
export default function HomePage() {
  return (
    <Section>
      <Container>
        <EnrollmentCTA />  {/* ✅ Client Component nested in Server Component */}
      </Container>
    </Section>
  );
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Adding "use client" to entire page.tsx | Would make entire page client-side, losing SSR benefits |
| Moving scrollToEnrollment to lib/analytics.ts | Mixes DOM logic with analytics module |
| Using `<a href="#enrollment">` | Loses smooth scroll animation, analytics tracking |
| Keeping unused scrollToEnrollment function | Dead code, creates confusion |
| Converting layout.tsx to Client Component | Would break SEO, performance |

---

## Task-03: Implement Zod Schema Validation for Enrollment API

**Status:** ✅ COMPLETED - P1

- [x] Replace manual regex validation with Zod schema in enrollment API route

### Subtasks

- [x] **Task-03-01:** Install Zod: `npm install zod`
- [x] **Task-03-02:** Create `@/lib/validation/enrollment.ts` with Zod schema
- [x] **Task-03-03:** Create `@/lib/validation/index.ts` barrel export
- [x] **Task-03-04:** Replace validateBody function in `@/app/api/enrollment/route.ts` with Zod parsing
- [x] **Task-03-05:** Update error handling to return Zod error messages
- [x] **Task-03-06:** Test validation with valid and invalid payloads

### Related Files

- `@/app/api/enrollment/route.ts` - Current manual validation (lines 16-62)
- `@/lib/validation/` - New directory for validation schemas
- `@/app/enrollment/page.tsx` - Form that submits to this API
- `@/package.json` - Add zod dependency

### Definition of Done

- [x] Zod schema validates all enrollment form fields correctly
- [x] Email validation uses Zod's built-in email validator (not regex)
- [x] Phone validation accepts reasonable formats but rejects invalid characters
- [x] All required fields (parentName, childName, childAge, startDate, phone, email) are enforced
- [x] Optional message field has max length validation (1500 chars)
- [x] Error messages are user-friendly and specific
- [x] Schema exports TypeScript type for form data
- [x] All existing tests (if any) pass
- [x] API returns 400 with structured error on validation failure

### Out of Scope

- Client-side validation with Zod (can be added later)
- Validation for other forms/routes
- Custom error message internationalization
- Async validation (e.g., checking email uniqueness)
- Form refactoring to React Hook Form

### Strict Rules to Follow

1. **Preserve API contract** - Request/response format remains unchanged
2. **Use Zod's email validator** - Don't write custom email regex
3. **Maintain type safety** - Export inferred type from schema
4. **User-friendly errors** - Error messages should guide users to fix issues
5. **Keep honeypot logic** - ExtraInfo field validation stays (not in Zod schema)

### Existing Code Patterns

```typescript
// Current manual validation in @/app/api/enrollment/route.ts
function validateBody(body: unknown): { value?: EnrollmentBody; error?: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }
  // Manual field checking...
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed.email || "")) {
    return { error: "Please enter a valid email address." };
  }
}
```

### Advanced Code Patterns

```typescript
// @/lib/validation/enrollment.ts
import { z } from "zod";

export const enrollmentSchema = z.object({
  parentName: z.string()
    .min(1, "Parent/guardian name is required")
    .max(100, "Name is too long"),
  childName: z.string()
    .min(1, "Child's name is required")
    .max(100, "Name is too long"),
  childAge: z.string()
    .min(1, "Child's age is required")
    .max(20, "Age description is too long"),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  phone: z.string()
    .min(10, "Phone number is too short")
    .regex(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  message: z.string()
    .max(1500, "Message must be under 1500 characters")
    .optional(),
});

export type EnrollmentData = z.infer<typeof enrollmentSchema>;

// Usage in API route
import { enrollmentSchema } from "@/lib/validation";

const result = enrollmentSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { ok: false, errors: result.error.flatten().fieldErrors },
    { status: 400 }
  );
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Using .parse() instead of .safeParse() | Throws exceptions, harder to control flow |
| Custom email regex | Zod's built-in validator is more robust, tested |
| Validating honeypot in Zod | Keep spam prevention separate from business logic |
| Validating in Client Component only | Security: always validate server-side |
| Returning Zod's raw error format | Too verbose, flatten for cleaner response |

---

## Task-04: Add CSRF Protection to Enrollment API

**Status:** ✅ COMPLETED - P1

- [x] Implement CSRF token generation and validation for enrollment form

### Subtasks

- [x] **Task-04-01:** Create `@/lib/csrf.ts` with token generation and validation utilities
- [x] **Task-04-02:** Add CSRF token generation to `@/app/api/csrf/route.ts` (API endpoint)
- [x] **Task-04-03:** Add hidden CSRF input field to enrollment form
- [x] **Task-04-04:** Add CSRF validation to `@/app/api/enrollment/route.ts`
- [x] **Task-04-05:** Store CSRF token in httpOnly cookie
- [x] **Task-04-06:** Test form submission with and without valid CSRF token

### Related Files

- `@/lib/csrf.ts` - New file for CSRF utilities
- `@/app/enrollment/page.tsx` - Add token generation and hidden field
- `@/app/api/enrollment/route.ts` - Add token validation
- `@/app/layout.tsx` - May need cookie configuration

### Definition of Done

- [x] CSRF token is generated server-side on page load
- [x] Token is stored in httpOnly cookie or secure session
- [x] Token is included as hidden field in enrollment form
- [x] API rejects requests without valid CSRF token (403 response)
- [x] Token is validated using constant-time comparison
- [x] Token expires after reasonable time (1 hour)
- [x] Error message is clear but doesn't expose security details
- [x] Honeypot field continues to work alongside CSRF
- [x] Form submissions from legitimate users succeed

### Out of Scope

- CSRF protection for other routes (separate task)
- CSRF token rotation on every request (overkill for this use case)
- Double-submit cookie pattern (token in cookie + header)
- Integration with authentication system (no auth in this app)

### Strict Rules to Follow

1. **Use cryptographically secure tokens** - Use `crypto.randomBytes` or Web Crypto API
2. **Constant-time comparison** - Prevent timing attacks when validating tokens
3. **httpOnly cookie** - Prevent XSS from stealing CSRF token
4. **SameSite cookie attribute** - Set to 'strict' or 'lax'
5. **Secure in production** - Cookie should only be sent over HTTPS
6. **Don't expose validation logic** - Generic error message on failure

### Existing Code Patterns

```typescript
// Current form pattern in @/app/enrollment/page.tsx
<form onSubmit={async (event) => {
  event.preventDefault();
  // Honeypot check only, no CSRF
  if (formData.get("extraInfo")) return;
  // Submit to API...
}}>
  {/* fields */}
</form>
```

### Advanced Code Patterns

```typescript
// @/lib/csrf.ts
import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hour
  });
  return token;
}

export async function validateCsrfToken(formToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!cookieToken || !formToken) return false;
  
  // Constant-time comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(formToken));
  } catch {
    return false;
  }
}

// Server Component: generate token
export default async function EnrollmentPage() {
  const csrfToken = await setCsrfCookie();
  return <EnrollmentForm csrfToken={csrfToken} />;
}

// Client Component: use token
"use client";
function EnrollmentForm({ csrfToken }: { csrfToken: string }) {
  return (
    <form>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* other fields */}
    </form>
  );
}

// API Route: validate token
const formData = new FormData(form);
const csrfToken = formData.get("csrfToken") as string;
if (!(await validateCsrfToken(csrfToken))) {
  return NextResponse.json(
    { ok: false, error: "Invalid or missing security token" },
    { status: 403 }
  );
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Predictable tokens (timestamp-based) | Easy for attacker to guess |
| Storing token in localStorage | XSS can steal it |
| Simple string comparison (`===`) | Timing attack vulnerability |
| Reusing tokens across sessions | Increases attack window |
| Detailed error on CSRF failure | Information leak to attackers |
| GET requests modifying data | CSRF protection less effective |

---

## Task-05: Implement Rate Limiting on Enrollment API

**Status:** ✅ COMPLETED - P1

- [x] Add rate limiting to prevent spam/abuse of enrollment endpoint

### Subtasks

- [x] **Task-05-01:** Evaluate rate limiting solutions (Upstash, custom, middleware)
- [x] **Task-05-02:** Install chosen solution: `npm install @upstash/ratelimit @upstash/redis`
- [x] **Task-05-03:** Create `@/lib/ratelimit.ts` with enrollment endpoint configuration
- [x] **Task-05-04:** Add rate limiting check to `@/app/api/enrollment/route.ts`
- [x] **Task-05-05:** Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to environment variables
- [x] **Task-05-06:** Test rate limiting with multiple rapid requests
- [x] **Task-05-07:** Add user-friendly error message for rate-limited requests

### Related Files

- `@/lib/ratelimit.ts` - New file for rate limiting configuration
- `@/app/api/enrollment/route.ts` - Add rate limit check before processing
- `.env.local` / `.env.example` - Add Redis/Upstash credentials
- `@/package.json` - Add dependencies

### Definition of Done

- [x] Rate limit is applied per IP address
- [x] Limit: 5 requests per 10 minutes per IP (configurable)
- [x] Returns 429 status code with Retry-After header when limited
- [x] User sees friendly message: "Too many attempts. Please try again later."
- [x] Rate limit works in both development and production
- [x] Environment variables documented in .env.example
- [x] Legitimate users can submit form normally
- [x] Logs rate limit events for monitoring

### Out of Scope

- Global rate limiting across all endpoints (enrollment only for now)
- User-account-based rate limiting (no authentication)
- Different limits for different user types
- Rate limiting UI indicators (progressive enhancement for later)
- Captcha integration (honeypot already exists)

### Strict Rules to Follow

1. **Fail open if Redis unavailable** - Don't block legitimate users if service fails
2. **Use IP + User-Agent fingerprint** - Better than IP alone (handles shared IPs)
3. **Sliding window algorithm** - More accurate than fixed windows
4. **Include Retry-After header** - Allows clients to handle gracefully
5. **Log violations** - Security monitoring without exposing to user
6. **Environment-specific limits** - Stricter in production, relaxed in dev

### Existing Code Patterns

```typescript
// Current API pattern in @/app/api/enrollment/route.ts
export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const { value, error } = validateBody(data);
  // No rate limiting currently
  // ... process request
}
```

### Advanced Code Patterns

```typescript
// @/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const enrollmentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit:enrollment",
});

// IP fingerprinting for shared IP scenarios
export function getClientIdentifier(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             "anonymous";
  const userAgent = request.headers.get("user-agent") || "unknown";
  // Simple hash of IP + User-Agent prefix
  return `${ip}:${userAgent.slice(0, 20)}`;
}

// API Route integration
import { enrollmentRateLimit, getClientIdentifier } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const { success, limit, reset, remaining } = await enrollmentRateLimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
        }
      }
    );
  }
  
  // Continue with request processing...
}

// Alternative: Middleware approach for multiple routes
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/enrollment") {
    // Apply rate limiting
  }
  return NextResponse.next();
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| IP-only rate limiting | Corporate/shared IPs get blocked unfairly |
| Fixed window algorithm | Allows burst attacks at window boundaries |
| No fallback if Redis fails | Creates dependency on external service |
| Same limits for all environments | Blocks developers during testing |
| Blocking without logging | Can't detect attack patterns |
| Hard limit without warning | Poor UX, users lose form data |

---

## Task-06: Add Error Boundaries and Error Pages

**Status:** ✅ COMPLETED - P2

- [x] Implement React error boundaries and custom error pages for better UX

### Subtasks

- [x] **Task-06-01:** Create `@/app/error.tsx` - Root error boundary
- [x] **Task-06-02:** Create `@/app/global-error.tsx` - Global error handler
- [x] **Task-06-03:** Create `@/app/enrollment/error.tsx` - Enrollment-specific error boundary
- [x] **Task-06-04:** Style error pages to match site design (use brand colors)
- [x] **Task-06-05:** Add error logging (console for now, Sentry later)
- [x] **Task-06-06:** Add "Try again" functionality where appropriate
- [x] **Task-06-07:** Test error boundaries by throwing test errors

### Related Files

- `@/app/error.tsx` - New root error boundary
- `@/app/global-error.tsx` - New global error handler (affects entire app)
- `@/app/enrollment/error.tsx` - Enrollment route error boundary
- `@/app/not-found.tsx` - Already exists, use as style reference
- `@/components/shared/Button.tsx` - Reuse for "Try again" button

### Definition of Done

- [x] Root error boundary catches errors in all pages
- [x] Enrollment-specific boundary catches form-related errors
- [x] Error pages match site's visual design (brand colors, typography)
- [x] Error messages are user-friendly (no stack traces exposed)
- [x] "Try again" button resets the error boundary
- [x] Errors are logged to console (for now)
- [x] Global error handler catches build-time/fatal errors
- [x] All error components are Client Components ("use client")

### Out of Scope

- Sentry/LogRocket integration (separate task)
- Error analytics dashboard
- Automatic error reporting to external service
- User feedback forms on error pages
- Recovery mechanisms beyond "Try again"

### Strict Rules to Follow

1. **Must be Client Components** - Error boundaries require "use client"
2. **Never expose stack traces** - Security risk, confusing to users
3. **Consistent styling** - Match existing not-found.tsx design
4. **Provide escape hatch** - Link back to home, contact info
5. **Log errors** - Even without external service, log to console
6. **Specific before general** - Route-level boundaries catch before root

### Existing Code Patterns

```typescript
// Existing @/app/not-found.tsx
export default function NotFound() {
  return (
    <Section>
      <Container className="space-y-4 text-sm leading-relaxed text-slate-700">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Page not found
        </h1>
        <p>The page you're looking for doesn't exist...</p>
        <Link href="/" className="text-sm font-semibold text-brand hover:text-brand-light">
          Go back home
        </Link>
      </Container>
    </Section>
  );
}
```

### Advanced Code Patterns

```typescript
// @/app/error.tsx
"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error - replace with Sentry in future
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <Section>
      <Container className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
          We apologize for the inconvenience. Our team has been notified and we're working to fix the issue.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand">
            Go back home
          </Link>
        </div>
        {/* Show error digest in development only */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-xs text-slate-400 font-mono">Error ID: {error.digest}</p>
        )}
      </Container>
    </Section>
  );
}

// @/app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-semibold">Critical Error</h1>
          <p className="text-slate-600">The application encountered a critical error.</p>
          <button
            onClick={reset}
            className="bg-brand text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand-dark"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Server Components for error boundaries | Error boundaries must be Client Components |
| Exposing error.message to users | Security risk, may contain sensitive info |
| No reset functionality | Users stuck, poor UX |
| Generic "Error" without context | Users don't know what to do |
| Missing home/contact links | Users need escape hatch |
| Silent errors | Can't debug production issues |

---

## Task-07: Refactor Tuition Page Client Component Boundary

**Status:** ✅ COMPLETED - P2

- [x] Fix similar Server/Client boundary issue in tuition page as was fixed in homepage

### Subtasks

- [x] **Task-07-01:** Analyze `@/app/tuition/page.tsx` button implementation (lines 48-56)
- [x] **Task-07-02:** Either reuse EnrollmentCTA component or create shared TuitionCTA
- [x] **Task-07-03:** Update `@/app/tuition/page.tsx` to use extracted Client Component
- [x] **Task-07-04:** Verify scroll-to-enrollment works from tuition page
- [x] **Task-07-05:** Run build to verify no errors

### Related Files

- `@/app/tuition/page.tsx` - Has inline button with onClick (lines 48-56)
- `@/app/components/EnrollmentCTA.tsx` - May be reusable (created in Task-02)
- `@/app/enrollment/page.tsx` - Target section with id="enrollment"
- `@/app/page.tsx` - Reference for the fix pattern

### Definition of Done

- [x] Tuition page builds without Server Component errors
- [x] "Request tuition details" button scrolls to enrollment section
- [x] No console errors when clicking button
- [x] Button styling preserved
- [x] Cross-page navigation (tuition → enrollment section) works

### Out of Scope

- Content changes to tuition page
- Modifying tuition/hours information
- Adding new CTAs to tuition page
- Analytics tracking changes

### Strict Rules to Follow

1. **Reuse if possible** - Use EnrollmentCTA from Task-02 if it fits
2. **DRY principle** - Don't duplicate scroll logic
3. **Same patterns as Task-02** - Consistency across codebase
4. **Minimal changes** - Don't refactor unrelated code

### Existing Code Patterns

```typescript
// @/app/tuition/page.tsx (problematic)
export default function TuitionPage() {  // Server Component
  return (
    <Button
      type="button"
      onClick={() => {  // ❌ Event handler in Server Component
        const el = document.getElementById("enrollment");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }}
    >
      Request tuition details
    </Button>
  );
}
```

### Advanced Code Patterns

```typescript
// Option 1: Reuse EnrollmentCTA with props
// EnrollmentCTA.tsx
interface EnrollmentCTAProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function EnrollmentCTA({ children, variant = "primary" }: EnrollmentCTAProps) {
  const scrollToEnrollment = () => {
    document.getElementById("enrollment")?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <Button variant={variant} onClick={scrollToEnrollment}>
      {children}
    </Button>
  );
}

// Usage in tuition.tsx
<EnrollmentCTA variant="primary">Request tuition details</EnrollmentCTA>

// Option 2: Create generic ScrollToSection component
// components/shared/ScrollToSection.tsx
"use client";
export function ScrollToSection({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  const scrollToSection = () => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };
  return <Button onClick={scrollToSection}>{children}</Button>;
}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Adding "use client" to entire tuition page | Loses SSR benefits for static content |
| Duplicating scroll logic | Maintenance burden, inconsistency risk |
| Hardcoding section ID in multiple places | Brittle, hard to change |
| Different patterns for same problem | Confusing for maintainers |

---

## Task-08: Implement Comprehensive Testing Infrastructure

**Status:** 🔄 PENDING - P2

- [ ] Add testing framework and coverage for production readiness

### Subtasks

- [ ] **Task-08-01:** Install and configure Jest for unit testing
- [ ] **Task-08-02:** Add Playwright for end-to-end testing
- [ ] **Task-08-03:** Create test utilities and mocking setup
- [ ] **Task-08-04:** Write unit tests for validation schemas
- [ ] **Task-08-05:** Write integration tests for API routes
- [ ] **Task-08-06:** Add E2E tests for critical user flows
- [ ] **Task-08-07:** Configure CI/CD testing pipeline
- [ ] **Task-08-08:** Set up test coverage reporting

### Related Files

- `jest.config.js` - New Jest configuration
- `playwright.config.ts` - New Playwright configuration
- `__tests__/` - New test directory structure
- `.github/workflows/` - CI/CD pipeline updates
- `package.json` - Add test scripts and dependencies

### Definition of Done

- [ ] Jest configuration supports TypeScript and Next.js
- [ ] Playwright E2E tests cover critical user journeys
- [ ] Unit tests achieve 80%+ code coverage
- [ ] API routes have integration tests
- [ ] Validation schemas have comprehensive test coverage
- [ ] CI/CD pipeline runs tests automatically
- [ ] Coverage reports are generated and tracked

### Out of Scope

- Visual regression testing (can be added later)
- Performance testing with Lighthouse (separate task)
- Load testing (separate from rate limiting)
- Accessibility testing automation (manual testing sufficient for now)

### Strict Rules to Follow

1. **Test critical paths** - Focus on enrollment flow and core functionality
2. **Maintain test independence** - Each test should run in isolation
3. **Use meaningful assertions** - Test behavior, not implementation
4. **Mock external dependencies** - Email, Redis, etc. should be mocked
5. **Keep tests fast** - Unit tests should run in milliseconds

---

## Task-09: Implement Advanced Caching Strategies

**Status:** � PENDING - P2

- [ ] Add Next.js advanced caching patterns for performance optimization

### Subtasks

- [ ] **Task-09-01:** Implement `revalidateTag` for granular cache invalidation
- [ ] **Task-09-02:** Add `revalidatePath` for page-level cache control
- [ ] **Task-09-03:** Create cache utilities for common data patterns
- [ ] **Task-09-04:** Implement ISR (Incremental Static Regeneration) for dynamic content
- [ ] **Task-09-05:** Add client-side caching strategies
- [ ] **Task-09-06:** Create cache monitoring and debugging tools

### Related Files

- `lib/cache.ts` - New caching utilities
- `app/api/` - Update routes with caching headers
- `lib/` - Add cache invalidation helpers
- `next.config.mjs` - Update with caching configuration

### Definition of Done

- [ ] Cache invalidation works with `revalidateTag`
- [ ] Path-based revalidation implemented
- [ ] ISR pages have proper revalidation intervals
- [ ] Cache utilities are reusable across the application
- [ ] Performance improvements are measurable
- [ ] Cache debugging tools are available

### Out of Scope

- CDN-level caching (handled by hosting platform)
- Browser caching beyond Next.js defaults
- Database query caching (no database in current stack)

---

## Task-10: Upgrade to React 19 and Modern Features

**Status:** 🔄 PENDING - P3

- [ ] Upgrade React and implement new hooks and patterns

### Subtasks

- [ ] **Task-10-01:** Upgrade to React 19.2 (latest stable)
- [ ] **Task-10-02:** Implement `useActionState` for form handling
- [ ] **Task-10-03:** Add `useOptimistic` for optimistic UI updates
- [ ] **Task-10-04:** Implement new `cache` API for data caching
- [ ] **Task-10-05:** Update error boundaries with new React 19 patterns
- [ ] **Task-10-06:** Migrate to new React 19 best practices

### Related Files

- `package.json` - Update React version
- `app/components/` - Update with new React patterns
- `lib/` - Add React 19 utilities
- `app/api/` - Update with new React patterns

### Definition of Done

- [ ] React upgraded to 19.2 successfully
- [ ] `useActionState` replaces manual form state management
- [ ] `useOptimistic` improves UX for async operations
- [ ] `cache` API reduces redundant data fetching
- [ ] All components follow React 19 best practices
- [ ] No breaking changes in functionality

### Out of Scope

- Concurrent features (React 18 focus)
- Server Components migration (already implemented)
- Advanced React DevTools integration

---

## Task-11: Add Performance Monitoring and APM

**Status:** 🔄 PENDING - P2

- [ ] Implement application performance monitoring and error tracking

### Subtasks

- [ ] **Task-11-01:** Integrate Sentry for error tracking and performance monitoring
- [ ] **Task-11-02:** Add custom performance metrics tracking
- [ ] **Task-11-03:** Implement Core Web Vitals monitoring
- [ ] **Task-11-04:** Add user journey analytics
- [ ] **Task-11-05:** Create performance dashboards and alerts
- [ ] **Task-11-06:** Set up error reporting workflows

### Related Files

- `lib/monitoring.ts` - New monitoring utilities
- `next.config.mjs` - Add Sentry configuration
- `.env.example` - Add Sentry environment variables
- `app/layout.tsx` - Add monitoring providers

### Definition of Done

- [ ] Sentry captures and categorizes all errors
- [ ] Performance metrics are tracked and reported
- [ ] Core Web Vitals monitoring is active
- [ ] Error reporting workflows are established
- [ ] Performance dashboards provide actionable insights
- [ ] Monitoring doesn't impact application performance

### Out of Scope

- Real user monitoring (RUM - separate implementation)
- Business intelligence and analytics beyond basic tracking
- A/B testing infrastructure

---

## Legend

- **�🔴 CRITICAL (P0)** - Blocks build, causes runtime errors, or security vulnerability
- **🟡 HIGH (P1)** - Security improvement, data integrity, or significant UX issue
- **🟢 MEDIUM (P2)** - Enhancement, best practice compliance, technical debt
- **🔵 LOW (P3)** - Nice to have, optimization, future-proofing

---

## Task ID Reference

| Task ID | Description | Status |
|---------|-------------|--------|
| Task-01 | Fix duplicate export in privacy page | ✅ COMPLETED |
| Task-02 | Fix Server/Client boundary in homepage | ✅ COMPLETED |
| Task-03 | Implement Zod validation | ✅ COMPLETED |
| Task-04 | Add CSRF protection | ✅ COMPLETED |
| Task-05 | Implement rate limiting | ✅ COMPLETED |
| Task-06 | Add error boundaries | ✅ COMPLETED |
| Task-07 | Fix tuition page boundary | ✅ COMPLETED |
| Task-08 | Implement testing infrastructure | 🔄 PENDING |
| Task-09 | Implement advanced caching strategies | 🔄 PENDING |
| Task-10 | Upgrade to React 19 | 🔄 PENDING |
| Task-11 | Add performance monitoring | 🔄 PENDING |

---

*Last updated: April 2026*
*Based on Next.js 14.2.5, React 18.3.1, Tailwind CSS 3.4.0 best practices*
