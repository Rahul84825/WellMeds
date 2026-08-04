/**
 * WellMeds Centralized Business & Contact Configuration
 * Single Source of Truth for Storefront Contact Info, WhatsApp, Address, & Schema.org Metadata.
 */

export const BUSINESS_INFO = {
  name: "WellMeds",
  legalName: "WellMeds Pharmacy",
  phone: "+91 7798795353",
  phoneDisplay: "+91 77987 95353",
  phoneRaw: "+917798795353",
  whatsappNumber: "917798795353",
  whatsappUrl: "https://wa.me/917798795353",
  email: "info@wellmeds.in",
  supportEmail: "info@wellmeds.in",
  hours: "Every Day 08:00 AM – 11:00 PM",
  hoursDisplay: "Open Daily 8:00 AM – 11:00 PM",
  address: {
    shopNo: "Shop No 3",
    building: "Echelon Apartment",
    street: "Baner - Pashan Link Rd, Baner",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411021",
    country: "India",
    countryCode: "IN",
    formatted: "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021, India",
    shortFormatted: "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021",
    lines: [
      "Shop No 3,",
      "Echelon Apartment,",
      "Baner - Pashan Link Rd,",
      "Baner, Pune, Maharashtra 411021"
    ]
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    "name": "WellMeds",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411021",
      "addressCountry": "IN"
    },
    "telephone": "+91 7798795353",
    "email": "info@wellmeds.in",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "23:00"
    }
  }
};

export const getWhatsAppLink = (message = "") => {
  if (!message) return BUSINESS_INFO.whatsappUrl;
  return `${BUSINESS_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`;
};

export default BUSINESS_INFO;
