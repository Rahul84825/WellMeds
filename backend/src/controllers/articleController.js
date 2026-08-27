import { Article } from "../models/Article.js";
import slugify from "slugify";

// Pre-defined seed dataset matching the user's curated articles
const INITIAL_ARTICLES = [
  {
    title: "Why Blood Thinners Need Careful, Ongoing Monitoring",
    slug: "why-blood-thinners-require-careful-ongoing-monitoring",
    category: "Medicine Guides",
    topic: "Anticoagulants",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-1",
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "The delicate balance anticoagulants manage in preventing clots while minimizing bleed risks, and why regular lab monitoring is non-negotiable.",
    content: `## The Role of Anticoagulants in Modern Medicine
Anticoagulants, commonly referred to as blood thinners, are life-saving medications prescribed for individuals at risk of blood clots, deep vein thrombosis (DVT), pulmonary embolism, or stroke associated with atrial fibrillation.

### Why Monitoring Is Vital
Unlike many standard daily medications, anticoagulants have a narrow therapeutic index:
- **Too low a dose:** The blood remains prone to clotting, increasing cardiovascular risks.
- **Too high a dose:** The risk of unexpected bleeding episodes increases substantially.

### Essential Safety Tips
1. **Never skip or double doses:** Always maintain a consistent time every single day.
2. **Watch for warning signs:** Red flags include unusual bruising, persistent nosebleeds, or dark stools.
3. **Notify your surgical team:** Always inform dentists or doctors before any invasive procedure.
4. **Maintain dietary consistency:** For medications like Warfarin, keep Vitamin K intake steady.`,
  },
  {
    title: "Understanding Insulin Types: Rapid, Short, and Long-Acting",
    slug: "understanding-insulin-types-rapid-short-and-long-acting",
    category: "Lifestyle",
    topic: "Diabetic Care",
    readTime: "6 min read",
    isFeatured: true,
    gradientClass: "slide-bg-2",
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Why insulin comes in distinct formulations, how each type works on your blood sugar, and how regimens are personalized for optimal control.",
    content: `## Navigating Different Insulin Formulations
Insulin is not a one-size-fits-all therapy. Modern endocrinology utilizes varying speeds and durations of insulin to replicate the natural physiological response of a healthy pancreas.

### The Three Core Types
- **Rapid-Acting Insulin:** Starts working within 15 minutes, peaks at 1 hour, and lasts 2 to 4 hours. Typically injected right before meals.
- **Short-Acting (Regular) Insulin:** Takes effect in 30 minutes, peaking at 2 to 3 hours, covering mealtime carbohydrate absorption.
- **Long-Acting / Basal Insulin:** Provides a steady background level of insulin for 18 to 24 hours, keeping fasting glucose stable.

### Storage & Injection Best Practices
- Keep unopened vials refrigerated between 2°C and 8°C.
- In-use pens or vials can remain at controlled room temperature for up to 28 days.
- Rotate injection sites (abdomen, thighs, upper arms) to prevent lipohypertrophy.`,
  },
  {
    title: "Understanding U=U: Undetectable Equals Untransmittable",
    slug: "understanding-uu-undetectable-equals-untransmittable",
    category: "Disease Awareness",
    topic: "HIV Care",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-3",
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "What U=U scientifically means, how undetectable viral loads are achieved, and why consistency in daily treatment is transformative.",
    content: `## The Breakthrough of U=U in HIV Care
Decades of robust clinical research (including the landmark PARTNER and Opposites Attract studies) have confirmed the scientific reality of **U=U**: *Undetectable = Untransmittable*.

### What It Means
When a person living with HIV adheres to modern Antiretroviral Therapy (ART) and maintains an undetectable viral load (fewer than 200 copies/mL) for at least 6 months, there is **zero risk** of sexually transmitting the virus to partners.

### Pillars of Sustained Viral Suppression
1. 100% daily adherence to prescribed antiretroviral regimens.
2. Routine viral load blood testing every 3 to 6 months.
3. Open, stigma-free dialogue with healthcare providers.`,
  },
  {
    title: "CPAP Machines: What to Check Before Buying One",
    slug: "cpap-machines-what-to-check-before-buying-one",
    category: "Health Guides",
    topic: "Equipment",
    readTime: "6 min read",
    isFeatured: true,
    gradientClass: "slide-bg-4",
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
    excerpt: "Key clinical and technical checkpoints to verify before investing in a CPAP or Auto-CPAP machine and mask interface.",
    content: `## Choosing the Right Sleep Apnea Equipment
Continuous Positive Airway Pressure (CPAP) therapy remains the gold standard for managing obstructive sleep apnea (OSA). Choosing the right device requires understanding a few core features.

### Key Factors to Evaluate
- **Fixed CPAP vs Auto-CPAP (APAP):** Auto-titrating devices adjust pressure dynamically throughout the night based on your breathing patterns.
- **Ramp Function:** Gently begins at a lower pressure, gradually increasing as you fall asleep.
- **Integrated Heated Humidifier:** Essential for preventing dry mouth and nasal congestion.
- **Mask Compatibility:** Whether you need a nasal pillow, nasal mask, or full-face mask depends on whether you breathe through your mouth.`,
  },
  {
    title: "Do You Actually Need a Multivitamin? A Balanced Look",
    slug: "do-you-actually-need-a-multivitamin-a-balanced-look",
    category: "Nutrition",
    topic: "Wellness",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-5",
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Who genuinely benefits from a daily multivitamin supplement, when whole foods suffice, and how to avoid micronutrient overload.",
    content: `## De-mystifying Daily Multivitamins
The global supplement market promotes multivitamins as an essential health insurance policy. However, clinical nutrition provides a much more nuanced perspective.

### Who Truly Benefits?
- **Pregnant and lactating women:** Folic acid, iron, and calcium supplementation are critical.
- **Older adults:** Decreased intrinsic factor reduces Vitamin B12 absorption; Vitamin D is also key.
- **Strict vegans/vegetarians:** Targeted Vitamin B12 and Vitamin D3 supplementation is necessary.
- **Individuals with malabsorption:** Conditions like celiac, Crohn's, or post-bariatric surgery.

### The Food-First Principle
Whole foods provide dietary fiber, phytonutrients, and synergistic co-factors that pills cannot replicate. Target a colourful plate before relying on tablets.`,
  },
  {
    title: "How to Read a Medicine Strip",
    slug: "how-to-read-a-medicine-strip",
    category: "Medicine Guides",
    topic: "General",
    readTime: "6 min read",
    excerpt: "A simple guide to understanding the generic name, strength, batch number, manufacturing date, and expiry printed on every strip.",
    content: `## Decode Your Prescription Strip
Every pharmaceutical blister strip carries vital regulatory and safety information that every patient should understand.

### What to Look For:
1. **Generic Name vs Brand Name:** The generic name represents the active chemical molecule (e.g., Paracetamol), while the brand name is the manufacturer's trademark.
2. **Strength/Dosage:** Specified in milligrams (mg) or micrograms (mcg) per unit.
3. **Red Line Warning:** In India, strips with a vertical red line indicate Schedule H / H1 drugs that require a registered medical practitioner's prescription.
4. **Batch & Expiry Date:** Always verify the 'EXP' date before consumption. Never consume medicines past the listed month.`,
  },
  {
    title: "Storing Medicines Safely at Home",
    slug: "storing-medicines-safely-at-home",
    category: "Health Guides",
    topic: "General",
    readTime: "5 min read",
    excerpt: "Heat, light, and humidity can quietly degrade how well your medicines work — here is how to store them right.",
    content: `## Safeguarding Medicine Potency
Improper storage conditions can cause medications to lose efficacy or break down into harmful sub-products before their stated expiration.

### Core Rules for Home Storage:
- **Avoid the bathroom cabinet:** Humidity and temperature fluctuations from showers degrade tablets.
- **Room temperature:** Store in a cool, dry, dark pantry away from direct sunlight (below 25°C).
- **Cold chain requirements:** Insulin, biologicals, and certain eye drops strictly require 2°C to 8°C in a central refrigerator shelf (never in the freezer).
- **Child-proof access:** Always store medicines out of reach and sight of young children.`,
  },
  {
    title: "Metformin: What You Should Know",
    slug: "metformin-guide",
    category: "Medicine Guides",
    topic: "Diabetic Care",
    readTime: "7 min read",
    excerpt: "Uses, dosage basics, common gastrointestinal side effects, and what to do if you miss a dose — explained simply.",
    content: `## The First-Line Type 2 Diabetes Therapy
Metformin is one of the safest, most thoroughly studied medications in modern history. It works primarily by reducing glucose production in the liver and improving cellular insulin sensitivity.

### Managing Gastrointestinal Side Effects
- Take Metformin with or immediately after meals to reduce stomach discomfort.
- Sustained-release (SR/ER) formulations significantly reduce nausea and diarrhea.
- Regular monitoring of Vitamin B12 levels is recommended for long-term users.`,
  },
  {
    title: "Understanding Hypertension",
    slug: "understanding-hypertension",
    category: "Disease Awareness",
    topic: "General",
    readTime: "6 min read",
    excerpt: "What high blood pressure actually means for your cardiovascular system, and why it is termed the 'silent' condition.",
    content: `## Why Blood Pressure Matters
Blood pressure measures the lateral force exerted by circulating blood against arterial walls. When this pressure remains persistently elevated, it causes micro-damage to vital organs.

### The Silent Nature of High BP
Hypertension rarely causes noticeable symptoms in its early stages. Without regular screenings, unmanaged high blood pressure can lead to myocardial infarction, stroke, kidney dysfunction, and vision impairment.`,
  },
  {
    title: "A Diabetes-Friendly Morning Routine",
    slug: "diabetes-friendly-morning-routine",
    category: "Lifestyle",
    topic: "Diabetic Care",
    readTime: "5 min read",
    excerpt: "Small, realistic habits — from your first glass of water to your breakfast composition — that help keep glucose levels steady.",
    content: `## Starting the Day with Stable Blood Sugar
The Dawn Phenomenon (a natural early-morning rise in hormones like cortisol and growth hormone) often causes blood sugar spikes upon waking.

### High-Impact Morning Habits
- **Hydrate immediately:** Drink 1-2 glasses of plain water to aid kidney filtration.
- **Prioritize protein & fiber:** Choose eggs, sprouts, paneer, or whole oats over high-glycemic fruit juices or sweetened cereals.
- **Post-breakfast stroll:** A 10-15 minute gentle walk utilizes muscular contractions to absorb glucose without requiring extra insulin.`,
  },
  {
    title: "Iron-Rich Foods Worth Adding to Your Plate",
    slug: "iron-rich-foods",
    category: "Nutrition",
    topic: "Anemia Care",
    readTime: "4 min read",
    excerpt: "Everyday dietary staples — from lentils and green leafy vegetables to seeds — that help naturally support optimal hemoglobin.",
    content: `## Boosting Iron Absorption
Iron is essential for synthesizing hemoglobin, the red blood cell protein that carries oxygen throughout the body.

### Heme vs Non-Heme Iron
- **Heme Iron:** Found in animal products, highly absorbable (15-35%).
- **Non-Heme Iron:** Found in plant sources like spinach, lentils, chickpeas, pumpkin seeds, and jaggery (absorption rate 2-20%).
- **Pro Tip:** Always pair non-heme iron foods with Vitamin C (lemon juice, tomatoes, bell peppers) to boost absorption by up to 300%. Avoid tea or coffee within 1 hour of meals.`,
  },
  {
    title: "What Chemotherapy Actually Does to Your Body",
    slug: "what-chemotherapy-actually-does-to-your-body",
    category: "Disease Awareness",
    topic: "Cancer Care",
    readTime: "7 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "How systemic chemotherapy targets fast-growing cells, and why that mechanism shapes both its clinical power and side-effect profile.",
    content: `## The Science of Chemotherapy
Chemotherapy utilizes powerful cytotoxic drugs that disrupt the rapid cell-division cycle characteristic of malignant cancer cells.

### Why Side Effects Occur
Because chemotherapy travels throughout the entire body, it also affects healthy, rapidly dividing cells such as hair follicles, bone marrow cells, and the lining of the digestive tract. Modern supportive care medications (like 5-HT3 antagonists for nausea and G-CSF for white blood cells) make today's treatments vastly more manageable.`,
  },
  {
    title: "Understanding Cancer Staging: What Stage 1 to 4 Really Means",
    slug: "understanding-cancer-staging-what-stage-1-to-4-really-means",
    category: "Disease Awareness",
    topic: "Cancer Care",
    readTime: "6 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "A plain-language clinical guide to what cancer staging tells your oncology team, and what it does not.",
    content: `## Demystifying TNM and Numerical Stages
Cancer staging standardizes how oncology teams assess the anatomical extent of a tumor to create personalized treatment protocols.

- **Stage 1:** Localized tumor confined to the organ of origin.
- **Stage 2 & 3:** Regional spread to adjacent tissues or regional lymph nodes.
- **Stage 4 (Metastatic):** Spread to distant organs (e.g. liver, lungs, bones). Advanced targeted therapies and immunotherapies are continuing to transform long-term outcomes in Stage 4 care.`,
  },
  {
    title: "Nutrition During Cancer Treatment: What Actually Helps",
    slug: "nutrition-during-cancer-treatment-what-actually-helps",
    category: "Disease Awareness",
    topic: "Cancer Care",
    readTime: "6 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Practical, realistic eating strategies for when taste alterations, nausea, and appetite loss occur during active therapies.",
    content: `## Nourishing the Body Through Oncology Protocols
Maintaining lean muscle mass and caloric intake during cancer therapy directly correlates with treatment tolerance and recovery.

### Practical Tips:
- Eat small, calorie-dense mini-meals every 2-3 hours instead of large heavy plates.
- Use plastic or ceramic utensils if metallic taste changes occur.
- Stay consistently hydrated with oral rehydration solutions, clear broths, and coconut water.`,
  },
  {
    title: "Biosimilars in Cancer Care: What They Are and Why They Matter",
    slug: "biosimilars-in-cancer-care-what-they-are-and-why-they-matter",
    category: "Disease Awareness",
    topic: "Cancer Care",
    readTime: "6 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "What a biosimilar biological medicine actually is, and how it expands affordable access to cutting-edge oncology care.",
    content: `## Affordable Innovation in Biologics
Biologics are complex medicines produced in living cell systems (such as monoclonal antibodies like Trastuzumab or Rituximab). A **biosimilar** is a biological product shown to have no clinically meaningful difference in safety, purity, and potency compared to the originator reference product.`,
  },
  {
    title: "A Simple Guide to Antiretroviral Therapy (ART)",
    slug: "a-simple-guide-to-antiretroviral-therapy-art",
    category: "Disease Awareness",
    topic: "HIV Care",
    readTime: "6 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "What ART regimens accomplish, why daily dosing timing matters, and how modern single-tablet regimens simplify management.",
    content: `## How ART Protects Your Immune Defense
Antiretroviral therapy combines multiple drug classes to inhibit HIV at various stages of its replication cycle, allowing CD4 cells to rebound and the immune system to rebuild.`,
  },
  {
    title: "Hepatitis B vs Hepatitis C: Key Differences Explained",
    slug: "hepatitis-b-vs-hepatitis-c-key-differences-explained",
    category: "Disease Awareness",
    topic: "Hepatitis",
    readTime: "6 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "How each virus spreads, how each is managed or cured, and why early serological screening matters for long-term liver health.",
    content: `## Protecting Hepatic Health
Both Hepatitis B (HBV) and Hepatitis C (HCV) cause liver inflammation, but their medical management differs substantially.

- **Hepatitis B:** Has an effective preventive vaccine. Chronic cases are managed with daily antiviral suppressive therapies (e.g., Tenofovir, Entecavir).
- **Hepatitis C:** No vaccine is currently available, but modern Direct-Acting Antivirals (DAAs) provide a complete cure in over 95% of patients with an 8-to-12-week oral regimen.`,
  },
  {
    title: "Osteoarthritis vs Rheumatoid Arthritis: What's the Difference",
    slug: "osteoarthritis-vs-rheumatoid-arthritis-whats-the-difference",
    category: "Disease Awareness",
    topic: "Arthritis",
    readTime: "6 min read",
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
    excerpt: "Two distinct joint conditions that share a common name — mechanical wear vs autoimmune inflammation.",
    content: `## Understanding Joint Pain Causes
- **Osteoarthritis (OA):** A degenerative wear-and-tear condition where joint cartilage wears down over time, typically worsening with activity.
- **Rheumatoid Arthritis (RA):** An autoimmune disorder where the immune system attacks the synovium lining joints, characterized by symmetrical joint swelling and prolonged morning stiffness.`,
  },
  {
    title: "Understanding DMARDs: The Medicines That Change Arthritis Outcomes",
    slug: "understanding-dmards-the-medicines-that-change-arthritis-outcomes",
    category: "Disease Awareness",
    topic: "Arthritis",
    readTime: "6 min read",
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
    excerpt: "How disease-modifying antirheumatic drugs work to halt disease progression rather than just masking symptoms.",
    content: `## Beyond Simple Pain Relief
Traditional painkillers (NSAIDs) only temporarily reduce symptoms. Disease-Modifying Anti-Rheumatic Drugs (DMARDs, like Methotrexate and biologics) suppress underlying immune overactivity, preventing irreversible joint deformity and preserving long-term mobility.`,
  },
  {
    title: "Why Your Body Tries to Reject a Life-Saving Transplant",
    slug: "why-your-body-tries-to-reject-a-life-saving-transplant",
    category: "Medicine Guides",
    topic: "Transplant Care",
    readTime: "5 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "How the human immune system recognizes foreign HLA markers, and how lifelong immunosuppressants protect donor grafts.",
    content: `## The Immunology of Organ Transplantation
The human immune system is genetically wired to recognize and eliminate foreign proteins (antigens). A transplanted kidney or liver presents foreign Human Leukocyte Antigens (HLA), triggering an immune attack known as rejection.

### The Role of Immunosuppressants
Medications like Tacrolimus, Cyclosporine, and Mycophenolate Mofetil dampen targeted immune pathways so the graft can function safely for decades.`,
  },
  {
    title: "Oxygen Concentrator vs Oxygen Cylinder: Which Do You Need?",
    slug: "oxygen-concentrator-vs-oxygen-cylinder-which-do-you-need",
    category: "Health Guides",
    topic: "Equipment",
    readTime: "6 min read",
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
    excerpt: "Comparing continuous electric oxygen generation and high-pressure stored oxygen cylinders for home pulmonary care.",
    content: `## Home Oxygen Solutions
- **Oxygen Concentrator:** Draws in ambient room air, strips nitrogen via molecular sieve beds, and delivers continuous 90-95% pure oxygen. Ideal for continuous home use requiring only electricity.
- **Oxygen Cylinder:** Stores compressed liquid/gas oxygen under high pressure. Useful as an emergency electrical backup or for short mobile trips.`,
  },
  {
    title: "Fat-Soluble vs Water-Soluble Vitamins: Why Timing Matters",
    slug: "fat-soluble-vs-water-soluble-vitamins-why-timing-matters",
    category: "Nutrition",
    topic: "Wellness",
    readTime: "5 min read",
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Why some vitamins absorb best alongside healthy dietary fats, while others dissolve freely in water and require consistent intake.",
    content: `## Optimizing Your Supplement Timing
- **Fat-Soluble (A, D, E, K):** Require dietary fat for absorption. Always take them with meals containing healthy lipids (like nuts, avocado, or milk). Excess amounts are stored in adipose tissue and the liver.
- **Water-Soluble (B-Complex, Vitamin C):** Dissolve in water and are rapidly excreted via urine when present in excess. Best taken with water early in the day.`,
  },
];

