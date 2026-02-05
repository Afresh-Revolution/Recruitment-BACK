# Admin Dashboards & Email (No Applicant Password)

## Concept

- **Applicants do not have passwords.** They submit the application form; the backend stores it. When a company admin approves or rejects the application, the backend **sends an email** to the applicant (using the email from the form). That is how applicants are notified – no login.
- **Each company has its own admin dashboard.** A **company admin** can log in (email + password), see only that company’s applications, and approve or reject them. On approve/reject, the system sends the email to the applicant.
- A **super admin** can log in and **manage all company admins** (create/delete company admins). The super admin can also list and review applications across companies.

## Roles

| Role           | Who                    | Can do |
|----------------|------------------------|--------|
| **super_admin**   | Platform owner          | Create/delete company admins, list all applications, approve/reject any application. |
| **company_admin** | Per-company dashboard  | List applications for their company only, approve/reject those applications (sends email to applicant). |

## Flow

1. **Applicant** fills the job application form (POST `/api/formdata`). No account or password. Data includes `data.email`, `data.fullName`, etc.
2. **Company admin** logs in (POST `/api/admin/login`), then:
   - GET `/api/admin/applications` → sees only their company’s applications.
   - PATCH `/api/admin/applications/:id/status` with `{ "status": "approved" \| "rejected", "message": "optional" }` → backend updates the application and **sends an email** to the applicant’s email from the form.
3. **Super admin** logs in, then:
   - GET/POST/DELETE `/api/admin/company-admins` → manage company admins.
   - GET `/api/admin/applications` (optional `?companyId=`) → list applications.
   - PATCH `/api/admin/applications/:id/status` → approve/reject and send email (same as company admin).

## Creating the first Super Admin

1. Set in `.env`:
   ```env
   SUPER_ADMIN_SECRET=your-strong-one-time-secret
   ```
2. Call once (e.g. Postman):
   ```http
   POST http://localhost:5000/api/admin/seed-super-admin
   X-Super-Admin-Secret: your-strong-one-time-secret
   Content-Type: application/json

   { "email": "super@example.com", "password": "securePassword", "name": "Super Admin" }
   ```
3. After that, log in with POST `/api/admin/login` using that email and password. Use the returned JWT for all other admin routes.

## Creating a Company Admin (Super Admin only)

```http
POST http://localhost:5000/api/admin/company-admins
Authorization: Bearer <super_admin_jwt>
Content-Type: application/json

{ "email": "admin@company.com", "password": "securePassword", "name": "Company Admin", "companyId": "<company_object_id>" }
```

That company admin can then log in and use their dashboard for that company only.

## Email (approval/rejection)

- Backend uses **nodemailer**. Configure SMTP in `.env` (see `env.example`).
- When a company admin (or super admin) sets an application’s status to `approved` or `rejected`, the backend calls `sendApplicationStatusEmail(toEmail, applicantName, companyName, roleTitle, approved, message)`.
- Applicant email is taken from `application.data.email`. If missing, status is still updated but no email is sent and the response indicates `emailSent: false`.

---

## How to test that email works

### Option 1: Run the test script (no server)

From the project root:

```bash
node test-email.js your@email.com
```

If you set `SMTP_USER` in `.env`, you can run:

```bash
node test-email.js
```

- **Success:** prints `OK – Email sent. MessageId: ...`
- **Failure:** prints `FAIL –` and the error (e.g. invalid credentials, connection refused).

### Option 2: Call the test endpoint (server must be running)

1. Start the server: `npm run dev`
2. Send a request with your **super admin secret** and the inbox you want to test:

```http
POST http://localhost:5000/api/admin/test-email
X-Super-Admin-Secret: your-strong-one-time-secret
Content-Type: application/json

{ "to": "your@email.com" }
```

- **Success:** response `{ "ok": true, "message": "Test email sent successfully", "data": { "to": "...", "messageId": "..." } }`
- **Failure:** response includes `ok: false` and an `error` message.

### SMTP setup (choose one)

**Gmail (real inbox):**

1. In `.env` set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=your@gmail.com`
   - `SMTP_PASS=` an [App Password](https://myaccount.google.com/apppasswords) (not your normal password)
   - `MAIL_FROM=your@gmail.com` or your app name
2. Run `node test-email.js your@gmail.com` or use the test endpoint with `"to": "your@gmail.com"`.

**Ethereal (fake inbox for testing):**

1. Go to [https://ethereal.email/create](https://ethereal.email/create) and create a test account.
2. Copy the SMTP credentials into `.env`:
   - `SMTP_HOST=smtp.ethereal.email`
   - `SMTP_PORT=587`
   - `SMTP_USER=` (from Ethereal)
   - `SMTP_PASS=` (from Ethereal)
   - `MAIL_FROM=` (e.g. the Ethereal user email)
3. Run `node test-email.js` (it will send to `SMTP_USER`). Check the Ethereal inbox or the preview URL they show when you send.

---

## API summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/admin/seed-super-admin` | Secret header | - | One-time: create first super admin |
| POST | `/api/admin/test-email` | Secret header | - | Send a test email (body: `{ "to": "your@email.com" }`) |
| POST | `/api/admin/login` | - | - | Login (email + password), returns JWT |
| GET | `/api/admin/company-admins` | JWT | super_admin | List company admins |
| POST | `/api/admin/company-admins` | JWT | super_admin | Create company admin |
| DELETE | `/api/admin/company-admins/:id` | JWT | super_admin | Delete company admin |
| GET | `/api/admin/applications` | JWT | company_admin or super_admin | List applications (company-scoped for company_admin) |
| PATCH | `/api/admin/applications/:id/status` | JWT | company_admin or super_admin | Approve/reject and send email to applicant |
