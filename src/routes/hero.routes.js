import express from "express";
import {
  getHeroByCompany,
  getHeroById,
  upsertHero,
  updateHero,
  removeHero,
} from "../controllers/hero.controller.js";

export const heroRouter = express.Router();

heroRouter.get("/", getHeroByCompany);
heroRouter.get("/by-id/:id", getHeroById);
heroRouter.get("/:companyId", getHeroByCompany);
heroRouter.post("/", upsertHero);
heroRouter.patch("/:id", updateHero);
heroRouter.delete("/:id", removeHero);
