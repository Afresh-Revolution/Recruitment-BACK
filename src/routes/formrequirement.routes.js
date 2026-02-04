import express from "express";
import * as formrequirementController from "../controllers/formrequirement.controller.js";

export const formrequirementRouter = express.Router();

formrequirementRouter.get("/", formrequirementController.getByJob);
formrequirementRouter.post("/", formrequirementController.upsert);
