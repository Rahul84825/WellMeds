import mongoose from "mongoose";

const surgicalCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "activity",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map virtual id to _id
surgicalCategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const SurgicalCategory = mongoose.model("SurgicalCategory", surgicalCategorySchema);
