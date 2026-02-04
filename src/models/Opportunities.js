import mongoose from "mongoose";

/**
 * Opportunities section – "Available Roles" block.
 * Section headers + job cards (via Role refs); all data from DB.
 */
const opportunitiesSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    // Smaller label above main title (e.g. "Trending Opportunities")
    trendingLabel: { type: String, default: "Trending Opportunities", trim: true },
    // Main section title
    sectionTitle: { type: String, default: "Available Roles", trim: true },
    // Job cards – refs to Role (each Role has companyId, title, department, type, location, deadline)
    roleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    // "View More Roles" button
    viewMoreButton: {
      text: { type: String, default: "View More Roles →", trim: true },
      link: { type: String, default: "/roles", trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Opportunities = mongoose.model(
  "Opportunities",
  opportunitiesSchema
);
