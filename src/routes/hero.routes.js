import express from "express";
import { getHeroByCompany, upsertHero } from "../controllers/hero.controller.js";

export const heroRouter = express.Router();

// GET /api/hero?companyId=xxx  or  GET /api/hero (returns first active hero)
heroRouter.get("/", getHeroByCompany);
heroRouter.get("/:companyId", getHeroByCompany);
heroRouter.post("/", upsertHero);
