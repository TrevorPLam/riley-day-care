import { NextResponse } from "next/server";
import { sendEnrollmentEmail } from "@/lib/email";
import { enrollmentSchema, formatZodErrors, type EnrollmentData } from "@/lib/validation";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit, createRateLimitHeaders } from "@/lib/ratelimit";

type EnrollmentBody = EnrollmentData;

export async function POST(request: Request) {
  // Check rate limiting first (before any other processing)
  const rateLimitResult = await checkRateLimit(request);
  
  if (!rateLimitResult.success) {
    const headers = {
      "Retry-After": String(rateLimitResult.retryAfter),
      ...createRateLimitHeaders(rateLimitResult),
    };
    
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { 
        status: 429,
        headers 
      }
    );
  }

  // Parse request body
  const data = await request.json().catch(() => null);
  
  // Validate CSRF token first
  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { 
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  }

  const honeypot = typeof data.extraInfo === "string" ? data.extraInfo.trim() : "";
  if (honeypot) {
    return NextResponse.json(
      { ok: true },
      {
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  }

  const csrfToken = data.csrfToken as string;
  if (!(await validateCsrfToken(csrfToken))) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing security token" },
      { 
        status: 403,
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  }

  // Remove CSRF token from data before validation
  delete data.csrfToken;
  delete data.extraInfo;
  
  // Validate with Zod schema
  const result = enrollmentSchema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = formatZodErrors(result.error);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { 
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  }
  
  const value: EnrollmentBody = result.data;

  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;

  try {
    console.log("New enrollment inquiry:", {
      ...value,
      ip,
      userAgent
    });

    await sendEnrollmentEmail({
      parentName: value.parentName,
      childName: value.childName,
      childAge: value.childAge,
      startDate: value.startDate,
      phone: value.phone,
      email: value.email,
      message: value.message,
      ip,
      userAgent
    });

    return NextResponse.json(
      { ok: true },
      { 
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  } catch (err) {
    console.error("Failed to handle enrollment inquiry", err);
    return NextResponse.json(
      { ok: false, error: "We could not process your request. Please try again later." },
      { 
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );
  }
}

