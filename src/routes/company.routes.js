import express from "express";
import * as companyController from "../controllers/company.controller.js";

export const companyRouter = express.Router();

companyRouter.get("/", companyController.getAll);
companyRouter.get("/:id", companyController.getOne);
companyRouter.post("/", companyController.create);
companyRouter.patch("/:id", companyController.update);
companyRouter.delete("/:id", companyController.remove);
