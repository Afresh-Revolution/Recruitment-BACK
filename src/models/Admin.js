import mongoose from "mongoose";

/**
 * Admin – super_admin (controls all) or company_admin (dashboard per company).
 * Only admins have passwords; applicants have no login, they receive approval/rejection by email.
 */
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "company_admin"],
      required: true,
    },
    // For company_admin: which company this admin manages. Null for super_admin.
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    name: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One super_admin per email; one company_admin per (email + companyId)
adminSchema.index({ email: 1, role: 1, companyId: 1 }, { unique: true });

export const Admin = mongoose.model("Admin", adminSchema);
