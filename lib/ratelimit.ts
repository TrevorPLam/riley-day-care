import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis connection with environment variables
// Falls back to in-memory storage if Redis is not available (fail open)
const redis = Redis.fromEnv();

// Create a rate limiter for the enrollment endpoint
// Allows 5 requests per 10 minutes per IP address
export const enrollmentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit:enrollment",
});

/**
 * Generates a client identifier for rate limiting
 * Uses IP address + User-Agent prefix for better fingerprinting
 * This handles shared IP scenarios more fairly than IP alone
 */
export function getClientIdentifier(request: Request): string {
  const host = request.headers.get("host") || "";
  const testRunId = request.headers.get("x-playwright-test-run");

  if (
    process.env.NODE_ENV !== "production" &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host) &&
    testRunId &&
    /^[a-zA-Z0-9-]{1,64}$/.test(testRunId)
  ) {
    return `playwright:${testRunId}`;
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             "anonymous";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  // Create a fingerprint using IP + first 20 chars of User-Agent
  // This balances uniqueness with privacy considerations
  const userAgentPrefix = userAgent.slice(0, 20);
  return `${ip}:${userAgentPrefix}`;
}

/**
 * Checks if the request should be rate limited
 * Returns the rate limit result with headers to include in response
 */
export async function checkRateLimit(request: Request) {
  try {
    const identifier = getClientIdentifier(request);
    const result = await enrollmentRateLimit.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? null : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    // If Redis is unavailable, fail open and allow the request
    console.error("Rate limiting failed:", error);
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 600000, // 10 minutes from now
      retryAfter: null,
    };
  }
}

/**
 * Creates rate limit headers for the response
 */
export function createRateLimitHeaders(rateLimitResult: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    "X-RateLimit-Limit": String(rateLimitResult.limit),
    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    "X-RateLimit-Reset": String(rateLimitResult.reset),
  };
}
