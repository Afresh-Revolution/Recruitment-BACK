import mongoose from "mongoose";

/**
 * RoleSection – config for the "Roles" page (company name context, tagline, filter categories).
 */
const roleSectionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sectionTagline: {
      type: String,
      default: "text challenge and apply today.",
      trim: true,
    },
    filterCategories: {
      type: [String],
      default: ["All", "Engineering", "Design", "Product", "Marketing"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RoleSection = mongoose.model("RoleSection", roleSectionSchema);
