import { ImportedMedicinePage } from "../models/ImportedMedicinePage.js";
import { PAPPage } from "../models/PAPPage.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

// Helper to seed default Imported Medicine Page
const seedDefaultImportedPage = async () => {
  return await ImportedMedicinePage.create({
    hero: {
      label: "GLOBAL MEDICINE ACCESS",
      heading: "Imported Medicines from Trusted Global Manufacturers",
      description: "WellMeds helps patients access genuine imported medicines that are unavailable locally. We source directly from trusted international manufacturers while ensuring authenticity, proper documentation, and secure delivery.",
      buttonPrimary: "Browse Imported Medicines",
      buttonSecondary: "Request Imported Medicine",
      imageUrl: ""
    },
    timeline: [
      { step: "01", title: "Submit Request", desc: "Provide medicine name, prescription sheet, and contact details." },
      { step: "02", title: "Clinical Check", desc: "Our registered pharmacists verify the prescription and determine importing guidelines." },
      { step: "03", title: "Global Sourcing", desc: "We coordinate with authorized global manufacturers to procure the medicine." },
      { step: "04", title: "Quality Audit", desc: "Every batch is inspected for authenticity, packaging integrity, and temperature logs." },
      { step: "05", title: "Express Delivery", desc: "Direct delivery to your doorstep using validated cold-chain temperature bags." }
    ],
    features: [
      { title: "100% Genuine Medicines", desc: "Every imported medication is sourced through fully licensed channels, complete with batch certificates." },
      { title: "Direct Sourcing Channels", desc: "We bypass multi-tiered distributor layers to procure products directly from global WHO-GMP manufacturers." },
      { title: "Validated Cold Chain", desc: "Equipped with real-time temperature logs and specialized insulation boxes to preserve potency." },
      { title: "Customs & Documentation", desc: "Our compliance desk guides you through the necessary import licensing, customs clearances, and filings." },
      { title: "Expedited Lead Times", desc: "Leveraging cargo logistics pathways to import and deliver rare treatments in the shortest possible timeframe." },
      { title: "Dedicated Pharmacist", desc: "A certified clinical case pharmacist is assigned to monitor your procurement cycle." }
    ],
    categories: [
      { name: "Cancer Medicines", query: "Oncology", desc: "Chemotherapy & targeted therapies" },
      { name: "Rare Disease Medicines", query: "Orphan Drugs", desc: "Orphan drugs & genetic therapies" },
      { name: "Transplant Medicines", query: "Immunosuppressants", desc: "Anti-rejection immunosuppressants" },
      { name: "Neurology", query: "Neurology", desc: "Sclerosis & neurodegenerative care" },
      { name: "Immunology", query: "Immunology", desc: "Autoimmune & biological therapies" },
      { name: "Vaccines & Biologics", query: "Biologics", desc: "Specialty vaccines & monoclonal antibodies" }
    ],
    stats: [
      { value: "1,200+", label: "Patients Assisted", desc: "Accessing critical therapies" },
      { value: "45+", label: "Global Source Countries", desc: "Direct manufacturer channels" },
      { value: "600+", label: "Orphan & Cancer Medicines", desc: "Rare specialties catalog" },
      { value: "100%", label: "Authenticity Guarantee", desc: "Direct-from-source tracking" }
    ],
    faqs: [
      { question: "How long does the import process take?", answer: "Typically, procurement and customs clearance take between 7 to 14 business days. For critical emergency cases, we can deliver within 5 to 7 days." },
      { question: "Do I need a prescription to order imported medicines?", answer: "Yes. Under Indian drug regulations, importing medicines for personal use requires a valid prescription from a registered specialist along with a patient-named import permit." },
      { question: "Are these imported medicines genuine?", answer: "Absolutely. We source all medications directly from the brand manufacturers or their licensed international distributors." },
      { question: "Can imported medicines be returned or cancelled?", answer: "Since these are specialty items procured specifically for an individual patient under a personal import permit, they cannot be returned or cancelled." },
      { question: "Is GST and customs duty included in the quoted price?", answer: "Yes, our quoted prices are fully inclusive of basic customs duties, IGST, handling fees, and doorstep delivery charges." }
    ],
    seo: {
      title: "Imported Medicines in India - Buy Imported Medicines Online | WellMeds",
      description: "Access genuine imported cancer, transplant, and rare disease medicines online in India. Direct manufacturer sourcing, validated cold-chain logistics, and full import documentation support.",
      keywords: "imported medicines, cancer medicine import, rare disease medicines, buy medicines online",
      canonical: "",
      ogImage: ""
    }
  });
};

