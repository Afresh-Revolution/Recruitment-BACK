import mongoose from "mongoose";

/**
 * Gallery section – all content from DB.
 * Category tag, title, subtitle, carousel images, copyright.
 */
const gallerySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    // Teal pill tag (e.g. "Life at Cage")
    categoryTag: {
      type: String,
      default: "Life at Cage",
      trim: true,
    },
    // Main title
    title: {
      type: String,
      default: "Our Gallery",
      trim: true,
    },
    // Subtitle below title
    subtitle: {
      type: String,
      default: "A glimpse into our community and culture.",
      trim: true,
    },
    // Carousel images (URL or base64); order = array index
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: null },
        order: { type: Number, default: 0 },
      },
    ],
    // Footer copyright
    copyright: {
      type: String,
      default: "© 2026 Cage All rights reserved.",
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Gallery = mongoose.model("Gallery", gallerySchema);
