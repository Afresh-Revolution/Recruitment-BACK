# Image Upload – API Guide

How to upload images to the backend and use the returned URL in your database (Hero, Gallery, Company, etc.).

---

## Endpoint

| Method | URL | Auth |
|--------|-----|------|
| **POST** | `/api/upload` | None |

**Base URL example:** `http://localhost:5000/api/upload`

---

## Clean example: upload in 3 steps

### 1. Postman or Thunder Client

1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/upload`
3. **Body:**
   - Open the **Body** tab.
   - Select **form-data** (not "raw" and not "JSON").
   - Add one row:
     - **Key:** `image`
     - **Type:** change from "Text" to **File**
     - **Value:** click "Select Files" and pick your image (e.g. `photo.jpg`)
4. Click **Send**.

**Response (success):**
```json
{
  "ok": true,
  "url": "/uploads/1738123456789-abc123.jpg"
}
```

Use that `url` in your Hero, Gallery, or Company API.

---

### 2. cURL (terminal)

Replace `C:\path\to\your\photo.jpg` with your image path:

```bash
curl -X POST http://localhost:5000/api/upload -F "image=@C:\path\to\your\photo.jpg"
```

On Mac/Linux:
```bash
curl -X POST http://localhost:5000/api/upload -F "image=@/path/to/photo.jpg"
```

---

### 3. HTML form (browser)

Save as `upload.html`, open in browser, choose a file and submit:

```html
<!DOCTYPE html>
<html>
<head><title>Upload image</title></head>
<body>
  <form action="http://localhost:5000/api/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="image" accept="image/jpeg,image/png,image/gif,image/webp" />
    <button type="submit">Upload</button>
  </form>
</body>
</html>
```

The response will show in the page (or open DevTools → Network to see the JSON with `url`).

---

## Request format

- **Content-Type:** `multipart/form-data` (not `application/json`).
- **Form field name:** `image` (must be exactly this).

You send the image as a **file** in the form. There is no JSON body for the file itself.

### Allowed images

| Type | Extensions | Max size |
|------|------------|----------|
| JPEG / JPG | `.jpg`, `.jpeg` | 10 MB |
| PNG | `.png` | 10 MB |
| GIF | `.gif` | 10 MB |
| WebP | `.webp` | 10 MB |

---

## Success response (201 Created)

**JSON body:**

```json
{
  "ok": true,
  "url": "/uploads/1738123456789-abc123.jpg"
}
```

- **`url`** – Path to the image. Use this value in your API when creating/updating Hero, Gallery, Powered, Company logo, etc.
- Image is served at: `http://localhost:5000/uploads/<filename>` (or your deployed base URL + `/uploads/<filename>`).

---

## Error responses (JSON)

### No file sent (400)

```json
{
  "ok": false,
  "message": "No image file sent. Use form field name 'image' and multipart/form-data."
}
```

### Wrong field name or Content-Type

Send the file in a field named **`image`** and use **multipart/form-data**. If you use a different field name or `application/json`, you get the message above.

**Fix:** In Postman/Thunder Client: Body → **form-data** (not raw JSON) → add key **`image`** → set type to **File** and choose your image.

### File too large (400)

```json
{
  "ok": false,
  "message": "File too large. Max 10 MB."
}
```

### Invalid file type (400)

Only image types above are allowed. Otherwise you get:

```json
{
  "ok": false,
  "error": {
    "message": "Only image files (jpeg, png, gif, webp) are allowed."
  }
}
```

---

## Example: cURL

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/your/photo.jpg"
```

Response:

```json
{
  "ok": true,
  "url": "/uploads/1738123456789-abc123.jpg"
}
```

---

## Example: Postman / Thunder Client

1. Method: **POST**
2. URL: `http://localhost:5000/api/upload`
3. **Body** tab:
   - Select **form-data** (not raw JSON).
   - Add a key: `image`.
   - Change type of `image` to **File** (not Text).
   - Choose your image file as the value.
4. Send. The response JSON will contain `ok` and `url`.

---

## Example: JavaScript (fetch)

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
if (!file) return;

const formData = new FormData();
formData.append("image", file);

const res = await fetch("http://localhost:5000/api/upload", {
  method: "POST",
  body: formData,
});
const data = await res.json();

if (data.ok) {
  console.log("Image URL:", data.url); // e.g. "/uploads/1738123456789-abc123.jpg"
}
```

---

## Using the URL in other APIs

After upload, use the returned `url` in the **JSON body** of your other endpoints.

### Hero section

```json
POST /api/hero
Content-Type: application/json

{
  "companyId": "<company_object_id>",
  "title": "Welcome",
  "subtitle": "Join our team",
  "image": "/uploads/1738123456789-abc123.jpg"
}
```

### Gallery

```json
POST /api/gallery
Content-Type: application/json

{
  "companyId": "<company_object_id>",
  "image": "/uploads/1738123456789-abc123.jpg",
  "caption": "Office photo"
}
```

### Company (e.g. logo)

```json
POST /api/company
Content-Type: application/json

{
  "name": "Acme Corp",
  "logo": "/uploads/1738123456789-abc123.jpg"
}
```

Same idea for Powered, Opportunities, or any model that has an image field: set it to the `url` string returned from **POST /api/upload**.

---

## Troubleshooting

| Response | Meaning | What to do |
|----------|---------|------------|
| `{ "ok": false, "message": "No image file sent. Use form field name 'image' and multipart/form-data." }` | The request did not include a file in the **`image`** field, or you used JSON instead of form-data. | Use **Body → form-data**, add key **`image`**, set type to **File**, and attach your image. |
| `{ "ok": true, "url": "/uploads/..." }` | Upload succeeded. | Use the `url` in your Hero/Gallery/Company etc. API. Full image URL: `http://localhost:5000` + `url`. |

**Correct request:** `POST http://localhost:5000/api/upload` with **form-data** and field **`image`** (File).

---

## Summary

| Item | Value |
|------|--------|
| Endpoint | `POST http://localhost:5000/api/upload` |
| Request | `multipart/form-data`, field name **`image`** (type: File) |
| Success (201) | `{ "ok": true, "url": "/uploads/<filename>" }` |
| Use `url` in | Hero, Gallery, Company, Powered, etc. (in their JSON bodies) |
