export const INITIAL_CATEGORIES = [
  { name: "Prescription", icon: "medical_services", count: 2 },
  { name: "Vitamins", icon: "pill", count: 2 },
  { name: "Medical Devices", icon: "monitor_heart", count: 2 },
  { name: "First Aid", icon: "medical_information", count: 3 },
  { name: "Personal Care", icon: "face", count: 2 },
  { name: "Supplements", icon: "spa", count: 1 }
];

export const INITIAL_PRODUCTS = [
  {
    name: "Advanced Multi-Vitamin Complex",
    category: "Vitamins",
    brand: "HealthGuard",
    price: 24.99,
    originalPrice: 29.99,
    stock: 150,
    requiresRx: false,
    badge: "Top Rated",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTt69PeIekAYrX5N8-YNwzS7BH5whbNSoyHZoTbwUKAD9PiRHhWb74WPdjkvHOvZIZeQB9Y3oTaNM8m7AreEk6RDEPKBaCT_AyHvi6-ejwKXmBMn8PRFZEhzERtvy1flJSykHMU83GvnicZJIvmI11I5htJiZ16XrMLf6az8UVqFZm0qpj1PGeZvYjhK5yVrit55XUfjphy30bqFNjK4ZREhtObZJ-9UZZgHxUp6ssis_MpTI9a27wx-iI-4IFDECyYGZ_KWVQPkRp",
    description: "A comprehensive daily vitamin complex supporting immunity, physical energy, and cognitive balance. Formulation includes Vit A, C, D, E, B6, B12, Zinc, and Magnesium.",
    sku: "VIT-HG-001"
  },
  {
    name: "ChronicCare 500mg Tablets",
    category: "Prescription",
    brand: "MediLife Pharmaceuticals",
    price: 45.00,
    stock: 450,
    requiresRx: true,
    badge: "Rx Required",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd6VnwzGJ7BQpCT38QD5SD-Jv1sPFOTF9vi7xGiaLM4CyL_XsQvVf2q9oj2P4MyneRo-Y60AI4OYinL4dDwVucYNjiRhHtaKKuC_GSWlGoXGm-Y2o5DYdEs_r3biSwYsVutKVm6DrsNLdN6_FyZoiA1PkTczxrPVfuyzfRIDqr_olxv5z5JGTpLcxvcrbLyUFFsizUaU4DK-g8HkrohTZPWCVOBw5RXOKszmQ_QTlt51xOW0Ru_vfHRn28ZpoRnLk8M5JiPTlhxzqg",
    description: "Prescription medication indicated for the management of chronic clinical blood pressure conditions. Direct clinical verification is mandatory before order fulfillment.",
    sku: "MED-ML-500"
  },
  {
    name: "Infrared Non-Contact Thermometer",
    category: "Medical Devices",
    brand: "BioCare Tech",
    price: 32.50,
    stock: 40,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_9iW_kQ6ex8lOaN1A5YQPA70eSZ7jWuTmel7icL0i6QvLB2TqWjz3zUDwkdTcpRaPvoKSbQAWzrWISFjEvJqfbaMVWE-loHeRb1dYusX-lXbGKGheHLI7vu3QT08maJ_h8XpsIV2iBQTB4XhfxcB-j1ne15hupuNcNdAO7_bGiHH7SYYk1mGq7uJOESsP9xlcT5QO0ccJ-oMMHckMI-r6tHkpwxqn9aop0wDZtYzceZo9gJ7VWM4rTtuF2DqYaLQ5oFJrxDeh3bYY",
    description: "High-precision infrared thermometer offering accurate temperature readings in less than 1 second. Non-contact measurement prevents cross-contamination.",
    sku: "DEV-BC-021"
  },
  {
    name: "Premium First Aid Emergency Kit",
    category: "First Aid",
    brand: "Clinica Supplies",
    price: 19.99,
    stock: 120,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-mBoUQcO4UogXh9saBrO-_Yreos77sZ3Ak1EaC1OVpkD5PoET6Kxx58g2dUPuQWn82NI7xVKgehe0lb_jt5N0xaxZW4OdqCF_JiE-1m3T3IRdskgOFvzZ0ziIiPyxAVepxCm_8s4Cc6Y9iHZo9PE2qk_xcJOBv-Wml83S1SQl9X1ArJjTxeQmt6E-5FVC0jHweaX_zjUwFCbW2H6tyOjH0tHHig-fYCs-NHfqNzBfuNOO7hn_CBoR3GuTq2FUob1ZU4SGu1ry4XU5",
    description: "Professional-grade emergency kit containing sterile bandages, antiseptic wipes, burn treatments, splints, and diagnostic guide tools.",
    sku: "FA-CS-911"
  },
  {
    name: "Organic Immunity Boosting Serum",
    category: "Supplements",
    brand: "PurePath Wellness",
    price: 58.00,
    stock: 80,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxRiMHkeolA-vmAyAo9z1RCM8c7oCBg7mCqGXRAKF7cs9nC-9BWdvSTUXuK-3K47aEzcYxaYcrAVAJAGUsoknFV9MgiC-PkKvecL34qy0yXX_t0lcOljWiWpNFR_YRzs36oOhVtrAm_aEOSRrzqJtNWKNOp2Xc_Uym7bW9QrJolcbqzBP82ez_2pzWxxPYB4Hj8qIY_w7KTBouC4nJBSOrbwy-X0lIfKX26fz1MeTX9r-bfEXb9dZEDyVd6PkpjH85FwW4jNSr_OzD",
    description: "Organic herbal serum infused with elderberry, echinacea, and essential nutrients to naturally support body defenses.",
    sku: "SUPP-PP-003"
  },
  {
    name: "Protective Surgical Masks (Pack of 50)",
    category: "First Aid",
    brand: "HealthGuard",
    price: 12.50,
    stock: 900,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWp96xQuso4yEFcEqLBZKc6-oF4x0hm2s4HCfsn809Ge57S2xJnWY0W-1nBEYX5KvCNdnRhtr7axhenSJJ6XYfL1gPAe2xmeOd_F9sSktBPzcnikYQkwLHT7yG2UfZPWG0r1YEwG0arqbB-4nZhb2hNtaa0tP5q_ka9tAEgCibbJduWAD8Q4b2EaLRfurXqzvn6LSRmcdVU3tWMDP33X7RPP6DOnhKXgY_9UO46syXH7GX6YmCtJZVylSuMokqzH8AfPerw3c_Enjk",
    description: "Comfortable, fluid-resistant 3-ply masks providing exceptional bacterial filtration and breathability.",
    sku: "FA-HG-050"
  },
  {
    name: "Hypoallergenic Moisturizing Cream",
    category: "Personal Care",
    brand: "Dermacare Elite",
    price: 29.00,
    stock: 60,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD-4a3J_3QLM-BH5MJg4Wer9VIvOKiqkInNhovyN7yhyq61eFzl2j7EL9oT9NLar1u1SBxzSgtvMkblWKW1iCT8wgb8Kgnu77q9elv8uzUW9KmvtXKrKccWoaYpgUOFv9PVjLdeZL9IvV1-0fIWkW--anJ12KjC3_rSXPq1zxlAE0-CMthILqCZ5Z-yG3hPpUpfENZwGgZevkagbYEf7HfRMKr8SLdEa4xWXDKC0SvY69ffQUYndzL9eFfvSzQlfSZ7XEyqDuDFSAp",
    description: "Deep nourishing lotion designed for dry, sensitive, and eczema-prone skin. Preserves moisture barrier for 24 hours.",
    sku: "SKIN-DE-007"
  },
  {
    name: "Automatic Blood Pressure Monitor",
    category: "Medical Devices",
    brand: "MediLife Pharmaceuticals",
    price: 89.00,
    stock: 25,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCt-APwqPL7_ZIQQLTV3x96pir_L0yeSRtno-9VQE_IRGb69T49cB1FXiU3x_arYDb8nO1T3GFh6YOLwaQaTH3oAvAQoasOWD305xnKVKdDaNkopGntunWrx9T8ZAvtivsmeYMHGivY0mYwYeClnsvjaafe34oSs-CvQR-ZjBFbL-lvpHRUaeux8s8d-0eKTmFzJkWfG-6LGebEUSL9BO0CQSKmgLoFdFZA3DyyqNOWF6VF8cHS2r1ajuECn3defCBlTw6S3rvDCIJB",
    description: "Easy-to-use automatic digital monitor with memory tracking. Clinically validated for home-use accuracy.",
    sku: "DEV-ML-089"
  },
  {
    name: "Amoxicillin 500mg Capsules",
    category: "Prescription",
    brand: "HealthGuard",
    price: 24.99,
    stock: 450,
    requiresRx: true,
    badge: "Rx Required",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjpwCpE71Gtb-ITkwMM26hZwicztc4CQSNaRZ8VOcr2suCCxBFBYYXU2sfgrR9sBJ2pDvEXXnwrlp4jE21biGm_DVwVfytkZ_thnKt9HhxP1b7olu7hanNgEIipRaWfDPlFUnsxgDc70UkofSBHeWKZp-qzlVcyZ5UbjYQWznPmfagT9zouODD8X-4zwEJgd7-veX46Rj-yDAsH4BYUSX7JI8x3UmvQBJVQOxzuK7Gr6Xc2yD_NSgHgtvsGIHaOqQZj8h9eMI4C6qN",
    description: "Broad-spectrum penicillin antibiotic capsules for treating various bacterial infections. Requires active pharmacist verification.",
    sku: "MED-HG-AX1"
  },
  {
    name: "Vitamin C Effervescent",
    category: "Vitamins",
    brand: "HealthGuard",
    price: 12.50,
    stock: 8,
    requiresRx: false,
    badge: "Low Stock",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgb9pE4ww5OLjFz7YBPUBbqh_ZaX_PA2nwU3rnk_DzndXVANNql4nWBOPihycHf30v3Z-gJIg5Ka2q9n7fwBQPMEQg7FJQuTi3FZlkRcALAwJzBRZ7SerKkc8ogHwDBf3Ej7ynQlBV7pFGhK1de0Wea_QpLyD7qCYjOhE39TzdhBDgndJdveQPmBfurG4Atdq9O0S6IYA-gWnU5_sDdp1JG0C2VxAf_6-p30M7jV0T51N7w0vpodUgokEig8FsPOyuNRRA8LLaCQ8s",
    description: "Immunity support effervescent tablets with natural orange flavor. Fast-dissolving tablets containing 1000mg Vitamin C.",
    sku: "VIT-HG-C1"
  },
  {
    name: "Aspirin 81mg",
    category: "First Aid",
    brand: "Bayer",
    price: 8.99,
    originalPrice: 12.99,
    stock: 1240,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmdI2es6gtor3mmlZYv6ijKCJm7nWkKqxA5k93v85U8yen4BHpCjaJMyFKscUUkrblH0Muv9pUNGcCF2eVBg71t6LLDjaga_3ZPtEDBwmXPa3VRyImdaYQl9CUWE1eTt0-fQ9746pPQEwLkFCMU2abb2D8ZjgoKjGOd-qQdMXltIs-mPsHvEcHqy5S1ZQ3139cn_VUTsf3cCgX72se4D_Gag4c3hzFx-aM-nJb-aNduMiRmPRTppVj5eFg9pTZUnQvNPgJ-sl55R-C",
    description: "Aspirin 81mg is a low-dose antiplatelet medicine used to reduce the risk of heart attack and stroke in people with cardiovascular disease. It helps prevent blood clots by reducing platelet aggregation.",
    sku: "FA-BY-ASP",
    medicalSections: [
      {
        title: "Overview",
        content: "Aspirin 81mg is a low-dose antiplatelet medicine used to reduce the risk of heart attack and stroke in people with cardiovascular disease. It helps prevent blood clots by reducing platelet aggregation."
      },
      {
        title: "Uses",
        content: "Low-dose aspirin is clinically indicated for the prevention of cardiovascular events in high-risk patients. It is primarily used for the prevention of recurrent heart attacks, prevention of recurrent ischemic stroke, and management of stable or unstable angina."
      },
      {
        title: "How It Works",
        content: "Aspirin works by irreversibly inhibiting the cyclooxygenase-1 (COX-1) enzyme in platelets. This prevents the synthesis of thromboxane A2, a powerful promoter of platelet aggregation and blood clotting, thereby reducing the likelihood of arterial blockages."
      }
    ],
    composition: [
      { ingredient: "Aspirin", strength: "81 mg", purpose: "Antiplatelet Agent" }
    ],
    benefits: [
      { title: "Helps prevent blood clot formation", description: "Reduces the risk of arterial blockages and blood clots in high-risk cardiovascular patients." },
      { title: "Reduces cardiovascular risk", description: "Lowers the incidence of secondary heart attacks and ischemic strokes." },
      { title: "Doctor-recommended low-dose therapy", description: "Provides the optimal clinical dosage for daily antiplatelet therapy under medical supervision." },
      { title: "Suitable for long-term use", description: "Enteric coating helps protect the stomach lining during long-term daily administration." }
    ],
    usageInstructions: [
      "Take once daily or as prescribed by your physician.",
      "Swallow the tablet whole with a full glass of water.",
      "Preferably take after meals to minimize gastric discomfort.",
      "Do not crush, chew, or break enteric-coated tablets unless instructed."
    ],
    storageInstructions: [
      "Store below 25°C in a dry place.",
      "Protect from direct moisture and humidity.",
      "Keep out of reach of children and pets."
    ],
    warnings: [
      "Do not take if you have a history of bleeding disorders or aspirin allergies.",
      "Use with extreme caution if you have active stomach ulcers or gastritis.",
      "Discontinue use and consult a physician if you notice unusual bruising or bleeding.",
      "Inform your surgeon or dentist about daily aspirin therapy before any procedure."
    ],
    sideEffects: [
      "Mild stomach irritation or heartburn",
      "Nausea or dyspepsia",
      "Increased bleeding tendency (e.g. nosebleeds, easy bruising)"
    ],
    safetyCards: [
      { icon: "Pregnancy", title: "Pregnancy", status: "Consult Doctor", description: "Use during pregnancy only under strict medical supervision, especially in the third trimester." },
      { icon: "Breastfeeding", title: "Breastfeeding", status: "Consult Doctor", description: "Aspirin passes into breast milk. Consult your doctor before using while nursing." },
      { icon: "Alcohol", title: "Alcohol", status: "Avoid", description: "Avoid alcohol as it increases the risk of stomach irritation and gastrointestinal bleeding." },
      { icon: "Driving", title: "Driving", status: "Generally Safe", description: "Does not affect alertness or motor skills." },
      { icon: "Kidney", title: "Kidney", status: "Use With Caution", description: "May affect renal function. Monitor closely if you have pre-existing kidney disease." },
      { icon: "Liver", title: "Liver", status: "Consult Doctor", description: "Use with caution in patients with severe hepatic impairment." },
      { icon: "Children", title: "Children", status: "Not Recommended", description: "Do not give to children or teenagers due to the risk of Reye's syndrome." },
      { icon: "Elderly", title: "Elderly", status: "Use With Caution", description: "Higher risk of gastrointestinal bleeding. Regular monitoring is advised." }
    ],
    faqs: [
      { question: "What is Aspirin 81mg used for?", answer: "Aspirin 81mg is a low-dose antiplatelet medicine used to reduce the risk of heart attack and stroke in people with cardiovascular disease." },
      { question: "Can I take it every day?", answer: "Yes, low-dose aspirin is typically prescribed for daily use. However, you should only start daily aspirin therapy under the guidance of a doctor." },
      { question: "Can it be taken after food?", answer: "Yes, taking aspirin after food or with milk is highly recommended to protect your stomach lining and reduce heartburn." },
      { question: "Can it be taken with blood pressure medicines?", answer: "Generally yes, but some blood pressure medications (like ACE inhibitors) can interact. Always inform your doctor of all medicines you are taking." },
      { question: "What happens if I miss a dose?", answer: "Take the missed dose as soon as you remember. If it is almost time for your next dose, skip the missed dose and resume your regular schedule. Do not double the dose." },
      { question: "Can pregnant women take Aspirin?", answer: "Pregnant women should only take aspirin if specifically prescribed by their obstetrician, often to prevent preeclampsia. Otherwise, avoid it." },
      { question: "Is Aspirin safe for elderly patients?", answer: "Yes, but elderly patients are at a higher risk for stomach irritation and bleeding. Close medical monitoring is recommended." },
      { question: "When should I consult my doctor?", answer: "Consult your doctor immediately if you experience severe stomach pain, black or tarry stools, coughing up blood, or any signs of an allergic reaction." }
    ],
    specifications: [
      { label: "Manufacturer", value: "Bayer Healthcare" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Dosage Form", value: "Enteric Coated Tablets" },
      { label: "Package Quantity", value: "100 Tablets" },
      { label: "Storage Temperature", value: "Below 25°C" }
    ],
    seo: {
      metaTitle: "Buy Bayer Aspirin 81mg Low-Dose Tablets | WellMeds",
      metaDescription: "Order Bayer Aspirin 81mg low-dose heart health tablets online. Authentic antiplatelet medicine, fast delivery, and licensed pharmacist verification.",
      keywords: "aspirin 81mg, low dose aspirin, bayer aspirin, antiplatelet, heart health",
      canonicalUrl: "",
      ogImage: ""
    }
  },
  {
    name: "CeraVe Moisturizer",
    category: "Personal Care",
    brand: "HealthGuard",
    price: 18.99,
    stock: 0,
    requiresRx: false,
    badge: "Out of Stock",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVy8Z_2nk9b8DYet4JJ64Hs866Xpliapo1ZO9mnopOcnjc8KOBGplBW23Z5lEqd6n7j0AkAKjxfM3PCBJ6M23SedlI-QDkodWqhAcD3nCkSWgg5oc50FCC6HGpSqKiB0p6O3sK_2jOn5_KU-NUZhnHP9wCF0CdtECkGoxkH1Z8SeXnkgbb8WF45friHVrywWgjgyF5l2g3rswdPn-xPCLkZJokwGEBMK2sPmrcsaSsEXE2CptmXNZmKJOoj_NHjEGBNUc0753NZXtG",
    description: "Daily hydrating body and face moisturizing lotion with ceramides to restore skin barrier protective properties.",
    sku: "SKIN-CV-MST"
  }
];

export const INITIAL_COUPONS = [
  {
    code: "MEDISAVE20",
    discountType: "percentage",
    discountAmount: 20,
    discountValue: 20,
    minOrderValue: 50,
    minimumOrder: 50,
    expiryDate: new Date("2028-12-31"),
    isActive: true,
  },
  {
    code: "FREE10",
    discountType: "fixed",
    discountAmount: 10,
    discountValue: 10,
    minOrderValue: 30,
    minimumOrder: 30,
    expiryDate: new Date("2028-12-31"),
    isActive: true,
  }
];
