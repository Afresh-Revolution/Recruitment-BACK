import express from "express";
import * as traineeController from "../controllers/trainee.controller.js";

export const traineeRouter = express.Router();

traineeRouter.get("/", traineeController.getAll);
traineeRouter.post("/", traineeController.create);
traineeRouter.patch("/:id", traineeController.update);
traineeRouter.delete("/:id", traineeController.remove);
traineeRouter.post("/section", traineeController.upsertSection);