import bcrypt from "bcrypt";
import { Admin } from "../models/Admin.js";
import { Company } from "../models/Company.js";
import { FormData } from "../models/FormData.js";
import { generateToken } from "../utils/generateToken.js";
import { sendApplicationStatusEmail } from "../utils/email.js";

const SALT_ROUNDS = 10;

/**
 * POST /api/admin/seed-super-admin
 * One-time: create the first super admin. Requires header X-Super-Admin-Secret: <SUPER_ADMIN_SECRET>.
 * Body: { email, password, name }
 */
export async function seedSuperAdmin(req, res, next) {
  try {
    const secret = process.env.SUPER_ADMIN_SECRET;
    if (!secret) {
      return res.status(501).json({
        ok: false,
        message: "SUPER_ADMIN_SECRET not configured; cannot seed super admin",
      });
    }
    const provided = req.headers["x-super-admin-secret"] || req.body?.secret;
    if (provided !== secret) {
      return res.status(403).json({ ok: false, message: "Forbidden: invalid secret" });
    }
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "email and password required" });
    }
    const existing = await Admin.findOne({
      email: email.trim().toLowerCase(),
      role: "super_admin",
    });
    if (existing) {
      return res.status(409).json({ ok: false, message: "Super admin with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await Admin.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name || null,
      role: "super_admin",
      companyId: null,
    });
    const doc = await Admin.findById(admin._id).select("-passwordHash");
    res.status(201).json({
      ok: true,
      data: { admin: doc },
      message: "Super admin created. Use POST /api/admin/login to get a token.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/test-email
 * Send a test approval email to check SMTP config. Requires X-Super-Admin-Secret header.
 * Body: { to: "your@email.com" } (optional; defaults to SMTP_USER or returns error)
 */
export async function testEmail(req, res, next) {
  try {
    const secret = process.env.SUPER_ADMIN_SECRET;
    if (!secret) {
      return res.status(501).json({
        ok: false,
        message: "SUPER_ADMIN_SECRET not configured",
      });
    }
    const provided = req.headers["x-super-admin-secret"] || req.body?.secret;
    if (provided !== secret) {
      return res.status(403).json({ ok: false, message: "Forbidden: invalid secret" });
    }
    const to = (req.body?.to || process.env.SMTP_USER || "").trim();
    if (!to) {
      return res.status(400).json({
        ok: false,
        message: "Provide 'to' in body (e.g. { \"to\": \"your@email.com\" }) or set SMTP_USER in .env",
      });
    }
    const result = await sendApplicationStatusEmail(
      to,
      "Test Applicant",
      "Test Company",
      "Test Role",
      true,
      "This is a test email from the recruitment backend. If you received this, SMTP is working."
    );
    if (result.sent) {
      return res.status(200).json({
        ok: true,
        message: "Test email sent successfully",
        data: { to, messageId: result.messageId },
      });
    }
    return res.status(500).json({
      ok: false,
      message: "Failed to send test email",
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/login
 * Body: { email, password }
 * Returns JWT with adminId, role, companyId (for company_admin).
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password required" });
    }
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    }).populate("companyId", "name");
    if (!admin) {
      return res.status(401).json({ ok: false, message: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Invalid email or password" });
    }
    const token = generateToken({
      adminId: admin._id.toString(),
      role: admin.role,
      companyId: admin.companyId?._id?.toString() ?? null,
    });
    res.status(200).json({
      ok: true,
      data: {
        admin: {
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          companyId: admin.companyId?._id ?? null,
          companyName: admin.companyId?.name ?? null,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Super Admin: manage company admins ─────────────────────────────────────

/**
 * GET /api/admin/company-admins
 * Super admin only. List all company admins (optionally filter by companyId query).
 */
export async function listCompanyAdmins(req, res, next) {
  try {
    const { companyId } = req.query;
    const filter = { role: "company_admin" };
    if (companyId) filter.companyId = companyId;
    const list = await Admin.find(filter)
      .populate("companyId", "name slug")
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    res.status(200).json({ ok: true, data: list });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/company-admins
 * Super admin only. Create a company admin for a specific company dashboard.
 * Body: { email, password, name, companyId }
 */
export async function createCompanyAdmin(req, res, next) {
  try {
    const { email, password, name, companyId } = req.body;
    if (!email || !password || !companyId) {
      return res.status(400).json({
        ok: false,
        message: "email, password, and companyId are required",
      });
    }
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ ok: false, message: "Company not found" });
    }
    const existing = await Admin.findOne({
      email: email.trim().toLowerCase(),
      role: "company_admin",
      companyId,
    });
    if (existing) {
      return res.status(409).json({ ok: false, message: "Admin already exists for this company and email" });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await Admin.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name || null,
      role: "company_admin",
      companyId,
    });
    const doc = await Admin.findById(admin._id)
      .populate("companyId", "name slug")
      .select("-passwordHash");
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/company-admins/:id
 * Super admin only. Remove a company admin.
 */
export async function deleteCompanyAdmin(req, res, next) {
  try {
    const admin = await Admin.findOne({
      _id: req.params.id,
      role: "company_admin",
    });
    if (!admin) {
      return res.status(404).json({ ok: false, message: "Company admin not found" });
    }
    await Admin.findByIdAndDelete(admin._id);
    res.status(200).json({ ok: true, data: { _id: admin._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}

// ─── Company Admin: applications (approve/reject, send email) ───────────────

/**
 * GET /api/admin/applications
 * Company admin: list applications for their company. Super admin: list all or by companyId query.
 */
export async function listApplications(req, res, next) {
  try {
    const { companyId } = req.query;
    const admin = req.admin;
    let filter = {};
    if (admin.role === "company_admin") {
      filter.companyId = admin.companyId;
    } else if (companyId) {
      filter.companyId = companyId;
    }
    const list = await FormData.find(filter)
      .populate("companyId", "name")
      .populate("roleId", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({ ok: true, data: list });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/applications/:id/status
 * Company admin: approve or reject an application for their company; send email to applicant.
 * Body: { status: "approved" | "rejected", message?: string }
 * Applicant has no password – they are notified by email from this dashboard.
 */
export async function setApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: "status must be 'approved' or 'rejected'",
      });
    }
    const application = await FormData.findById(id)
      .populate("companyId", "name")
      .populate("roleId", "title");
    if (!application) {
      return res.status(404).json({ ok: false, message: "Application not found" });
    }
    const admin = req.admin;
    if (admin.role === "company_admin" && !admin.companyId.equals(application.companyId._id)) {
      return res.status(403).json({ ok: false, message: "You can only review applications for your company" });
    }
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = admin._id;
    await application.save();

    const applicantEmail = application.data?.email;
    const applicantName = application.data?.fullName || application.data?.name || "Applicant";
    const companyName = application.companyId?.name || "Company";
    const roleTitle = application.roleId?.title || "the role";

    if (applicantEmail) {
      const result = await sendApplicationStatusEmail(
        applicantEmail,
        applicantName,
        companyName,
        roleTitle,
        status === "approved",
        message || undefined
      );
      return res.status(200).json({
        ok: true,
        data: {
          application: {
            _id: application._id,
            status: application.status,
            reviewedAt: application.reviewedAt,
          },
          emailSent: result.sent,
          emailError: result.sent ? null : result.error,
        },
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        application: {
          _id: application._id,
          status: application.status,
          reviewedAt: application.reviewedAt,
        },
        emailSent: false,
        emailError: "No applicant email in application data",
      },
    });
  } catch (error) {
    next(error);
  }
}
