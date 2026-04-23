import path from "path";
import cloudinary from "../config/cloudinary.js";
import { getStoredUploadFilename } from "./uploads.js";

const CLOUDINARY_REQUIRED_VARS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const DELIVERY_TYPES = new Set(["upload", "private", "authenticated"]);
const configuredDeliveryType = process.env.CLOUDINARY_RESUME_DELIVERY_TYPE?.trim().toLowerCase();

export const RESUME_CLOUDINARY_ENABLED = CLOUDINARY_REQUIRED_VARS.every(
  (key) => typeof process.env[key] === "string" && process.env[key].trim() !== ""
);
export const RESUME_CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_RESUME_FOLDER?.trim() || "the-cage/resumes";
export const RESUME_CLOUDINARY_RESOURCE_TYPE = "raw";
export const RESUME_CLOUDINARY_DELIVERY_TYPE = DELIVERY_TYPES.has(configuredDeliveryType)
  ? configuredDeliveryType
  : "upload";
export const RESUME_SIGNED_URL_TTL_SECONDS = Math.max(
  60,
  Number(process.env.RESUME_SIGNED_URL_TTL_SECONDS || 900) || 900
);

function normalizeResumeExtension(filename) {
  const ext = (path.extname(filename) || ".pdf")
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");

  if ([".pdf", ".doc", ".docx"].includes(ext)) return ext;
  return ".pdf";
}

function getResumeFormat(filename) {
  return normalizeResumeExtension(filename).slice(1) || "pdf";
}

function getCloudinaryPublicId(filename) {
  return `${RESUME_CLOUDINARY_FOLDER}/${filename}`;
}

export function createResumeFilename(originalName) {
  const ext = normalizeResumeExtension(originalName);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

export function buildCloudinaryAssetUrl(storage) {
  if (!storage?.publicId) return null;

  return cloudinary.url(storage.publicId, {
    resource_type: storage.resourceType || RESUME_CLOUDINARY_RESOURCE_TYPE,
    type: storage.deliveryType || "upload",
    secure: true,
  });
}

export function buildResumeDownloadUrl(storage) {
  if (!storage) return null;

  if (storage.provider !== "cloudinary") {
    return storage.url || null;
  }

  if (!storage.publicId) {
    return storage.url || null;
  }

  if ((storage.deliveryType || "upload") === "upload") {
    return storage.url || buildCloudinaryAssetUrl(storage);
  }

  return cloudinary.utils.private_download_url(
    storage.publicId,
    storage.format || getResumeFormat(storage.filename || ""),
    {
      resource_type: storage.resourceType || RESUME_CLOUDINARY_RESOURCE_TYPE,
      type: storage.deliveryType || "private",
      expires_at: Math.floor(Date.now() / 1000) + RESUME_SIGNED_URL_TTL_SECONDS,
      attachment: true,
    }
  );
}

export function buildLocalResumeAsset(file) {
  if (!file?.filename) return null;

  return {
    provider: "local",
    filename: file.filename,
    originalName: file.originalname || file.filename,
    url: `/uploads/${file.filename}`,
    bytes: typeof file.size === "number" ? file.size : null,
    contentType: file.mimetype || null,
  };
}

export async function storeResumeInCloudinary(file) {
  if (!RESUME_CLOUDINARY_ENABLED) {
    throw new Error("Cloudinary resume storage is not configured.");
  }
  if (!file?.buffer) {
    throw new Error("Resume buffer missing for Cloudinary upload.");
  }

  const filename = createResumeFilename(file.originalname || "resume.pdf");
  const publicId = getCloudinaryPublicId(filename);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: RESUME_CLOUDINARY_RESOURCE_TYPE,
        type: RESUME_CLOUDINARY_DELIVERY_TYPE,
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        filename_override: file.originalname || filename,
      },
      (error, uploaded) => {
        if (error) return reject(error);
        resolve(uploaded);
      }
    );

    stream.end(file.buffer);
  });

  return {
    provider: "cloudinary",
    filename,
    originalName: file.originalname || filename,
    url: result.secure_url || buildCloudinaryAssetUrl({
      publicId,
      resourceType: RESUME_CLOUDINARY_RESOURCE_TYPE,
      deliveryType: RESUME_CLOUDINARY_DELIVERY_TYPE,
    }),
    publicId,
    resourceType: RESUME_CLOUDINARY_RESOURCE_TYPE,
    deliveryType: RESUME_CLOUDINARY_DELIVERY_TYPE,
    format: result.format || getResumeFormat(filename),
    bytes: typeof result.bytes === "number" ? result.bytes : file.size || null,
    contentType: file.mimetype || null,
  };
}

export function getResumeStorageFromFile(file) {
  return file?.resumeStorage || null;
}

export function getResumeUrlFromFile(file) {
  return getResumeStorageFromFile(file)?.url || null;
}

export function getResumeStorageFromData(data) {
  const directUrl =
    typeof data?.resumeUrl === "string" && data.resumeUrl.trim() !== ""
      ? data.resumeUrl.trim()
      : typeof data?.attachmentUrl === "string" && data.attachmentUrl.trim() !== ""
        ? data.attachmentUrl.trim()
        : null;

  if (data?.resumeStorage && typeof data.resumeStorage === "object") {
    return {
      ...data.resumeStorage,
      url: data.resumeStorage.url || directUrl || null,
      filename:
        data.resumeStorage.filename ||
        getStoredUploadFilename(data.resumeStorage.url || directUrl || ""),
    };
  }

  if (!directUrl) return null;

  return {
    provider: /^https?:\/\//i.test(directUrl) ? "remote" : "local",
    url: directUrl,
    filename: getStoredUploadFilename(directUrl),
  };
}
