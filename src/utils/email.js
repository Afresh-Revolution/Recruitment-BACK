import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

/**
 * Send approval or rejection email to applicant (no password – they are notified by email from admin).
 * @param {string} toEmail - Applicant email (from form data)
 * @param {string} applicantName - Full name from application
 * @param {string} companyName - Company name
 * @param {string} roleTitle - Job/role title
 * @param {boolean} approved - true = approved, false = rejected
 * @param {string} [message] - Optional custom message from admin
 */
export async function sendApplicationStatusEmail(
  toEmail,
  applicantName,
  companyName,
  roleTitle,
  approved,
  message = null
) {
  const subject = approved
    ? `Application approved – ${companyName}`
    : `Application update – ${companyName}`;
  const statusText = approved ? "approved" : "not moving forward";
  const body = message
    ? message
    : approved
      ? `Hello ${applicantName},\n\nYour application for ${roleTitle} at ${companyName} has been approved. The team will be in touch with next steps.\n\nBest regards,\n${companyName}`
      : `Hello ${applicantName},\n\nThank you for your interest in ${roleTitle} at ${companyName}. After review, we have decided not to move forward with your application at this time. We encourage you to apply for other roles that match your experience.\n\nBest regards,\n${companyName}`;

  const mailOptions = {
    from: process.env.MAIL_FROM || "noreply@thecage.com",
    to: toEmail,
    subject,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error("Email send error:", err.message);
    return { sent: false, error: err.message };
  }
}
