import mongoose from "mongoose";

const medicalSpecialitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Speciality name is required"],
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
    bannerImage: {
      type: String,
      default: "",
    },
    iconImage: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    richContentSections: {
      type: [
        {
          heading: { type: String, required: true },
          richTextDescription: { type: String, required: true },
          displayOrder: { type: Number, default: 0 },
        }
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map virtual id to _id
medicalSpecialitySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const MedicalSpeciality = mongoose.model("MedicalSpeciality", medicalSpecialitySchema);
