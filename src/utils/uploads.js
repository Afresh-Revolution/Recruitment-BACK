import fs from "fs";
import path from "path";

export const UPLOADS_ROUTE_PREFIX = "/uploads/";
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

export function getUploadFilename(value) {
  if (typeof value !== "string") return null;

  let candidate = value.trim();
  if (!candidate) return null;

  if (/^https?:\/\//i.test(candidate)) {
    try {
      candidate = new URL(candidate).pathname;
    } catch {
      return null;
    }
  }

  candidate = candidate.split(/[?#]/, 1)[0];

  if (candidate.startsWith(UPLOADS_ROUTE_PREFIX)) {
    candidate = candidate.slice(UPLOADS_ROUTE_PREFIX.length);
  } else {
    candidate = candidate.replace(/^\/+/, "");
  }

  if (
    !candidate ||
    candidate === "." ||
    candidate === ".." ||
    candidate.includes("..") ||
    candidate.includes("/") ||
    candidate.includes("\\") ||
    path.isAbsolute(candidate)
  ) {
    return null;
  }

  return candidate;
}

export function resolveUploadPath(value) {
  const filename = getUploadFilename(value);
  if (!filename) return null;
  return path.join(ensureUploadDir(), filename);
}
