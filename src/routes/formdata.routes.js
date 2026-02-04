import express from "express";
import * as formdataController from "../controllers/formdata.controller.js";

export const formdataRouter = express.Router();

formdataRouter.get("/", formdataController.getByCompany);
formdataRouter.post("/", formdataController.create);
formdataRouter.delete("/:id", formdataController.remove);
