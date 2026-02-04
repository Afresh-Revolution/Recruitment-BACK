import mongoose from "mongoose";

const poweredSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    // Section heading (e.g. "POWERED BY:")
    title: {
      type: String,
      default: "POWERED BY:",
      trim: true,
    },
    // List of partner companies – order preserved for display
    partners: [
      {
        name: { type: String, required: true, trim: true },
        logoUrl: { type: String, default: null }, // image URL or base64
        logoText: { type: String, default: null }, // e.g. "afr®" text on logo
        link: { type: String, default: null },
        order: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Powered = mongoose.model("Powered", poweredSchema);
