import express from "express";
import * as galleryController from "../controllers/gallery.controller.js";

export const galleryRouter = express.Router();

galleryRouter.get("/", galleryController.getByCompany);
galleryRouter.get("/by-id/:id", galleryController.getById);
galleryRouter.post("/", galleryController.upsert);
galleryRouter.patch("/:id", galleryController.update);
galleryRouter.delete("/:id", galleryController.remove);
