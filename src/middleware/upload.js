import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { UPLOAD_DIR, ensureUploadDir } from "../utils/uploads.js";

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureUploadDir();
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

/** Cloudinary storage for images */
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "the-cage",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
  },
});

/** Multer for images (Hero, Gallery, etc.). Use field name "image". */
export const imageUpload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Only image files (jpeg, png, gif, webp) are allowed."));
  },
});

