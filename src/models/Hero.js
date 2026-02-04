import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // ─── Header / Navigation ─────────────────────────────────────────
    navigation: {
      logo: { type: String, default: "C.A.G.E" },
      links: [
        {
          label: { type: String, required: true },
          path: { type: String, required: true },
          active: { type: Boolean, default: false },
        },
      ],
    },

    // ─── Left content: Headline ───────────────────────────────────────
    headline: {
      main: { type: String, required: true, default: "Accelerate your growth with" },
      highlight: { type: String, required: true, default: "top talent" },
      highlightIcon: { type: String, default: "⚡" }, // icon/emoji or image URL
    },

    // ─── Left content: Description ───────────────────────────────────
    description: {
      type: String,
      required: true,
      default:
        "Join a network where companies, startups, and entrepreneurs support each other by sharing and engaging with verified talent — automatically.",
    },

    // ─── Left content: CTA button ────────────────────────────────────
    cta: {
      text: { type: String, default: "Apply Now" },
      link: { type: String, default: "/apply" },
    },

    // ─── Left content: Feature pills (Smart Matching, Analytics, etc.) ─
    features: [
      {
        label: { type: String, required: true },
        icon: { type: String, default: null }, // e.g. "+" or null
        highlighted: { type: Boolean, default: false }, // e.g. green background
      },
    ],

    // ─── Right grid: Four panels ──────────────────────────────────────
    panels: {
      // Top left: hands on laptop image
      topLeft: {
        imageUrl: { type: String, default: null }, // base64 or URL
        alt: { type: String, default: "Person working on laptop" },
      },
      // Top right: New Hires card
      topRight: {
        label: { type: String, default: "New Hires" },
        count: { type: String, default: "+1424" },
        monthLabels: {
          type: [String],
          default: ["Ap", "My", "Ju", "Jl", "Au", "Se"],
        },
        backgroundImage: { type: String, default: null },
        overlayColor: { type: String, default: "purple" },
      },
      // Bottom left: Shine together card
      bottomLeft: {
        title: { type: String, default: "Shine together" },
        iconUrl: { type: String, default: null }, // interlocking circles icon
        backgroundImage: { type: String, default: null },
        overlayColor: { type: String, default: "pink" },
      },
      // Bottom right: person with laptop image
      bottomRight: {
        imageUrl: { type: String, default: null },
        alt: { type: String, default: "Person with laptop" },
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hero = mongoose.model("Hero", heroSchema);
