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
    inStock: {
      type: Boolean,
      default: true,
    },
    requiresRx: {
      type: Boolean,
      default: false,
    },
    isColdChain: {
      type: Boolean,
      default: false,
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
    isNonRefundable: {
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
    productSpecifications: {
      genericName: { type: String, default: "" },
      strength: { type: String, default: "", maxlength: [50, "Strength specification cannot exceed 50 characters"] },
      dosageForm: { type: String, default: "" },
      route: { type: String, default: "" },
      prescription: { type: String, default: "" },
      manufacturer: { type: String, default: "" },
      packSize: { type: String, default: "" },
      storage: { type: String, default: "" },
      shelfLife: { type: String, default: "" },
      country: { type: String, default: "" },
      coldChain: { type: String, default: "" },
      productType: { type: String, default: "" },
      drugClass: { type: String, default: "" },
      therapeuticCategory: { type: String, default: "" },
      availablePackings: { type: String, default: "" }
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: { type: String },
      canonicalUrl: { type: String },
      ogImage: { type: String }
    },
    specialities: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalSpeciality" }],
      default: []
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
    molecules: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Molecule" }],
      default: []
    },
    productType: {
      type: String,
      enum: ["medicine", "wellness"],
      default: "medicine",
    },
    isSurgical: {
      type: Boolean,
      default: false,
    },
    manufacturer: {
      type: String,
      default: "",
    },
    marketer: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    importedCountry: {
      type: String,
      default: "",
    },
    strength: {
      type: String,
      default: "",
    },
    packSize: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    similarMedicinePriority: {
      type: Number,
      default: 0,
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    medicineCategory: {
      type: String,
      default: "",
    },
    moleculeSlug: {
      type: String,
      default: "",
    },
    surgicalCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurgicalCategory",
      required: [
        function () {
          return this.isSurgical === true;
        },
        "Surgical Category is required if product is surgical",
      ],
    },
    isTrending: {
      type: Boolean,
      default: false,
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

// Database Indexes for High-Performance Queries & Search
productSchema.index({ category: 1 });
productSchema.index({ surgicalCategory: 1 });
productSchema.index({ molecules: 1 });
productSchema.index({ specialities: 1 });
productSchema.index({ productType: 1, isSurgical: 1, isTrending: 1 });
productSchema.index({ isImported: 1 });
productSchema.index({ displayOrder: 1 });
productSchema.index({ name: "text", brand: "text", manufacturer: "text" });

export const Product = mongoose.model("Product", productSchema);

