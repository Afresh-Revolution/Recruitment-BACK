import express from "express";
import * as opportunitiesController from "../controllers/opportunities.controller.js";

export const opportunitiesRouter = express.Router();

opportunitiesRouter.get("/", opportunitiesController.getByCompany);
opportunitiesRouter.get("/by-id/:id", opportunitiesController.getById);
opportunitiesRouter.post("/", opportunitiesController.upsert);
opportunitiesRouter.patch("/:id", opportunitiesController.update);
opportunitiesRouter.delete("/:id", opportunitiesController.remove);
