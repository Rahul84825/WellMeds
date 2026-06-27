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
    <section className="py-20 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 medical-pattern opacity-30 pointer-events-none"></div>

      <div className="max-w-max-width mx-auto px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
          
          {/* Left Column: 35% Width Marketing */}
          <div className="lg:col-span-4 space-y-5 text-left animate-[fade-in_0.4s_ease-out]">
            <div className="space-y-3">
              <span className="inline-block bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Clinical Grade Catalogue
              </span>
              <h2 className="font-extrabold text-3xl lg:text-4xl text-on-surface leading-tight tracking-tight">
                Surgical & Medical <br />
                <span className="text-[#004782] dark:text-primary-fixed-dim">Equipment Supplies</span>
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-surface-variant leading-relaxed max-w-sm">
                Equip your hospital, clinic, or diagnostic facility with certified medical essentials, sterile instruments, and consumable supplies from verified manufacturers.
              </p>
            </div>

            {/* Action CTA Button */}
            <div>
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-[#004782] hover:bg-[#003c70] text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 select-none"
              >
                Browse Catalogue
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 pt-5 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-[#086b53] font-black text-sm">&#10003;</span> Certified Medical Products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#086b53] font-black text-sm">&#10003;</span> Trusted Manufacturers
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#004782] font-black text-sm">&#10003;</span> Fast Delivery
              </div>
            </div>
          </div>

          {/* Right Column: 65% Width Grid Categories */}
          <div className="lg:col-span-8 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-sm hover:border-[#004782]/20 flex items-start gap-4 group"
                  >
                    {/* Icon Circle */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${cat.iconBg}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm text-on-surface font-extrabold group-hover:text-[#004782] dark:group-hover:text-primary-fixed-dim transition-colors leading-snug">
                        {cat.title}
                      </h4>
                      <p className="text-slate-500 dark:text-zinc-400 font-normal text-xs leading-relaxed line-clamp-2">
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
