import mongoose from "mongoose";

/**
 * Company – job portal tenants (destination cards).
 * One backend, one DB; start with two companies, add more via admin over time.
 */
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    logo: { type: String, default: null },
    description: { type: String, default: null },
    backgroundImage: { type: String, default: null },
    partnerTag: { type: String, default: "Partner", trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
