import express from "express";
import * as galleryController from "../controllers/gallery.controller.js";

export const galleryRouter = express.Router();

galleryRouter.get("/", galleryController.getByCompany);
galleryRouter.post("/", galleryController.upsert);
