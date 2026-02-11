import express from "express";
import * as formrequirementController from "../controllers/formrequirement.controller.js";

export const formrequirementRouter = express.Router();

formrequirementRouter.get("/", formrequirementController.getByJob);
formrequirementRouter.get("/:id", formrequirementController.getById);
formrequirementRouter.post("/", formrequirementController.upsert);
formrequirementRouter.patch("/:id", formrequirementController.update);
formrequirementRouter.delete("/:id", formrequirementController.remove);
