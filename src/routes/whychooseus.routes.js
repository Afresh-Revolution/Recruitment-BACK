import express from "express";
import * as whychooseusController from "../controllers/whychooseus.controller.js";

export const whychooseusRouter = express.Router();

whychooseusRouter.get("/", whychooseusController.get);
whychooseusRouter.post("/", whychooseusController.upsert);
