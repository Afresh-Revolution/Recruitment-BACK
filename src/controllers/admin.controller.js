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

// ─── Company Admin: applications (list, summary, export, status) ─────────────

/**
 * GET /api/admin/applications/summary
 * Returns counts for Admin Dashboard KPIs: total, pending, interviewing, hired.
 * Company admin: their company only. Super admin: all or filter by companyId query.
 */
export async function listApplicationSummary(req, res, next) {
  try {
    const { companyId } = req.query;
    const admin = req.admin;
    let filter = {};
    if (admin.role === "company_admin") {
      filter.companyId = admin.companyId;
    } else if (companyId) {
      filter.companyId = companyId;
    }
    const [total, pending, interviewing, hired] = await Promise.all([
      FormData.countDocuments(filter),
      FormData.countDocuments({ ...filter, status: "pending" }),
      FormData.countDocuments({ ...filter, status: "interviewing" }),
      FormData.countDocuments({ ...filter, status: { $in: ["hired", "approved"] } }),
    ]);
    res.status(200).json({
      ok: true,
      data: { total, pending, interviewing, hired },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/applications/export-csv
 * Stream CSV of applications for Admin Dashboard "Export CSV" button.
 * Company admin: their company only. Super admin: all or filter by companyId query.
 */
export async function exportApplicationsCsv(req, res, next) {
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
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "Application ID",
      "Company",
      "Role",
      "Applicant Name",
      "Email",
      "Status",
      "Applied At",
      "Reviewed At",
    ];
    const escapeCsv = (val) => {
      if (val == null) return "";
      const s = String(val);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = list.map((app) => {
      const name = app.data?.fullName ?? app.data?.name ?? "";
      const email = app.data?.email ?? "";
      return [
        app._id.toString(),
        app.companyId?.name ?? "",
        app.roleId?.title ?? "",
        name,
        email,
        app.status ?? "pending",
        app.createdAt ? new Date(app.createdAt).toISOString() : "",
        app.reviewedAt ? new Date(app.reviewedAt).toISOString() : "",
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    const filename = `admin-dashboard-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/applications
 * Status section: list applications with optional status filter and search (applicant, role, company).
 * Company admin: their company only. Super admin: all or ?companyId=xxx.
 * Query: ?status=pending|reviewed|interviewing|hired|approved|rejected & ?search=...
 */
export async function listApplications(req, res, next) {
  try {
    const { companyId, status, search } = req.query;
    const admin = req.admin;
    let filter = {};
    if (admin.role === "company_admin") {
      filter.companyId = admin.companyId;
    } else if (companyId) {
      filter.companyId = companyId;
    }
    if (status && ["pending", "reviewed", "approved", "interviewing", "hired", "rejected"].includes(status)) {
      filter.status = status;
    }
    let list;
    if (search && String(search).trim()) {
      const term = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(term, "i");
      list = await FormData.find(filter)
        .populate("companyId", "name")
        .populate("roleId", "title")
        .sort({ createdAt: -1 });
      list = list.filter(
        (app) =>
          regex.test(app.data?.fullName ?? "") ||
          regex.test(app.data?.name ?? "") ||
          regex.test(app.data?.email ?? "") ||
          regex.test(app.companyId?.name ?? "") ||
          regex.test(app.roleId?.title ?? "")
      );
    } else {
      list = await FormData.find(filter)
        .populate("companyId", "name")
        .populate("roleId", "title")
        .sort({ createdAt: -1 });
    }
    res.status(200).json({ ok: true, data: list });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/applications/:id
 * Application Details modal: fetch one application by id (company-scoped for company_admin).
 */
export async function getOneApplication(req, res, next) {
  try {
    const { id } = req.params;
    const admin = req.admin;
    const application = await FormData.findById(id)
      .populate("companyId", "name")
      .populate("roleId", "title");
    if (!application) {
      return res.status(404).json({ ok: false, message: "Application not found" });
    }
    if (admin.role === "company_admin" && !admin.companyId.equals(application.companyId._id)) {
      return res.status(403).json({ ok: false, message: "You can only view applications for your company" });
    }
    res.status(200).json({ ok: true, data: application });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/applications/:id – update application document (e.g. data); use .../status for status.
 * Company admin: their company only. Body: any FormData fields except status (use .../status for that).
 */
export async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const admin = req.admin;
    const application = await FormData.findById(id).populate("companyId", "name").populate("roleId", "title");
    if (!application) {
      return res.status(404).json({ ok: false, message: "Application not found" });
    }
    if (admin.role === "company_admin" && !admin.companyId.equals(application.companyId._id)) {
      return res.status(403).json({ ok: false, message: "You can only update applications for your company" });
    }
    const { status, reviewedAt, reviewedBy, ...allowedBody } = req.body;
    const updated = await FormData.findByIdAndUpdate(id, allowedBody, { new: true, runValidators: true })
      .populate("companyId", "name")
      .populate("roleId", "title");
    res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/applications/:id – delete application. Company admin: their company only.
 */
export async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const admin = req.admin;
    const application = await FormData.findById(id);
    if (!application) {
      return res.status(404).json({ ok: false, message: "Application not found" });
    }
    if (admin.role === "company_admin" && !admin.companyId.equals(application.companyId)) {
      return res.status(403).json({ ok: false, message: "You can only delete applications for your company" });
    }
    await FormData.findByIdAndDelete(id);
    res.status(200).json({ ok: true, data: { _id: id, deleted: true } });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/applications/:id/status
 * Company admin: set application status; optionally send email on approved/hired or rejected.
 * Body: { status: "pending" | "reviewed" | "interviewing" | "hired" | "approved" | "rejected", message?: string }
 * Applicant has no password – they are notified by email from this dashboard when approved/hired or rejected.
 */
export async function setApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const allowed = ["pending", "reviewed", "interviewing", "hired", "approved", "rejected"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: `status must be one of: ${allowed.join(", ")}`,
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

    const isApproved = status === "approved" || status === "hired";
    const isRejected = status === "rejected";
    const shouldSendEmail = applicantEmail && (isApproved || isRejected);
    if (shouldSendEmail) {
      const result = await sendApplicationStatusEmail(
        applicantEmail,
        applicantName,
        companyName,
        roleTitle,
        isApproved,
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
