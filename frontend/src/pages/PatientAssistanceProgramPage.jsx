import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/pap/Hero";
import Timeline from "../components/pap/Timeline";
import Eligibility from "../components/pap/Eligibility";
import Programs from "../components/pap/Programs";
import Stats from "../components/pap/Stats";
import ApplicationForm from "../components/pap/ApplicationForm";
import FAQ from "../components/pap/FAQ";

const PatientAssistanceProgramPage = () => {
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Set Document SEO Metadata
    document.title = "Patient Assistance Program India - Subsidized Cancer Medicines | WellMeds";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Apply for Patient Assistance Programs (PAP) in India. Access subsidized or free oncology, transplant, and chronic care medicines with dedicated caseworker assistance."
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
          "name": "Patient Assistance Program",
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
          "name": "Who qualifies for the Patient Assistance Program?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Eligibility is primarily based on clinical need (having a valid prescription for a covered specialty medication from a certified specialist) and financial assessment (demonstrating that the cost of therapy exceeds your household's disposable income)."
          }
        },
        {
          "@type": "Question",
          "name": "Is the Patient Assistance Program free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, applying through WellMeds is completely free. We do not charge any coordination or facilitation fees. The cost of the medication itself is either fully subsidized or partially subsidized."
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

  const handleApplyClick = (programName) => {
    setSelectedProgram(programName);
    const el = document.getElementById("pap-application-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckEligibilityClick = () => {
    const el = document.getElementById("pap-application-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleTalkPharmacistClick = () => {
    const el = document.getElementById("pap-application-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-zinc-950/20 py-sm px-6 sm:px-12 lg:px-24 text-left border-b border-slate-100 dark:border-zinc-900">
        <div className="max-w-[1440px] mx-auto text-xs text-slate-550 dark:text-zinc-400 font-bold flex items-center gap-xs">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-zinc-100">Patient Assistance Program (PAP)</span>
        </div>
      </div>

      <Hero 
        onCheckEligibilityClick={handleCheckEligibilityClick} 
        onTalkPharmacistClick={handleTalkPharmacistClick} 
      />

      {/* What is PAP: Two Column Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900 text-left">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-850 dark:text-zinc-100 leading-tight">
              Understanding Patient Assistance Programs (PAP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              Patient Assistance Programs are corporate social responsibility and patient-access initiatives run by global pharmaceutical companies (like Roche, AstraZeneca, Novartis, and Pfizer). These programs are designed to help patients who cannot afford the full cost of high-value specialty medications.
            </p>
            <p className="text-xs sm:text-sm text-[#086b53] dark:text-emerald-400 font-bold">
              Through these programs, manufacturers provide medicines either free of charge or at heavily subsidized co-payment rates to qualifying individuals.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-800/80 p-lg rounded-2xl space-y-md">
            <h3 className="font-extrabold text-base text-slate-850 dark:text-zinc-150">
              How Patients Benefit
            </h3>
            <ul className="space-y-sm text-xs text-slate-550 dark:text-zinc-400 font-medium list-disc pl-md">
              <li>Access to premium FDA-approved medications at a fraction of their retail price.</li>
              <li>Continuity of long-term treatments (like oncology cycles) without financial interruptions.</li>
              <li>Full assistance with dossier compilation and manufacturer coordination by WellMeds.</li>
              <li>Safe dispensing and delivery via validated cold-chain shipping.</li>
            </ul>
          </div>
        </div>
      </section>

      <Timeline />
      <Eligibility />
      <Programs onApplyClick={handleApplyClick} />
      <Stats />
      <ApplicationForm selectedProgram={selectedProgram} />
      <FAQ />
    </div>
  );
};

export default PatientAssistanceProgramPage;
