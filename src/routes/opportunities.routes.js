import express from "express";
import * as opportunitiesController from "../controllers/opportunities.controller.js";

export const opportunitiesRouter = express.Router();

opportunitiesRouter.get("/", opportunitiesController.getByCompany);
opportunitiesRouter.post("/", opportunitiesController.upsert);
