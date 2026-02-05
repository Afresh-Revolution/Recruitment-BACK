/**
 * Standalone script to test email (SMTP) without starting the server.
 * Usage: node test-email.js [recipient@email.com]
 *
 * Requires .env with SMTP_* and optionally MAIL_FROM.
 * If no recipient is given, uses SMTP_USER from .env.
 */
import "dotenv/config";
import { sendApplicationStatusEmail } from "./src/utils/email.js";

const to = process.argv[2] || process.env.SMTP_USER;

if (!to) {
  console.error("Usage: node test-email.js <recipient@email.com>");
  console.error("Or set SMTP_USER in .env and run: node test-email.js");
  process.exit(1);
}

console.log("Sending test email to:", to);
console.log("SMTP:", process.env.SMTP_HOST || "smtp.ethereal.email", "port", process.env.SMTP_PORT || 587);

const result = await sendApplicationStatusEmail(
  to,
  "Test Applicant",
  "Test Company",
  "Test Role",
  true,
  "This is a test email from the recruitment backend. If you received this, SMTP is working."
);

if (result.sent) {
  console.log("OK – Email sent. MessageId:", result.messageId);
} else {
  console.error("FAIL –", result.error);
  process.exit(1);
}
