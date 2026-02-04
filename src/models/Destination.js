import mongoose from "mongoose";

/**
 * Destination section – "Choose Your Destination" block.
 * Section title, description + ordered company cards.
 */
const destinationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    sectionTitle: {
      type: String,
      default: "Choose Your Destination",
      trim: true,
    },
    sectionDescription: {
      type: String,
      default:
        "Select a partner company to view their open positions. Each offers unique challenges and world-class environments.",
      trim: true,
    },
    companyIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    ],
    selectButtonText: {
      type: String,
      default: "Select →",
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Destination = mongoose.model("Destination", destinationSchema);
