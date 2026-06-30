import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/imported/Hero";
import Timeline from "../components/imported/Timeline";
import FeatureGrid from "../components/imported/FeatureGrid";
import SpecialtyCategories from "../components/imported/SpecialtyCategories";
import Stats from "../components/imported/Stats";
import RequestForm from "../components/imported/RequestForm";
import FAQ from "../components/imported/FAQ";

const ImportedMedicinesPage = () => {
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Set Document SEO Metadata
    document.title = "Imported Medicines in India - Buy Imported Medicines Online | WellMeds";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Access genuine imported cancer, transplant, and rare disease medicines online in India. Direct manufacturer sourcing, validated cold-chain logistics, and full import documentation support."
      );
    }

    // Inject JSON-LD Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Imported Medicines",
          "item": window.location.href
        }
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long does the import process take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Typically, procurement and customs clearance take between 7 to 14 business days. For critical emergency cases, we can fast-track flight bookings and clearances to deliver within 5 to 7 days."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need a prescription to order imported medicines?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Under Indian drug regulations, importing medicines for personal use requires a valid prescription from a registered specialist, along with a patient-named import permit (Form 12A)."
          }
        },
        {
          "@type": "Question",
          "name": "Are these imported medicines genuine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. We source all medications directly from the brand manufacturers or their licensed international distributors. Every shipment is accompanied by a Certificate of Analysis (CoA), original invoices, and customs bill of entry."
          }
        }
      ]
    };

    const script1 = document.createElement("script");
    script1.type = "application/ld+json";
    script1.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.type = "application/ld+json";
    script2.text = JSON.stringify(faqSchema);
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  const handleBrowseClick = () => {
    const el = document.getElementById("import-request-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRequestClick = () => {
    const el = document.getElementById("import-request-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-zinc-950/20 py-sm px-6 sm:px-12 lg:px-24 text-left border-b border-slate-100 dark:border-zinc-900">
        <div className="max-w-[1440px] mx-auto text-xs text-slate-550 dark:text-zinc-400 font-bold flex items-center gap-xs">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-zinc-100">Imported Medicines</span>
        </div>
      </div>

      <Hero onBrowseClick={handleBrowseClick} onRequestClick={handleRequestClick} />
      <Timeline />
      <FeatureGrid />
      <SpecialtyCategories />
      <Stats />
      <RequestForm />
      <FAQ />
    </div>
  );
};

export default ImportedMedicinesPage;
