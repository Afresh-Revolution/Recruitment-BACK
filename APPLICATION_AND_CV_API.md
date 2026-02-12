# Application & CV API – Endpoint and How It Works

## Main endpoint: submit application + CV in one request

**`POST /api/formdata/apply`**

- **Purpose:** Submit a job application and optionally attach a CV in a **single** request. The backend stores the file (multer) and creates the application in MongoDB.
- **Content-Type:** `multipart/form-data`
- **Auth:** None

### How it works

1. **Request body (form fields + optional file)**  
   Send multipart form data with:
   - **Required:** `companyId`, `roleId`
   - **Optional:** `applicantId`
   - **Optional file:** field name **`resume`** (PDF or Word, max 10 MB)
   - **Any other fields** as form fields (e.g. `fullName`, `email`, `phone`, `address`, `educationStatus`, `role`, `motivation`, `workRemotely`, `workingDaysTime`, etc.)

2. **Backend flow**
   - **Multer** (in `src/middleware/upload.js`) handles the `resume` file: saves it under `uploads/` with a unique filename (e.g. `1234567890-abc123.pdf`).
   - **Controller** `createWithResume` in `src/controllers/formdata.controller.js`:
     - Reads `companyId`, `roleId`, `applicantId` from `req.body`.
     - Puts every other form field into a `data` object (e.g. `data.fullName`, `data.email`, …).
     - If a file was uploaded, sets `data.resumeUrl` and `data.attachmentUrl` to `/uploads/<filename>`.
     - Creates one **FormData** document in MongoDB with that `data` and returns it.

3. **Response**  
   `201` with body:  
   `{ "ok": true, "data": { ...application document } }`

So: **one API endpoint** = one HTTP request that both stores the CV (via multer) and saves the application (MongoDB).

---

## Other related endpoints

| Method | Endpoint | Purpose |
|--------|----------|--------|
| **POST** | `/api/formdata/apply` | Submit application + optional CV in one multipart request (use this for “apply with CV”). |
| **POST** | `/api/formdata` | Submit application as **JSON** only (no file); you’d set `data.resumeUrl` if the CV was uploaded elsewhere. |
| **POST** | `/api/upload/resume` | Upload only a resume file; returns `{ ok, url, filename }`. You’d then send that `url` in a separate `POST /api/formdata` if you don’t use `/apply`. |
| **GET** | `/api/formdata` | List applications (optional `?companyId=...`). |
| **GET** | `/uploads/:filename` | Public URL to download a stored file (e.g. CV). |

---

## Example: calling the main endpoint

```http
POST /api/formdata/apply
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

Form fields (and one file):

- `companyId` = `<company ObjectId>`
- `roleId` = `<role ObjectId>`
- `fullName` = `Jane Doe`
- `email` = `jane@example.com`
- `phone` = `+1234567890`
- `resume` = [file: CV.pdf]

Backend then:

1. Saves `CV.pdf` under `uploads/` (e.g. `uploads/1738...-xyz.pdf`).
2. Creates an application document with `companyId`, `roleId`, and `data: { fullName, email, phone, resumeUrl: "/uploads/...", attachmentUrl: "/uploads/..." }`.

---

## Frontend example (JavaScript)

```javascript
const formData = new FormData();
formData.append("companyId", companyId);
formData.append("roleId", roleId);
formData.append("fullName", fullName);
formData.append("email", email);
formData.append("phone", phone);
// ... other fields (address, educationStatus, role, motivation, workRemotely, etc.)
if (resumeFile) formData.append("resume", resumeFile);

const res = await fetch(`${API_BASE}/api/formdata/apply`, {
  method: "POST",
  body: formData,
});
const json = await res.json(); // { ok: true, data: { ...application } }
```

No separate upload then form submit; one call stores both the CV and the application.

---

## Admin: same data, different endpoints

**Yes — the API works with the admin.** Applications and CVs submitted via `POST /api/formdata/apply` are the same records and files the admin dashboard uses.

| Who | What they use |
|-----|----------------|
| **Applicant** | `POST /api/formdata/apply` (no auth) to submit application + CV. |
| **Admin** | **Admin endpoints** (require `Authorization: Bearer <admin JWT>`) to view and manage those applications. |

Admin does **not** call `/api/formdata/apply` (admins don’t submit job applications). Admin uses:

- **GET** `/api/admin/applications` — list applications (same FormData documents), with `resumeUrl` / `data.resumeUrl` for the CV.
- **GET** `/api/admin/applications/:id` — one application (details modal); includes resume URLs.
- **GET** `/api/admin/uploads/:filename` — download the resume file (e.g. PDF) with admin auth.
- **PATCH** `/api/admin/applications/:id/status` — set status (e.g. Mark as Reviewed).
- **PATCH** `/api/admin/applications/:id` — update application.
- **DELETE** `/api/admin/applications/:id` — delete application.

Resume files stored by multer (from `/api/formdata/apply`) are in the same `uploads/` folder, so the admin download endpoint serves those same files. Full details: see **ADMIN_DASHBOARD_ENDPOINTS.md**.
