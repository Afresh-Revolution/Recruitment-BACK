# API Endpoints & JSON Bodies

Base URL: `http://localhost:5000` (or your server URL)

---

## HTTP methods (REST)

| Method | Use | Examples in this API |
|--------|-----|----------------------|
| **GET** | Fetch/read data | Get users, posts, jobs, companies, hero, roles, applications |
| **POST** | Send/create new data | Create account, submit form, add job, create company, submit application |
| **PUT** | Update entire existing data | Edit full profile (replace whole resource) |
| **PATCH** | Update part of existing data | Change only name, email, or a few fields |
| **DELETE** | Remove data | Delete post, job, user, company, role, application |

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Service status |
| GET | `/api/health` | No | Health check |

**GET /**  
Response:
```json
{ "ok": true, "service": "the-cage-backend" }
```

**GET /api/health**  
Response:
```json
{ "ok": true }
```

---

## Company

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/company` | No | List active companies |
| GET | `/api/company/:id` | No | Get one company |
| POST | `/api/company` | No | Create company |
| PATCH | `/api/company/:id` | No | Update part of company |
| DELETE | `/api/company/:id` | No | Remove company |

**GET /api/company**  
Response:
```json
{
  "ok": true,
  "data": [
    {
      "_id": "...",
      "name": "Company A",
      "slug": "company_a",
      "logo": "https://...",
      "description": "...",
      "backgroundImage": "https://...",
      "partnerTag": "Partner",
      "active": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**GET /api/company/:id**  
Response:
```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "name": "Company A",
    "slug": "company_a",
    "logo": "https://...",
    "description": "...",
    "backgroundImage": "https://...",
    "partnerTag": "Partner",
    "active": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**POST /api/company**  
Request:
```json
{
  "name": "Company A",
  "slug": "company_a",
  "logo": "https://...",
  "description": "Short description",
  "backgroundImage": "https://...",
  "partnerTag": "Partner",
  "active": true
}
```
Response: `201` — `{ "ok": true, "data": { ...company } }`

**PATCH /api/company/:id**  
Request: (any subset of company fields)  
Response: `200` — `{ "ok": true, "data": { ...company } }`

**DELETE /api/company/:id**  
Response: `200` — `{ "ok": true, "data": { "_id": "...", "deleted": true } }`

---

## Hero

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hero` | No | First active hero (no companyId) |
| GET | `/api/hero?companyId=xxx` | No | Hero by companyId (query) |
| GET | `/api/hero/by-id/:id` | No | Get one hero document by _id |
| GET | `/api/hero/:companyId` | No | Hero by companyId (param) |
| POST | `/api/hero` | No | Create/update hero (upsert by companyId) |
| PATCH | `/api/hero/:id` | No | Update hero by _id (partial) |
| DELETE | `/api/hero/:id` | No | Remove hero by _id |

**GET /api/hero** or **GET /api/hero?companyId=xxx**  
Response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "companyId": "...",
    "navigation": {
      "logo": "C.A.G.E",
      "links": [
        { "label": "Home", "path": "/", "active": true },
        { "label": "Browse Jobs", "path": "/jobs", "active": false }
      ]
    },
    "headline": {
      "main": "Accelerate your growth with",
      "highlight": "top talent",
      "highlightIcon": "⚡"
    },
    "description": "Join a network where...",
    "cta": { "text": "Apply Now", "link": "/apply" },
    "features": [
      { "label": "Smart Matching", "icon": "+", "highlighted": true },
      { "label": "Analytics", "icon": null, "highlighted": false }
    ],
    "panels": {
      "topLeft": { "imageUrl": "https://...", "alt": "Person working on laptop" },
      "topRight": {
        "label": "New Hires",
        "count": "+1424",
        "monthLabels": ["Ap", "My", "Ju", "Jl", "Au", "Se"],
        "backgroundImage": "https://...",
        "overlayColor": "purple"
      },
      "bottomLeft": {
        "title": "Shine together",
        "iconUrl": "https://...",
        "backgroundImage": "https://...",
        "overlayColor": "pink"
      },
      "bottomRight": { "imageUrl": "https://...", "alt": "Person with laptop" }
    },
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**POST /api/hero**  
Request: `companyId` required; any other Hero fields.
```json
{
  "companyId": "company_object_id",
  "navigation": {
    "logo": "C.A.G.E",
    "links": [
      { "label": "Home", "path": "/", "active": true },
      { "label": "Browse Jobs", "path": "/jobs", "active": false }
    ]
  },
  "headline": {
    "main": "Accelerate your growth with",
    "highlight": "top talent",
    "highlightIcon": "⚡"
  },
  "description": "Join a network where...",
  "cta": { "text": "Apply Now", "link": "/apply" },
  "features": [
    { "label": "Smart Matching", "icon": "+", "highlighted": true }
  ],
  "panels": {
    "topLeft": { "imageUrl": "https://...", "alt": "Person working on laptop" },
    "topRight": {
      "label": "New Hires",
      "count": "+1424",
      "monthLabels": ["Ap", "My", "Ju", "Jl", "Au", "Se"],
      "backgroundImage": "https://...",
      "overlayColor": "purple"
    },
    "bottomLeft": {
      "title": "Shine together",
      "iconUrl": "https://...",
      "backgroundImage": "https://...",
      "overlayColor": "pink"
    },
    "bottomRight": { "imageUrl": "https://...", "alt": "Person with laptop" }
  },
  "isActive": true
}
```
Response: `200` — `{ "success": true, "message": "Hero section saved successfully", "data": { ...hero } }`

---

## Powered

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/powered` | No | Powered section (optional companyId) |
| GET | `/api/powered/by-id/:id` | No | Get one Powered document by _id |
| POST | `/api/powered` | No | Create/update powered (upsert) |
| PATCH | `/api/powered/:id` | No | Update Powered by _id |
| DELETE | `/api/powered/:id` | No | Remove Powered by _id |

**GET /api/powered** or **GET /api/powered?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "title": "POWERED BY:",
    "partners": [
      {
        "name": "Partner Name",
        "logoUrl": "https://...",
        "logoText": "afr®",
        "link": "https://...",
        "order": 0
      }
    ],
    "companyId": "..."
  }
}
```

**POST /api/powered**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "title": "POWERED BY:",
  "partners": [
    {
      "name": "Partner Name",
      "logoUrl": "https://...",
      "logoText": "afr®",
      "link": "https://...",
      "order": 0
    }
  ]
}
```
Response: `200` — `{ "ok": true, "data": { ...powered } }`

---

## Opportunities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/opportunities` | No | Opportunities section (optional companyId) |
| GET | `/api/opportunities/by-id/:id` | No | Get one Opportunities document by _id |
| POST | `/api/opportunities` | No | Create/update opportunities (upsert) |
| PATCH | `/api/opportunities/:id` | No | Update Opportunities by _id |
| DELETE | `/api/opportunities/:id` | No | Remove Opportunities by _id |

**GET /api/opportunities** or **GET /api/opportunities?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "trendingLabel": "Trending Opportunities",
    "sectionTitle": "Available Roles",
    "roles": [
      {
        "_id": "...",
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "type": "Full-time",
        "location": "Remote",
        "deadline": "2026-02-15T00:00:00.000Z",
        "company": { "name": "Company A", "logo": "https://..." }
      }
    ],
    "viewMoreButton": { "text": "View More Roles →", "link": "/roles" }
  }
}
```

**POST /api/opportunities**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "trendingLabel": "Trending Opportunities",
  "sectionTitle": "Available Roles",
  "roleIds": ["role_id_1", "role_id_2"],
  "viewMoreButton": { "text": "View More Roles →", "link": "/roles" }
}
```
Response: `200` — `{ "ok": true, "data": { ...opportunities } }`

---

## WhyChooseUs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/whychooseus` | No | Why choose us section |
| GET | `/api/whychooseus/by-id/:id` | No | Get one WhyChooseUs document by _id |
| POST | `/api/whychooseus` | No | Create/update (upsert) |
| PATCH | `/api/whychooseus/:id` | No | Update WhyChooseUs by _id |
| DELETE | `/api/whychooseus/:id` | No | Remove WhyChooseUs by _id |

**GET /api/whychooseus**  
Response: `{ "ok": true, "data": { ...whyChooseUs } }`  
(Structure: companyId, sectionKey, headline, description, rating, features, previewImages, trainees, gallery, isActive.)

**POST /api/whychooseus**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "sectionKey": "why_choose_us",
  "headline": "...",
  "description": "...",
  "rating": { "score": 4.8, "label": "Rating" },
  "features": ["Feature 1", "Feature 2"],
  "previewImages": ["https://..."],
  "trainees": { "total": 150, "list": [{ "name": "...", "role": "...", "avatar": "...", "rating": 5 }] },
  "gallery": { "title": "...", "subtitle": "...", "images": ["https://..."] },
  "isActive": true
}
```
Response: `200` — `{ "ok": true, "data": { ... } }`

---

## Trainee

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trainee` | No | Section + trainee cards (optional companyId) |
| POST | `/api/trainee` | No | Create trainee |
| PATCH | `/api/trainee/:id` | No | Update part of trainee |
| DELETE | `/api/trainee/:id` | No | Remove trainee |
| POST | `/api/trainee/section` | No | Create/update trainee section (upsert) |

**GET /api/trainee** or **GET /api/trainee?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "sectionTitle": "We have over 150+ Trainee",
    "trainees": [
      {
        "_id": "...",
        "name": "John Doe",
        "role": "Java Developer",
        "avatar": "https://...",
        "rating": 5
      }
    ]
  }
}
```

**POST /api/trainee**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "name": "John Doe",
  "role": "Java Developer",
  "avatar": "https://...",
  "rating": 5,
  "isActive": true
}
```
Response: `201` — `{ "ok": true, "data": { ...trainee } }`

**PATCH /api/trainee/:id**  
Request: (any subset of name, role, avatar, rating, isActive)  
Response: `200` — `{ "ok": true, "data": { ...trainee } }`

**DELETE /api/trainee/:id**  
Response: `200` — `{ "ok": true, "data": { "_id": "...", "deleted": true } }`

**POST /api/trainee/section**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "sectionTitle": "We have over 150+ Trainee",
  "traineeIds": ["trainee_id_1", "trainee_id_2"]
}
```
Response: `200` — `{ "ok": true, "data": { ...section } }`

---

## Gallery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/gallery` | No | Gallery section (optional companyId) |
| GET | `/api/gallery/by-id/:id` | No | Get one Gallery document by _id |
| POST | `/api/gallery` | No | Create/update gallery (upsert) |
| PATCH | `/api/gallery/:id` | No | Update Gallery by _id |
| DELETE | `/api/gallery/:id` | No | Remove Gallery by _id |

**GET /api/gallery** or **GET /api/gallery?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "categoryTag": "Life at Cage",
    "title": "Our Gallery",
    "subtitle": "A glimpse into our community and culture.",
    "images": [
      { "url": "https://...", "alt": "Team photo", "order": 0 }
    ],
    "copyright": "© 2026 Cage All rights reserved."
  }
}
```

**POST /api/gallery**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "categoryTag": "Life at Cage",
  "title": "Our Gallery",
  "subtitle": "A glimpse into our community and culture.",
  "images": [
    { "url": "https://...", "alt": "Team photo", "order": 0 }
  ],
  "copyright": "© 2026 Cage All rights reserved."
}
```
Response: `200` — `{ "ok": true, "data": { ...gallery } }`

---

## Destination

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/destination` | No | Destination section (optional companyId) |
| POST | `/api/destination` | No | Create destination |
| PATCH | `/api/destination/:id` | No | Update part of destination |
| DELETE | `/api/destination/:id` | No | Remove destination |

**GET /api/destination** or **GET /api/destination?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "sectionTitle": "Choose Your Destination",
    "sectionDescription": "Select a partner company to view their open positions...",
    "selectButtonText": "Select →",
    "companies": [
      {
        "_id": "...",
        "name": "Company A",
        "logo": "https://...",
        "description": "...",
        "backgroundImage": "https://...",
        "partnerTag": "Partner",
        "openRolesCount": 5,
        "selectLink": "/companies/..."
      }
    ]
  }
}
```

**POST /api/destination**  
Request:
```json
{
  "companyId": "company_object_id_or_null",
  "sectionTitle": "Choose Your Destination",
  "sectionDescription": "Select a partner company...",
  "companyIds": ["company_id_1", "company_id_2"],
  "selectButtonText": "Select →"
}
```
Response: `201` — `{ "ok": true, "data": { ...destination } }`

**PATCH /api/destination/:id**  
Request: (any subset of section fields)  
Response: `200` — `{ "ok": true, "data": { ...destination } }`

**DELETE /api/destination/:id**  
Response: `200` — `{ "ok": true, "data": { "_id": "...", "deleted": true } }`

---

## Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/role` | No | All active roles (no companyId) |
| GET | `/api/role?companyId=xxx` | No | Roles section + list for company |
| POST | `/api/role` | No | Create role (job) |
| PATCH | `/api/role/:id` | No | Update part of role |
| DELETE | `/api/role/:id` | No | Remove role (job) |
| POST | `/api/role/section` | No | Create/update role section (upsert) |

**GET /api/role**  
Response: `{ "ok": true, "data": { "roles": [ ... ] } }` (list of Role docs with companyId populated)

**GET /api/role?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "companyName": "Company A",
    "companyLogo": "https://...",
    "sectionTagline": "text challenge and apply today.",
    "filterCategories": ["All", "Engineering", "Design"],
    "roles": [
      {
        "_id": "...",
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "type": "Full-time",
        "location": "Remote",
        "deadline": "2026-02-15T00:00:00.000Z",
        "applyByLabel": "Apply by Feb 15",
        "applyLink": "/apply/..."
      }
    ]
  }
}
```

**POST /api/role**  
Request:
```json
{
  "companyId": "company_object_id",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "type": "Full-time",
  "location": "Remote",
  "description": "We are looking for...",
  "requirements": ["3+ years experience", "Node.js"],
  "qualifications": ["BSc Computer Science"],
  "deadline": "2026-02-15",
  "isActive": true
}
```
Response: `201` — `{ "ok": true, "data": { ...role } }`

**PATCH /api/role/:id**  
Request: (any subset of role fields)  
Response: `200` — `{ "ok": true, "data": { ...role } }`

**DELETE /api/role/:id**  
Response: `200` — `{ "ok": true, "data": { "_id": "...", "deleted": true } }`

**POST /api/role/section**  
Request:
```json
{
  "companyId": "company_object_id",
  "sectionTagline": "text challenge and apply today.",
  "filterCategories": ["All", "Engineering", "Design", "Product", "Marketing"]
}
```
Response: `200` — `{ "ok": true, "data": { ...section } }`

---

## FormRequirement

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/formrequirement?roleId=xxx` | No | Form content for one role (or fallback from Role) |
| GET | `/api/formrequirement?companyId=xxx` | No | List form requirements for company |
| GET | `/api/formrequirement/:id` | No | Get one FormRequirement by _id |
| POST | `/api/formrequirement` | No | Create/update form requirement (upsert by companyId + roleId) |
| PATCH | `/api/formrequirement/:id` | No | Update FormRequirement by _id |
| DELETE | `/api/formrequirement/:id` | No | Remove FormRequirement by _id |

**GET /api/formrequirement?roleId=xxx**  
Response:
```json
{
  "ok": true,
  "data": {
    "jobTitle": "Managing Director",
    "jobDescription": "We are looking for...",
    "jobRequirements": ["Requirement 1", "Requirement 2"],
    "jobQualifications": ["BSc", "5+ years"],
    "jobDuration": "Full-time",
    "applicationDeadline": "15th January, 2026",
    "roleId": "...",
    "companyId": "..."
  }
}
```

**GET /api/formrequirement?companyId=xxx**  
Response: `{ "ok": true, "data": [ ...list of FormRequirement docs... ] }`

**POST /api/formrequirement**  
Request:
```json
{
  "companyId": "company_object_id",
  "roleId": "role_object_id",
  "jobTitle": "Managing Director",
  "jobDescription": "We are looking for...",
  "jobRequirements": ["Requirement 1", "Requirement 2"],
  "jobQualifications": ["BSc", "5+ years"],
  "jobDuration": "Full-time",
  "applicationDeadline": "15th January, 2026",
  "deadlineDate": "2026-01-15"
}
```
Response: `200` — `{ "ok": true, "data": { ...formRequirement } }`

---

## FormData (Applications)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/formdata` | No | List submissions (optional companyId) |
| POST | `/api/formdata` | No | Submit application |
| PATCH | `/api/formdata/:id` | No | Update application by _id (partial, e.g. data) |
| DELETE | `/api/formdata/:id` | No | Remove application submission |

**GET /api/formdata** or **GET /api/formdata?companyId=xxx**  
Response:
```json
{
  "ok": true,
  "data": [
    {
      "_id": "...",
      "companyId": "...",
      "roleId": "...",
      "applicantId": null,
      "data": {
        "fullName": "...",
        "email": "...",
        "phone": "...",
        "address": "...",
        "educationStatus": "Graduate",
        "role": "...",
        "motivation": "...",
        "attachmentUrl": "...",
        "workRemotely": true
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**POST /api/formdata**  
Request:
```json
{
  "companyId": "company_object_id",
  "roleId": "role_object_id",
  "applicantId": "user_id_or_null",
  "data": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "address": "Lagos, Nigeria",
    "educationStatus": "Graduate",
    "role": "Senior Software Engineer",
    "workingDaysTime": "Mondays: 10am - 5pm, Wednesday: 10am - 5pm, Friday: 10am - 4pm",
    "motivation": "Why do you want to work with us?",
    "attachmentUrl": "https://...",
    "workRemotely": true
  }
}
```
Response: `201` — `{ "ok": true, "data": { ...formData } }`

**DELETE /api/formdata/:id**  
Response: `200` — `{ "ok": true, "data": { "_id": "...", "deleted": true } }`

---

## Admin (no applicant password – applicants get approval/rejection by email)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/admin/seed-super-admin` | Secret header | - | One-time: create first super admin |
| POST | `/api/admin/login` | No | - | Admin login (email + password), returns JWT |
| GET | `/api/admin/company-admins` | JWT | super_admin | List company admins |
| POST | `/api/admin/company-admins` | JWT | super_admin | Create company admin |
| DELETE | `/api/admin/company-admins/:id` | JWT | super_admin | Delete company admin |
| GET | `/api/admin/applications/summary` | JWT | company_admin or super_admin | **Admin Dashboard:** KPI counts (total, pending, interviewing, hired) |
| GET | `/api/admin/applications/export-csv` | JWT | company_admin or super_admin | **Admin Dashboard:** Download applications as CSV |
| GET | `/api/admin/applications` | JWT | company_admin or super_admin | List applications (company-scoped for company_admin) |
| GET | `/api/admin/applications/:id` | JWT | company_admin or super_admin | Get one application (Application Details) |
| PATCH | `/api/admin/applications/:id/status` | JWT | company_admin or super_admin | Set status (pending, interviewing, hired, approved, rejected); email on approved/hired or rejected |
| PATCH | `/api/admin/applications/:id` | JWT | company_admin or super_admin | Update application body (e.g. data); use .../status for status |
| DELETE | `/api/admin/applications/:id` | JWT | company_admin or super_admin | Delete application (company-scoped) |

**Admin Dashboard (C.A.G.E)**  
Use these with `Authorization: Bearer <admin JWT>` so the dashboard can bring everything from the backend:

- **GET /api/admin/applications/summary** — For the four KPI cards (Total Applications, Pending Review, Interviewing, Hired).  
  Query: `?companyId=xxx` (optional, super_admin only).  
  Response: `200` — `{ "ok": true, "data": { "total": 5, "pending": 1, "interviewing": 1, "hired": 1 } }`

- **GET /api/admin/applications/export-csv** — For the "Export CSV" button. Returns a CSV file.  
  Query: `?companyId=xxx` (optional, super_admin only).  
  Response: `200` — CSV attachment (filename like `admin-dashboard-applications-2025-02-05.csv`).

- **GET /api/admin/applications** — For the **Status** section (applications table, search, filter).  
  Query: `?companyId=xxx` (super_admin), `?status=pending|reviewed|interviewing|hired|approved|rejected`, `?search=...` (applicant, role, company).  
  Response: `200` — `{ "ok": true, "data": [ ...applications with companyId, roleId populated ] }`

**POST /api/admin/seed-super-admin** (one-time)  
Headers: `X-Super-Admin-Secret: <SUPER_ADMIN_SECRET>`  
Request:
```json
{ "email": "super@example.com", "password": "securePassword", "name": "Super Admin" }
```
Response: `201` — `{ "ok": true, "data": { "admin": { ... } }, "message": "..." }`

**POST /api/admin/login**  
Request:
```json
{ "email": "admin@example.com", "password": "password" }
```
Response: `200` — `{ "ok": true, "data": { "admin": { _id, email, name, role, companyId, companyName }, "token": "jwt..." } }`

**POST /api/admin/company-admins** (super_admin only)  
Headers: `Authorization: Bearer <jwt>`  
Request:
```json
{ "email": "companyadmin@example.com", "password": "password", "name": "Company Admin", "companyId": "company_object_id" }
```
Response: `201` — `{ "ok": true, "data": { ...admin } }`

**GET /api/admin/applications** (Status section: table, search, filter)  
Headers: `Authorization: Bearer <jwt>`  
Query: `?companyId=xxx` (optional, super_admin), `?status=pending|reviewed|interviewing|hired|approved|rejected`, `?search=...` (search by applicant name/email, role title, company name)  
Response: `200` — `{ "ok": true, "data": [ ...applications with companyId, roleId populated ] }`

**PATCH /api/admin/applications/:id/status**  
Headers: `Authorization: Bearer <jwt>`  
Request:
```json
{ "status": "pending" | "reviewed" | "interviewing" | "hired" | "approved" | "rejected", "message": "Optional custom message to applicant" }
```
Backend sends email to applicant’s `data.email` when status is `approved`/`hired` (approval email) or `rejected` (rejection email).  
Response: `200` — `{ "ok": true, "data": { "application": { _id, status, reviewedAt }, "emailSent": true, "emailError": null } }`

---

## Error response (all endpoints)

```json
{
  "ok": false,
  "error": { "message": "Error message here" }
}
```

---

## Summary table

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status |
| GET | `/api/health` | Health check |
| GET | `/api/company` | List companies |
| GET | `/api/company/:id` | Get company |
| POST | `/api/company` | Create company |
| PATCH | `/api/company/:id` | Update part of company |
| DELETE | `/api/company/:id` | Remove company |
| GET | `/api/hero`, `/api/hero?companyId=`, `/api/hero/by-id/:id`, `/api/hero/:companyId` | Get hero |
| POST | `/api/hero` | Upsert hero |
| PATCH | `/api/hero/:id` | Update hero by _id |
| DELETE | `/api/hero/:id` | Remove hero by _id |
| GET | `/api/powered`, `/api/powered?companyId=`, `/api/powered/by-id/:id` | Get powered |
| POST | `/api/powered` | Upsert powered |
| PATCH | `/api/powered/:id` | Update powered by _id |
| DELETE | `/api/powered/:id` | Remove powered by _id |
| GET | `/api/opportunities`, `/api/opportunities?companyId=`, `/api/opportunities/by-id/:id` | Get opportunities |
| POST | `/api/opportunities` | Upsert opportunities |
| PATCH | `/api/opportunities/:id` | Update opportunities by _id |
| DELETE | `/api/opportunities/:id` | Remove opportunities by _id |
| GET | `/api/whychooseus`, `/api/whychooseus/by-id/:id` | Get why choose us |
| POST | `/api/whychooseus` | Upsert why choose us |
| PATCH | `/api/whychooseus/:id` | Update why choose us by _id |
| DELETE | `/api/whychooseus/:id` | Remove why choose us by _id |
| GET | `/api/trainee`, `/api/trainee?companyId=` | Get trainee section + list |
| POST | `/api/trainee` | Create trainee |
| PATCH | `/api/trainee/:id` | Update part of trainee |
| DELETE | `/api/trainee/:id` | Remove trainee |
| POST | `/api/trainee/section` | Upsert trainee section |
| GET | `/api/gallery`, `/api/gallery?companyId=`, `/api/gallery/by-id/:id` | Get gallery |
| POST | `/api/gallery` | Upsert gallery |
| PATCH | `/api/gallery/:id` | Update gallery by _id |
| DELETE | `/api/gallery/:id` | Remove gallery by _id |
| GET | `/api/destination`, `/api/destination?companyId=` | Get destination |
| POST | `/api/destination` | Create destination |
| PATCH | `/api/destination/:id` | Update part of destination |
| DELETE | `/api/destination/:id` | Remove destination |
| GET | `/api/role`, `/api/role?companyId=` | Get roles (or section + roles) |
| POST | `/api/role` | Create role |
| PATCH | `/api/role/:id` | Update part of role |
| DELETE | `/api/role/:id` | Remove role |
| POST | `/api/role/section` | Upsert role section |
| GET | `/api/formrequirement?roleId=`, `?companyId=`, `/api/formrequirement/:id` | Get form requirement(s) |
| POST | `/api/formrequirement` | Upsert form requirement |
| PATCH | `/api/formrequirement/:id` | Update form requirement by _id |
| DELETE | `/api/formrequirement/:id` | Remove form requirement by _id |
| GET | `/api/formdata`, `/api/formdata?companyId=` | List applications |
| POST | `/api/formdata` | Submit application |
| PATCH | `/api/formdata/:id` | Update application by _id |
| DELETE | `/api/formdata/:id` | Remove application submission |
| POST | `/api/admin/seed-super-admin` | One-time: create first super admin (secret header) |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/company-admins` | List company admins (super_admin) |
| POST | `/api/admin/company-admins` | Create company admin (super_admin) |
| DELETE | `/api/admin/company-admins/:id` | Delete company admin (super_admin) |
| GET | `/api/admin/applications/summary` | Admin Dashboard KPI counts (total, pending, interviewing, hired) |
| GET | `/api/admin/applications/export-csv` | Admin Dashboard: export applications as CSV |
| GET | `/api/admin/applications` | List applications (admin) |
| GET | `/api/admin/applications/:id` | Get one application (Application Details) |
| PATCH | `/api/admin/applications/:id/status` | Set application status; email on approved/hired or rejected (admin) |
| PATCH | `/api/admin/applications/:id` | Update application body (admin) |
| DELETE | `/api/admin/applications/:id` | Delete application (admin) |
