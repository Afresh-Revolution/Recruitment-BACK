# Upload & Resume API Endpoints

Base URL: `https://recruitment-back.onrender.com` (or `http://localhost:5000` locally).

---

## 1. Image upload (Hero, Gallery, Company logos, etc.)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/api/upload` | No | Upload one image; returns a URL to use in your app. |

**Request**

- **Content-Type:** `multipart/form-data`
- **Field name:** `image` (must be exactly `image`)
- **Allowed types:** JPEG, PNG, GIF, WebP
- **Max size:** 10 MB

**Example (cURL)**

```bash
curl -X POST https://recruitment-back.onrender.com/api/upload -F "image=@/path/to/photo.jpg"
```

**Response (201)**

```json
{
  "ok": true,
  "url": "/uploads/1738123456789-abc123.jpg"
}
```

Use `url` as the image URL in Hero, Gallery, Company, etc. Full URL for the same origin:  
`https://recruitment-back.onrender.com/uploads/1738123456789-abc123.jpg`

---

## 2. Resume upload (application documents)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/api/upload/resume` | No | Upload a resume (PDF or Word); returns a URL for the application form. |

**Request**

- **Content-Type:** `multipart/form-data`
- **Field name:** `resume` (must be exactly `resume`)
- **Allowed types:** PDF (`.pdf`), Word (`.doc`, `.docx`)
- **Max size:** 10 MB

**Example (cURL)**

```bash
curl -X POST https://recruitment-back.onrender.com/api/upload/resume -F "resume=@/path/to/Resume.pdf"
```

**Response (201)**

```json
{
  "ok": true,
  "url": "/uploads/1738123456790-xyz789.pdf",
  "filename": "1738123456790-xyz789.pdf"
}
```

Use `url` in the application payload when submitting an application (e.g. in `data.resumeUrl` or `data.attachmentUrl`). The **apply form (FormData)** does this automatically: it uploads the resume to `POST /api/upload/resume` first, then sends the returned URL inside `POST /api/formdata` in `data.resumeUrl` and `data.attachmentUrl`. So the same resume upload endpoint works for both:

- **Standalone use:** call `POST /api/upload/resume`, then include the returned `url` in your own `POST /api/formdata` body.
- **Apply form:** the frontend uploads the file to `POST /api/upload/resume`, then submits the form with that URL; no extra step needed.

Example manual payload for `POST /api/formdata`:

```json
{
  "companyId": "...",
  "roleId": "...",
  "data": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "resumeUrl": "/uploads/1738123456790-xyz789.pdf",
    "attachmentUrl": "/uploads/1738123456790-xyz789.pdf"
  }
}
```

---

## 3. Serving uploaded files (download / display)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/uploads/:filename` | No | Download or display an uploaded file (image or resume). |

**Examples**

- Image: `GET https://recruitment-back.onrender.com/uploads/1738123456789-abc123.jpg`
- Resume: `GET https://recruitment-back.onrender.com/uploads/1738123456790-xyz789.pdf`

Use these URLs in an `<a href="...">` for “Download resume” or in `<img src="...">` for images.

**Note (Render):** On Render the filesystem is ephemeral; files in `/uploads` are lost on redeploy. For production, use persistent storage (e.g. S3) and store/return those URLs instead.

---

## 4. Admin: resume URL in applications and authenticated download

**GET /api/admin/applications** (and **GET /api/admin/applications/:id**) return each application with a **resume URL** the admin UI can use to show or download the file. The URL can appear in:

- **`data.attachmentUrl`**
- **`data.resumeUrl`**
- **Root-level `resumeUrl`** (convenience; backend sets this from `data.resumeUrl` or `data.attachmentUrl`)

**Using the URL**

- If the value is a **full URL** (e.g. `https://...`), use it as-is.
- If it is a **relative path** (e.g. `/uploads/123.pdf`), turn it into a full URL by appending to the API base URL:  
  `fullUrl = baseUrl + resumeUrl`  
  Example: `https://recruitment-back.onrender.com` + `/uploads/123.pdf` → `https://recruitment-back.onrender.com/uploads/123.pdf`

**If the file is behind auth**

Use the **admin-only download** endpoint with the admin Bearer token:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/admin/uploads/:filename` | **Bearer token** (admin JWT) | Download an uploaded file (e.g. resume). Same file as `/uploads/:filename` but requires admin login. |

- **URL:** `GET https://recruitment-back.onrender.com/api/admin/uploads/1738123456790-xyz789.pdf`
- **Header:** `Authorization: Bearer <admin JWT>`
- The **filename** is the last part of the resume URL (e.g. from `data.resumeUrl` = `/uploads/1738123456790-xyz789.pdf` use filename `1738123456790-xyz789.pdf`).

So the frontend can either:

1. Use the **public** URL: `baseUrl + application.resumeUrl` (e.g. `baseUrl + "/uploads/xxx.pdf"`) for direct link/download, or  
2. Use the **authenticated** URL: `baseUrl + "/api/admin/uploads/" + filename` with `Authorization: Bearer <token>` for admin-only download.

---

## Summary

| Purpose | Method | Endpoint | Form field / Auth |
|---------|--------|----------|-------------------|
| Upload image | POST | `/api/upload` | `image` |
| Upload resume | POST | `/api/upload/resume` | `resume` |
| Get file (public) | GET | `/uploads/:filename` | — |
| Get file (admin, behind auth) | GET | `/api/admin/uploads/:filename` | Bearer token |
