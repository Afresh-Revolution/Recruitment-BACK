import express from "express";
import * as roleController from "../controllers/role.controller.js";

export const roleRouter = express.Router();

roleRouter.get("/", roleController.getByCompany);
roleRouter.post("/", roleController.create);
roleRouter.patch("/:id", roleController.update);
roleRouter.delete("/:id", roleController.remove);
roleRouter.post("/section", roleController.upsertSection);
