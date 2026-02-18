import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Verify Resend configuration.
 * @returns {boolean}
 */
export async function verifyResendConfig() {
  if (!resend) {
    console.warn("⚠️  WARNING: RESEND_API_KEY not defined in .env. Emails will NOT be sent.");
    return false;
  }
  console.log("✅ Resend configuration found");
  return true;
}

/** Basic check: non-empty string with @ (used to avoid sending to invalid addresses) */
function isValidEmail(value) {
  if (value == null || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.includes("@");
}

/**
 * Helper to send email with retries
 */
async function sendMailWithRetry(mailOptions, retries = 2, delay = 2000) {
  if (!resend) {
    return { sent: false, error: "Resend client not initialized (missing API key)" };
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const { data, error } = await resend.emails.send(mailOptions);
      if (error) {
        throw new Error(error.message || "Unknown Resend error");
      }
      return { sent: true, messageId: data.id };
    } catch (err) {
      if (i === retries) {
        console.error(`Email sending failed after ${retries + 1} attempts:`, err.message);
        return { sent: false, error: err.message };
      }
      console.warn(`Email attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Send status update email to applicant.
 * @param {string} toEmail - Applicant email
 * @param {string} applicantName - Applicant Name
 * @param {string} companyName - Company Name
 * @param {string} roleTitle - Role Title
 * @param {string} status - New status (approved, hired, rejected, interviewing, reviewed, pending)
 * @param {string} [message] - Optional custom message
 */
export async function sendApplicationStatusEmail(
  toEmail,
  applicantName,
  companyName,
  roleTitle,
  status,
  message = null
) {
  const email = typeof toEmail === "string" ? toEmail.trim() : "";
  if (!isValidEmail(email)) {
    console.error("Application status email skipped: invalid or missing recipient email");
    return { sent: false, error: "Invalid or missing recipient email" };
  }

  // Determine Subject and Body based on status
  let subject = "";
  let defaultBody = "";

  switch (status) {
    case "hired":
    case "approved":
      subject = `Application Approved – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nYour application for ${roleTitle} at ${companyName} has been approved! The team will be in touch with next steps.\n\nBest regards,\n${companyName}`;
      break;

    case "rejected":
      subject = `Application Update – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nThank you for your interest in ${roleTitle} at ${companyName}. After review, we have decided not to move forward with your application at this time. We encourage you to apply for other roles matches your experience.\n\nBest regards,\n${companyName}`;
      break;

    case "interviewing":
      subject = `Interview Invitation – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nWe are impressed with your application for ${roleTitle} at ${companyName} and would like to invite you for an interview. Our team will contact you shortly to schedule a time.\n\nBest regards,\n${companyName}`;
      break;

    case "reviewed":
      subject = `Application Reviewed – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nYour application for ${roleTitle} at ${companyName} has been reviewed by our hiring team. We are currently evaluating all candidates and will update you on the next steps soon.\n\nBest regards,\n${companyName}`;
      break;

    case "pending":
      subject = `Application Update – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nYour application status for ${roleTitle} at ${companyName} has been updated to 'Pending'. We are still processing your application and will be in touch.\n\nBest regards,\n${companyName}`;
      break;

    default:
      // Fallback or skip? For now, generic update.
      subject = `Application Update – ${companyName}`;
      defaultBody = `Hello ${applicantName},\n\nYour application status for ${roleTitle} at ${companyName} has been updated to '${status}'.\n\nBest regards,\n${companyName}`;
      break;
  }

  const body = message || defaultBody;

  const mailOptions = {
    from: process.env.MAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject,
    text: body,
  };

  const result = await sendMailWithRetry(mailOptions);
  if (result.sent) {
    console.log(`Application status email sent via Resend to ${email} (status: ${status}), messageId: ${result.messageId}`);
  }
  return result;
}

/**
 * Send "application received" email to applicant automatically when they submit.
 * @param {string} toEmail - Applicant email
 * @param {string} applicantName - Full name
 * @param {string} companyName - Company name
 * @param {string} roleTitle - Job/role title
 */
export async function sendApplicationReceivedEmail(toEmail, applicantName, companyName, roleTitle) {
  const email = typeof toEmail === "string" ? toEmail.trim() : "";
  if (!isValidEmail(email)) {
    console.error("Application-received email skipped: invalid or missing recipient email");
    return { sent: false, error: "Invalid or missing recipient email" };
  }
  const subject = `Application received – ${companyName}`;
  const body = `Hello ${applicantName},\n\nWe have received your application for ${roleTitle} at ${companyName}. We will review it and get back to you.\n\nBest regards,\n${companyName}`;
  const mailOptions = {
    from: process.env.MAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject,
    text: body,
  };

  return sendMailWithRetry(mailOptions);
}