// Helper to seed default PAP Page
const seedDefaultPAPPage = async () => {
  return await PAPPage.create({
    hero: {
      label: "PATIENT SUPPORT",
      heading: "Making Life-Saving Medicines Affordable",
      description: "WellMeds helps eligible patients reduce the financial burden of long-term treatments through verified Patient Assistance Programs offered by pharmaceutical companies.",
      buttonPrimary: "Check Eligibility",
      buttonSecondary: "Talk to Pharmacist",
      imageUrl: ""
    },
    whatIsPap: {
      title: "Understanding Patient Assistance Programs (PAP)",
      desc: "Patient Assistance Programs are corporate social responsibility and patient-access initiatives run by global pharmaceutical companies. These programs are designed to help patients who cannot afford the full cost of high-value specialty medications.",
      points: [
        "Access to premium FDA-approved medications at a fraction of their retail price.",
        "Continuity of long-term treatments without financial interruptions.",
        "Full assistance with dossier compilation and manufacturer coordination by WellMeds.",
        "Safe dispensing and delivery via validated cold-chain shipping."
      ]
    },
    timeline: [
      { step: "01", title: "Doctor Rx", desc: "Your treating specialist prescribes a therapy covered under a manufacturer PAP." },
      { step: "02", title: "Eligibility Check", desc: "Our caseworkers evaluate your clinical and financial details against PAP criteria." },
      { step: "03", title: "Document Review", desc: "We verify your medical reports, income certificates, and ID proofs." },
      { step: "04", title: "Apply Sourcing", desc: "We compile and submit your application docket to the respective pharma brand desk." },
      { step: "05", title: "Brand Approval", desc: "The manufacturer reviews the docket and issues the subsidized drug approval voucher." },
      { step: "06", title: "Safe Delivery", desc: "WellMeds dispenses and delivers your approved subsidized medicine under cold-chain." }
    ],
    eligibility: [
      { title: "Oncology & Cancer Patients", desc: "Patients prescribed high-value chemotherapy, immunotherapy, or targeted kinase inhibitors." },
      { title: "Rare Diseases & Orphan Drugs", desc: "Families dealing with rare genetic disorders requiring specialized enzyme therapies." },
      { title: "Organ Transplant Recipients", desc: "Patients requiring lifelong anti-rejection immunosuppressive therapies." },
      { title: "Chronic Lifelong Therapies", desc: "Management of severe rheumatoid arthritis, psoriasis, or advanced cardiovascular conditions." },
      { title: "Pediatric Care Support", desc: "Subsidized growth hormones, specialized nutrition, and pediatric critical care medications." },
      { title: "Low & Middle-Income Families", desc: "Patients without adequate health insurance coverage or those who have exhausted their limits." }
    ],
    programs: [
      { name: "Roche Oncology Access Program", medicine: "Herceptin (Trastuzumab) / Kadcyla", manufacturer: "Roche Products India", savings: "Buy 2 Cycles, Get 1 Cycle Free", eligibility: "Diagnosed HER2+ breast cancer patients under specialist prescription." },
      { name: "AstraZeneca Tagrisso Support", medicine: "Tagrisso (Osimertinib)", manufacturer: "AstraZeneca India", savings: "Up to 45% Financial Subsidy", eligibility: "EGFR mutation-positive NSCLC patients with income verification." },
      { name: "Novartis Transplant Assistance", medicine: "Myfortic (Mycophenolate) / Sandimmun", manufacturer: "Novartis India", savings: "Subsidized Monthly Maintenance", eligibility: "Post-transplant patients undergoing active immunosuppression." },
      { name: "Pfizer Ibrance Co-Pay Program", medicine: "Ibrance (Palbociclib)", manufacturer: "Pfizer India", savings: "Co-pay support of up to 50%", eligibility: "HR+/HER2- metastatic breast cancer patients." }
    ],
    stats: [
      { value: "1,500+", label: "Patients Assisted", desc: "Accessing subsidized treatments" },
      { value: "15+", label: "Pharma Brand Programs", desc: "Active manufacturer collaborations" },
      { value: "₹2.5 Cr+", label: "Direct Patient Savings", desc: "Through approved subsidies" },
      { value: "100%", label: "Free Advocacy Service", desc: "No facilitation or file charges" }
    ],
    faqs: [
      { question: "Who qualifies for the Patient Assistance Program?", answer: "Eligibility is primarily based on two criteria: clinical need (having a valid prescription from a certified specialist) and financial assessment." },
      { question: "Is the Patient Assistance Program free?", answer: "Yes, applying through WellMeds is completely free. We do not charge any coordination or facilitation fees." },
      { question: "How long does the PAP approval take?", answer: "Once we compile your complete document dossier and submit it, approval typically takes between 3 to 7 business days." },
      { question: "Can anyone apply for PAP?", answer: "Any patient who has been prescribed a specialty medication that has an active PAP run by its manufacturer can apply." }
    ],
    seo: {
      title: "Patient Assistance Program India - Subsidized Cancer Medicines | WellMeds",
      description: "Apply for Patient Assistance Programs (PAP) in India. Access subsidized or free oncology, transplant, and chronic care medicines with dedicated caseworker assistance.",
      keywords: "Patient Assistance Program, PAP India, financial assistance medicines, free cancer medicines",
      canonical: "",
      ogImage: ""
    }
  });
};

