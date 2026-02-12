# Admin Dashboard – Endpoints Reference

Base URL: **https://recruitment-back.onrender.com**  
All endpoints below (except login/seed) require: **`Authorization: Bearer <admin JWT>`**

---

## 1. Login (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login with email + password. Returns `{ ok, data: { admin, token } }`. |

**Body:** `{ "email": "...", "password": "..." }`

---

## 2. Dashboard KPIs (summary cards)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications/summary` | Counts for Total, Pending, Interviewing, Hired. |

**Query (optional):** `?companyId=xxx` (super_admin only)  
**Response:** `{ "ok": true, "data": { "total", "pending", "interviewing", "hired" } }`

---

## 3. Export CSV

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications/export-csv` | Download all applications as CSV. |

**Query (optional):** `?companyId=xxx`  
**Response:** CSV file (attachment).

---

## 4. Status table (list applications)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications` | List applications for the table (search & filter). |

**Query (optional):**  
- `?companyId=xxx`  
- `?status=pending|reviewed|interviewing|hired|approved|rejected`  
- `?search=...` (applicant name, email, role, company)  

**Response:** `{ "ok": true, "data": [ ... ] }`  
Each item includes **`resumeUrl`** (root-level) and **`data.resumeUrl`** / **`data.attachmentUrl`** for the resume link.

---

## 5. Application Details (modal)

These are the endpoints for the **Application Details** view (one application: ID, status, applicant info, position, documents, Mark as Reviewed).

### 5.1 Get one application (open modal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications/:id` | Fetch one application by ID for the details modal. |

**Example:** `GET /api/admin/applications/507f1f77bcf86cd799439011`

**Response:** `{ "ok": true, "data": { ...application } }`  

The `data` object includes:
- `_id`, `companyId` (populated: name), `roleId` (populated: title)
- `data.fullName`, `data.email`, `data.phone`, `data.address`, etc.
- **`resumeUrl`** (root-level) and **`data.resumeUrl`** / **`data.attachmentUrl`** for the resume
- `status`, `createdAt`, `reviewedAt`

Use this to fill: **ID**, **Current Status**, **Applied On**, **Applicant Information**, **Position Details**, and **Documents** (resume).

---

### 5.2 Download resume (from Application Details)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/uploads/:filename` | Download the uploaded file (e.g. resume PDF). Requires admin Bearer token. |

**Example:** If `data.resumeUrl` is `/uploads/1738123456790-xyz789.pdf`, then:
- **Filename** = `1738123456790-xyz789.pdf`
- **URL** = `GET /api/admin/uploads/1738123456790-xyz789.pdf`
- **Header:** `Authorization: Bearer <admin JWT>`

**Alternative (public):** `GET /uploads/1738123456790-xyz789.pdf` (no auth) — full URL: `baseUrl + "/uploads/1738123456790-xyz789.pdf"`.

---

### 5.3 Mark as Reviewed (or set status)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/admin/applications/:id/status` | Set application status (e.g. Mark as Reviewed). Optionally send email to applicant. |

**Body:** `{ "status": "reviewed", "message": "Optional custom message" }`  

**Allowed statuses:** `pending`, `reviewed`, `interviewing`, `hired`, `approved`, `rejected`

**Response:** `{ "ok": true, "data": { "application": { "_id", "status", "reviewedAt" }, "emailSent", "emailError" } }`

---

### 5.4 Update application (optional)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/admin/applications/:id` | Update application body (e.g. data fields). Use `.../status` for status changes. |

**Body:** Any FormData fields (e.g. `data: { fullName, email, resumeUrl }`). Do not send `status` here — use `PATCH .../status` for that.

---

### 5.5 Delete application (optional)

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/admin/applications/:id` | Delete the application. |

**Response:** `{ "ok": true, "data": { "_id", "deleted": true } }`

---

## Application Details – Quick checklist

| UI element | Endpoint / source |
|------------|-------------------|
| Open modal (load one application) | **GET** `/api/admin/applications/:id` |
| ID (e.g. APP-002) | From `data._id` (format as needed in frontend) |
| Current Status | `data.status` |
| Applied On | `data.createdAt` |
| Applicant: Full Name | `data.data.fullName` or `data.data.name` |
| Applicant: Email | `data.data.email` |
| Position: Role | `data.roleId.title` |
| Position: Company | `data.companyId.name` |
| Documents / Resume | `data.resumeUrl` or `data.data.resumeUrl` or `data.data.attachmentUrl` |
| Download resume button | **GET** `/api/admin/uploads/:filename` with Bearer token, or open `baseUrl + data.resumeUrl` |
| Mark as Reviewed button | **PATCH** `/api/admin/applications/:id/status` with body `{ "status": "reviewed" }` |
| Close button | No API call (close modal) |

---

## Summary table (all admin application endpoints)

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/api/admin/applications/summary` | KPI counts |
| GET | `/api/admin/applications/export-csv` | Export CSV |
| GET | `/api/admin/applications` | List (Status table) |
| GET | `/api/admin/applications/:id` | **Application Details – load one** |
| GET | `/api/admin/uploads/:filename` | **Application Details – download resume (with auth)** |
| PATCH | `/api/admin/applications/:id/status` | **Application Details – Mark as Reviewed / set status** |
| PATCH | `/api/admin/applications/:id` | Update application body |
| DELETE | `/api/admin/applications/:id` | Delete application |

All of the above (except login) require **`Authorization: Bearer <admin JWT>`**.
