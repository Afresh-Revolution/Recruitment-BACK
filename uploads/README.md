# Uploads folder – images for backend and database

This folder is where the API stores images when you upload them via **POST /api/upload**.

## How it works

- **Upload:** Send a multipart request to `POST /api/upload` with form field name `image`.  
  Accepted: JPEG, PNG, GIF, WebP (max 10 MB).  
  Files are saved here with names like `1738123456789-abc123.jpg`.

- **URL in DB:** The API returns a URL like `/uploads/1738123456789-abc123.jpg`.  
  Store that in your Hero, Gallery, Company logo, etc. so the frontend can load the image.

- **Serving:** The app serves this folder at `/uploads`, so  
  `http://localhost:5000/uploads/filename.jpg` returns the image.

## Using images in your data

When you create or update Hero, Gallery, Powered, etc., set the image field to the URL returned from upload, for example:

- `"image": "/uploads/1738123456789-abc123.jpg"`
- Or full URL: `"image": "http://localhost:5000/uploads/1738123456789-abc123.jpg"` (if your frontend needs an absolute URL).

Uploaded image files in this folder are not committed to git (see `.gitignore`). Only this README and `.gitkeep` are tracked so the folder exists in the repo.
