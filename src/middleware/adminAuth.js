import { Admin } from "../models/Admin.js";
import { verifyToken } from "../utils/generateToken.js";

/**
 * Verify JWT and attach admin to req. Use on all admin routes.
 * No password for applicants – they receive approval/rejection by email from admin dashboard.
 */
export async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return res.status(401).json({ ok: false, message: "Unauthorized: no token" });
    }
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ ok: false, message: "Unauthorized: invalid or inactive admin" });
    }
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ ok: false, message: "Unauthorized: invalid or expired token" });
    }
    next(err);
  }
}

/** Require super_admin role. Use after adminAuth. */
export function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== "super_admin") {
    return res.status(403).json({ ok: false, message: "Forbidden: super admin only" });
  }
  next();
}

/** Require company_admin role (for company dashboard). Use after adminAuth. */
export function requireCompanyAdmin(req, res, next) {
  if (req.admin?.role !== "company_admin") {
    return res.status(403).json({ ok: false, message: "Forbidden: company admin only" });
  }
  if (!req.admin?.companyId) {
    return res.status(403).json({ ok: false, message: "Forbidden: company admin must have companyId" });
  }
  next();
}
