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

## API summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/admin/seed-super-admin` | Secret header | - | One-time: create first super admin |
| POST | `/api/admin/login` | - | - | Login (email + password), returns JWT |
| GET | `/api/admin/company-admins` | JWT | super_admin | List company admins |
| POST | `/api/admin/company-admins` | JWT | super_admin | Create company admin |
| DELETE | `/api/admin/company-admins/:id` | JWT | super_admin | Delete company admin |
| GET | `/api/admin/applications` | JWT | company_admin or super_admin | List applications (company-scoped for company_admin) |
| PATCH | `/api/admin/applications/:id/status` | JWT | company_admin or super_admin | Approve/reject and send email to applicant |
