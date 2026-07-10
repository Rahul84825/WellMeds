import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PatientAssistanceProgramPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Patient Assistance Program (PAP) | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Access manufacturer-backed subsidies for high-cost specialty therapies through the Patient Assistance Program.");
  }, []);

  const handleApplyClick = () => {
    const el = document.getElementById("pap-contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleExpertClick = () => {
    const el = document.getElementById("pap-contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const timelineSteps = [
    { step: "01", title: "Patient Applies", desc: "Submit basic details and upload prescription paperwork." },
    { step: "02", title: "Document Review", desc: "Our team verifies medical reports & financial documents." },
    { step: "03", title: "Eligibility Verification", desc: "We evaluate eligibility against manufacturer criteria." },
    { step: "04", title: "Manufacturer Approval", desc: "Dossier submitted to the pharma brand for subsidy approval." },
    { step: "05", title: "Medicine Support", desc: "Subsidized medicines dispatched under validated cold chain." }
  ];

  const eligibilityCards = [
    { title: "Cancer Patients", desc: "Subsidies for oncology cycles, targeted molecules, and immunotherapies.", icon: "biotech" },
    { title: "Rare Disease Patients", desc: "Support for orphan drug therapies and genetic disorders.", icon: "emergency" },
    { title: "Organ Transplant", desc: "Coverage for lifelong post-transplant immunosuppressant regimens.", icon: "health_and_safety" },
    { title: "Chronic Conditions", desc: "Assistance for complex autoimmune, neurological, and pulmonary diseases.", icon: "psychology" },
    { title: "Financial Need", desc: "Subsidies adjusted dynamically based on household income assessments.", icon: "payments" },
    { title: "Doctor Recommendation", desc: "Endorsement and clinical recommendation from certified medical specialists.", icon: "rate_review" }
  ];

  const benefits = [
    { title: "Lower Medicine Cost", desc: "Up to 100% manufacturer subsidy or co-pay support on high-cost formulations.", icon: "savings" },
    { title: "Manufacturer Support", desc: "Direct access to patient access schemes run by top global pharma brands.", icon: "handshake" },
    { title: "Dedicated Case Manager", desc: "Personal coordinator managing your approvals and application dossiers.", icon: "support_agent" },
    { title: "Fast Processing", desc: "Verification and brand approval coordination completed within 5-7 business days.", icon: "bolt" },
    { title: "Financial Guidance", desc: "Expert guidance on medical trust sponsorships and alternate crowdfunding support.", icon: "menu_book" }
  ];

  const documents = [
    { title: "Prescription", desc: "Original prescription from a registered medical specialist.", icon: "description" },
    { title: "Doctor Letter", desc: "Clinical recommendation letter detailing treatment necessity.", icon: "note_alt" },
    { title: "ID Proof", desc: "Aadhaar card, Passport, or PAN card of the patient.", icon: "badge" },
    { title: "Income Proof", desc: "Latest tax returns, salary slips, or government income certificates.", icon: "request_quote" },
    { title: "Medical Records", desc: "Biopsy reports, diagnostic scans, and hospital discharge summaries.", icon: "folder_open" }
  ];

  const faqs = [
    {
      q: "What is a Patient Assistance Program (PAP)?",
      a: "Patient Assistance Programs are access programs sponsored by top pharmaceutical manufacturers (like Roche, Novartis, Pfizer, and AstraZeneca). They are designed to help patients obtain high-cost specialty therapies (especially for oncology and transplants) at highly subsidized or free-of-cost rates."
    },
    {
      q: "How do I qualify for financial assistance?",
      a: "Eligibility is determined by a combination of clinical criteria (having a valid specialist prescription for a covered drug) and financial criteria (verifying that the household cannot afford full retail pricing). Each program has its own specific criteria."
    },
    {
      q: "Is there a fee to apply for PAP through WellMeds?",
      a: "No. WellMeds facilitates the application, verification, manufacturer coordination, and drug dispensing completely free of charge. There are no registration or coordination fees."
    },
    {
      q: "What pharma brands sponsor these access programs?",
      a: "Most major global and domestic pharma manufacturers sponsor PAPs for high-cost critical care medicines. These include Roche, AstraZeneca, Novartis, MSD, Pfizer, and others."
    },
    {
      q: "How long does the approval process take?",
      a: "Once you submit all required clinical and financial documents to our support desk, the review and manufacturer approval cycle typically takes 5 to 7 business days."
    }
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen text-left">
      {/* Breadcrumbs */}
      <div className="border-b border-outline-variant/30 bg-surface-container-lowest/50 py-sm">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop text-xs font-semibold text-on-surface-variant flex items-center gap-xs">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-primary font-bold">Patient Assistance Program (PAP)</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-xxl bg-gradient-to-b from-[#038076]/5 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none medical-pattern"></div>

        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-xl items-center relative z-10">
          <div className="lg:col-span-7 space-y-md">
            <span className="inline-flex items-center gap-xs bg-primary/10 text-primary border border-primary/20 px-md py-xs rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">handshake</span> Therapy Co-Pay Support
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight">
              Patient Assistance <br/>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Program (PAP)</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
              Helping patients access high-cost specialty therapies at affordable prices. Get guided support through corporate co-payment and manufacturer subsidy programs.
            </p>
            <div className="flex flex-wrap gap-md pt-sm">
              <button 
                onClick={handleApplyClick}
                className="bg-primary hover:bg-[#086b53] text-white px-xl py-sm rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-xs text-sm"
              >
                Apply Now <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </button>
              <button 
                onClick={handleExpertClick}
                className="border border-outline-variant hover:bg-slate-50 dark:hover:bg-zinc-800 text-on-surface px-xl py-sm rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-sm"
              >
                Talk to Expert
              </button>
            </div>
          </div>

          {/* Premium Right Side Illustration */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-85 h-80 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-full blur-3xl animate-pulse-slow"></div>

              {/* dossier decoration card 1 */}
              <div className="absolute top-12 left-2 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-2xl p-md shadow-lg w-52 transform -rotate-6 transition-transform hover:rotate-0 duration-300 z-20">
                <div className="flex gap-xs items-center mb-xs">
                  <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                  <span className="text-xs font-bold text-on-surface">Subsidies Approved</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">Verified by major global pharma brands.</p>
              </div>

              {/* dossier decoration card 2 */}
              <div className="absolute bottom-12 right-2 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-2xl p-md shadow-lg w-56 transform rotate-6 transition-transform hover:rotate-0 duration-300 z-10">
                <div className="flex gap-xs items-center mb-xs">
                  <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                  <span className="text-xs font-bold text-on-surface">Dedicated Support</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">Free coordination and documentation assist.</p>
              </div>

              {/* Main Illustration Block */}
              <div className="w-36 h-36 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center text-white animate-float">
                <span className="material-symbols-outlined text-5xl">volunteer_activism</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How PAP Works (Timeline) */}
      <section className="py-xxl bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Timeline</p>
            <h2 className="text-3xl font-black text-on-surface">How PAP Works</h2>
            <p className="text-body-sm text-on-surface-variant">Simple step-by-step assistance path for co-pay approval.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-md items-stretch">
            {timelineSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex-1 bg-background dark:bg-zinc-900/50 border border-outline-variant/30 rounded-2xl p-md flex flex-col justify-between group hover:shadow-md transition-all duration-300 relative text-left"
              >
                <div>
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">Step {step.step}</span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface mb-xs group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Apply Section */}
      <section className="py-xxl bg-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Patient Criteria</p>
            <h2 className="text-3xl font-black text-on-surface">Who Can Apply</h2>
            <p className="text-body-sm text-on-surface-variant">Our program covers patients matching any of the criteria below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {eligibilityCards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/35 dark:border-outline/20 p-lg rounded-2xl flex gap-md items-start hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">{card.icon}</span>
                </div>
                <div className="space-y-xs">
                  <h3 className="font-bold text-sm text-on-surface">{card.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-xxl bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Added Value</p>
            <h2 className="text-3xl font-black text-on-surface">Program Benefits</h2>
            <p className="text-body-sm text-on-surface-variant">Experience stress-free, fully audited clinical assistance support.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="bg-background dark:bg-zinc-900 border border-outline-variant/30 p-lg rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-all text-left"
              >
                <div>
                  <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-md">
                    <span className="material-symbols-outlined text-2xl">{benefit.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface mb-xs">{benefit.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-xxl bg-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Preparation checklist</p>
            <h2 className="text-3xl font-black text-on-surface">Required Documents</h2>
            <p className="text-body-sm text-on-surface-variant">Keep these documents ready for verification and file approval.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
            {documents.map((doc, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm transition-all text-left"
              >
                <div>
                  <div className="w-8 h-8 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center mb-sm">
                    <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                  </div>
                  <h3 className="font-bold text-xs text-on-surface mb-xs">{doc.title}</h3>
                  <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-xxl bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center space-y-xs max-w-2xl mx-auto mb-xl">
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider">Clear Doubts</p>
            <h2 className="text-3xl font-black text-on-surface">Frequently Asked Questions</h2>
            <p className="text-body-sm text-on-surface-variant">Common queries regarding Patient Assistance Program guidelines.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-sm">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-outline-variant/35 dark:border-outline/20 bg-background dark:bg-zinc-900/60 rounded-2xl overflow-hidden transition-all"
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
      <section id="pap-contact" className="py-xxl bg-gradient-to-t from-[#038076]/5 via-background to-background">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/35 dark:border-outline/20 rounded-3xl p-lg md:p-xl shadow-lg max-w-4xl mx-auto text-center space-y-lg relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-sm max-w-xl mx-auto">
              <span className="bg-secondary/10 text-secondary border border-secondary/25 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                Support Desk
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface">Start Your PAP Application</h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
                Connect with our dedicated co-pay assistance managers to submit files for manufacturer evaluation.
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md max-w-3xl mx-auto text-left pt-md">
              <div className="border border-outline-variant/30 rounded-2xl p-md bg-background dark:bg-zinc-900/60">
                <span className="material-symbols-outlined text-primary text-2xl mb-xs">mail</span>
                <h4 className="font-bold text-xs text-on-surface">Email Inquiries</h4>
                <p className="text-xs text-on-surface-variant font-bold mt-xs truncate">pap@wellmeds.in</p>
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
                href="mailto:pap@wellmeds.in"
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

export default PatientAssistanceProgramPage;
