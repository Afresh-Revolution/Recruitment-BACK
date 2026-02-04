# Backend concept – Job portal (multi-company)

## Concept

- **One backend, one database** for a job application portal.
- **Two companies at start**, with the ability to **add more companies over time** via an admin dashboard.
- All section content is stored in the DB and served by this backend.

## Sections (files)

| Section            | Model              | Purpose |
|--------------------|--------------------|--------|
| **Hero**           | `Hero.js`          | Hero block: headline, CTA, features, 4 panels. |
| **Powered**        | `Powered.js`       | “Powered by” partners (logos + names). |
| **Opportunities**  | `Opportunities.js` | Section “Available Roles” / “Trending Opportunities” + featured role IDs. |
| **WhyChooseUs**    | `WhyChooseUs.js`   | “Why choose us”: headline, features, trainees, gallery. |
| **Trainee**        | `Trainee.js`       | Trainee/testimonial entries. |
| **Gallery**        | `Gallery.js`       | Gallery block (title, images). |
| **FormData**       | `FormData.js`      | Submitted job application form data (per application). |
| **FormRequirement**| `FormRequirement.js` | Form field definitions per role/company (what applicants must fill). |
| **Destination**    | `Destination.js`   | **Section where companies are listed** (section title + ordered company IDs). |
| **Role**           | `Role.js`          | **Available roles/jobs** (job postings per company). |

## Core entities

- **Company** (`Company.js`) – Portal tenants. Admin can add more over time.
- **Destination** – The “companies list” section: section title + `companyIds[]` (refs to `Company`). Frontend lists those companies.
- **Role** – Job postings (available roles) per company. Applicants apply to roles; submissions go to **FormData**; form fields come from **FormRequirement**.

## API base paths

- `GET/POST /api/company` – Companies (for admin + for Destination listing).
- `GET/POST /api/hero` – Hero section.
- `GET/POST /api/powered` – Powered By section.
- `GET/POST /api/opportunities` – Opportunities section.
- `GET/POST /api/whychooseus` – WhyChooseUs section.
- `GET/POST /api/trainee` – Trainee section.
- `GET/POST /api/gallery` – Gallery section.
- `GET/POST /api/formdata` – Application form submissions.
- `GET/POST /api/formrequirement` – Form field requirements.
- `GET/POST /api/destination` – **Destination section (companies list)**.
- `GET/POST /api/role` – **Available roles (jobs)**.

All section GETs support `?companyId=xxx` where relevant for multi-company.

## Folder structure

```
src/
├── server.js
├── app.js
├── config/
│   └── db.js
├── models/
│   ├── Company.js
│   ├── Hero.js
│   ├── Powered.js
│   ├── Opportunities.js
│   ├── WhyChooseUs.js
│   ├── Trainee.js
│   ├── Gallery.js
│   ├── Destination.js   ← companies list section
│   ├── Role.js          ← available roles/jobs
│   ├── FormData.js
│   └── FormRequirement.js
├── controllers/
│   ├── company.controller.js
│   ├── hero.controller.js
│   ├── powered.controller.js
│   ├── opportunities.controller.js
│   ├── whychooseus.controller.js
│   ├── trainee.controller.js
│   ├── gallery.controller.js
│   ├── destination.controller.js
│   ├── role.controller.js
│   ├── formdata.controller.js
│   └── formrequirement.controller.js
├── routes/
│   └── (same names as controllers, .routes.js)
└── middleware/
    └── adminAuth.js
```

You can fill in the exact fields inside each model later; the files and backend logic are in place for this concept.
