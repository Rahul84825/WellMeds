import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Hero from "../components/imported/Hero";
import Timeline from "../components/imported/Timeline";
import FeatureGrid from "../components/imported/FeatureGrid";
import SpecialtyCategories from "../components/imported/SpecialtyCategories";
import Stats from "../components/imported/Stats";
import RequestForm from "../components/imported/RequestForm";
import FAQ from "../components/imported/FAQ";
import Loader from "../components/Loader";

const ImportedMedicinesPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPageData = async () => {
      try {
        const response = await axios.get("/api/cms/imported");
        if (response.data.success) {
          setPageData(response.data.data);
          
          // Dynamic SEO
          const seo = response.data.data.seo;
          document.title = seo.title || "Imported Medicines in India - Buy Imported Medicines Online | WellMeds";
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute("content", seo.description || "Access genuine imported cancer, transplant, and rare disease medicines online in India.");
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
      label: "GLOBAL MEDICINE ACCESS",
      heading: "Imported Medicines from Trusted Global Manufacturers",
      description: "WellMeds helps patients access genuine imported medicines that are unavailable locally. We source directly from trusted international manufacturers while ensuring authenticity, proper documentation, and secure delivery.",
      buttonPrimary: "Browse Imported Medicines",
      buttonSecondary: "Request Imported Medicine",
      imageUrl: ""
    }
  };

  const handleScrollToForm = () => {
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

      {/* Hero Section */}
      <Hero 
        heroData={data.hero}
        onBrowseClick={handleScrollToForm} 
        onRequestClick={handleScrollToForm} 
      />

      {/* How Import Works */}
      <Timeline timelineData={data.timeline} />

      {/* Benefits */}
      <FeatureGrid featuresData={data.features} />

      {/* Specialty Categories */}
      <SpecialtyCategories categoriesData={data.categories} />

      {/* Trust Stats */}
      <Stats statsData={data.stats} />

      {/* Medicine Request Form */}
      <RequestForm />

      {/* FAQ Accordion */}
      <FAQ faqsData={data.faqs} />
    </div>
  );
};

export default ImportedMedicinesPage;
