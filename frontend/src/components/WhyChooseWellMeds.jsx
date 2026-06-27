import React from "react";
import { 
  Hospital, 
  ShieldCheck, 
  IndianRupee, 
  Truck, 
  PackageCheck, 
  Stethoscope 
} from "lucide-react";

const WhyChooseWellMeds = () => {
  const benefits = [
    {
      id: "genuine",
      title: "100% Genuine Medicines",
      description: "Directly sourced from trusted manufacturers with complete batch traceability.",
      icon: ShieldCheck,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
    },
    {
      id: "pricing",
      title: "Affordable Pricing",
      description: "Competitive pricing with significant savings on long-term treatment plans.",
      icon: IndianRupee,
      iconBg: "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]",
    },
    {
      id: "support",
      title: "Expert Pharmacist Support",
      description: "Licensed pharmacists available to guide patients regarding dosage, storage, and medicine alternatives.",
      icon: Stethoscope,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
    },
    {
      id: "delivery",
      title: "Fast Delivery",
      description: "Rapid delivery across Pune with reliable shipping to customers across India.",
      icon: Truck,
      iconBg: "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]",
    },
    {
      id: "packaging",
      title: "Safe Packaging",
      description: "Medicines are securely packed using tamper-evident and temperature-conscious packaging where required.",
      icon: PackageCheck,
      iconBg: "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]",
      span: "xl:col-span-2",
    },
  ];

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-sm">
          <span className="inline-block bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] text-label-sm px-sm py-[4px] rounded-full font-bold uppercase tracking-wider">
            Our Quality Standards
          </span>
          <h2 className="font-headline-md text-headline-md lg:text-headline-lg lg:font-headline-lg text-on-surface">
            Why Choose <span className="text-[#004782] dark:text-[#a4c9ff]">WellMeds</span>?
          </h2>
          <p className="text-on-surface-variant dark:text-surface-variant font-body-md max-w-2xl mx-auto leading-relaxed">
            Your trusted healthcare partner, committed to providing authentic medicines and expert pharmacist guidance when it matters most.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-lg items-stretch">
          
          {/* Left Column: Featured Trust Card */}
          <div className="md:col-span-1 xl:col-span-5 h-full">
            <div className="bg-gradient-to-br from-[#004782] via-[#055746] to-[#086b53] text-white p-lg md:p-xl rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-lg border border-white/10 min-h-[400px] xl:h-full group hover:shadow-xl transition-all duration-300">
              
              {/* Background glows */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
              <div className="absolute -left-10 -top-10 w-36 h-36 bg-[#a4c9ff]/15 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Content */}
              <div className="space-y-md">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-xs border border-white/20">
                  <Hospital className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-headline-md text-headline-md lg:text-headline-lg text-white mb-2 leading-tight">
                  Trusted by Patients Across India
                </h3>
                <p className="text-white/85 font-body-sm leading-relaxed max-w-md">
                  Families navigating chronic illness, cancer care, and transplant therapies trust WellMeds to secure authentic medicines with complete clinical tracking and fast, temperature-controlled delivery.
                </p>
              </div>

              {/* Google Reviews Badge */}
              <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-md border border-white/15 flex items-center gap-md relative z-10">
                <div className="text-3xl font-extrabold text-white flex items-center gap-0.5 tracking-tight">
                  4.8<span className="text-yellow-400">★</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Google Rating</p>
                  <p className="text-xs text-white/80 font-medium">1000+ Verified Patient Reviews</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Benefit Cards */}
          <div className="md:col-span-1 xl:col-span-7 grid grid-cols-1 xl:grid-cols-2 gap-lg">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={benefit.id}
                  className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-lg rounded-3xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#004782]/30 flex flex-col justify-between h-full group ${
                    benefit.span || ""
                  }`}
                >
                  <div className={`flex flex-col h-full gap-md ${
                    benefit.id === "packaging" ? "xl:flex-row xl:items-start" : ""
                  }`}>
                    
                    {/* Icon Badge */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      benefit.iconBg
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Text Area */}
                    <div className="space-y-1">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {benefit.title}
                      </h4>
                      <p className="text-on-surface-variant dark:text-surface-variant font-body-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseWellMeds;
