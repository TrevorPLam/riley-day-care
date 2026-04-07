"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { enrollmentSchema } from "@/lib/validation/enrollment";
import { validateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { enrollmentRateLimit } from "@/lib/ratelimit";
import { getClientIdentifier } from "@/lib/ratelimit";
import { sendEnrollmentEmail } from "@/lib/email";
import { cookies } from "next/headers";

type EnrollmentState = {
  error: string | null;
  success: boolean;
};

export async function requestCsrfToken(): Promise<string | null> {
  try {
    const token = await setCsrfCookie();
    return token;
  } catch (error) {
    console.error("Failed to generate CSRF token:", error);
    return null;
  }
}

export async function submitEnrollment(
  prevState: EnrollmentState,
  formData: FormData
): Promise<EnrollmentState> {
  // Honeypot field - real visitors will not fill this
  if (formData.get("extraInfo")) {
    return { error: null, success: false };
  }

  // Rate limiting
  const identifier = getClientIdentifier({ headers: {} } as Request);
  const { success } = await enrollmentRateLimit.limit(identifier);
  
  if (!success) {
    return { error: "Too many attempts. Please try again later.", success: false };
  }

  // CSRF validation
  const csrfToken = formData.get("csrfToken") as string;
  if (!(await validateCsrfToken(csrfToken))) {
    return { error: "Your security token expired. Please try again.", success: false };
  }

  // Message validation
  const message = (formData.get("message") as string | null) || "";
  if (message && message.trim().length > 0 && message.trim().length < 10) {
    return { error: "Please share a bit more detail in the message field.", success: false };
  }

  // Validate form data with Zod
  const payload = {
    parentName: formData.get("parentName") as string,
    childName: formData.get("childName") as string,
    childAge: formData.get("childAge") as string,
    startDate: formData.get("startDate") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    message: message || undefined,
  };

  const validation = enrollmentSchema.safeParse(payload);
  if (!validation.success) {
    const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Please check your form details and try again.", success: false };
  }

  try {
    // Send enrollment notification
    await sendEnrollmentEmail(validation.data);
    
    return { error: null, success: true };
  } catch (error) {
    console.error("Enrollment submission error:", error);
    return { 
      error: "We could not submit your request. Please check your details and try again.", 
      success: false 
    };
  }
}
