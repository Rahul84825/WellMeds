import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Molecule } from "../models/Molecule.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";

// Resolve DNS SRV issues on IPv6-preferred networks
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

// Load environment variables
dotenv.config();

const generateContent = (product) => {
  const categoryName = product.category?.name || "Healthcare";
  const brandName = product.brand || "WellMeds Alliance";
  const productName = product.name || "Medicine";
  const molecules = product.molecules || [];
  const moleculeNames = molecules.map(m => m.name);
  const moleculeString = moleculeNames.join(" and ");

  // Determine flags
  const isWellness = product.productType === "wellness" || ["Vitamins", "Supplements", "Personal Care"].includes(categoryName);
  const isDevice = categoryName === "Medical Devices" || productName.toLowerCase().includes("thermometer") || productName.toLowerCase().includes("monitor") || productName.toLowerCase().includes("device");
  const isFirstAid = categoryName === "First Aid" || productName.toLowerCase().includes("kit") || productName.toLowerCase().includes("bandage") || productName.toLowerCase().includes("mask");
  const isPrescription = product.requiresRx;

  // Determine if imported
  const isImported = (product.badge && product.badge.toLowerCase().includes("imported")) ||
                     (product.name && product.name.toLowerCase().includes("imported")) ||
                     (product.description && product.description.toLowerCase().includes("imported")) ||
                     (product.specifications && product.specifications.some(s => s.label.toLowerCase().includes("origin") && !s.value.toLowerCase().includes("india")));

  // 1. Introduction Paragraphs (3 to 5 paragraphs)
  const introParagraphs = [];
  if (isDevice) {
    introParagraphs.push(
      `${productName} is a clinical-grade medical device developed by ${brandName} to support accurate home and professional healthcare monitoring. This device is engineered with precision sensors to provide fast, reliable measurements, assisting users in tracking essential vital health parameters.`
    );
    introParagraphs.push(
      `Health practitioners recommend ${productName} for daily monitoring to identify early signs of physiological fluctuations and prevent serious health complications. At WellMeds, we ensure that every medical device undergoes comprehensive calibration checks and meets strict safety certifications before reaching you.`
    );
    introParagraphs.push(
      `Whether you are managing a chronic health condition or maintaining a general wellness routine, this device offers user-friendly controls, easy-to-read displays, and long-term durability. Utilizing this device daily can help you and your physician make informed therapeutic decisions.`
    );
  } else if (isWellness) {
    introParagraphs.push(
      `${productName} is a premium daily wellness formulation created by ${brandName} to enrich your body with vital elements and support overall physiological equilibrium. Crafted with high-bioavailability ingredients, it helps fill nutritional gaps and enhances systemic vigor.`
    );
    introParagraphs.push(
      `This wellness support is recommended for individuals seeking to strengthen their body's natural defense systems, optimize cellular energy production, and improve daily cognitive and physical resilience. WellMeds naturally delivers this premium wellness product directly to your home with guaranteed quality.`
    );
    if (moleculeString) {
      introParagraphs.push(
        `Formulated with ${moleculeString} as key active components, ${productName} acts synergistically to nourish tissues, combat oxidative stress, and assist in metabolic processes, contributing to sustained health over time.`
      );
    } else {
      introParagraphs.push(
        `Through a carefully balanced mixture of natural extracts and pure nutrients, this product offers long-term nourishment, helping you maintain a high level of physical vitality and daily focus.`
      );
    }
  } else {
    // Standard Medicine (Prescription or OTC)
    const rxText = isPrescription ? "under the strict guidance of a certified healthcare provider" : "as a convenient over-the-counter therapy for clinical relief";
    introParagraphs.push(
      `${productName} is a high-efficacy pharmaceutical formulation manufactured by ${brandName} and indicated for the therapeutic management of symptoms related to ${categoryName}. It is designed to be taken ${rxText}.`
    );
    if (moleculeString) {
      introParagraphs.push(
        `Containing the active chemical agent ${moleculeString}, this medicine works by targeting the biological pathways responsible for the disease or discomfort, helping restore optimal metabolic and systemic functions.`
      );
    } else {
      introParagraphs.push(
        `This medicine operates on specific physiological receptors to alleviate symptoms, reduce discomfort, and prevent the recurrence of underlying health complications, promoting a rapid return to health.`
      );
    }
    introParagraphs.push(
      `Doctors prescribe ${productName} for conditions requiring precise dosage control and proven bio-equivalence. WellMeds provides this authentic medicine with rigorous cold-chain shipping and verified pharmacy standards to ensure maximum therapeutic potency.`
    );
  }

  if (isImported) {
    introParagraphs.push(
      `As an imported product of international provenance, ${productName} has undergone extensive international clinical trials and holds quality certifications from top global regulatory authorities, ensuring world-class safety and performance.`
    );
  }

  // 2. Uses (5 to 10 bullets)
  const usesBullets = [];
  if (isDevice) {
    usesBullets.push("High-precision measurement of vital physiological signs");
    usesBullets.push("Non-invasive monitoring suitable for home or clinical environments");
    usesBullets.push("Tracking health changes over time to assist in clinical diagnosis");
    usesBullets.push("Preventative screening for sudden fluctuations in body metrics");
    usesBullets.push("Facilitating remote patient monitoring and telemedicine consults");
    usesBullets.push("Providing quick and easy-to-understand readings for family care");
  } else if (isWellness) {
    usesBullets.push("Daily nutritional support to augment dietary intake");
    usesBullets.push("Promoting natural immune response and immune cellular activity");
    usesBullets.push("Aiding in metabolic processes and cellular energy production");
    usesBullets.push("Enhancing overall physical stamina, vitality, and reducing fatigue");
    usesBullets.push("Supporting cognitive balance, mental clarity, and focus");
    usesBullets.push("Providing protective antioxidant support against free radical damage");
  } else {
    usesBullets.push(`Management of symptoms associated with ${categoryName} disorders`);
    if (moleculeString) {
      usesBullets.push(`Targeted clinical action mediated by ${moleculeString}`);
    }
    usesBullets.push("Reduction of acute and chronic physiological discomfort");
    usesBullets.push("Prevention of disease progression and secondary complications");
    usesBullets.push("Restoring physiological balance and systemic harmony");
    usesBullets.push("Supporting standard clinical protocols for long-term recovery");
  }

  // 3. How It Works (2 to 4 paragraphs)
  const howItWorksParagraphs = [];
  if (isDevice) {
    howItWorksParagraphs.push(
      `${productName} utilizes advanced bio-sensing technology to capture physical signals from the body. These signals (such as arterial pulse waves, infrared radiation, or bio-impedance) are registered by high-sensitivity sensors.`
    );
    howItWorksParagraphs.push(
      `Once captured, the integrated clinical microprocessors process these raw signals using calibrated medical-grade algorithms. The device filters out physical noise and motion artifacts to display a clean, accurate measurement on the digital interface within seconds.`
    );
  } else if (isWellness) {
    howItWorksParagraphs.push(
      `${productName} operates by delivering a balanced matrix of micro-nutrients and active compounds that serve as essential cofactors in physiological pathways. ${moleculeString ? `Specifically, ${moleculeString} replenishes cellular stores to assist in biochemical processes.` : "These compounds are rapidly absorbed in the digestive tract to provide systemic support."}`
    );
    howItWorksParagraphs.push(
      `These nutrients work at the mitochondrial level to optimize cellular respiration, strengthen cell membranes, and neutralize harmful free radicals. Consistent use ensures that tissue cells have adequate building blocks to repair and defend themselves.`
    );
  } else {
    howItWorksParagraphs.push(
      `${productName} works systemically by absorbing into the bloodstream and binding to specific cell receptors or enzymes. ${moleculeString ? `The active constituent ${moleculeString} acts as a selective inhibitor or agonist, regulating chemical messengers in the body.` : "This binding action modifies the biological signals that cause the symptoms."}`
    );
    howItWorksParagraphs.push(
      `By correcting these biochemical pathways, the medicine reduces inflammation, relaxes vascular muscles, or kills pathogenic micro-organisms depending on its class. This targeted response allows the body to initiate its natural healing process without further aggravation.`
    );
  }

  // 4. Drug Interactions (list of strings)
  const drugInteractions = [
    "Alcohol: Consuming alcohol while using this product may increase drowsiness, dizziness, or worsen gastrointestinal side effects. It is strongly advised to limit or avoid alcohol.",
    "Blood Thinners: Use with extreme caution if you are concurrently taking anticoagulants (like warfarin or daily aspirin) due to potential bleeding risks. Consult your physician.",
    "Antacids & Supplements: Certain mineral supplements or antacids may bind to this product and significantly reduce its absorption. Space dosages by at least 2 hours.",
    "Concurrent Medications: Inform your doctor or WellMeds pharmacist about all prescription, OTC, herbal, and vitamin products you are currently taking before starting therapy."
  ];
  if (moleculeString) {
    drugInteractions.unshift(`Molecules Alert: Specific interaction risk exists with other drugs containing ${moleculeString} or matching therapeutic categories to avoid accidental double-dosing.`);
  }

  // 5. Storage Conditions (list of strings)
  const storageConditions = [
    "Store below 25°C or 30°C in a cool, dry place.",
    "Keep the container tightly closed to protect the product from moisture and atmospheric humidity.",
    "Protect from direct sunlight, extreme heat, and freezing conditions.",
    "Keep safely out of the reach of children and domestic pets."
  ];

  // 6. How To Use (list of strings for usageInstructions)
  const usageInstructions = [];
  if (isDevice) {
    usageInstructions.push("Read the user manual thoroughly before operating the device.");
    usageInstructions.push("Ensure you rest quietly in a seated position for at least 5 minutes before taking measurements.");
    usageInstructions.push("Place the sensor or cuff exactly as illustrated in the guide, keeping it at heart level.");
    usageInstructions.push("Remain still and quiet during the measurement cycle.");
    usageInstructions.push("Clean the sensor or contact surface with a soft, dry cloth after each use.");
  } else if (isWellness) {
    usageInstructions.push("Take one dose daily, preferably in the morning with a meal to enhance absorption.");
    usageInstructions.push("Swallow whole with a full glass of water. Do not crush or chew.");
    usageInstructions.push("Maintain a consistent schedule to get the maximum wellness benefit.");
    usageInstructions.push("Do not exceed the recommended daily serving size unless advised by a nutritionist or doctor.");
  } else {
    usageInstructions.push("Take this medicine exactly in the dose and duration prescribed by your physician.");
    usageInstructions.push("Swallow the tablet or capsule whole with water. Do not break, crush, or chew it.");
    usageInstructions.push("It is recommended to take it after meals to prevent gastric irritation, unless instructed otherwise.");
    usageInstructions.push("Complete the full course of treatment even if you begin to feel better.");
  }

  // 7. Safety Advice (array of cards)
  const safetyCards = [
    {
      icon: "Pregnancy",
      title: "Pregnancy",
      status: isWellness || isDevice ? "Use With Caution" : "Consult Doctor",
      description: isDevice ? "Perfectly safe to monitor health, but consult a doctor if measurements indicate abnormal readings." : "Use during pregnancy only if specifically prescribed by your doctor. The benefits must outweigh potential fetal risks."
    },
    {
      icon: "Breastfeeding",
      title: "Breastfeeding",
      status: isWellness || isDevice ? "Use With Caution" : "Consult Doctor",
      description: isDevice ? "Non-invasive and safe to use while nursing." : "Active metabolites may pass into breast milk. Consult your doctor before using while breastfeeding."
    },
    {
      icon: "Alcohol",
      title: "Alcohol",
      status: isWellness || isDevice ? "Use With Caution" : "Unsafe",
      description: isDevice ? "Alcohol intake does not interfere with the device, but may skew physiological readings like heart rate." : "Avoid alcohol. Combining alcohol with this medicine increases risk of liver stress, severe drowsiness, or stomach bleeding."
    },
    {
      icon: "Driving",
      title: "Driving",
      status: isWellness || isDevice ? "Safe" : "Use With Caution",
      description: isWellness || isDevice ? "Does not impact focus, coordination, or driving abilities." : "This medicine may cause drowsiness or dizziness. Avoid driving or operating machinery if you experience these symptoms."
    },
    {
      icon: "Kidney",
      title: "Kidney",
      status: isWellness || isDevice ? "Safe" : "Use With Caution",
      description: isDevice ? "Has no effect on renal function." : "Use with caution if you have moderate-to-severe renal impairment. Dosage adjustments may be required by your doctor."
    },
    {
      icon: "Liver",
      title: "Liver",
      status: isWellness || isDevice ? "Use With Caution" : "Consult Doctor",
      description: isDevice ? "Has no systemic effect on liver enzymes." : "Avoid use or consult doctor if you have severe hepatic disease, as it may cause accumulation and toxicity."
    }
  ];

  // 8. Side Effects (list of strings)
  const sideEffects = [];
  if (isDevice) {
    sideEffects.push("Common: Temporary skin indentation or redness from cuff compression.");
    sideEffects.push("Less Common: Minor localized skin itching from sensor materials.");
    sideEffects.push("Serious: None reported under standard, non-defective usage conditions.");
    sideEffects.push("Consultation: Discontinue device usage and consult your doctor if skin irritation persists.");
  } else if (isWellness) {
    sideEffects.push("Common: Mild bloating, stomach discomfort, or temporary change in urine color.");
    sideEffects.push("Less Common: Mild skin flushing, metallic taste, or mild headache.");
    sideEffects.push("Serious: Severe allergic reactions, hives, or swelling of face and hands.");
    sideEffects.push("Consultation: Consult your healthcare provider if mild side effects persist for more than a week.");
  } else {
    sideEffects.push("Common: Nausea, mild headache, dizziness, fatigue, or dry mouth.");
    sideEffects.push("Less Common: Indigestion, mild skin rash, or temporary sleep disturbances.");
    sideEffects.push("Serious (Seek Immediate Emergency Care): Unusual bleeding or bruising, severe abdominal pain, yellowing of eyes/skin, breathing difficulties.");
    sideEffects.push("Consultation: Contact your doctor immediately if you experience any serious side effects or if common side effects worsen.");
  }

  // 9. FAQs (6 to 10 FAQs)
  const faqs = [];
  if (isDevice) {
    faqs.push({ question: `How accurate is the ${productName}?`, answer: "This device is clinically calibrated for high precision. For best results, follow the cuff placement and posture guidelines in the user manual." });
    faqs.push({ question: "How often should I calibrate the device?", answer: "We recommend professional calibration once every 12 to 24 months to maintain clinical accuracy." });
    faqs.push({ question: "Does it come with a warranty?", answer: "Yes, this device includes a standard manufacturer warranty. Please preserve your WellMeds purchase invoice for warranty claims." });
    faqs.push({ question: "Can multiple users store their data?", answer: "Most digital models support memory tracking for multiple user profiles. Refer to your model's user guide for profile setup." });
    faqs.push({ question: "What should I do if I get an error message?", answer: "Ensure the cuff/sensor is placed correctly, check the batteries, remain completely still, and try the measurement again." });
    faqs.push({ question: "Is it battery-operated or rechargeable?", answer: "This device runs on standard AAA/AA batteries or an external DC adapter depending on the specific model specifications." });
  } else if (isWellness) {
    faqs.push({ question: `Is ${productName} safe for daily use?`, answer: "Yes, it is formulated as a daily dietary support. Always stick to the recommended daily dosage." });
    faqs.push({ question: "Can I take this supplement with prescription medicines?", answer: "While generally safe, please consult your doctor to ensure that the active vitamins or minerals do not interact with your prescriptions." });
    faqs.push({ question: "When is the best time of day to take this?", answer: "We recommend taking it in the morning with breakfast to maximize absorption and support your energy levels throughout the day." });
    faqs.push({ question: "Is it suitable for vegetarians?", answer: "Please verify the composition details on the label. Most of our capsule shells and ingredients are vegetable-sourced." });
    faqs.push({ question: "How long does it take to see results?", answer: "Nutritional supplements act gradually. Users typically report improvements in energy, sleep quality, or immunity within 2 to 4 weeks of consistent use." });
    faqs.push({ question: "Can children take this supplement?", answer: "This product is formulated for adults. Keep out of reach of children and consult a pediatrician before giving supplements to minors." });
  } else {
    faqs.push({ question: `What is ${productName} primarily used for?`, answer: `It is clinically indicated for the management and treatment of symptoms related to ${categoryName} and corresponding underlying conditions.` });
    faqs.push({ question: "Can I take this medicine daily?", answer: "You should take it daily exactly as prescribed by your physician for the full duration of the therapy." });
    faqs.push({ question: "Can I consume alcohol while taking it?", answer: "No, alcohol must be avoided as it can interact with the medicine, leading to severe liver stress, drowsiness, or blood pressure drops." });
    faqs.push({ question: "What should I do if I miss a dose?", answer: "Take the missed dose as soon as you remember. If it is almost time for the next dose, skip the missed dose. Do not double the dose to make up." });
    faqs.push({ question: "Can I stop taking it suddenly?", answer: "No, stopping this medication abruptly can cause a relapse or worsening of your condition. Always consult your doctor before stopping." });
    faqs.push({ question: "Should I take it before or after food?", answer: "It is generally best taken after a meal with water to protect your stomach lining and enhance absorption, unless specified otherwise by your doctor." });
    faqs.push({ question: "Is it safe during pregnancy?", answer: "No, it is not recommended unless specifically prescribed by your doctor. Consult your obstetrician before taking this medicine." });
  }

  // 10. References
  const references = [
    "World Health Organization (WHO) Guidelines for Therapeutic Care.",
    "U.S. Food and Drug Administration (FDA) Approved Product Database.",
    "National Institutes of Health (NIH) Clinical Reference Library.",
    "Central Drugs Standard Control Organisation (CDSCO), Ministry of Health, India.",
    "Indian Pharmacopoeia Commission (IPC) Monographs."
  ];

  // 11. Disclaimer
  const disclaimer = "The information provided on WellMeds is intended for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider before starting or stopping any medication.";

  return {
    introParagraphs,
    usesBullets,
    howItWorksParagraphs,
    drugInteractions,
    storageConditions,
    usageInstructions,
    safetyCards,
    sideEffects,
    faqs,
    references,
    disclaimer
  };
};

