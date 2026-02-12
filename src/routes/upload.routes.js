import express from "express";
import multer from "multer";
import { resumeUpload, imageUpload } from "../middleware/upload.js";

export const uploadRouter = express.Router();

/**
 * POST /api/upload
 * Field name: "image" (multipart/form-data)
 * Returns: { ok, url }
 */
uploadRouter.post("/", imageUpload.single("image"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "No image file sent. Use form field name 'image' and multipart/form-data.",
    });
  }
  res.status(201).json({ ok: true, url: `/uploads/${req.file.filename}` });
});

/**
 * POST /api/upload/resume
 * Field name: "resume" (multipart/form-data). PDF or Word. Max 10 MB.
 * Returns: { ok, url, filename } – use url in application (e.g. data.resumeUrl).
 */
uploadRouter.post("/resume", resumeUpload.single("resume"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "No file sent. Use form field name 'resume' and multipart/form-data (PDF or Word).",
    });
  }
  res.status(201).json({
    ok: true,
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
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
