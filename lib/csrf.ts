import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";

/**
 * Generate a cryptographically secure CSRF token
 * @returns 32-byte hex string token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate CSRF token and return it without setting cookie
 * @returns The generated CSRF token
 */
export function getCsrfTokenForForm(): string {
  return generateCsrfToken();
}

/**
 * Set CSRF token in httpOnly cookie (Server Action)
 * @returns The generated CSRF token
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hour
    path: "/",
  });
  
  return token;
}

/**
 * Validate CSRF token from form against cookie
 * Uses constant-time comparison to prevent timing attacks
 * @param formToken Token submitted in form
 * @returns True if tokens match, false otherwise
 */
export async function validateCsrfToken(formToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!cookieToken || !formToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(formToken));
  } catch {
    return false;
  }
}

/**
 * Get current CSRF token from cookie without setting a new one
 * @returns Current CSRF token or null if not set
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}
