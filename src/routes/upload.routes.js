import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store under project root /uploads (created if missing)
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase().replace(/[^a-z.]/g, "");
    const safeExt = ext || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Only image files (jpeg, png, gif, webp) are allowed."));
  },
});

const resumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowed = /^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i.test(file.mimetype) ||
      /\.(pdf|doc|docx)$/i.test(file.originalname || "");
    if (allowed) cb(null, true);
    else cb(new Error("Only PDF or Word documents (pdf, doc, docx) are allowed for resume."));
  },
});

export const uploadRouter = express.Router();

/**
 * POST /api/upload
 * Field name: "image" (multipart/form-data)
 * Returns: { ok, url } – url is the public path for Hero, Gallery, etc.
 */
uploadRouter.post("/", upload.single("image"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "No image file sent. Use form field name 'image' and multipart/form-data.",
    });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ ok: true, url });
});

/**
 * POST /api/upload/resume
 * Field name: "resume" (multipart/form-data). PDF or Word (doc, docx). Max 10 MB.
 * Returns: { ok, url, filename } – use url in application form (e.g. data.resumeUrl).
 */
uploadRouter.post("/resume", resumeUpload.single("resume"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "No file sent. Use form field name 'resume' and multipart/form-data (PDF or Word).",
    });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ ok: true, url, filename: req.file.filename });
});

uploadRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ ok: false, message: "File too large. Max 10 MB." });
    }
  }
  if (err.message) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  next(err);
});
