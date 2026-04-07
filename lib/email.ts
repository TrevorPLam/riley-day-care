import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  ENROLLMENT_NOTIFICATIONS_TO,
  ENROLLMENT_NOTIFICATIONS_FROM
} = process.env;

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

export async function sendEnrollmentEmail(payload: EnrollmentEmailPayload) {
  if (!ENROLLMENT_NOTIFICATIONS_TO || !transporter) {
    return;
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

  await transporter.sendMail({
    from,
    to: ENROLLMENT_NOTIFICATIONS_TO,
    subject: "New enrollment inquiry - Riley Day Care",
    text: lines.join("\n")
  });
}

