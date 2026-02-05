# Deploy the-cage Backend on Render

This guide walks you through deploying this Node.js backend as a **Web Service** on [Render](https://render.com).

---

## Prerequisites

- A [Render](https://render.com) account (free tier is fine)
- Your repo pushed to **GitHub** or **GitLab**
- **MongoDB Atlas** (or another MongoDB host) with a connection string
- (Optional) SMTP credentials for approval/rejection emails

---

## 1. One-click deploy (Blueprint)

1. In Render Dashboard: **New** → **Blueprint**.
2. Connect your repo and ensure **Blueprint** is selected.
3. Render will read `render.yaml` in the repo root. Click **Apply**.
4. Add the environment variables below in the Web Service → **Environment** tab, then trigger a **Manual Deploy** if needed.

---

## 2. Manual setup (New Web Service)

1. **New** → **Web Service**.
2. Connect your GitHub/GitLab repo and select this repository.
3. Use these settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `the-cage-backend` (or any name) |
   | **Region** | Choose closest to your users |
   | **Branch** | `master` (or your default branch) |
   | **Root Directory** | *(leave blank)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or paid for always-on) |

4. Click **Create Web Service**. The first deploy may fail until you add `MONGODB_URI` (see below).

---

## 3. Environment variables

In the Web Service → **Environment** tab, add:

| Key | Required | Description |
|-----|----------|-------------|
| `PORT` | No (auto) | Render sets this; your app already uses `process.env.PORT \|\| 5000`. |
| `NODE_ENV` | No | Set to `production` for production. |
| `MONGODB_URI` | **Yes** | Full MongoDB connection string (e.g. Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`). |
| `CORS_ORIGIN` | **Yes** | Comma-separated frontend URLs allowed for CORS, e.g. `https://your-app.onrender.com` or `https://yourdomain.com`. |
| `JWT_SECRET` | **Yes** | Strong random string for signing JWTs (e.g. use `openssl rand -hex 32`). |
| `SUPER_ADMIN_SECRET` | **Yes** | One-time secret for seeding super admin via `POST /api/admin/seed-super-admin` (header `X-Super-Admin-Secret`). |
| `SMTP_HOST` | No | e.g. `smtp.gmail.com`. |
| `SMTP_PORT` | No | e.g. `587`. |
| `SMTP_SECURE` | No | `false` for TLS on port 587. |
| `SMTP_USER` | No | SMTP username. |
| `SMTP_PASS` | No | SMTP password (or app password). |
| `MAIL_FROM` | No | Sender address, e.g. `noreply@yourdomain.com`. |

**MongoDB Atlas:** In Network Access, allow **0.0.0.0/0** (or Render’s IPs) so the Render service can connect.

---

## 4. After deploy

- **URL:** `https://<your-service-name>.onrender.com`
- **Health check:** `GET https://<your-service-name>.onrender.com/api/health` → `{ "ok": true }`
- **Root:** `GET https://<your-service-name>.onrender.com/` → `{ "ok": true, "service": "the-cage-backend" }`

---

## 5. Free tier behavior

- The service **spins down** after ~15 minutes of no traffic.
- The first request after spin-down can take **30–60 seconds** (cold start).
- For always-on uptime, use a paid instance.

---

## 6. File uploads (important)

The app stores uploaded images in the **local `uploads/` directory**. On Render, the filesystem is **ephemeral**: anything in `uploads/` is lost on redeploy or restart.

- **For production:** Plan to switch to persistent storage (e.g. **AWS S3**, **Cloudinary**, or Render Disk) and change the upload route to save there and serve via URLs. The current API already returns a `url`; that URL can point to S3/Cloudinary instead of `/uploads/...`.
- **For testing:** Uploads will work until the next deploy or restart, then disappear.

---

## 7. Quick checklist

- [ ] Repo connected to Render
- [ ] Build: `npm install`, Start: `npm start`
- [ ] `MONGODB_URI` set and Atlas allows Render IPs (e.g. 0.0.0.0/0)
- [ ] `CORS_ORIGIN` set to your frontend URL(s)
- [ ] `JWT_SECRET` and `SUPER_ADMIN_SECRET` set to strong random values
- [ ] (Optional) SMTP vars set for emails
- [ ] Deploy and test `/api/health`

Your backend is ready for use on Render.
