# Applicant email (approved / declined) – how it works & endpoints

Applicants get an email when an admin sets their application to **approved**, **hired**, or **rejected**. There is **no separate “send email” endpoint** — the email is sent automatically when you update the application status.

---

## 1. Automatic "application received" email (on submit)

When someone submits via **POST** `/api/formdata/apply` with an email in the form:

- The backend saves the application and CV.
- It **automatically** sends a short "We have received your application" email to `data.email`.
- Subject: `Application received – {companyName}`. The request still returns `201` even if the email fails (failure is logged).

No extra API call is needed; it happens inside the apply endpoint.

---

## 2. Automatic approval / decline email (when admin sets status)

1. **Admin** calls **PATCH** `/api/admin/applications/:id/status` with body:
   - `status`: `"hired"` | `"approved"` (accept) or `"rejected"` (decline)
   - `message`: optional custom text (replaces the default email body)

2. **Backend** (in `src/controllers/admin.controller.js`):
   - Updates the application status and saves.
   - Reads applicant email from `application.data.email`, name from `application.data.fullName`, company and role from the application.
   - If status is **hired** or **approved** → sends an **approval** email.
   - If status is **rejected** → sends a **decline** email.

3. **Email content** is built in `src/utils/email.js` (`sendApplicationStatusEmail`):
   - **Approved:** subject `Application approved – {companyName}`, default body: “Your application for {role} at {company} has been approved…”
   - **Rejected:** subject `Application update – {companyName}`, default body: “We have decided not to move forward…”
   - If the admin sent a `message`, that text is used as the **entire email body** instead of the default.

So: **the email is sent automatically** when the admin updates the status; no separate step.

---

## 3. Endpoint that triggers approval/decline email

| Method | Endpoint | Auth | When email is sent |
|--------|----------|------|--------------------|
| **PATCH** | `/api/admin/applications/:id/status` | Bearer (admin JWT) | When `status` is `hired`, `approved`, or `rejected` |

**Request**

```http
PATCH /api/admin/applications/<applicationId>/status
Authorization: Bearer <admin JWT>
Content-Type: application/json
```

**Body**

```json
{
  "status": "hired",
  "message": "Optional custom message (if omitted, default approval/decline text is used)"
}
```

- **Accept:** `"status": "hired"` or `"status": "approved"`
- **Decline:** `"status": "rejected"`
- **No email:** `"status": "pending"`, `"reviewed"`, or `"interviewing"` (status is updated, no email sent)

**Response**

```json
{
  "ok": true,
  "data": {
    "application": { "_id": "...", "status": "hired", "reviewedAt": "..." },
    "emailSent": true,
    "emailError": null
  }
}
```

- If the application has no `data.email`, you get `emailSent: false` and `emailError: "No applicant email in application data"`.

---

## 4. Test-email endpoint (SMTP check)

To verify that email is configured and can be sent:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/api/admin/test-email` | Header `X-Super-Admin-Secret: <SUPER_ADMIN_SECRET>` | Sends one test approval email to check SMTP. |

**Request**

```http
POST /api/admin/test-email
X-Super-Admin-Secret: <your SUPER_ADMIN_SECRET from .env>
Content-Type: application/json
```

**Body (optional)**

```json
{ "to": "your@email.com" }
```

If `to` is omitted, the server uses `SMTP_USER` from `.env` as the recipient (or returns an error if not set).

**Response (success):** `200` `{ "ok": true, "message": "Test email sent successfully", "data": { "to", "messageId" } }`

---

## 5. Env vars for email

In `.env` (see `env.example`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@yourdomain.com
```

- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.
- `MAIL_FROM` is the “From” address shown to the applicant.

---

## Summary

| When | What happens (automatic) |
|------|---------------------------|
| Applicant submits (POST `/api/formdata/apply`) | "Application received" email is sent to `data.email` (if present). |
| Admin sets status to **hired** or **approved** | Approval email is sent to the applicant. |
| Admin sets status to **rejected** | Decline email is sent to the applicant. |
| Test SMTP | **POST** `/api/admin/test-email` with `X-Super-Admin-Secret` and optional `{ "to": "email@example.com" }`. |

No separate "send email" endpoint; all applicant emails are triggered automatically by the apply and status endpoints.
