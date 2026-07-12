import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { User } from "./src/models/User.js";
import { Product } from "./src/models/Product.js";
import { Category } from "./src/models/Category.js";
import { Order } from "./src/models/Order.js";
import { Coupon } from "./src/models/Coupon.js";
import { Molecule } from "./src/models/Molecule.js";
import { SurgicalCategory } from "./src/models/SurgicalCategory.js";
import slugify from "slugify";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from "./src/config/initialData.js";

// Resolve DNS SRV issues on IPv6-preferred networks
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

dotenv.config();

const seedDB = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected. Cleaning collections...");

    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();
    await Molecule.deleteMany();
    await SurgicalCategory.deleteMany();

    console.log("Creating default Admin user...");
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    await User.create({
      name: "WellMeds Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      authProvider: "local",
      isVerified: true,
    });
    console.log(`Admin account created: ${adminEmail} / ${adminPassword}`);

    console.log("Seeding categories...");
    const categoryMap = {};
    for (const cat of INITIAL_CATEGORIES) {
      const createdCat = await Category.create({
        ...cat,
        slug: slugify(cat.name, { lower: true })
      });
      categoryMap[cat.name] = createdCat._id;
    }
    console.log("Categories seeded.");

    console.log("Seeding molecules...");
    const seededMolecules = await Molecule.create([
      {
        name: "Paracetamol",
        slug: "paracetamol",
        aliases: ["Acetaminophen", "APAP"],
        shortDescription: "A widely used over-the-counter pain reliever and fever reducer.",
        description: "Paracetamol (acetaminophen) is a pain reliever and a fever reducer. The exact mechanism of action of is not fully known. Paracetamol is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
        uses: "Temporary relief of mild to moderate pain such as headache, toothache, muscle aches, or cold symptoms. It also helps reduce fever.",
        benefits: "Gentle on the stomach compared to NSAIDs, rapidly absorbed, and highly effective for temperature control.",
        howItWorks: "It is believed to act primarily in the brain to block the chemical messengers that signal pain, and to act on the hypothalamic heat-regulating center to reduce fever.",
        dosage: "Adults: 500mg to 1000mg every 4 to 6 hours as needed. Do not exceed 4000mg in 24 hours.",
        sideEffects: "Rare when taken as directed. Large doses can cause severe liver damage. Alert your doctor if you experience itching, swelling, or rash.",
        warnings: "Severe liver damage may occur if you take more than the maximum daily amount, take it with other drugs containing paracetamol, or consume 3 or more alcoholic drinks daily while using this product.",
        precautions: "Consult your doctor if you have kidney/liver disease or a history of alcoholism.",
        storage: "Store at room temperature away from direct sunlight and moisture. Keep out of reach of children.",
        letter: "P",
        isActive: true,
        faqs: [
          { question: "Is paracetamol safe for pregnant women?", answer: "Paracetamol is generally considered the first-choice painkiller for pregnant women when used at the lowest effective dose for the shortest time." },
          { question: "Can I take paracetamol with ibuprofen?", answer: "Yes, you can take paracetamol and ibuprofen together as they work differently. However, always confirm doses and check if your other medicines contain either ingredient." }
        ],
        references: ["World Health Organization Guidelines on Pain Management", "FDA Drug Safety Communication on Acetaminophen"]
      },
      {
        name: "Aspirin",
        slug: "aspirin",
        aliases: ["Acetylsalicylic Acid", "ASA"],
        shortDescription: "A nonsteroidal anti-inflammatory drug used to reduce pain, fever, and cardiovascular risks.",
        description: "Aspirin, also known as acetylsalicylic acid, is a salicylate medication used to reduce pain, fever, and inflammation, and as an antithrombotic agent.",
        uses: "Pain relief, reduction of swelling, and daily low-dose preventative therapy for individuals at risk of heart attack or stroke.",
        benefits: "Acts as a blood thinner to prevent clots, treats pain and swelling, and reduces risk of cardiovascular events.",
        howItWorks: "It inhibits cyclooxygenase (COX) enzymes, preventing the synthesis of prostaglandins and thromboxanes, which trigger inflammation and platelet aggregation.",
        dosage: "Pain/Fever: 325mg to 650mg every 4 hours. Low-dose cardiovascular prevention: 75mg to 81mg once daily.",
        sideEffects: "Stomach irritation, nausea, and increased bleeding risks.",
        warnings: "Do not give to children or teenagers with fever, flu symptoms, or chickenpox due to the risk of Reye's syndrome.",
        precautions: "Avoid if you have bleeding disorders, stomach ulcers, or asthma sensitive to NSAIDs.",
        storage: "Keep in a cool, dry place. Keep bottle tightly closed.",
        letter: "A",
        isActive: true,
        faqs: [
          { question: "Why is low-dose aspirin prescribed?", answer: "Low-dose aspirin (81mg) is prescribed to reduce the risk of blood clots forming in the arteries, thereby lowering the risk of heart attacks and strokes." }
        ],
        references: ["American Heart Association Aspirin Guidelines"]
      },
      {
        name: "Amoxicillin",
        slug: "amoxicillin",
        aliases: ["Amoxil", "Moxatag"],
        shortDescription: "A penicillin-type antibiotic used to treat a wide variety of bacterial infections.",
        description: "Amoxicillin is a moderate-spectrum, bacteriolytic, beta-lactam antibiotic used to treat bacterial infections caused by susceptible microorganisms.",
        uses: "Treatment of infections of the ear, nose, throat, urinary tract, and skin, and infections like pneumonia or bronchitis.",
        benefits: "Broad efficacy against common bacteria, well-tolerated in pediatric patients, and acid-stable.",
        howItWorks: "It works by binding to penicillin-binding proteins inside the bacterial cell wall, inhibiting cell wall synthesis and causing bacterial cell lysis.",
        dosage: "Usually 250mg to 500mg every 8 hours, or 500mg to 875mg every 12 hours depending on severity.",
        sideEffects: "Nausea, vomiting, diarrhea, or mild skin rash.",
        warnings: "Must complete the full prescribed course even if symptoms disappear. Failure to do so may lead to antibiotic resistance.",
        precautions: "Do not use if you have a known allergy to penicillin or cephalosporin antibiotics.",
        storage: "Store capsules at room temperature. Liquid suspensions should ideally be refrigerated.",
        letter: "A",
        isActive: true,
        faqs: [
          { question: "Is amoxicillin effective against the common cold?", answer: "No. Amoxicillin is an antibiotic and only kills bacteria. It is completely ineffective against viruses, which cause colds, flu, and most coughs." }
        ],
        references: ["CDC Guidelines on Antibiotic Stewardship", "FDA Prescribing Information for Amoxicillin"]
      },
      {
        name: "Cetirizine",
        slug: "cetirizine",
        aliases: ["Zyrtec", "Reactine"],
        shortDescription: "A second-generation antihistamine used to relieve allergy symptoms.",
        description: "Cetirizine is a second-generation antihistamine that reduces the natural chemical histamine in the body. Histamine can produce symptoms of sneezing, itching, watery eyes, and runny nose.",
        uses: "Relief of seasonal and perennial allergic rhinitis symptoms, and treatment of uncomplicated skin manifestations of chronic urticaria.",
        benefits: "Provides 24-hour relief, is less sedating than first-generation antihistamines, and has a rapid onset of action.",
        howItWorks: "It selectively blocks peripheral H1 histamine receptors, preventing histamine from binding and triggering allergic responses.",
        dosage: "Adults: 5mg to 10mg once daily depending on symptom severity.",
        sideEffects: "Mild drowsiness, dry mouth, or fatigue.",
        warnings: "Use caution when driving or operating machinery. Avoid consuming alcohol while taking this medicine.",
        precautions: "Consult your doctor if you have kidney or liver impairment.",
        storage: "Store at room temperature in a dry place.",
        letter: "C",
        isActive: true,
        faqs: [
          { question: "Does cetirizine cause drowsiness?", answer: "Cetirizine is a second-generation antihistamine, which means it causes much less drowsiness than older antihistamines. However, some drowsiness can still occur in sensitive individuals." }
        ],
        references: ["NIH Allergen Therapeutics Guidelines"]
      }
    ]);
    console.log("Molecules seeded.");

    const moleculeMap = {};
    seededMolecules.forEach(m => {
      moleculeMap[m.name] = m._id;
    });

    // Establish molecule-to-molecule relationships
    await Molecule.updateOne(
      { name: "Paracetamol" },
      { $set: { relatedMolecules: [moleculeMap["Aspirin"]] } }
    );
    await Molecule.updateOne(
      { name: "Aspirin" },
      { $set: { relatedMolecules: [moleculeMap["Paracetamol"]] } }
    );

    console.log("Seeding products...");
    for (const prod of INITIAL_PRODUCTS) {
      const categoryId = categoryMap[prod.category];
      let linkedMolecules = [];
      
      // Associate molecules dynamically based on seeded names
      if (prod.name === "ChronicCare 500mg Tablets") {
        linkedMolecules = [moleculeMap["Paracetamol"]];
      } else if (prod.name === "Amoxicillin 500mg Capsules") {
        linkedMolecules = [moleculeMap["Amoxicillin"]];
      } else if (prod.name === "Aspirin 81mg") {
        linkedMolecules = [moleculeMap["Aspirin"]];
      } else if (prod.name === "Advanced Multi-Vitamin Complex") {
        linkedMolecules = [moleculeMap["Cetirizine"]];
      }

      const isWellness = ["Vitamins", "Supplements", "Personal Care"].includes(prod.category);
      await Product.create({
        ...prod,
        category: categoryId,
        molecules: linkedMolecules,
        slug: slugify(prod.name, { lower: true }),
        productType: isWellness ? "wellness" : "medicine"
      });
    }
    console.log("Products seeded.");

    console.log("Seeding coupons...");
    for (const coupon of INITIAL_COUPONS) {
      await Coupon.create(coupon);
    }
    console.log("Coupons seeded.");

    console.log("Seeding default surgical categories...");
    const defaultSurgCats = [
      { name: "Wheelchairs", slug: "wheelchairs", description: "Manual and electric wheelchairs for mobility support.", icon: "wheelchair", displayOrder: 1, isActive: true },
      { name: "Mobility Aids", slug: "mobility", description: "Walkers, canes, and crutches for assisting movement.", icon: "walking", displayOrder: 2, isActive: true },
      { name: "Hospital Beds", slug: "hospital-beds", description: "Adjustable hospital beds and accessories.", icon: "bed", displayOrder: 3, isActive: true },
      { name: "Respiratory Care", slug: "respiratory-care", description: "Oxygen concentrators, nebulizers, and CPAP machines.", icon: "lungs", displayOrder: 4, isActive: true },
      { name: "Orthopedic Supports", slug: "orthopedic-supports", description: "Braces, splints, and traction equipment.", icon: "bone", displayOrder: 5, isActive: true },
      { name: "Diagnostic Devices", slug: "diagnostic-devices", description: "Professional medical monitors and oximeters.", icon: "activity", displayOrder: 6, isActive: true }
    ];
    for (const cat of defaultSurgCats) {
      await SurgicalCategory.create(cat);
    }
    console.log("Surgical categories seeded.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
