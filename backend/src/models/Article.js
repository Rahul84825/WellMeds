import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Article slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Article category is required"],
      enum: [
        "Health Guides",
        "Medicine Guides",
        "Disease Awareness",
        "Lifestyle",
        "Nutrition",
        "General Wellness",
      ],
      default: "Health Guides",
      index: true,
    },
    topic: {
      type: String,
      trim: true,
      default: "General",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    author: {
      name: { type: String, default: "Wellmeds Health Team" },
      title: { type: String, default: "Clinical Editorial Team" },
      avatar: { type: String, default: "" },
    },
    reviewer: {
      name: { type: String, default: "Payal Choudhary" },
      qualifications: { type: String, default: "D.Pharm" },
      avatarText: { type: String, default: "PC" },
    },
    coverImage: {
      type: String,
      default: "",
    },
    gradientClass: {
      type: String,
      default: "slide-bg-1",
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimized filtering
articleSchema.index({ active: 1, category: 1, topic: 1, publishedAt: -1 });

export const Article = mongoose.model("Article", articleSchema);
