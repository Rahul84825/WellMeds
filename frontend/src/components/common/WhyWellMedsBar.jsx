import React from "react";
import { ShieldCheck, Factory, Truck, Percent } from "lucide-react";

const WhyWellMedsBar = () => {
  const items = [
    {
      id: "authentic",
      title: "Authentic Medicines",
      description: "100% genuine with batch traceability.",
      icon: ShieldCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      id: "sourcing",
      title: "Direct Manufacturer Sourcing",
      description: "FDA & WHO-GMP certified partners.",
      icon: Factory,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "delivery",
      title: "Fast & Safe Delivery",
      description: "Temperature-controlled express shipping.",
      icon: Truck,
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      textColor: "text-teal-600 dark:text-teal-400"
    },
    {
      id: "savings",
      title: "Up to 85% Savings",
      description: "Direct manufacturer pricing.",
      icon: Percent,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      textColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <section className="pt-16 pb-14 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1D2B5C] dark:text-zinc-100 mb-12 font-poppins tracking-tight">
          Why <span className="text-[#038076]">WellMeds</span>?
        </h2>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id} 
                className="flex flex-col items-center text-center relative select-none px-2 lg:px-4"
              >
                {/* Subtle vertical separator for desktop */}
                {index < items.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-slate-200 dark:bg-zinc-800" />
                )}

                {/* Rounded Icon Background */}
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shrink-0 ${item.bgColor} ${item.textColor}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center min-w-0 w-full">
                  <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-zinc-200 font-poppins mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-[240px]">
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
