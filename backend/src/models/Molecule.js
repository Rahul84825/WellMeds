import mongoose from "mongoose";

const moleculeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Molecule name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    uses: {
      type: String,
      default: "",
    },
    benefits: {
      type: String,
      default: "",
    },
    howItWorks: {
      type: String,
      default: "",
    },
    dosage: {
      type: String,
      default: "",
    },
    sideEffects: {
      type: String,
      default: "",
    },
    warnings: {
      type: String,
      default: "",
    },
    precautions: {
      type: String,
      default: "",
    },
    storage: {
      type: String,
      default: "",
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      ogImage: { type: String, default: "" }
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    letter: {
      type: String,
      required: [true, "Alphabet letter is required"],
      uppercase: true,
      length: 1,
    },
    faqs: {
      type: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }],
      default: []
    },
    references: {
      type: [String],
      default: []
    },
    relatedMolecules: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Molecule" }],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

moleculeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const Molecule = mongoose.model("Molecule", moleculeSchema);
