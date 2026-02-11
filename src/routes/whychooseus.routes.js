import express from "express";
import * as whychooseusController from "../controllers/whychooseus.controller.js";

export const whychooseusRouter = express.Router();

whychooseusRouter.get("/", whychooseusController.get);
whychooseusRouter.get("/by-id/:id", whychooseusController.getById);
whychooseusRouter.post("/", whychooseusController.upsert);
whychooseusRouter.patch("/:id", whychooseusController.update);
whychooseusRouter.delete("/:id", whychooseusController.remove);
