import { z } from "zod";

/**
 * Environment variable validation schema
 * 
 * This schema validates all environment variables used throughout the application.
 * It ensures type safety and provides clear error messages when variables are missing
 * or invalid. The validation runs at build time to fail fast.
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]),

  // Email configuration for enrollment notifications
  EMAIL_HOST: z.string().min(1, { message: "EMAIL_HOST is required for sending emails" }),
  EMAIL_PORT: z.string().transform(Number).pipe(
    z.number().int().min(1).max(65535, { message: "EMAIL_PORT must be a valid port number (1-65535)" })
  ),
  EMAIL_USER: z.string().email({ message: "EMAIL_USER must be a valid email address" }),
  EMAIL_PASS: z.string().min(1, { message: "EMAIL_PASS is required for email authentication" }),
  
  // Email notification settings
  ENROLLMENT_NOTIFICATIONS_TO: z.string().email({ message: "ENROLLMENT_NOTIFICATIONS_TO must be a valid email address" }),
  ENROLLMENT_NOTIFICATIONS_FROM: z.string().email({ message: "ENROLLMENT_NOTIFICATIONS_FROM must be a valid email address" }).optional(),

  // Upstash Redis configuration for rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url({ message: "UPSTASH_REDIS_REST_URL must be a valid URL" }),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, { message: "UPSTASH_REDIS_REST_TOKEN is required for Redis authentication" }),

  // Analytics configuration (optional)
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1).optional(),
  PLAUSIBLE_API_HOST: z.string().url().optional(),

  // Sentry configuration for error tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  SENTRY_SEND_DEFAULT_PII: z.enum(["true", "false"]).transform(Boolean).optional(),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url({ message: "NEXT_PUBLIC_SITE_URL must be a valid URL" }),

  // Vercel configuration (automatically set by Vercel)
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
});

// Validate environment variables and export the result
// This will throw an error if validation fails, preventing the app from starting
const _env = envSchema.parse(process.env);

// Export the validated environment object
export const env = _env;

// Type inference for environment variables
export type Env = z.infer<typeof envSchema>;

// Extend the ProcessEnv interface for better TypeScript support
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Helper function to check if we're in test mode
 */
export const isTest = env.NODE_ENV === "test";

/**
 * Get the base URL for the current environment
 */
export const getBaseUrl = (): string => {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  return env.NEXT_PUBLIC_SITE_URL;
};

/**
 * Validate environment variables with better error messages
 * This function can be used in next.config.mjs for build-time validation
 */
export function validateEnvironment(): void {
  try {
    envSchema.parse(process.env);
    console.log("Environment variables validated successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("\x1b[1m\x1b[31m\u26a0\ufe0f Environment variables validation failed\x1b[0m");
      console.error("");
      error.issues.forEach((err) => {
        console.error(`  \x1b[31m${err.path.join(".")}\x1b[0m: ${err.message}`);
      });
      console.error("");
      console.error("Please check your .env.local file and ensure all required variables are set.");
      console.error("See .env.example for a list of required environment variables.");
    } else {
      console.error("\x1b[1m\x1b[31m\u26a0\ufe0f Unexpected error during environment validation:\x1b[0m", error);
    }
    process.exit(1);
  }
}
