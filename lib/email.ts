import nodemailer from "nodemailer";
import { env } from "./env";

const {
  EMAIL_HOST: SMTP_HOST,
  EMAIL_PORT: SMTP_PORT,
  EMAIL_USER: SMTP_USER,
  EMAIL_PASS: SMTP_PASSWORD,
  ENROLLMENT_NOTIFICATIONS_TO,
  ENROLLMENT_NOTIFICATIONS_FROM
} = env;

if (!ENROLLMENT_NOTIFICATIONS_TO) {
  console.warn(
    "[email] ENROLLMENT_NOTIFICATIONS_TO is not set. Enrollment emails will not be sent."
  );
}

const transporter =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        }
      })
    : null;

export interface EnrollmentEmailPayload {
  parentName: string;
  childName: string;
  childAge: string;
  startDate: string;
  phone: string;
  email: string;
  message?: string;
  ip?: string | null;
  userAgent?: string | null;
}

export async function sendEnrollmentEmail(payload: EnrollmentEmailPayload): Promise<boolean> {
  if (!ENROLLMENT_NOTIFICATIONS_TO || !transporter) {
    console.error("[email] Service not configured");
    return false;
  }


  const from = ENROLLMENT_NOTIFICATIONS_FROM || ENROLLMENT_NOTIFICATIONS_TO;

  const lines = [
    `New enrollment inquiry from ${payload.parentName}`,
    "",
    `Parent/guardian: ${payload.parentName}`,
    `Child: ${payload.childName}`,
    `Child age: ${payload.childAge}`,
    `Preferred start date: ${payload.startDate}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    "",
    "Message:",
    payload.message?.trim() || "(none provided)",
    "",
    "Request metadata:",
    `IP: ${payload.ip || "unknown"}`,
    `User agent: ${payload.userAgent || "unknown"}`
  ];

  try {
    await transporter.sendMail({
      from,
      to: ENROLLMENT_NOTIFICATIONS_TO,
      subject: "New enrollment inquiry - Riley Day Care",
      text: lines.join("\n")
    });

    console.log("[email] Enrollment notification sent successfully");
    return true;
  } catch (error) {
    console.error("[email] Failed to send enrollment notification:", error);
    throw error;
  }
}

