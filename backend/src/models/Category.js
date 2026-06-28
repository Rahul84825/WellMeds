import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
      default: "category",
    },
    count: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
    seoKeywords: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    introduction: {
      type: String,
      default: "",
    },
    faqs: {
      type: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize status and isActive before saving
categorySchema.pre("save", function (next) {
  if (this.status === "Active") {
    this.isActive = true;
  } else if (this.status === "Inactive") {
    this.isActive = false;
  } else {
    this.status = this.isActive ? "Active" : "Inactive";
  }
  next();
});

export const Category = mongoose.model("Category", categorySchema);
