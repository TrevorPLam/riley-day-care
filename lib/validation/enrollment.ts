import { z } from "zod";

/**
 * Enrollment form validation schema
 * 
 * This schema validates all fields from the enrollment form.
 * Note: The honeypot field (extraInfo) is intentionally excluded
 * from this schema - it should be checked separately before
 * Zod validation to keep spam prevention logic separate from
 * business data validation.
 */
export const enrollmentSchema = z.object({
  parentName: z.string()
    .min(1, "Parent/guardian name is required")
    .max(100, "Name must be under 100 characters"),
  
  childName: z.string()
    .min(1, "Child's name is required")
    .max(100, "Name must be under 100 characters"),
  
  childAge: z.string()
    .min(1, "Child's age is required")
    .max(20, "Age description is too long"),
  
  startDate: z.string()
    .min(1, "Preferred start date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  
  phone: z.string()
    .min(1, "Phone number is required")
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[\d\s\-\+\(\)\.]+$/, "Phone number contains invalid characters"),
  
  email: z.string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  
  message: z.string()
    .max(1500, "Message must be under 1500 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

/**
 * TypeScript type inferred from the enrollment schema.
 * Use this instead of manually defining the type.
 */
export type EnrollmentData = z.infer<typeof enrollmentSchema>;

/**
 * Format Zod validation errors into a user-friendly string.
 * Returns the first error message for simplicity, or a generic
 * message if no specific field errors exist.
 */
export function formatZodErrors(error: z.ZodError): string {
  const flattened = error.flatten();
  
  // Get the first error message from any field
  // Type assertion needed because Zod's flatten types are complex
  const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
  
  for (const messages of Object.values(fieldErrors)) {
    if (messages && messages.length > 0) {
      return messages[0];
    }
  }
  
  // Check form-level errors if no field errors
  if (flattened.formErrors.length > 0) {
    return flattened.formErrors[0];
  }
  
  return "Please check your information and try again.";
}
