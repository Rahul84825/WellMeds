export const promoSlides = [
  {
    id: "life-saving-medicines",
    title: "Critical & Life-Saving Medicine Support",
    subtitle: "Struggling to find rare or critical care medicines? Request them directly via WhatsApp. Dedicated clinical team, cold-chain logistics, and immediate dispatch.",
    bgGradient: "from-[#004782] via-[#0b5c9e] to-[#086b53]",
    pattern: "cross",
    cta: [
      { label: "Request via WhatsApp", type: "primary", href: "https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20need%20help%20finding%20a%20medicine.", external: true },
      { label: "Browse Catalog", type: "secondary", to: "/products" }
    ],
    customData: {
      medicines: [
        {
          name: "Sorafenat 200mg",
          brand: "Natco Pharma",
          salt: "Sorafenib Tosylate",
          price: 3450,
          originalPrice: 8900,
          discount: "61% OFF",
          inStock: true,
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60"
        },
        {
          name: "Gefticip 250mg",
          brand: "Cipla Oncology",
          salt: "Gefitinib IP",
          price: 2890,
          originalPrice: 7200,
          discount: "60% OFF",
          inStock: true,
          image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&auto=format&fit=crop&q=60"
        }
      ]
    }
  },
  {
    id: "why-patients-trust",
    title: "Why 15,000+ Patients Trust WellMeds",
    subtitle: "We maintain 100% authentic pharmacy operations, certified clinical pharmacist oversight, and specialized cold-chain integrity for every single delivery.",
    bgGradient: "from-[#086b53] via-[#055743] to-[#004782]",
    pattern: "shield",
    cta: [
      { label: "Learn About Us", type: "primary", to: "/about" },
      { label: "View Certifications", type: "secondary", to: "/about#quality" }
    ],
    customData: {
      stats: [
        { value: "4.9 ★", label: "Google Business Rating", desc: "1,200+ Verified Reviews" },
        { value: "35%", label: "Average Patient Savings", desc: "Bypassing Middlemen Costs" },
        { value: "100%", label: "Authenticity Guarantee", desc: "Sourced Directly from Brands" }
      ]
    }
  },
  {
    id: "exclusive-savings",
    title: "Direct-from-Manufacturer Pricing",
    subtitle: "Bypass distributor markups. WellMeds connects you directly to WHO-GMP certified manufacturers to deliver up to 85% savings on Patient Assistance Program (PAP) therapies.",
    bgGradient: "from-[#0b5c9e] via-[#004782] to-[#086b53]",
    pattern: "hexagon",
    cta: [
      { label: "Check Savings Calculator", type: "primary", to: "/products?filter=imported" },
      { label: "Upload Rx to Compare", type: "secondary", to: "/upload-prescription" }
    ],
    customData: {
      discountHighlight: "Up to 85%",
      badgeText: "Direct Sourced",
      subText: "WHO-GMP Certified Facilities"
    }
  },
  {
    id: "prescription-upload",
    title: "10-Minute Prescription Verification",
    subtitle: "Upload your medical prescription sheet. Our certified clinical pharmacists will review, validate, and call you back within 10 minutes to finalize your order.",
    bgGradient: "from-[#004782] via-[#0b5c9e] to-[#0b5c9e]",
    pattern: "dna",
    cta: [
      { label: "Upload Prescription Now", type: "primary", to: "/upload-prescription" },
      { label: "Quick Upload via WhatsApp", type: "secondary", href: "https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20want%20to%20upload%20my%20prescription.", external: true }
    ],
    customData: {
      steps: [
        { number: "01", title: "Upload Rx Sheet", desc: "Snap a photo or attach PDF" },
        { number: "02", title: "Clinical Audit", desc: "Verified in 10 minutes" },
        { number: "03", title: "Doorstep Delivery", desc: "Cold-chain dispatched" }
      ]
    }
  },
  {
    id: "three-hour-delivery",
    title: "Express 3-Hour Emergency Delivery",
    subtitle: "Urgent medical requirements? Our express delivery riders are active across Pune, Hinjawadi, and PCMC to deliver critical supplies with certified cold-chain bags.",
    bgGradient: "from-[#086b53] via-[#055743] to-[#086b53]",
    pattern: "molecule",
    cta: [
      { label: "Order Express Supplies", type: "primary", to: "/products" },
      { label: "Check Coverage Areas", type: "secondary", to: "/contact" }
    ],
    customData: {
      deliveryAreas: ["Pune City", "PCMC Area", "Hinjawadi Infotech Park", "Hadapsar & Kothrud"],
      dispatchSpeed: "Under 15 Mins",
      riderStatus: "Active & Dispensing"
    }
  }
];
