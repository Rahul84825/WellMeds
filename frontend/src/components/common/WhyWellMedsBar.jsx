import React from "react";
import { ShieldCheck, Factory, Truck, Percent } from "lucide-react";

const WhyWellMedsBar = () => {
  const items = [
    {
      id: "authentic",
      title: "Authentic Medicines",
      description: "100% genuine medications sourced from verified supply chains with full batch traceability.",
      icon: ShieldCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      id: "sourcing",
      title: "Direct Manufacturer Sourcing",
      description: "Sourced directly from FDA and WHO-GMP compliant pharmaceutical manufacturers.",
      icon: Factory,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "delivery",
      title: "Fast & Safe Delivery",
      description: "Rapid delivery options with temperature-controlled shipping for sensitive medicines.",
      icon: Truck,
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      textColor: "text-teal-600 dark:text-teal-400"
    },
    {
      id: "savings",
      title: "Up to 85% Savings",
      description: "Direct pricing to deliver significant savings on chronic and specialty care therapies.",
      icon: Percent,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      textColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <section className="pt-16 pb-10 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[#1D2B5C] dark:text-zinc-100 mb-10 font-poppins tracking-tight">
          Why <span className="text-[#038076]">WellMeds</span>?
        </h2>

        {/* Items Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-x-8">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id} 
                className="group flex flex-col lg:flex-row items-center lg:items-center gap-3 lg:gap-4 text-center lg:text-left relative select-none"
              >
                {/* Subtle vertical separator for desktop */}
                {index < items.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-slate-200 dark:bg-zinc-800" />
                )}

                {/* Rounded Icon Background */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 ${item.bgColor} ${item.textColor}`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 pr-0 lg:pr-6">
                  {item.id === "authentic" ? (
                    <div className="relative group/tooltip inline-block">
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-poppins cursor-help border-b border-dotted border-slate-300 dark:border-zinc-700 pb-0.5">
                        {item.title}
                      </span>
                      {/* Tooltip for Authentic Medicines */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-800 dark:bg-zinc-800 text-white text-[11px] rounded-lg py-2 px-3 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center shadow-lg font-normal leading-normal">
                        {item.description}
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-zinc-800" />
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-poppins">
                      {item.title}
                    </h3>
                  )}
                  {/* Subtle hover subtext on desktop, and regular subtext on mobile */}
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium lg:hidden">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[200px]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyWellMedsBar;