// @desc    Get Imported Medicine Page content
// @route   GET /api/cms/imported
// @access  Public
export const getImportedMedicinePage = async (req, res, next) => {
  try {
    let page = await ImportedMedicinePage.findOne();
    if (!page) {
      page = await seedDefaultImportedPage();
    }
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Imported Medicine Page content
// @route   PUT /api/cms/imported
// @access  Private/Admin
export const updateImportedMedicinePage = async (req, res, next) => {
  try {
    let page = await ImportedMedicinePage.findOne();
    if (!page) {
      page = await seedDefaultImportedPage();
    }

    const updateData = req.body;

    // Handle parsed JSON objects for complex fields
    if (typeof updateData.hero === "string") updateData.hero = JSON.parse(updateData.hero);
    if (typeof updateData.timeline === "string") updateData.timeline = JSON.parse(updateData.timeline);
    if (typeof updateData.features === "string") updateData.features = JSON.parse(updateData.features);
    if (typeof updateData.categories === "string") updateData.categories = JSON.parse(updateData.categories);
    if (typeof updateData.stats === "string") updateData.stats = JSON.parse(updateData.stats);
    if (typeof updateData.faqs === "string") updateData.faqs = JSON.parse(updateData.faqs);
    if (typeof updateData.seo === "string") updateData.seo = JSON.parse(updateData.seo);

    // Image Upload
    if (req.file) {
      const folder = "cms_imported";
      const uploadedUrl = await uploadToCloudinary(req.file.path, folder);
      if (!updateData.hero) updateData.hero = {};
      updateData.hero.imageUrl = uploadedUrl;
    }

    Object.assign(page, updateData);
    await page.save();

    res.status(200).json({ success: true, message: "Page updated successfully", data: page });
  } catch (err) {
    next(err);
  }
};

// @desc    Get PAP Page content
// @route   GET /api/cms/pap
// @access  Public
export const getPAPPage = async (req, res, next) => {
  try {
    let page = await PAPPage.findOne();
    if (!page) {
      page = await seedDefaultPAPPage();
    }
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

// @desc    Update PAP Page content
// @route   PUT /api/cms/pap
// @access  Private/Admin
export const updatePAPPage = async (req, res, next) => {
  try {
    let page = await PAPPage.findOne();
    if (!page) {
      page = await seedDefaultPAPPage();
    }

    const updateData = req.body;

    // Handle parsed JSON objects for complex fields
    if (typeof updateData.hero === "string") updateData.hero = JSON.parse(updateData.hero);
    if (typeof updateData.whatIsPap === "string") updateData.whatIsPap = JSON.parse(updateData.whatIsPap);
    if (typeof updateData.timeline === "string") updateData.timeline = JSON.parse(updateData.timeline);
    if (typeof updateData.eligibility === "string") updateData.eligibility = JSON.parse(updateData.eligibility);
    if (typeof updateData.programs === "string") updateData.programs = JSON.parse(updateData.programs);
    if (typeof updateData.stats === "string") updateData.stats = JSON.parse(updateData.stats);
    if (typeof updateData.faqs === "string") updateData.faqs = JSON.parse(updateData.faqs);
    if (typeof updateData.seo === "string") updateData.seo = JSON.parse(updateData.seo);

    // Image Upload
    if (req.file) {
      const folder = "cms_pap";
      const uploadedUrl = await uploadToCloudinary(req.file.path, folder);
      if (!updateData.hero) updateData.hero = {};
      updateData.hero.imageUrl = uploadedUrl;
    }

    Object.assign(page, updateData);
    await page.save();

    res.status(200).json({ success: true, message: "Page updated successfully", data: page });
  } catch (err) {
    next(err);
  }
};
