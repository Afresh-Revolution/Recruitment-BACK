import express from "express";
import * as destinationController from "../controllers/destination.controller.js";

export const destinationRouter = express.Router();

destinationRouter.get("/", destinationController.getByCompany);
destinationRouter.post("/", destinationController.create);
destinationRouter.patch("/:id", destinationController.update);
destinationRouter.delete("/:id", destinationController.remove);