const seedProductInformation = async () => {
  try {
    console.log("Connecting to MongoDB database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected. Scanning products...");

    const products = await Product.find()
      .populate("category")
      .populate("molecules")
      .populate("specialities");

    console.log(`Found ${products.length} products to evaluate.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const product of products) {
      try {
        const hasSection = (title) => product.medicalSections && product.medicalSections.some(s => s.title.toLowerCase() === title.toLowerCase());
        
        // Generate content contextually
        const generated = generateContent(product);

        let needsSave = false;

        // Ensure medicalSections exists
        if (!product.medicalSections) {
          product.medicalSections = [];
        }

        // Introduction / Overview
        if (!hasSection("Overview") && !hasSection("Introduction")) {
          const content = generated.introParagraphs.join("\n\n");
          product.medicalSections.push({ title: "Overview", content });
          needsSave = true;
        }

        // Uses
        if (!hasSection("Uses")) {
          const content = generated.usesBullets.map(b => `• ${b}`).join("\n");
          product.medicalSections.push({ title: "Uses", content });
          needsSave = true;
        }

        // How It Works
        if (!hasSection("How It Works")) {
          const content = generated.howItWorksParagraphs.join("\n\n");
          product.medicalSections.push({ title: "How It Works", content });
          needsSave = true;
        }

        // Drug Interactions
        if (!hasSection("Drug Interactions")) {
          const content = generated.drugInteractions.map(i => `• ${i}`).join("\n");
          product.medicalSections.push({ title: "Drug Interactions", content });
          needsSave = true;
        }

        // Storage Conditions
        if (!hasSection("Storage Conditions") && !hasSection("Storage Instructions")) {
          const content = generated.storageConditions.map(s => `• ${s}`).join("\n");
          product.medicalSections.push({ title: "Storage Conditions", content });
          needsSave = true;
        }

        // How To Use / usageInstructions
        if (!product.usageInstructions || product.usageInstructions.length === 0) {
          product.usageInstructions = generated.usageInstructions;
          needsSave = true;
        }

        // Safety Advice / safetyCards
        if (!product.safetyCards || product.safetyCards.length === 0) {
          product.safetyCards = generated.safetyCards;
          needsSave = true;
        }

        // Side Effects
        if (!product.sideEffects || product.sideEffects.length === 0) {
          product.sideEffects = generated.sideEffects;
          needsSave = true;
        }

        // FAQs
        if (!product.faqs || product.faqs.length === 0) {
          product.faqs = generated.faqs;
          needsSave = true;
        }

        // References
        if (!product.references || product.references.length === 0) {
          product.references = generated.references;
          needsSave = true;
        }

        // Medical Disclaimer
        if (!hasSection("Medical Disclaimer") && !hasSection("Disclaimer")) {
          product.medicalSections.push({ title: "Medical Disclaimer", content: generated.disclaimer });
          needsSave = true;
        }

        // Also set description if empty
        if (!product.description) {
          product.description = generated.introParagraphs[0];
          needsSave = true;
        }

        if (needsSave) {
          await product.save();
          console.log(`Updated ${product.name}`);
          updatedCount++;
        } else {
          console.log(`Skipped ${product.name}`);
          skippedCount++;
        }
      } catch (err) {
        console.error(`Failed ${product.name}:`, err.message);
        failedCount++;
      }
    }

    console.log(`Completed ${updatedCount + skippedCount} Products`);
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  }
};

seedProductInformation();
