import mongoose from "mongoose";

/**
 * FormData section – submitted job application form data.
 * One document per application (applicant + role + custom form fields).
 */
const formDataSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Admin pipeline: pending → reviewed → interviewing → hired/accepted, or rejected (approved = legacy)
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "interviewing", "hired", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

export const FormData = mongoose.model("FormData", formDataSchema);
