import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { adminAuth, requireSuperAdmin, requireCompanyAdmin } from "../middleware/adminAuth.js";

export const adminRouter = express.Router();

// ─── Public (no JWT) ──────────────────────────────────────────────────────
adminRouter.post("/seed-super-admin", adminController.seedSuperAdmin);
adminRouter.post("/login", adminController.login);

// ─── All admin routes below require JWT (adminAuth) ────────────────────────
adminRouter.use(adminAuth);

// ─── Super Admin only: manage company admins ────────────────────────────────
adminRouter.get("/company-admins", requireSuperAdmin, adminController.listCompanyAdmins);
adminRouter.post("/company-admins", requireSuperAdmin, adminController.createCompanyAdmin);
adminRouter.delete("/company-admins/:id", requireSuperAdmin, adminController.deleteCompanyAdmin);

// ─── Company Admin (and Super Admin): applications ─────────────────────────
adminRouter.get("/applications", adminController.listApplications);
adminRouter.patch("/applications/:id/status", adminController.setApplicationStatus);
