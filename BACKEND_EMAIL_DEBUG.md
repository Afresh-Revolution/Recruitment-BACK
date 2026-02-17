# Backend: Why applicants don't receive emails (Accepted/Rejected)

The frontend only calls **PATCH /api/admin/applications/:id/status** and shows the backend’s **emailSent** / **emailError**. If applicants don’t get emails, the backend is responsible. Use this checklist to find and fix the cause.

---

## 1. Check the API response

After the admin sets status to **Accepted** (hired/approved) or **Rejected**:

- **emailSent: true** → Backend believes the email was sent. If the applicant still didn’t receive it, see §4 (SMTP/config) and §5 (logs).
- **emailSent: false, emailError: "No valid applicant email..."** → Application has no usable email. See §2.
- **emailSent: false, emailError: "Invalid or missing recipient email"** → Same as above; email was missing or invalid.
- **emailSent: false, emailError: "<some SMTP message>"** → Sending failed (credentials, network, etc.). See §4.

---

## 2. Application must have a valid email

Emails are sent only when the application has a **valid** `data.email`:

- Stored in **MongoDB** on the application document under `data.email`.
- Must be a non-empty string containing `@` (after trim).
- It comes from the **apply** form: the field that collects the applicant’s email must be submitted with field name **`email`** (or whatever the form stores in `data`), and the backend must persist it (e.g. **POST /api/formdata/apply** puts form fields into `data`).

**Check in DB:**  
Find the application by `_id` and ensure `data.email` exists and looks like a real address.

**Check apply flow:**  
Ensure the applicant form includes an email field and that **POST /api/formdata/apply** (or **POST /api/formdata**) receives and saves it into `data.email`.

---

## 3. Status endpoint and email logic

- **Endpoint:** **PATCH /api/admin/applications/:id/status**
- **Body:** `{ "status": "hired" | "approved" | "rejected", "message": "optional" }`
- Email is sent **only** when:
  - `status` is **hired**, **approved**, or **rejected**, and
  - The application has a valid **data.email** (see §2).

Code: **src/controllers/admin.controller.js** → `setApplicationStatus`; **src/utils/email.js** → `sendApplicationStatusEmail`. The controller normalizes `data.email`, checks it’s valid, then calls the email util. If the util returns an error, the controller returns it in **emailError**.

---

## 4. SMTP / env config

If **emailSent: false** and **emailError** is an SMTP-related message (e.g. auth failed, connection refused), fix config:

- **.env** (see **env.example**):
  - **SMTP_HOST**, **SMTP_PORT**, **SMTP_SECURE**
  - **SMTP_USER**, **SMTP_PASS** (e.g. Gmail App Password, not normal password)
  - **MAIL_FROM** (address shown as sender)
- Restart the server after changing .env.
- **Test:** Use **POST /api/admin/test-email** with header **X-Super-Admin-Secret: &lt;SUPER_ADMIN_SECRET&gt;** and optional body **{ "to": "your@email.com" }** to verify sending. If this fails, the problem is SMTP/config, not the status endpoint.

---

## 5. Server logs

The backend logs help confirm what happened:

- **“Sending status email for application &lt;id&gt; to applicant (approved|rejected)”** → Attempt was made.
- **“Application status email sent to …”** → Send succeeded (from **src/utils/email.js**).
- **“Application &lt;id&gt; status email failed: …”** → Send failed; the message is the **emailError** returned to the frontend.
- **“Application &lt;id&gt;: no valid applicant email …”** → Email was skipped because **data.email** was missing or invalid.

Use these to see whether the problem is “no email on application” vs “SMTP/config”.

---

## Summary

| If you see | Do this |
|------------|--------|
| **emailError: "No valid applicant email..."** | Ensure apply form sends and backend saves **data.email**; check document in DB. |
| **emailError: &lt;SMTP error&gt;** | Fix SMTP env (SMTP_USER, SMTP_PASS, etc.); test with **POST /api/admin/test-email**. |
| **emailSent: true** but applicant got nothing | Check spam; check SMTP/MAIL_FROM; check server logs for messageId; verify SMTP provider (e.g. Gmail) allows sending. |

The frontend is only displaying **emailSent** and **emailError** from the status endpoint; fixing the above on the backend should resolve applicants not receiving emails.
