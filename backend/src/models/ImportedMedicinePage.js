import mongoose from "mongoose";

const importedMedicinePageSchema = new mongoose.Schema(
  {
    hero: {
      label: { type: String, default: "GLOBAL MEDICINE ACCESS" },
      heading: { type: String, default: "Imported Medicines from Trusted Global Manufacturers" },
      description: { type: String, default: "WellMeds helps patients access genuine imported medicines that are unavailable locally. We source directly from trusted international manufacturers while ensuring authenticity, proper documentation, and secure delivery." },
      buttonPrimary: { type: String, default: "Browse Imported Medicines" },
      buttonSecondary: { type: String, default: "Request Imported Medicine" },
      imageUrl: { type: String, default: "" }
    },
    timeline: [
      {
        step: { type: String, required: true },
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],
    features: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],
    categories: [
      {
        name: { type: String, required: true },
        query: { type: String, required: true },
        desc: { type: String, default: "" }
      }
    ],
    stats: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
        desc: { type: String, default: "" }
      }
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ],
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
      canonical: { type: String, default: "" },
      ogImage: { type: String, default: "" }
    }
  },
  {
    timestamps: true
  }
);

export const ImportedMedicinePage = mongoose.model("ImportedMedicinePage", importedMedicinePageSchema);
