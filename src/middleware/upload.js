import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Single uploads directory: CVs and images stored here */
export const UPLOAD_DIR = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = (path.extname(file.originalname) || ".pdf").toLowerCase().replace(/[^a-z.]/g, "");
    const safeExt = ext || ".pdf";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    cb(null, name);
  },
});

/** Multer for resume/CV: PDF or Word. Max 10 MB. Use field name "resume". */
export const resumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed =
      /^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i.test(file.mimetype) ||
      /\.(pdf|doc|docx)$/i.test(file.originalname || "");
    if (allowed) cb(null, true);
    else cb(new Error("Only PDF or Word (pdf, doc, docx) are allowed for resume."));
  },
});

/** Multer for images (Hero, Gallery, etc.). Use field name "image". */
export const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Only image files (jpeg, png, gif, webp) are allowed."));
  },
});
