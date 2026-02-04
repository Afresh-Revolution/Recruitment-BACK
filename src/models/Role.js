import mongoose from "mongoose";

/**
 * Role section – available roles/jobs per company.
 * Job postings; applicants apply through FormData.
 */
const roleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    department: { type: String, default: null, trim: true },
    type: { type: String, default: null }, // e.g. Full-time, Part-time, Contract
    location: { type: String, default: null }, // e.g. Remote, Hybrid
    description: { type: String, default: null },
    requirements: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    deadline: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Role = mongoose.model("Role", roleSchema);
