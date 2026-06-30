import React from "react";
import { Link } from "react-router-dom";
import { 
  Scissors, 
  Shield, 
  Bandage, 
  Syringe, 
  Bed, 
  Stethoscope 
} from "lucide-react";

const SurgicalProductsSection = () => {
  const categories = [
    {
      id: "instruments",
      title: "Surgical Instruments",
      description: "Premium stainless steel surgical tools for hospital and clinical procedures.",
      icon: Scissors,
      iconBg: "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]",
    },
    {
      id: "ppe",
      title: "Gloves & PPE",
      description: "Sterile medical gloves and protective equipment for clinical staff safety.",
      icon: Shield,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
    },
    {
      id: "woundcare",
      title: "Dressings & Wound Care",
      description: "Sterile bandages, gauze, surgical tapes, and wound dressing kits.",
      icon: Bandage,
      iconBg: "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]",
    },
    {
      id: "syringes",
      title: "Syringes & Needles",
      description: "Disposable medical-grade injections, IV supplies, and needles.",
      icon: Syringe,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
    },
    {
      id: "supplies",
      title: "Hospital Supplies",
      description: "Underpads, patient apparel, bed accessories, and clinical consumables.",
      icon: Bed,
      iconBg: "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]",
    },
    {
      id: "diagnostics",
      title: "Diagnostic Equipment",
      description: "Professional stethoscopes, monitors, and clinical diagnostic tools.",
      icon: Stethoscope,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
    },
  ];

  return (
    <section className="py-5 md:py-20 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 medical-pattern opacity-30 pointer-events-none"></div>
 
      <div className="max-w-max-width mx-auto px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-xl items-center">
          
          {/* Left Column: 35% Width Marketing */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6 text-left animate-[fade-in_0.4s_ease-out]">
            <div className="space-y-3 md:space-y-4">
              <span className="inline-block bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Clinical Grade Catalogue
              </span>
              <h2 className="font-extrabold text-[22px] md:text-3xl lg:text-4xl text-on-surface leading-tight tracking-tight">
                Surgical &amp; Medical <br />
                <span className="text-[#004782] dark:text-primary-fixed-dim">Equipment Supplies</span>
              </h2>
              <p className="text-[13px] md:text-base text-on-surface-variant dark:text-surface-variant leading-relaxed max-w-md">
                Equip your hospital, clinic, or diagnostic facility with certified medical essentials, sterile instruments, and consumable supplies from verified manufacturers.
              </p>
            </div>
 
            {/* Action CTA Button */}
            <div>
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-[#004782] hover:bg-[#003c70] text-white h-[45px] md:py-3.5 px-6 md:px-8 rounded-xl font-semibold text-sm md:text-base shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 select-none"
              >
                Browse Catalogue
              </Link>
            </div>
 
            {/* Trust Badges */}
            <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-slate-100 dark:border-zinc-800 text-[11px] md:text-sm text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <span className="text-[#086b53] font-black text-base">&#10003;</span> Certified Medical Products
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#086b53] font-black text-base">&#10003;</span> Trusted Manufacturers
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#004782] font-black text-base">&#10003;</span> Fast Delivery
              </div>
            </div>
          </div>
 
          {/* Right Column: 65% Width Grid Categories */}
          <div className="lg:col-span-8 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-4 md:p-7 rounded-2xl shadow-xs transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-sm hover:border-[#004782]/20 flex items-start gap-4 md:gap-5 group"
                  >
                    {/* Icon Circle */}
                    <div className={`w-9 h-9 md:w-13 md:h-13 min-w-[36px] md:min-w-[52px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${cat.iconBg}`}>
                      <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
 
                    {/* Content */}
                    <div className="space-y-1 md:space-y-1.5 text-left">
                      <h4 className="text-[16px] md:text-base text-on-surface font-extrabold group-hover:text-[#004782] dark:group-hover:text-primary-fixed-dim transition-colors leading-snug">
                        {cat.title}
                      </h4>
                      <p className="text-slate-500 dark:text-zinc-400 font-normal text-[13px] md:text-sm leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SurgicalProductsSection;
