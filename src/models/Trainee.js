import mongoose from "mongoose";

/**
 * Trainee – individual trainee card (avatar, name, role, rating).
 */
const traineeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true }, // e.g. Java Developer, PHP Developer
    avatar: { type: String, default: null }, // image URL or base64
    rating: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Trainee = mongoose.model("Trainee", traineeSchema);
