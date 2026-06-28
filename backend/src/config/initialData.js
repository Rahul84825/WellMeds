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
    name: "Bayer Aspirin 81mg",
    category: "First Aid",
    brand: "HealthGuard",
    price: 8.99,
    stock: 1240,
    requiresRx: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmdI2es6gtor3mmlZYv6ijKCJm7nWkKqxA5k93v85U8yen4BHpCjaJMyFKscUUkrblH0Muv9pUNGcCF2eVBg71t6LLDjaga_3ZPtEDBwmXPa3VRyImdaYQl9CUWE1eTt0-fQ9746pPQEwLkFCMU2abb2D8ZjgoKjGOd-qQdMXltIs-mPsHvEcHqy5S1ZQ3139cn_VUTsf3cCgX72se4D_Gag4c3hzFx-aM-nJb-aNduMiRmPRTppVj5eFg9pTZUnQvNPgJ-sl55R-C",
    description: "Low-dose pain reliever and heart health support tablets. Relieves minor aches and pains temporarily.",
    sku: "FA-HG-ASP"
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
    minOrderValue: 50,
    expiryDate: new Date("2028-12-31"),
    isActive: true,
  },
  {
    code: "FREE10",
    discountType: "fixed",
    discountAmount: 10,
    minOrderValue: 30,
    expiryDate: new Date("2028-12-31"),
    isActive: true,
  }
];
