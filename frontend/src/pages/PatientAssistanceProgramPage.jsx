import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Hero from "../components/pap/Hero";
import Timeline from "../components/pap/Timeline";
import Eligibility from "../components/pap/Eligibility";
import Programs from "../components/pap/Programs";
import Stats from "../components/pap/Stats";
import ApplicationForm from "../components/pap/ApplicationForm";
import FAQ from "../components/pap/FAQ";
import Loader from "../components/Loader";

const PatientAssistanceProgramPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPageData = async () => {
      try {
        const response = await axios.get("/api/cms/pap");
        if (response.data.success) {
          setPageData(response.data.data);
          
          // Dynamic SEO
          const seo = response.data.data.seo;
          document.title = seo.title || "Patient Assistance Program India - Subsidized Cancer Medicines | WellMeds";
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute("content", seo.description || "Apply for Patient Assistance Programs (PAP) in India.");
          }
        }
      } catch (err) {
        console.error("Failed to load CMS page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-zinc-900">
        <Loader size="lg" />
      </div>
    );
  }

  // Fallback default values if backend failed to provide data
  const data = pageData || {
    hero: {
      label: "PATIENT SUPPORT",
      heading: "Making Life-Saving Medicines Affordable",
      description: "WellMeds helps eligible patients reduce the financial burden of long-term treatments through verified Patient Assistance Programs offered by pharmaceutical companies.",
      buttonPrimary: "Check Eligibility",
      buttonSecondary: "Talk to Pharmacist",
      imageUrl: ""
    },
    whatIsPap: {
      title: "Understanding Patient Assistance Programs (PAP)",
      desc: "Patient Assistance Programs are corporate social responsibility and patient-access initiatives run by global pharmaceutical companies. These programs are designed to help patients who cannot afford the full cost of high-value specialty medications.",
      points: [
        "Access to premium FDA-approved medications at a fraction of their retail price.",
        "Continuity of long-term treatments without financial interruptions.",
        "Full assistance with dossier compilation and manufacturer coordination by WellMeds.",
        "Safe dispensing and delivery via validated cold-chain shipping."
      ]
    }
  };

  const handleApplyClick = (programName) => {
    setSelectedProgram(programName);
    const el = document.getElementById("pap-application-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToForm = () => {
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

      {/* Hero */}
      <Hero 
        heroData={data.hero}
        onCheckEligibilityClick={handleScrollToForm} 
        onTalkPharmacistClick={handleScrollToForm} 
      />

      {/* What is PAP: Two Column Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900 text-left">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-850 dark:text-zinc-100 leading-tight">
              {data.whatIsPap.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-650 dark:text-zinc-300 leading-relaxed font-medium">
              {data.whatIsPap.desc}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-800/80 p-lg rounded-2xl space-y-md">
            <h3 className="font-extrabold text-base text-slate-850 dark:text-zinc-150">
              How Patients Benefit
            </h3>
            <ul className="space-y-sm text-xs text-slate-550 dark:text-zinc-400 font-medium list-disc pl-md">
              {data.whatIsPap.points && data.whatIsPap.points.map((pt, pIdx) => (
                <li key={pIdx}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <Timeline timelineData={data.timeline} />

      {/* Eligibility */}
      <Eligibility eligibilityData={data.eligibility} />

      {/* Available Programs */}
      <Programs programsData={data.programs} onApplyClick={handleApplyClick} />

      {/* Trust Stats */}
      <Stats statsData={data.stats} />

      {/* Apply Now Form */}
      <ApplicationForm selectedProgram={selectedProgram} />

      {/* FAQ */}
      <FAQ faqsData={data.faqs} />
    </div>
  );
};

export default PatientAssistanceProgramPage;