// @desc    Get all active articles (Public) with search, category, topic, sort, pagination
// @route   GET /api/articles
export const getArticles = async (req, res, next) => {
  try {
    const { category, topic, search, sort = "newest", page = 1, limit = 24 } = req.query;

    const query = { active: true };

    if (category && category !== "all" && category !== "All") {
      // Allow case-insensitive or slugified match
      query.category = { $regex: new RegExp(`^${category.replace(/-/g, " ")}$`, "i") };
    }

    if (topic && topic !== "all" && topic !== "All" && topic !== "All Topics") {
      query.topic = { $regex: new RegExp(`^${topic}$`, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { topic: searchRegex },
        { category: searchRegex },
        { "reviewer.name": searchRegex },
      ];
    }

    // Sort order
    let sortOptions = { publishedAt: -1, createdAt: -1 };
    if (sort === "oldest") {
      sortOptions = { publishedAt: 1, createdAt: 1 };
    } else if (sort === "az") {
      sortOptions = { title: 1 };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 24));
    const skipNum = (pageNum - 1) * limitNum;

    const [total, articles] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .sort(sortOptions)
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      articles,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured articles for Hero Carousel (Public)
// @route   GET /api/articles/featured
export const getFeaturedArticles = async (req, res, next) => {
  try {
    let featured = await Article.find({ active: true, isFeatured: true })
      .sort({ displayOrder: 1, publishedAt: -1 })
      .limit(6)
      .lean();

    // Fallback if no featured flagged
    if (!featured || featured.length === 0) {
      featured = await Article.find({ active: true })
        .sort({ publishedAt: -1 })
        .limit(5)
        .lean();
    }

    res.status(200).json({ success: true, featured });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single article by slug (Public)
// @route   GET /api/articles/:slug
export const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.replace(/\.html$/i, "").toLowerCase();

    const article = await Article.findOneAndUpdate(
      { slug: cleanSlug, active: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    // Fetch up to 3 related articles from same topic or category
    const related = await Article.find({
      _id: { $ne: article._id },
      active: true,
      $or: [{ topic: article.topic }, { category: article.category }],
    })
      .limit(3)
      .lean();

    res.status(200).json({ success: true, article, related });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all articles for Admin CMS (Admin Only)
// @route   GET /api/articles/admin/all
export const adminGetArticles = async (req, res, next) => {
  try {
    const { search, category, topic, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status === "active") query.active = true;
    if (status === "inactive") query.active = false;
    if (status === "featured") query.isFeatured = true;

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (topic && topic !== "all") {
      query.topic = { $regex: new RegExp(`^${topic}$`, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { topic: searchRegex },
        { "reviewer.name": searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const skipNum = (pageNum - 1) * limitNum;

    const [total, articles] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      articles,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new article (Admin Only)
// @route   POST /api/articles
export const createArticle = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, message: "Article title is required" });
    }

    let slugVal = data.slug ? slugify(data.slug, { lower: true, strict: true }) : slugify(data.title, { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await Article.findOne({ slug: slugVal });
    if (existing) {
      slugVal = `${slugVal}-${Date.now().toString().slice(-4)}`;
    }

    const newArticle = await Article.create({
      ...data,
      slug: slugVal,
    });

    res.status(201).json({ success: true, article: newArticle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update article (Admin Only)
// @route   PUT /api/articles/:id
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
    }

    const updated = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, article: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete article (Admin Only)
// @route   DELETE /api/articles/:id
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Article.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default curated articles
// @route   POST /api/articles/seed
export const seedArticles = async (req, res, next) => {
  try {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of INITIAL_ARTICLES) {
      const existing = await Article.findOne({ slug: item.slug });
      if (!existing) {
        await Article.create(item);
        insertedCount++;
      } else {
        await Article.updateOne({ _id: existing._id }, { $set: item });
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeding completed. Inserted: ${insertedCount}, Updated: ${updatedCount}`,
      insertedCount,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};
