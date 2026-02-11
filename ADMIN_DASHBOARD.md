# Admin Dashboard – Backend Integration

This page is the **Admin Dashboard** (C.A.G.E): *Manage and review job applications*. Everything on this page is driven by the backend; the frontend should use the following endpoints with the admin JWT.

---

## 1. Auth

- **Login:** `POST /api/admin/login`  
  Body: `{ "email": "...", "password": "..." }`  
  Response: `{ "ok": true, "data": { "admin": {...}, "token": "..." } }`  
  Store `token` and send it as `Authorization: Bearer <token>` on all requests below.

---

## 2. KPI cards (Total, Pending Review, Interviewing, Hired)

- **Endpoint:** `GET /api/admin/applications/summary`
- **Headers:** `Authorization: Bearer <admin JWT>`
- **Query (optional):** `?companyId=xxx` (super_admin only; company_admin sees their company only)
- **Response:**  
  `{ "ok": true, "data": { "total": 5, "pending": 1, "interviewing": 1, "hired": 1 } }`

Map to your cards:

- **Total Applications** → `data.total`
- **Pending Review** → `data.pending`
- **Interviewing** → `data.interviewing`
- **Hired** → `data.hired`

---

## 3. Export CSV button

- **Endpoint:** `GET /api/admin/applications/export-csv`
- **Headers:** `Authorization: Bearer <admin JWT>`
- **Query (optional):** `?companyId=xxx` (super_admin only)
- **Response:** CSV file download (e.g. `admin-dashboard-applications-2025-02-05.csv`)

Use as the `href` of the "Export CSV" button (with token in a header you can’t set from a plain link, so the frontend should either open in a new window with fetch + blob download, or use a programmatic download with `fetch` + `Authorization` and then trigger the file save).

---

## 4. Status (applications table, search, filter)

This section is named **Status**: the table of applicants with search and status filter (All Status, Pending, Reviewed, Interviewing, Accepted, Rejected) and the view-details (eye) action.

- **Endpoint:** `GET /api/admin/applications`
- **Headers:** `Authorization: Bearer <admin JWT>`
- **Query (optional):**
  - `?companyId=xxx` (super_admin only)
  - `?status=pending|reviewed|interviewing|hired|approved|rejected` — filter by status (for the "All Status" dropdown)
  - `?search=...` — search by applicant name, email, role title, or company name (for the "Search by applicant, role, or company..." input)
- **Response:**  
  `{ "ok": true, "data": [ { "_id", "companyId": { "name" }, "roleId": { "title" }, "data": { "fullName", "email", ... }, "status", "createdAt", "reviewedAt", ... }, ... ] }`

**Table columns → backend fields:**

| Column        | Source |
|---------------|--------|
| APPLICANT     | `data.fullName` or `data.name` + `data.email` |
| ROLE          | `roleId.title` |
| COMPANY       | `companyId.name` |
| DATE APPLIED  | `createdAt` (e.g. format as "Oct 12") |
| STATUS        | `status` — show as Pending / Reviewed / Interviewing / Accepted (for `hired` or `approved`) / Rejected |
| View (eye)    | Link or action to view application `_id` (e.g. detail page or modal using same `_id` for `PATCH .../status`) |

Backend `status` values: `pending`, `reviewed`, `interviewing`, `hired`, `approved`, `rejected`. Map **Accepted** in the UI to `hired` or `approved`.

---

## 5. Updating status (Status section: Pending → Reviewed → Interviewing → Accepted/Hired, or Rejected)

- **Endpoint:** `PATCH /api/admin/applications/:id/status`
- **Headers:** `Authorization: Bearer <admin JWT>`
- **Body:** `{ "status": "pending" | "reviewed" | "interviewing" | "hired" | "approved" | "rejected", "message": "Optional custom email body" }`
- **Response:**  
  `{ "ok": true, "data": { "application": { "_id", "status", "reviewedAt" }, "emailSent": true, "emailError": null } }`

When `status` is `approved` or `hired`, the applicant receives an approval email. When `status` is `rejected`, they receive a rejection email (if `data.email` exists). For `pending` or `interviewing`, no email is sent.

---

## Summary

| UI element           | Backend endpoint                              |
|----------------------|-----------------------------------------------|
| Page title           | Static: "Admin Dashboard"                     |
| Subtitle             | Static: "Manage and review job applications" |
| Total Applications   | `GET /api/admin/applications/summary` → `data.total` |
| Pending Review       | `GET /api/admin/applications/summary` → `data.pending` |
| Interviewing         | `GET /api/admin/applications/summary` → `data.interviewing` |
| Hired                | `GET /api/admin/applications/summary` → `data.hired` |
| Export CSV button    | `GET /api/admin/applications/export-csv` (download CSV) |
| **Status** (table, search, filter) | `GET /api/admin/applications` → `data`; use `?status=` and `?search=` for filter and search |
| Change status       | `PATCH /api/admin/applications/:id/status`    |

All of the above require the admin to be logged in and the request to include the JWT from `POST /api/admin/login`.
