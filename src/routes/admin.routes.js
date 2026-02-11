import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { adminAuth, requireSuperAdmin, requireCompanyAdmin } from "../middleware/adminAuth.js";

export const adminRouter = express.Router();

// ─── Public (no JWT) ──────────────────────────────────────────────────────
adminRouter.post("/seed-super-admin", adminController.seedSuperAdmin);
adminRouter.post("/reset-password", adminController.resetAdminPassword);
adminRouter.post("/test-email", adminController.testEmail);
adminRouter.post("/login", adminController.login);

// ─── All admin routes below require JWT (adminAuth) ────────────────────────
adminRouter.use(adminAuth);

// ─── Super Admin only: manage company admins ────────────────────────────────
adminRouter.get("/company-admins", requireSuperAdmin, adminController.listCompanyAdmins);
adminRouter.post("/company-admins", requireSuperAdmin, adminController.createCompanyAdmin);
adminRouter.delete("/company-admins/:id", requireSuperAdmin, adminController.deleteCompanyAdmin);

// ─── Company Admin (and Super Admin): applications ─────────────────────────
adminRouter.get("/applications/summary", adminController.listApplicationSummary);
adminRouter.get("/applications/export-csv", adminController.exportApplicationsCsv);
adminRouter.get("/applications", adminController.listApplications);
adminRouter.get("/applications/:id", adminController.getOneApplication);
// Admin-only file download (Bearer token). Use for resume when behind auth.
adminRouter.get("/uploads/:filename", adminController.serveUploadedFile);
adminRouter.patch("/applications/:id/status", adminController.setApplicationStatus);
adminRouter.patch("/applications/:id", adminController.updateApplication);
adminRouter.delete("/applications/:id", adminController.deleteApplication);
