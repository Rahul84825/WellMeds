import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // UPDATED: category is now an ObjectId reference to Category document
    // This enables proper relational queries and .populate() support
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
        originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    requiresRx: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    sku: {
      type: String,
      unique: true,
      required: [true, "SKU is required"],
    },
    medicalSections: {
      type: [{
        title: { type: String, required: true },
        content: { type: String, required: true }
      }],
      default: []
    },
    composition: {
      type: [{
        ingredient: { type: String, required: true },
        strength: { type: String, required: true },
        purpose: { type: String, required: true }
      }],
      default: []
    },
    benefits: {
      type: [{
        title: { type: String, required: true },
        description: { type: String }
      }],
      default: []
    },
    usageInstructions: {
      type: [String],
      default: []
    },
    storageInstructions: {
      type: [String],
      default: []
    },
    warnings: {
      type: [String],
      default: []
    },
    sideEffects: {
      type: [String],
      default: []
    },
    safetyCards: {
      type: [{
        icon: { type: String },
        title: { type: String, required: true },
        status: { type: String, required: true },
        description: { type: String }
      }],
      default: []
    },
    faqs: {
      type: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }],
      default: []
    },
    specifications: {
      type: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
      }],
      default: []
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: { type: String },
      canonicalUrl: { type: String },
      ogImage: { type: String }
    },
    relatedProducts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: []
    },
    references: {
      type: [String],
      default: []
    },
    imagesData: {
      type: [{
        url: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
        caption: { type: String }
      }],
      default: []
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map virtual id to _id
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const Product = mongoose.model("Product", productSchema);
