import { Article } from "../models/Article.js";
import slugify from "slugify";

// Pre-defined seed dataset containing 10 curated clinical articles
export const INITIAL_ARTICLES = [
  {
    title: "Black Spot on Tongue: Common Causes and When to Worry",
    slug: "black-spot-on-tongue-causes-when-to-worry",
    category: "Oral & Dental Health",
    categoryBadge: "Oral Hygiene",
    topic: "Oral Care",
    readTime: "10 min read",
    isFeatured: true,
    gradientClass: "slide-bg-1",
    status: "published",
    active: true,
    publishedAt: new Date("2026-03-19T12:41:00.000Z"),
    lastUpdatedDate: new Date("2026-08-11T19:11:00.000Z"),
    author: {
      name: "Dr. Meenakshi Maruwada",
      title: "Dental Surgeon",
      credentials: "BDS, PGCAD, GMHE (IIM-B)",
    },
    reviewer: {
      name: "Dr. Betina Chandolia",
      qualifications: "BDS, MDS, PGCCL, PGDMH",
    },
    excerpt: "Black spots on the tongue, while often harmless, can be alarming when first noticed. Learn about common causes, diagnosis, and when to seek dental consultation.",
    tableOfContents: [
      { id: "what-does-black-spot-mean", label: "What Does a Black Spot on the Tongue Mean?", level: 2, order: 1 },
      { id: "common-causes", label: "Common Causes of Black Spots on the Tongue", level: 2, order: 2 },
      { id: "comparison-table", label: "Black Spot vs Black Hairy Tongue vs Something Serious: How to Tell", level: 2, order: 3 },
      { id: "risk-factors", label: "Risk Factors", level: 2, order: 4 },
      { id: "prevention-tips", label: "Prevention Tips", level: 2, order: 5 },
      { id: "when-to-seek-help", label: "When to Seek Medical Attention?", level: 2, order: 6 },
      { id: "conclusion", label: "Conclusion", level: 2, order: 7 },
      { id: "faqs", label: "FAQs", level: 2, order: 8 },
    ],
    sections: [
      {
        id: "what-does-black-spot-mean",
        heading: "What Does a Black Spot on the Tongue Mean?",
        type: "text",
        paragraphs: [
          "Black spots on the tongue, while often harmless, can be alarming when first noticed. These spots are relatively common and can arise from various causes, ranging from benign (not harmful or severe) conditions like black hairy tongue to more serious underlying health issues.",
          "Understanding the causes of black spots on the tongue and when to seek medical attention is essential for maintaining oral health and overall well-being. While many cases resolve without intervention, recognising when professional help is necessary can help address potential health concerns early on.",
        ],
        order: 1,
      },
      {
        id: "common-causes",
        heading: "Common Causes of Black Spots on the Tongue",
        type: "mixed",
        paragraphs: [
          "Black spots on the tongue can stem from various factors, including benign pigmentation, lifestyle habits, and medical conditions. Here are some of the most common causes:",
        ],
        bullets: [
          "1. Black Hairy Tongue: Characterised by elongated papillae trapping food particles, bacteria, and staining substances.",
          "2. Oral Trauma or Injury: Accidental bites or cuts resulting in dark blood blisters or post-injury pigmentation.",
          "3. Chemical Exposure: Bismuth subsalicylate (found in antacids) reacting with sulfur in saliva to form harmless temporary dark deposits.",
          "4. Oral Pigmentation: Increased melanin patches (melanosis) on tongue papillae.",
          "5. Underlying Health Conditions: Addison's disease or Peutz-Jeghers syndrome causing mucosal pigmentation.",
        ],
        callout: "This is not medical advice. Seek professional guidance.",
        order: 2,
      },
      {
        id: "comparison-table",
        heading: "Black Spot vs Black Hairy Tongue vs Something Serious: How to Tell",
        type: "table",
        paragraphs: [
          "Use this structured clinical comparison table to distinguish common benign spots from symptoms requiring medical evaluation:",
        ],
        table: {
          headers: ["What you see", "What it may mean", "What to do"],
          rows: [
            ["A single small, flat, dark dot, stable for months, painless", "Benign pigmentation (e.g. pigmented papillae)", "Usually harmless; mention it at your next dental visit"],
            ["Dark, furry or coated surface; metallic taste; bad breath", "Black hairy tongue", "Scrape the tongue, improve hygiene, cut tobacco; usually clears within a few weeks"],
            ["A dark spot after a bite or burn, fading over days", "Trauma or a healing blood blister", "Watch it; it should gradually resolve within 1 to 2 weeks"],
            ["Dark staining in a tobacco, paan or gutka user", "Tobacco-associated melanosis", "See a dentist; these habits increase the risk of oral cancer"],
          ],
        },
        order: 3,
      },
      {
        id: "risk-factors",
        heading: "Risk Factors",
        type: "list",
        bullets: [
          "Tobacco use (smoking, chewing tobacco, paan, gutka)",
          "Poor oral hygiene and irregular tongue cleaning",
          "Recent course of oral or systemic antibiotics",
          "Excessive alcohol or tea/coffee consumption",
          "Trauma or irritation from dental appliances or sharp teeth",
          "Underlying medical conditions like Addison's disease or Peutz-Jeghers syndrome",
        ],
        order: 4,
      },
      {
        id: "prevention-tips",
        heading: "Prevention Tips",
        type: "list",
        bullets: [
          "Brush your teeth and tongue twice daily to maintain oral hygiene",
          "Use an antibacterial mouthwash to reduce bacterial buildup",
          "Avoid tobacco products, including smoking and chewing tobacco",
          "Limit alcohol and caffeine intake to prevent tongue discolouration",
          "Visit your dentist regularly for check-ups and cleanings",
          "Eat a balanced diet rich in vitamins, especially B12 and iron",
          "Replace worn or damaged dental appliances to avoid tongue irritation",
          "Monitor any changes in tongue appearance and consult a doctor if needed",
        ],
        order: 5,
      },
      {
        id: "when-to-seek-help",
        heading: "When to Seek Medical Attention?",
        type: "list",
        paragraphs: [
          "Black spots on the tongue are usually harmless, but certain symptoms may indicate a more serious underlying issue. Seek medical attention if you notice:",
        ],
        bullets: [
          "A black spot or other mouth lesion that lasts more than two weeks.",
          "A sore, ulcer or patch in the mouth that has not healed within three weeks.",
          "A red patch, white patch, or mixed red-and-white patch that does not rub off.",
          "A lump, thickening or lasting swelling on the tongue, inside the cheek, or on the floor of the mouth.",
          "Rapid changes in the size, shape or colour of a black spot.",
          "Persistent pain, numbness, bleeding or swelling of the tongue or mouth.",
          "Difficulty eating, speaking, swallowing or opening the mouth with no obvious dental cause.",
          "A loose tooth with no clear dental reason.",
          "Lasting changes in your voice or speech.",
        ],
        order: 6,
      },
      {
        id: "conclusion",
        heading: "Conclusion",
        type: "text",
        paragraphs: [
          "Black spots on the tongue are usually harmless and often result from poor oral hygiene, medication side effects, or minor tongue injuries. While generally benign, persistent discolouration or additional symptoms may signal a more serious issue. Practising good oral hygiene, avoiding tobacco, and noting any tongue changes are important for prevention. If black spots last more than two weeks or interfere with eating or speaking, consult a doctor.",
          "Regular dental visits and early intervention are crucial, especially in rare cases like oral cancer. Staying aware of the causes of black spots on the tongue and being proactive helps ensure any oral health concerns are addressed promptly and effectively.",
        ],
        order: 7,
      },
    ],
    faqs: [
      {
        question: "Are black spots on the tongue always a sign of a serious condition?",
        answer: "Black spots on the tongue are not always a sign of a serious condition. In many cases, they are harmless and may be caused by minor injury, poor oral hygiene, or conditions like black hairy tongue. Only in rare situations do they point to an underlying medical issue. If the spots persist, change in appearance, or are accompanied by pain or other symptoms, a medical or dental check-up is advisable.",
        order: 1,
      },
      {
        question: "Can black spots on the tongue be prevented?",
        answer: "Yes, in many cases. Maintaining excellent oral hygiene (brushing teeth and gently scraping the tongue), avoiding tobacco, limiting excessive staining drinks, and drinking plenty of water can prevent most benign black spots.",
        order: 2,
      },
      {
        question: "How long do black spots on the tongue typically last?",
        answer: "Spots caused by food stains or bismuth medication resolve within a few days. Spots caused by trauma typically heal within 1 to 2 weeks. If any spot remains unchanged or grows after 2 weeks, consult a dental surgeon or physician.",
        order: 3,
      },
      {
        question: "Can black spots on the tongue be treated at home?",
        answer: "Gentle tongue brushing with a soft toothbrush or tongue scraper, warm salt water rinses, and stopping aggravating substances can resolve benign causes at home. Never attempt to scratch, cut, or chemically bleach tongue spots.",
        order: 4,
      },
      {
        question: "When should I consult a doctor about black spots on my tongue?",
        answer: "You should seek professional medical or dental evaluation if the spot persists beyond 2 weeks, bleeds, causes pain, grows rapidly, or is accompanied by lumps, difficulty swallowing, or unexplained weight loss.",
        order: 5,
      },
    ],
    references: [
      {
        title: "National Center for Biotechnology Information. (2014, August 8). Black hairy tongue.",
        source: "PMC",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4138463/",
        order: 1,
      },
      {
        title: "Schlager, E., St Claire, C., Ashack, K., & Khachemoune, A. (2017). Black Hairy Tongue: Predisposing Factors, Diagnosis, and Treatment.",
        source: "American journal of clinical dermatology, 18(4), 563-569.",
        url: "https://doi.org/10.1007/s40257-017-0268-y",
        order: 2,
      },
      {
        title: "Sreeja, C., Ramakrishnan, K., Vijayalakshmi, D., Devi, M., Aesha, I., & Vijayabanu, B. (2015). Oral pigmentation: A review.",
        source: "Journal of pharmacy & bioallied sciences, 7(Suppl 2), S403-S408.",
        url: "https://doi.org/10.4103/0975-7406.163471",
        order: 3,
      },
      {
        title: "Cohen P. R. (2009). Black tongue secondary to bismuth subsalicylate: case report and review of exogenous causes of macular lingual pigmentation.",
        source: "Journal of drugs in dermatology : JDD, 8(12), 1132-1135.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20027942/",
        order: 4,
      },
    ],
    disclaimer: "This article is for informational purposes only and does not constitute medical advice. The information provided should not be used for diagnosing or treating health conditions. Always consult a qualified healthcare provider for diagnosis, treatment, and personalised medical advice.",
  },
  {
    title: "Why Blood Thinners Need Careful, Ongoing Monitoring",
    slug: "why-blood-thinners-require-careful-ongoing-monitoring",
    category: "Medicine Guides",
    categoryBadge: "Cardiology",
    topic: "Anticoagulants",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-1",
    status: "published",
    active: true,
    publishedAt: new Date("2026-03-15T10:00:00.000Z"),
    lastUpdatedDate: new Date("2026-08-10T14:30:00.000Z"),
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team", credentials: "MD, Clinical Pharmacology" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "The delicate balance anticoagulants manage in preventing clots while minimizing bleed risks, and why regular lab monitoring is non-negotiable.",
    tableOfContents: [
      { id: "role-of-anticoagulants", label: "The Role of Anticoagulants in Modern Medicine", level: 2, order: 1 },
      { id: "why-monitoring-vital", label: "Why Monitoring Is Vital", level: 2, order: 2 },
      { id: "essential-safety-tips", label: "Essential Safety Tips", level: 2, order: 3 },
      { id: "faqs", label: "Frequently Asked Questions", level: 2, order: 4 },
    ],
    sections: [
      {
        id: "role-of-anticoagulants",
        heading: "The Role of Anticoagulants in Modern Medicine",
        type: "text",
        paragraphs: [
          "Anticoagulants, commonly referred to as blood thinners, are life-saving medications prescribed for individuals at risk of blood clots, deep vein thrombosis (DVT), pulmonary embolism, or stroke associated with atrial fibrillation.",
          "By delaying the chemical cascade necessary for clot formation, these medicines protect against catastrophic vascular blockages while requiring precise dosage calibration.",
        ],
        order: 1,
      },
      {
        id: "why-monitoring-vital",
        heading: "Why Monitoring Is Vital",
        type: "mixed",
        paragraphs: [
          "Unlike standard over-the-counter pain relievers, anticoagulants feature a narrow therapeutic index where slight variations in blood concentration cause noticeable clinical effects.",
        ],
        bullets: [
          "Too low a dose: The blood remains prone to clotting, increasing cardiovascular risks.",
          "Too high a dose: The risk of unexpected bleeding episodes increases substantially.",
          "Dietary interactions: Foods rich in Vitamin K can directly alter the effectiveness of certain blood thinners like Warfarin.",
        ],
        order: 2,
      },
      {
        id: "essential-safety-tips",
        heading: "Essential Safety Tips",
        type: "list",
        bullets: [
          "Never skip or double doses: Always maintain a consistent time every single day.",
          "Watch for warning signs: Red flags include unusual bruising, persistent nosebleeds, or dark stools.",
          "Notify your surgical team: Always inform dentists or doctors before any invasive procedure.",
          "Maintain dietary consistency: Keep Vitamin K intake steady without drastic sudden dietary shifts.",
        ],
        order: 3,
      },
    ],
    faqs: [
      {
        question: "Can I take aspirin or ibuprofen alongside my blood thinner?",
        answer: "Generally no, unless explicitly prescribed and monitored by your cardiologist. NSAIDs can significantly amplify bleeding risks.",
        order: 1,
      },
      {
        question: "What should I do if I accidentally miss a dose?",
        answer: "Take it as soon as you remember on the same day. If it is already near the time for your next dose, skip the missed dose and resume your regular schedule. Never double up.",
        order: 2,
      },
    ],
    references: [
      {
        title: "National Heart, Lung, and Blood Institute. Anticoagulants and Antiplatelet Medications.",
        source: "NIH / NHLBI",
        url: "https://www.nhlbi.nih.gov/health/blood-thinners",
        order: 1,
      },
      {
        title: "American Heart Association. A Patient's Guide to Taking Warfarin / Anticoagulants.",
        source: "Circulation Journal",
        url: "https://www.heart.org",
        order: 2,
      },
    ],
  },
  {
    title: "Understanding Insulin Types: Rapid, Short, and Long-Acting",
    slug: "understanding-insulin-types-rapid-short-and-long-acting",
    category: "Lifestyle",
    categoryBadge: "Diabetic Care",
    topic: "Diabetic Care",
    readTime: "6 min read",
    isFeatured: true,
    gradientClass: "slide-bg-2",
    status: "published",
    active: true,
    publishedAt: new Date("2026-03-10T09:15:00.000Z"),
    lastUpdatedDate: new Date("2026-08-05T11:20:00.000Z"),
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Why insulin comes in distinct formulations, how each type works on your blood sugar, and how regimens are personalized for optimal control.",
    tableOfContents: [
      { id: "insulin-formulations", label: "Navigating Different Insulin Formulations", level: 2, order: 1 },
      { id: "three-core-types", label: "The Three Core Types of Insulin", level: 2, order: 2 },
      { id: "storage-best-practices", label: "Storage & Injection Best Practices", level: 2, order: 3 },
      { id: "faqs", label: "Frequently Asked Questions", level: 2, order: 4 },
    ],
    sections: [
      {
        id: "insulin-formulations",
        heading: "Navigating Different Insulin Formulations",
        type: "text",
        paragraphs: [
          "Insulin is not a one-size-fits-all therapy. Modern endocrinology utilizes varying speeds and durations of insulin to replicate the natural physiological response of a healthy pancreas.",
        ],
        order: 1,
      },
      {
        id: "three-core-types",
        heading: "The Three Core Types of Insulin",
        type: "mixed",
        bullets: [
          "Rapid-Acting Insulin: Starts working within 15 minutes, peaks at 1 hour, and lasts 2 to 4 hours. Typically injected right before meals.",
          "Short-Acting (Regular) Insulin: Takes effect in 30 minutes, peaking at 2 to 3 hours, covering mealtime carbohydrate absorption.",
          "Long-Acting / Basal Insulin: Provides a steady background level of insulin for 18 to 24 hours, keeping fasting glucose stable.",
        ],
        order: 2,
      },
      {
        id: "storage-best-practices",
        heading: "Storage & Injection Best Practices",
        type: "list",
        bullets: [
          "Keep unopened vials refrigerated between 2°C and 8°C.",
          "In-use pens or vials can remain at controlled room temperature for up to 28 days.",
          "Rotate injection sites (abdomen, thighs, upper arms) to prevent lipohypertrophy.",
        ],
        order: 3,
      },
    ],
    faqs: [
      {
        question: "Can insulin be stored in the freezer?",
        answer: "Never freeze insulin. Freezing breaks down the protein structure permanently, rendering the medicine completely ineffective.",
        order: 1,
      },
    ],
    references: [
      {
        title: "American Diabetes Association. Insulin Basics & Delivery Methods.",
        source: "Diabetes Care",
        url: "https://diabetes.org",
        order: 1,
      },
    ],
  },
  {
    title: "Understanding U=U: Undetectable Equals Untransmittable",
    slug: "understanding-uu-undetectable-equals-untransmittable",
    category: "Disease Awareness",
    categoryBadge: "HIV Care",
    topic: "HIV Care",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-3",
    status: "published",
    active: true,
    publishedAt: new Date("2026-03-01T08:00:00.000Z"),
    lastUpdatedDate: new Date("2026-08-01T16:00:00.000Z"),
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "What U=U scientifically means, how undetectable viral loads are achieved, and why consistency in daily treatment is transformative.",
    tableOfContents: [
      { id: "breakthrough-uu", label: "The Breakthrough of U=U in HIV Care", level: 2, order: 1 },
      { id: "what-it-means", label: "What Undetectable Means", level: 2, order: 2 },
      { id: "pillars-suppression", label: "Pillars of Sustained Viral Suppression", level: 2, order: 3 },
      { id: "faqs", label: "FAQs", level: 2, order: 4 },
    ],
    sections: [
      {
        id: "breakthrough-uu",
        heading: "The Breakthrough of U=U in HIV Care",
        type: "text",
        paragraphs: [
          "Decades of robust clinical research (including the landmark PARTNER and Opposites Attract studies) have confirmed the scientific reality of U=U: Undetectable = Untransmittable.",
        ],
        order: 1,
      },
      {
        id: "what-it-means",
        heading: "What Undetectable Means",
        type: "text",
        paragraphs: [
          "When a person living with HIV adheres to modern Antiretroviral Therapy (ART) and maintains an undetectable viral load (fewer than 200 copies/mL) for at least 6 months, there is zero risk of sexually transmitting the virus to partners.",
        ],
        order: 2,
      },
      {
        id: "pillars-suppression",
        heading: "Pillars of Sustained Viral Suppression",
        type: "list",
        bullets: [
          "100% daily adherence to prescribed antiretroviral regimens.",
          "Routine viral load blood testing every 3 to 6 months.",
          "Open, stigma-free dialogue with healthcare providers.",
        ],
        order: 3,
      },
    ],
    faqs: [
      {
        question: "Does U=U prevent other STIs?",
        answer: "No. Antiretroviral therapy specifically suppresses HIV. Barrier methods (like condoms) remain essential for protection against other sexually transmitted infections.",
        order: 1,
      },
    ],
    references: [
      {
        title: "The Lancet. Risk of sexual transmission of HIV in serodiscordant couples (PARTNER study).",
        source: "The Lancet Journal",
        url: "https://www.thelancet.com",
        order: 1,
      },
    ],
  },
  {
    title: "CPAP Machines: What to Check Before Buying One",
    slug: "cpap-machines-what-to-check-before-buying-one",
    category: "Health Guides",
    categoryBadge: "Respiratory Care",
    topic: "Equipment",
    readTime: "6 min read",
    isFeatured: true,
    gradientClass: "slide-bg-4",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
    excerpt: "Key clinical and technical checkpoints to verify before investing in a CPAP or Auto-CPAP machine and mask interface.",
    tableOfContents: [
      { id: "choosing-equipment", label: "Choosing the Right Sleep Apnea Equipment", level: 2, order: 1 },
      { id: "factors-to-evaluate", label: "Key Factors to Evaluate", level: 2, order: 2 },
      { id: "faqs", label: "Frequently Asked Questions", level: 2, order: 3 },
    ],
    sections: [
      {
        id: "choosing-equipment",
        heading: "Choosing the Right Sleep Apnea Equipment",
        type: "text",
        paragraphs: [
          "Continuous Positive Airway Pressure (CPAP) therapy remains the gold standard for managing obstructive sleep apnea (OSA). Choosing the right device requires understanding a few core features.",
        ],
        order: 1,
      },
      {
        id: "factors-to-evaluate",
        heading: "Key Factors to Evaluate",
        type: "list",
        bullets: [
          "Fixed CPAP vs Auto-CPAP (APAP): Auto-titrating devices adjust pressure dynamically throughout the night.",
          "Ramp Function: Gently begins at a lower pressure, gradually increasing as you fall asleep.",
          "Integrated Heated Humidifier: Essential for preventing dry mouth and nasal congestion.",
          "Mask Compatibility: Nasal pillows, nasal masks, or full-face masks based on sleeping habits.",
        ],
        order: 2,
      },
    ],
    faqs: [
      {
        question: "How often should CPAP filters and tubing be replaced?",
        answer: "Disposable filters should be replaced every 2 to 4 weeks. Tubing and mask cushions should typically be replaced every 3 to 6 months for optimal hygiene.",
        order: 1,
      },
    ],
    references: [
      {
        title: "American Academy of Sleep Medicine. Clinical Practice Guidelines for OSA Therapy.",
        source: "AASM",
        url: "https://aasm.org",
        order: 1,
      },
    ],
  },
  {
    title: "Do You Actually Need a Multivitamin? A Balanced Look",
    slug: "do-you-actually-need-a-multivitamin-a-balanced-look",
    category: "Nutrition & Diet",
    categoryBadge: "Wellness",
    topic: "Wellness",
    readTime: "5 min read",
    isFeatured: true,
    gradientClass: "slide-bg-5",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Who genuinely benefits from a daily multivitamin supplement, when whole foods suffice, and how to avoid micronutrient overload.",
    tableOfContents: [
      { id: "demystifying-vitamins", label: "De-mystifying Daily Multivitamins", level: 2, order: 1 },
      { id: "who-truly-benefits", label: "Who Truly Benefits?", level: 2, order: 2 },
      { id: "food-first", label: "The Food-First Principle", level: 2, order: 3 },
      { id: "faqs", label: "FAQs", level: 2, order: 4 },
    ],
    sections: [
      {
        id: "demystifying-vitamins",
        heading: "De-mystifying Daily Multivitamins",
        type: "text",
        paragraphs: [
          "The global supplement market promotes multivitamins as an essential health insurance policy. However, clinical nutrition provides a much more nuanced perspective.",
        ],
        order: 1,
      },
      {
        id: "who-truly-benefits",
        heading: "Who Truly Benefits?",
        type: "list",
        bullets: [
          "Pregnant and lactating women: Folic acid, iron, and calcium supplementation are critical.",
          "Older adults: Decreased intrinsic factor reduces Vitamin B12 absorption; Vitamin D is also key.",
          "Strict vegans/vegetarians: Targeted Vitamin B12 and Vitamin D3 supplementation is necessary.",
          "Individuals with malabsorption: Conditions like celiac, Crohn's, or post-bariatric surgery.",
        ],
        order: 2,
      },
      {
        id: "food-first",
        heading: "The Food-First Principle",
        type: "text",
        paragraphs: [
          "Whole foods provide dietary fiber, phytonutrients, and synergistic co-factors that pills cannot replicate. Target a colourful plate before relying on tablets.",
        ],
        order: 3,
      },
    ],
    faqs: [
      {
        question: "Can taking too many vitamins be harmful?",
        answer: "Yes. Fat-soluble vitamins (A, D, E, K) accumulate in the body tissues and can cause toxicities when taken in excessive doses over prolonged periods.",
        order: 1,
      },
    ],
    references: [
      {
        title: "Harvard T.H. Chan School of Public Health. The Nutrition Source: Vitamins and Minerals.",
        source: "Harvard Health",
        url: "https://www.hsph.harvard.edu/nutritionsource",
        order: 1,
      },
    ],
  },
  {
    title: "How to Read a Medicine Strip: A Patient's Guide",
    slug: "how-to-read-a-medicine-strip",
    category: "Medicine Guides",
    categoryBadge: "Pharmacy Basics",
    topic: "General",
    readTime: "6 min read",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "A simple guide to understanding the generic chemical name, strength, batch number, manufacturing date, and expiry printed on every strip.",
    tableOfContents: [
      { id: "decode-strip", label: "Decode Your Prescription Strip", level: 2, order: 1 },
      { id: "what-to-look-for", label: "What to Look For on Packaging", level: 2, order: 2 },
      { id: "faqs", label: "FAQs", level: 2, order: 3 },
    ],
    sections: [
      {
        id: "decode-strip",
        heading: "Decode Your Prescription Strip",
        type: "text",
        paragraphs: [
          "Every pharmaceutical blister strip carries vital regulatory and safety information that every patient should understand before consumption.",
        ],
        order: 1,
      },
      {
        id: "what-to-look-for",
        heading: "What to Look For on Packaging",
        type: "list",
        bullets: [
          "Generic Name vs Brand Name: The generic name represents the active chemical molecule (e.g. Paracetamol), while the brand name is the manufacturer's trademark.",
          "Strength & Dosage: Specified in milligrams (mg) or micrograms (mcg) per unit tablet.",
          "Red Line Warning: In India, strips with a vertical red line indicate Schedule H / H1 drugs requiring a registered medical practitioner's prescription.",
          "Batch & Expiry Date: Never consume medications beyond the listed expiry month and year.",
        ],
        order: 2,
      },
    ],
    faqs: [
      {
        question: "What does IP, BP, or USP mean next to a medicine name?",
        answer: "These abbreviations stand for Indian Pharmacopoeia, British Pharmacopoeia, or United States Pharmacopeia, denoting official regulatory purity standards.",
        order: 1,
      },
    ],
    references: [
      {
        title: "Central Drugs Standard Control Organization (CDSCO). Guidelines on Drug Packaging and Labelling.",
        source: "CDSCO India",
        url: "https://cdsco.gov.in",
        order: 1,
      },
    ],
  },
  {
    title: "Storing Medicines Safely at Home: Preserving Potency",
    slug: "storing-medicines-safely-at-home",
    category: "Preventive Care",
    categoryBadge: "Home Care",
    topic: "General",
    readTime: "5 min read",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Heat, light, and humidity can quietly degrade how well your medicines work — here is how to store them right.",
    tableOfContents: [
      { id: "safeguarding-potency", label: "Safeguarding Medicine Potency", level: 2, order: 1 },
      { id: "core-rules", label: "Core Rules for Home Storage", level: 2, order: 2 },
      { id: "faqs", label: "FAQs", level: 2, order: 3 },
    ],
    sections: [
      {
        id: "safeguarding-potency",
        heading: "Safeguarding Medicine Potency",
        type: "text",
        paragraphs: [
          "Improper storage conditions can cause medications to lose efficacy or break down into harmful sub-products before their stated expiration.",
        ],
        order: 1,
      },
      {
        id: "core-rules",
        heading: "Core Rules for Home Storage",
        type: "list",
        bullets: [
          "Avoid the bathroom cabinet: Humidity and heat fluctuations from showers quickly degrade tablets.",
          "Cool, dry storage: Store in a dry pantry away from direct sunlight (below 25°C).",
          "Cold chain requirements: Insulin, biologicals, and certain eye drops strictly require 2°C to 8°C in a central refrigerator shelf (never in the freezer).",
          "Child-proof safety: Always store medicines out of reach and sight of young children.",
        ],
        order: 2,
      },
    ],
    faqs: [
      {
        question: "Can I leave insulin at room temperature?",
        answer: "An in-use insulin vial or pen can typically remain at room temperature (below 25°C) for up to 28 days. Unopened insulin must always be refrigerated.",
        order: 1,
      },
    ],
    references: [
      {
        title: "U.S. FDA. Proper Storage of Medication in the Home.",
        source: "FDA Consumer Updates",
        url: "https://www.fda.gov",
        order: 1,
      },
    ],
  },
  {
    title: "Metformin: Complete Guide, Benefits and Managing Side Effects",
    slug: "metformin-complete-guide-benefits-and-side-effects",
    category: "Medication",
    categoryBadge: "Diabetes",
    topic: "Diabetic Care",
    readTime: "7 min read",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "Uses, dosage basics, common gastrointestinal side effects, and what to do if you miss a dose — explained simply.",
    tableOfContents: [
      { id: "first-line-therapy", label: "The First-Line Type 2 Diabetes Therapy", level: 2, order: 1 },
      { id: "managing-side-effects", label: "Managing Gastrointestinal Side Effects", level: 2, order: 2 },
      { id: "faqs", label: "FAQs", level: 2, order: 3 },
    ],
    sections: [
      {
        id: "first-line-therapy",
        heading: "The First-Line Type 2 Diabetes Therapy",
        type: "text",
        paragraphs: [
          "Metformin is one of the safest, most thoroughly studied medications in modern history. It works primarily by reducing glucose production in the liver and improving cellular insulin sensitivity.",
        ],
        order: 1,
      },
      {
        id: "managing-side-effects",
        heading: "Managing Gastrointestinal Side Effects",
        type: "list",
        bullets: [
          "Take Metformin with or immediately after meals to reduce stomach discomfort.",
          "Sustained-release (SR/ER) formulations significantly reduce nausea and diarrhea.",
          "Regular monitoring of Vitamin B12 levels is recommended for long-term users.",
        ],
        order: 2,
      },
    ],
    faqs: [
      {
        question: "Does Metformin cause hypoglycemia (low blood sugar)?",
        answer: "When taken alone, Metformin rarely causes hypoglycemia because it does not stimulate excess insulin secretion from the pancreas.",
        order: 1,
      },
    ],
    references: [
      {
        title: "American Diabetes Association Standards of Medical Care in Diabetes.",
        source: "Diabetes Care",
        url: "https://diabetes.org",
        order: 1,
      },
    ],
  },
  {
    title: "Understanding Hypertension: The Silent Condition Explained",
    slug: "understanding-hypertension-the-silent-condition",
    category: "Women's Health",
    categoryBadge: "Cardiovascular",
    topic: "General",
    readTime: "6 min read",
    status: "published",
    active: true,
    author: { name: "Wellmeds Health Team", title: "Clinical Editorial Team" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
    excerpt: "What high blood pressure actually means for your cardiovascular system, and why it is termed the 'silent' condition.",
    tableOfContents: [
      { id: "why-bp-matters", label: "Why Blood Pressure Matters", level: 2, order: 1 },
      { id: "silent-nature", label: "The Silent Nature of High BP", level: 2, order: 2 },
      { id: "faqs", label: "FAQs", level: 2, order: 3 },
    ],
    sections: [
      {
        id: "why-bp-matters",
        heading: "Why Blood Pressure Matters",
        type: "text",
        paragraphs: [
          "Blood pressure measures the lateral force exerted by circulating blood against arterial walls. When this pressure remains persistently elevated, it causes micro-damage to vital organs over time.",
        ],
        order: 1,
      },
      {
        id: "silent-nature",
        heading: "The Silent Nature of High BP",
        type: "text",
        paragraphs: [
          "Hypertension rarely causes noticeable symptoms in its early stages. Without regular screenings, unmanaged high blood pressure can lead to myocardial infarction, stroke, kidney dysfunction, and vision impairment.",
        ],
        order: 2,
      },
    ],
    faqs: [
      {
        question: "What is considered a normal blood pressure reading?",
        answer: "A normal resting blood pressure for adults is generally below 120/80 mmHg.",
        order: 1,
      },
    ],
    references: [
      {
        title: "World Health Organization. Hypertension Fact Sheet.",
        source: "WHO",
        url: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
        order: 1,
      },
    ],
  },
];

// @desc    Get all active articles (Public) with search, category, topic, sort, pagination
// @route   GET /api/articles
export const getArticles = async (req, res, next) => {
  try {
    const { category, topic, search, sort = "newest", page = 1, limit = 24 } = req.query;

    const query = { $or: [{ status: "published" }, { active: true }] };

    if (category && category !== "all" && category !== "All") {
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
        { "author.name": searchRegex },
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

// @desc    Get single article by slug (Public + Preview support)
// @route   GET /api/articles/:slug
export const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.replace(/\.html$/i, "").toLowerCase();
    const isPreview = req.query.preview === "true";

    const query = { slug: cleanSlug };
    if (!isPreview) {
      query.$or = [{ status: "published" }, { active: true }];
    }

    let article = null;
    if (isPreview) {
      article = await Article.findOne(query).lean();
    } else {
      article = await Article.findOneAndUpdate(
        query,
        { $inc: { views: 1 } },
        { new: true }
      ).lean();
    }

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const related = await Article.find({
      _id: { $ne: article._id },
      active: true,
      $or: [{ category: article.category }, { topic: article.topic }],
    })
      .limit(4)
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

    if (status === "published" || status === "active") query.status = "published";
    if (status === "draft" || status === "inactive") query.status = "draft";
    if (status === "archived") query.status = "archived";
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
        { category: searchRegex },
        { "author.name": searchRegex },
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

// @desc    Get single article by ID for Admin CMS editor (Admin Only)
// @route   GET /api/articles/admin/:id
export const adminGetArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id).lean();

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

// Helper to sanitize article data from client
const sanitizeArticleData = (raw) => {
  const data = { ...raw };

  if (data.tableOfContents && Array.isArray(data.tableOfContents)) {
    data.tableOfContents = data.tableOfContents
      .filter((t) => t && (t.label || t.id))
      .map((t, i) => ({
        id: (t.id || slugify(t.label || `section-${i + 1}`, { lower: true, strict: true })).trim(),
        label: (t.label || `Section ${i + 1}`).trim(),
        level: t.level || 2,
        order: i + 1,
      }));
  }

  if (data.sections && Array.isArray(data.sections)) {
    data.sections = data.sections.map((s, i) => ({
      id: (s.id || slugify(s.heading || `section-${i + 1}`, { lower: true, strict: true })).trim(),
      heading: (s.heading || "").trim(),
      subHeading: (s.subHeading || "").trim(),
      content: (s.content || "").trim(),
      type: s.type || "text",
      paragraphs: Array.isArray(s.paragraphs) ? s.paragraphs.filter((p) => typeof p === "string" && p.trim()) : [],
      bullets: Array.isArray(s.bullets) ? s.bullets.filter((b) => typeof b === "string" && b.trim()) : [],
      numbered: Array.isArray(s.numbered) ? s.numbered.filter((n) => typeof n === "string" && n.trim()) : [],
      images: Array.isArray(s.images) ? s.images.filter((img) => img && img.url) : [],
      table: s.table && s.table.headers && s.table.headers.length > 0 ? s.table : null,
      callout: (s.callout || "").trim(),
      order: i + 1,
    }));
  }

  if (data.faqs && Array.isArray(data.faqs)) {
    data.faqs = data.faqs
      .filter((f) => f && f.question && f.question.trim())
      .map((f, i) => ({
        question: f.question.trim(),
        answer: (f.answer || "").trim(),
        order: i + 1,
      }));
  }

  if (data.references && Array.isArray(data.references)) {
    data.references = data.references
      .filter((r) => r && r.title && r.title.trim())
      .map((r, i) => ({
        title: r.title.trim(),
        source: (r.source || "").trim(),
        url: (r.url || "").trim(),
        details: (r.details || "").trim(),
        order: i + 1,
      }));
  }

  if (data.seo) {
    data.seo = {
      metaTitle: (data.seo.metaTitle || data.title || "").trim(),
      metaDescription: (data.seo.metaDescription || data.excerpt || "").trim(),
      canonicalUrl: (data.seo.canonicalUrl || "").trim(),
      ogImage: (data.seo.ogImage || data.heroImage || "").trim(),
      keywords: Array.isArray(data.seo.keywords) ? data.seo.keywords : [],
      noIndex: Boolean(data.seo.noIndex),
    };
  }

  return data;
};

// @desc    Create new article (Admin Only)
// @route   POST /api/articles
export const createArticle = async (req, res, next) => {
  try {
    const rawData = req.body;
    if (!rawData.title || !rawData.title.trim()) {
      return res.status(400).json({ success: false, message: "Article title is required" });
    }

    const data = sanitizeArticleData(rawData);

    let slugVal = data.slug ? slugify(data.slug, { lower: true, strict: true }) : slugify(data.title, { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await Article.findOne({ slug: slugVal });
    if (existing) {
      slugVal = `${slugVal}-${Date.now().toString().slice(-4)}`;
    }

    const statusVal = data.status || (data.active ? "published" : "draft");
    const activeVal = statusVal === "published";

    const newArticle = await Article.create({
      ...data,
      slug: slugVal,
      status: statusVal,
      active: activeVal,
      lastUpdatedDate: new Date(),
    });

    res.status(201).json({ success: true, article: newArticle });
  } catch (error) {
    console.error("[CREATE_ARTICLE_ERROR]", error);
    next(error);
  }
};

// @desc    Update article (Admin Only)
// @route   PUT /api/articles/:id
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawData = req.body;
    const updateData = sanitizeArticleData(rawData);

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
    }

    if (updateData.status) {
      updateData.active = updateData.status === "published";
    } else if (typeof updateData.active === "boolean") {
      updateData.status = updateData.active ? "published" : "draft";
    }

    updateData.lastUpdatedDate = new Date();

    const updated = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, article: updated });
  } catch (error) {
    console.error("[UPDATE_ARTICLE_ERROR]", error);
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

// @desc    Toggle article publish status (Admin Only)
// @route   PUT /api/articles/:id/status
export const togglePublishArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const nextStatus = article.status === "published" ? "draft" : "published";
    article.status = nextStatus;
    article.active = nextStatus === "published";
    article.lastUpdatedDate = new Date();
    await article.save();

    res.status(200).json({ success: true, article, status: nextStatus });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed up to 10 curated clinical articles safely without touching other collections
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
      message: `Seeding completed safely. Inserted: ${insertedCount}, Updated: ${updatedCount} articles. Zero other data modified.`,
      insertedCount,
      updatedCount,
      totalSeeded: INITIAL_ARTICLES.length,
    });
  } catch (error) {
    next(error);
  }
};
