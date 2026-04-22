import fs from "fs";
import path from "path";

export const UPLOADS_ROUTE_PREFIX = "/uploads/";
export const DEFAULT_UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR);

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

export function syncLegacyUploads() {
  ensureUploadDir();

  if (UPLOAD_DIR === DEFAULT_UPLOAD_DIR || !fs.existsSync(DEFAULT_UPLOAD_DIR)) {
    return { copied: 0, skipped: 0 };
  }

  let copied = 0;
  let skipped = 0;
  const entries = fs.readdirSync(DEFAULT_UPLOAD_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const source = path.join(DEFAULT_UPLOAD_DIR, entry.name);
    const target = path.join(UPLOAD_DIR, entry.name);

    if (fs.existsSync(target)) {
      skipped += 1;
      continue;
    }

    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    copied += 1;
  }

  return { copied, skipped };
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
