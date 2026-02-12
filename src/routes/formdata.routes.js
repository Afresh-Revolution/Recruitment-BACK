import express from "express";
import multer from "multer";
import * as formdataController from "../controllers/formdata.controller.js";
import { resumeUpload } from "../middleware/upload.js";

export const formdataRouter = express.Router();

formdataRouter.get("/", formdataController.getByCompany);
/** Single request: multipart form with optional "resume" file + application fields. Stores CV and application. */
formdataRouter.post("/apply", resumeUpload.single("resume"), formdataController.createWithResume);
formdataRouter.post("/", formdataController.create);
formdataRouter.patch("/:id", formdataController.update);
formdataRouter.delete("/:id", formdataController.remove);

formdataRouter.use((err, req, res, next) => {
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
