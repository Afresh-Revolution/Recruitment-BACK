import express from "express";
import * as poweredController from "../controllers/powered.controller.js";

export const poweredRouter = express.Router();

poweredRouter.get("/", poweredController.getByCompany);
poweredRouter.post("/", poweredController.upsert);
