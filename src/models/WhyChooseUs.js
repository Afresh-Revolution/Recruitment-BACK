import mongoose from "mongoose";

/**
 * WhyChooseUs section – "Why choose us" content (headline, features, trainees, gallery).
 * Content to be defined later; company-scoped for multi-company.
 */
const traineeSchema = new mongoose.Schema({
  name: String,
  role: String,
  avatar: String,
  rating: Number,
});

const gallerySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  images: [String],
});

const whyChooseUsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    sectionKey: {
      type: String,
      unique: true,
      default: "why_choose_us",
    },
    headline: { type: String, default: null },
    description: { type: String, default: null },
    rating: { score: Number, label: String },
    features: [String],
    previewImages: [String],
    trainees: { total: Number, list: [traineeSchema] },
    gallery: gallerySchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WhyChooseUs = mongoose.model("WhyChooseUs", whyChooseUsSchema);
