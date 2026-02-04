import mongoose from "mongoose";

/**
 * Trainee section – section title + ordered trainee refs.
 * "We have over 150+ Trainee" + list of trainee cards.
 */
const traineeSectionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    sectionTitle: {
      type: String,
      default: "We have over 150+ Trainee",
      trim: true,
    },
    traineeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trainee" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TraineeSection = mongoose.model(
  "TraineeSection",
  traineeSectionSchema
);
