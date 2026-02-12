# API quick reference

Base: `https://recruitment-back.onrender.com` (or your server)

---

## Applicant – submit application + CV

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/formdata/apply` | No | **multipart/form-data:** `companyId`, `roleId`, `fullName`, `email`, `phone`, … + file field **`resume`** (PDF/Word, max 10 MB) |

One request stores CV (multer) + application (MongoDB). Response: `201` `{ ok, data }`.

---

## Admin – auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/admin/login` | No | `{ "email", "password" }` → returns `{ ok, data: { admin, token } }` |

All admin routes below need: **`Authorization: Bearer <token>`**

---

## Admin – applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications/summary` | Counts: total, pending, interviewing, hired |
| GET | `/api/admin/applications` | List (optional `?companyId=&status=&search=`) |
| GET | `/api/admin/applications/:id` | One application (details modal) |
| GET | `/api/admin/uploads/:filename` | Download resume (auth required) |
| PATCH | `/api/admin/applications/:id/status` | Set status → **sends email** when `hired`/`approved`/`rejected` |
| PATCH | `/api/admin/applications/:id` | Update application body |
| DELETE | `/api/admin/applications/:id` | Delete application |
| GET | `/api/admin/applications/export-csv` | Export CSV |

**Status + email:**  
`PATCH .../applications/:id/status`  
Body: `{ "status": "hired" | "approved" | "rejected" | "pending" | "reviewed" | "interviewing", "message": "optional custom text" }`  
When status is **hired** or **approved** → acceptance email. **rejected** → decline email. Response includes `emailSent`, `emailError`.

---

## Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/formdata` | List applications (optional `?companyId=`) |
| GET | `/uploads/:filename` | Download file (e.g. resume, no auth) |

---

Full details: **API_ENDPOINTS.md**, **APPLICATION_AND_CV_API.md**, **ADMIN_DASHBOARD_ENDPOINTS.md**.
