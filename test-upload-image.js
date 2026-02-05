/**
 * Test image upload – run with: node test-upload-image.js
 * Usage: node test-upload-image.js [path-to-image.jpg]
 * If no path given, creates a tiny 1x1 PNG in memory and uploads it.
 *
 * Start the server first: npm run dev
 * Default base URL: http://localhost:5000 (set BASE_URL to override)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function run() {
  let imagePath = process.argv[2];
  let body;
  let contentType;

  if (imagePath) {
    imagePath = path.resolve(__dirname, imagePath);
    if (!fs.existsSync(imagePath)) {
      console.error("File not found:", imagePath);
      process.exit(1);
    }
    body = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };
    contentType = mime[ext] || "image/jpeg";
    console.log("Uploading file:", imagePath, "(" + (body.length / 1024).toFixed(1) + " KB)");
  } else {
    // 1x1 transparent PNG (tiny)
    body = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    contentType = "image/png";
    console.log("No file path given – uploading a tiny 1x1 PNG to test.");
  }

  const boundary = "----FormBoundary" + Date.now();
  const filename = imagePath ? path.basename(imagePath) : "test.png";
  const part = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="image"; filename="${filename}"`,
    `Content-Type: ${contentType}`,
    "",
    body.toString("binary"),
  ].join("\r\n");
  const raw = part + "\r\n--" + boundary + "--\r\n";

  const res = await fetch(BASE_URL + "/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": Buffer.byteLength(raw, "binary").toString(),
    },
    body: Buffer.from(raw, "binary"),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Upload failed:", res.status, data);
    process.exit(1);
  }
  console.log("Upload OK:", data);
  console.log("Image URL:", BASE_URL + data.url);
  console.log("You can open this URL in a browser to verify the image.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
