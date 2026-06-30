import mongoose from "mongoose";

const papPageSchema = new mongoose.Schema(
  {
    hero: {
      label: { type: String, default: "PATIENT SUPPORT" },
      heading: { type: String, default: "Making Life-Saving Medicines Affordable" },
      description: { type: String, default: "WellMeds helps eligible patients reduce the financial burden of long-term treatments through verified Patient Assistance Programs offered by pharmaceutical companies." },
      buttonPrimary: { type: String, default: "Check Eligibility" },
      buttonSecondary: { type: String, default: "Talk to Pharmacist" },
      imageUrl: { type: String, default: "" }
    },
    whatIsPap: {
      title: { type: String, default: "Understanding Patient Assistance Programs (PAP)" },
      desc: { type: String, default: "Patient Assistance Programs are corporate social responsibility and patient-access initiatives run by global pharmaceutical companies. These programs are designed to help patients who cannot afford the full cost of high-value specialty medications." },
      points: [{ type: String }]
    },
    timeline: [
      {
        step: { type: String, required: true },
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],
    eligibility: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],
    programs: [
      {
        name: { type: String, required: true },
        medicine: { type: String, required: true },
        manufacturer: { type: String, required: true },
        savings: { type: String, required: true },
        eligibility: { type: String, required: true }
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

export const PAPPage = mongoose.model("PAPPage", papPageSchema);
