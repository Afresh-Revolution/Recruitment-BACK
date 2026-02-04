import mongoose from "mongoose";

/**
 * FormRequirement section – job form content displayed when applying.
 * All content from DB: job title, description, requirements, qualifications, duration, deadline.
 */
const formRequirementSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    // Job title (e.g. "Managing Director")
    jobTitle: { type: String, required: true, trim: true },
    // Job description paragraph
    jobDescription: {
      type: String,
      default: null,
      trim: true,
    },
    // Job requirement bullet points
    jobRequirements: {
      type: [String],
      default: [],
    },
    // Job qualification bullet points
    jobQualifications: {
      type: [String],
      default: [],
    },
    // Job duration (e.g. "Contract", "Full-time")
    jobDuration: { type: String, default: null, trim: true },
    // Application deadline (Date or formatted string like "15th January, 2026")
    applicationDeadline: { type: String, default: null, trim: true },
    deadlineDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FormRequirement = mongoose.model(
  "FormRequirement",
  formRequirementSchema
);
