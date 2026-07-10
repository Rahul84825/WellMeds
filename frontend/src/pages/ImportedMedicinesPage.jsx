import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ImportedMedicinesPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Imported Medicines Made Accessible | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Source genuine imported medicines under clinical supervision from trusted global manufacturers with WellMeds.");
  }, []);

  const handleBrowseClick = () => {
    const el = document.getElementById("imported-categories");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactClick = () => {
    const el = document.getElementById("imported-contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const steps = [
    {
      step: "01",
      title: "Request Medicine",
      desc: "Submit your drug query along with a valid specialist prescription.",
      icon: "quickref",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      text: "text-blue-600 dark:text-blue-400"
    },
    {
      step: "02",
      title: "Prescription Verification",
      desc: "Our licensed pharmacists review documentation for compliance.",
      icon: "verified_user",
      bg: "bg-teal-50 dark:bg-teal-950/20",
      text: "text-teal-600 dark:text-teal-400"
    },
    {
      step: "03",
      title: "Global Sourcing",
      desc: "We coordinate with FDA-approved suppliers in US, Europe, or Japan.",
      icon: "language",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-600 dark:text-emerald-400"
    },
    {
      step: "04",
      title: "Safe Delivery",
      desc: "Monitored cold-chain shipping directly to your doorstep in India.",
      icon: "local_shipping",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
      text: "text-cyan-600 dark:text-cyan-400"
    }
  ];

  const features = [
    {
      title: "100% Genuine Medicines",
      desc: "Sourced directly from original patent manufacturers with batch Certificates of Analysis (CoA).",
      icon: "security"
    },
    {
      title: "Cold Chain Delivery",
      desc: "Strict 2°C - 8°C temperature control with active logger monitoring to preserve efficacy.",
      icon: "ac_unit"
    },
    {
      title: "Global Supplier Network",
      desc: "Direct access to licensed specialty pharmaceutical channels in US, EU, UK, and Japan.",
      icon: "hub"
    },
    {
      title: "Licensed Pharmacists",
      desc: "End-to-end guidance for Form 12A documentation and customs clearance clearance.",
      icon: "clinical_suite"
    },
    {
      title: "Transparent Pricing",
      desc: "Direct customs bill invoice copy with zero hidden freight fees or custom markups.",
      icon: "payments"
    },
    {
      title: "Pan India Delivery",
      desc: "Secured priority shipping across major cities, medical hubs, and remote PIN codes.",
      icon: "distance"
    }
  ];

  const categories = [
    { name: "Oncology", desc: "Advanced cancer therapies, targeted biologics, and immunotherapy drugs.", icon: "biotech" },
    { name: "Transplant", desc: "Immunosuppressants and post-operative transplant support medications.", icon: "health_and_safety" },
    { name: "Rare Diseases", desc: "Orphan drugs for genetic, lysosomal storage, and metabolic conditions.", icon: "emergency" },
    { name: "Hormonal Therapy", desc: "Advanced endocrinology drugs and hormone replacements.", icon: "science" },
    { name: "Neurology", desc: "Medications for ALS, Multiple Sclerosis, and advanced neuro disorders.", icon: "psychology" },
    { name: "Critical Care", desc: "Specialty hospital-use injections and emergency therapeutics.", icon: "vaccines" },
    { name: "Cardiology", desc: "Novel cardiovascular drugs not yet commercially available locally.", icon: "monitor_heart" },
    { name: "Vaccines", desc: "Imported travel vaccines and specialty immunizations.", icon: "shield" }
  ];

  const faqs = [
    {
      q: "How do I request an imported medicine?",
      a: "Simply contact our support team via WhatsApp, phone, or email. You will need to share the drug name and a copy of your specialist's prescription. Our clinical pharmacist will check global availability, estimate timelines, and provide a cost breakdown."
    },
    {
      q: "What documents are required for importing medicines?",
      a: "Under Indian regulations, importing medicines for personal use requires a valid prescription from a registered Indian specialist (recommending the specific drug and dosage), along with patient ID proof (Aadhaar or Passport). We assist you in obtaining the required Form 12A import permit from the CDSCO."
    },
    {
      q: "How long does the import process take?",
      a: "The standard process takes between 7 to 14 business days. This covers international procurement, customs clearance, and local transit. For emergency cases, we can expedite shipments within 5 to 7 days."
    },
    {
      q: "Are these imported medicines genuine and certified?",
      a: "Yes. Every single shipment is sourced from licensed pharmacies or manufacturers abroad and is accompanied by original legal invoices, customs bills of entry, and batch Certificate of Analysis (CoA) to ensure absolute safety."
    },
    {
      q: "How is the cold chain maintained during shipment?",
      a: "We use specialized, validated medical-grade temperature-controlled containers. High-quality temperature loggers are packed inside the box to record temperatures throughout the flight and domestic delivery process."
    },
    {
      q: "Can I return imported medicines?",
      a: "No. Since imported medicines are custom-cleared and procured individually for patient names under specific regulatory permits, returns or order cancellations are not possible once the procurement process begins."
    }
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen text-left">
      {/* Breadcrumbs */}
      <div className="border-b border-outline-variant/30 bg-surface-container-lowest/50 py-sm">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop text-xs font-semibold text-on-surface-variant flex items-center gap-xs">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Imported Medicines</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-xxl bg-gradient-to-b from-[#038076]/5 via-background to-background relative overflow-hidden">
        {/* Decorative Grid BG */}
        <div className="absolute inset-0 opacity-5 pointer-events-none medical-pattern"></div>
        
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-xl items-center relative z-10">
          <div className="lg:col-span-7 space-y-md">
            <span className="inline-flex items-center gap-xs bg-primary/10 text-primary border border-primary/20 px-md py-xs rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">public</span> Global Medical Access
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight">
              Imported Medicines <br/>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Made Accessible</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
              Helping patients source genuine imported medicines under clinical supervision from trusted global manufacturers. Complete legal compliance and safe cold-chain delivery.
            </p>
            <div className="flex flex-wrap gap-md pt-sm">
              <button 
                onClick={handleBrowseClick}
                className="bg-primary hover:bg-[#086b53] text-white px-xl py-sm rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-xs text-sm"
              >
                Browse Medicines <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </button>
              <button 
                onClick={handleContactClick}
                className="border border-outline-variant hover:bg-slate-50 dark:hover:bg-zinc-800 text-on-surface px-xl py-sm rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-sm"
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* Premium Right Side Illustration (CSS Cards) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-full blur-3xl animate-pulse-slow"></div>
              
              {/* Premium Floating Card 1 */}
              <div className="absolute top-10 left-4 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-2xl p-md shadow-lg w-52 transform -rotate-6 transition-transform hover:rotate-0 duration-300 z-20">
                <div className="flex gap-xs items-center mb-xs">
                  <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                  <span className="text-xs font-bold text-on-surface">100% Genuine</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">Sourced from FDA approved global manufacturers.</p>
              </div>

              {/* Premium Floating Card 2 */}
              <div className="absolute bottom-10 right-4 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-2xl p-md shadow-lg w-56 transform rotate-6 transition-transform hover:rotate-0 duration-300 z-10">
                <div className="flex gap-xs items-center mb-xs">
                  <span className="material-symbols-outlined text-secondary text-2xl">ac_unit</span>
                  <span className="text-xs font-bold text-on-surface">Cold Chain Secured</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">Active temperature logging during air travel.</p>
              </div>

              {/* Main Circular Med Icon */}
              <div className="w-40 h-40 bg-gradient-to-tr from-primary to-secondary rounded-3xl shadow-2xl flex items-center justify-center text-white transform rotate-45 animate-float">
                <div className="transform -rotate-45">
                  <span className="material-symbols-outlined text-5xl">language</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-xxl bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Process flow</p>
            <h2 className="text-3xl font-black text-on-surface">How It Works</h2>
            <p className="text-body-sm text-on-surface-variant">Four simple steps to safely procure your prescribed imported therapeutics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg relative">
            {steps.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-background dark:bg-zinc-900/50 border border-outline-variant/30 rounded-2xl p-lg relative flex flex-col justify-between group hover:shadow-md transition-all duration-300"
              >
                {/* Arrow Connector on desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">arrow_forward</span>
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-md">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.text}`}>
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <span className="text-2xl font-black text-on-surface-variant/20">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface mb-xs group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose WellMeds Section */}
      <section className="py-xxl bg-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Quality Assurance</p>
            <h2 className="text-3xl font-black text-on-surface">Why Choose WellMeds</h2>
            <p className="text-body-sm text-on-surface-variant">We ensure clinical precision, genuine documentation, and reliable global transit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/35 dark:border-outline/20 p-lg rounded-2xl flex gap-md items-start hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">{feature.icon}</span>
                </div>
                <div className="space-y-xs">
                  <h3 className="font-bold text-sm text-on-surface">{feature.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Imported Medicines Grid */}
      <section id="imported-categories" className="py-xxl bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Specialty Offerings</p>
            <h2 className="text-3xl font-black text-on-surface">Specialty Therapeutic Areas</h2>
            <p className="text-body-sm text-on-surface-variant">Common clinical categories where imported medication is critical.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="border border-outline-variant/30 bg-background dark:bg-zinc-900 rounded-2xl p-md flex flex-col justify-between hover:border-primary/50 hover:scale-[1.02] transition-all duration-200"
              >
                <div>
                  <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-sm">
                    <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface mb-xs">{cat.name}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-xxl bg-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Clear Doubts</p>
            <h2 className="text-3xl font-black text-on-surface">Frequently Asked Questions</h2>
            <p className="text-body-sm text-on-surface-variant">Everything you need to know about purchasing imported medications.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-sm">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-outline-variant/35 dark:border-outline/20 bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-lg py-md flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="font-bold text-sm text-on-surface pr-sm">{faq.q}</span>
                    <span className={`material-symbols-outlined text-primary text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-lg pb-md text-xs text-on-surface-variant font-medium leading-relaxed border-t border-slate-50 dark:border-zinc-800/50 pt-sm animate-[fade-in_0.2s_ease-out]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Static Contact Section */}
      <section id="imported-contact" className="py-xxl bg-gradient-to-t from-[#038076]/5 via-background to-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/35 dark:border-outline/20 rounded-3xl p-lg md:p-xl shadow-lg max-w-4xl mx-auto text-center space-y-lg relative overflow-hidden">
            {/* Background Accent Gradient */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-sm max-w-xl mx-auto">
              <span className="bg-secondary/10 text-secondary border border-secondary/25 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                Support Desk
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface">Initiate Import Request</h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
                Need an imported medicine? Reach out to our dedicated imports desk. Keep your prescription ready.
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md max-w-3xl mx-auto text-left pt-md">
              <div className="border border-outline-variant/30 rounded-2xl p-md bg-background dark:bg-zinc-900/60">
                <span className="material-symbols-outlined text-primary text-2xl mb-xs">mail</span>
                <h4 className="font-bold text-xs text-on-surface">Email Inquiries</h4>
                <p className="text-xs text-on-surface-variant font-bold mt-xs truncate">imports@wellmeds.in</p>
                <p className="text-[10px] text-on-surface-variant/70 font-semibold truncate">support@wellmeds.in</p>
              </div>

              <div className="border border-outline-variant/30 rounded-2xl p-md bg-background dark:bg-zinc-900/60">
                <span className="material-symbols-outlined text-primary text-2xl mb-xs">call</span>
                <h4 className="font-bold text-xs text-on-surface">Phone Support</h4>
                <p className="text-xs text-on-surface-variant font-bold mt-xs">+91 XXXXX XXXXX</p>
                <p className="text-[10px] text-on-surface-variant/70 font-semibold">Mon - Sat (9am - 7pm)</p>
              </div>

              <div className="border border-outline-variant/30 rounded-2xl p-md bg-background dark:bg-zinc-900/60">
                <span className="material-symbols-outlined text-secondary text-2xl mb-xs">chat</span>
                <h4 className="font-bold text-xs text-on-surface">WhatsApp Direct</h4>
                <p className="text-xs text-on-surface-variant font-bold mt-xs">+91 XXXXX XXXXX</p>
                <p className="text-[10px] text-on-surface-variant/70 font-semibold">Instant reply via WhatsApp</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-md pt-sm">
              <a 
                href="https://wa.me/910000000000" 
                target="_blank" 
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-lg py-sm rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp Us
              </a>
              <a 
                href="mailto:imports@wellmeds.in"
                className="bg-[#004782] hover:bg-[#003866] text-white px-lg py-sm rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span> Email Support
              </a>
              <a 
                href="tel:+910000000000"
                className="border border-[#004782]/45 hover:bg-[#004782]/5 text-[#004782] px-lg py-sm rounded-xl font-bold transition-all active:scale-95 text-xs flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">call</span> Call Helpline
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImportedMedicinesPage;
