import express from "express";
import * as poweredController from "../controllers/powered.controller.js";

export const poweredRouter = express.Router();

poweredRouter.get("/", poweredController.getByCompany);
poweredRouter.get("/by-id/:id", poweredController.getById);
poweredRouter.post("/", poweredController.upsert);
poweredRouter.patch("/:id", poweredController.update);
poweredRouter.delete("/:id", poweredController.remove);
