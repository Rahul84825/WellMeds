import React from "react";
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  Stethoscope, 
  Thermometer, 
  Lock 
} from "lucide-react";

const TrustStatsBar = () => {
  const stats = [
    {
      id: "genuine",
      icon: ShieldCheck,
      iconColor: "text-[#038076] dark:text-[#84d6b9]",
      bgAccent: "bg-[#038076]/10 dark:bg-[#038076]/20",
      value: "100%",
      label: "Genuine Medicines",
      caption: "Sourced directly from verified manufacturers with full batch traceability.",
    },
    {
      id: "suppliers",
      icon: Award,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      bgAccent: "bg-[#004782]/10 dark:bg-[#004782]/20",
      value: "50+",
      label: "Verified Suppliers",
      caption: "Sourced exclusively from FDA & WHO-GMP compliant partners.",
    },
    {
      id: "delivery",
      icon: Truck,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      bgAccent: "bg-[#004782]/10 dark:bg-[#004782]/20",
      value: "Fast Delivery",
      label: "Express Shipping",
      caption: "Rapid 2-hour delivery across Pune and reliable shipping pan-India.",
    },
    {
      id: "pharmacists",
      icon: Stethoscope,
      iconColor: "text-[#038076] dark:text-[#84d6b9]",
      bgAccent: "bg-[#038076]/10 dark:bg-[#038076]/20",
      value: "Certified",
      label: "Licensed Pharmacists",
      caption: "Dosage reviews, clinical storage validation, and guidance on alternatives.",
    },
    {
      id: "coldchain",
      icon: Thermometer,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      bgAccent: "bg-[#004782]/10 dark:bg-[#004782]/20",
      value: "Cold Chain",
      label: "Secure Logistics",
      caption: "Temperature-monitored packaging and transit for sensitive medicines.",
    },
    {
      id: "payments",
      icon: Lock,
      iconColor: "text-[#038076] dark:text-[#84d6b9]",
      bgAccent: "bg-[#038076]/10 dark:bg-[#038076]/20",
      value: "Secure Pay",
      label: "Encrypted Checkout",
      caption: "100% safe online payment gateways, UPI, and Cash on Delivery options.",
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight
                         text-[#1D2B5C] dark:text-zinc-100 ">
            Clinical Excellence & <span className="text-[#038076]">Safety Assured</span>
          </h2>
        </div>

        {/* 6-Column Grid of Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className="group flex items-start gap-4 rounded-xl border
                           border-slate-100 bg-white p-5
                           transition-all duration-200
                           hover:-translate-y-1
                           hover:border-[#038076]/25
                           hover:shadow-[0_6px_20px_rgba(3,128,118,0.08)]
                           dark:border-zinc-800 dark:bg-zinc-900
                           dark:hover:border-[#038076]/40"
              >
                {/* Icon Box */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center
                             rounded-xl transition-all duration-200
                             group-hover:scale-105 ${stat.bgAccent}`}
                >
                  <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[16px] font-extrabold text-[#004782] dark:text-primary-fixed-dim leading-none">
                      {stat.value}
                    </span>
                    <h3 className="text-[13px] font-bold text-[#1D2B5C] dark:text-zinc-100 leading-none group-hover:text-[#038076] transition-colors duration-200">
                      {stat.label}
                    </h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    {stat.caption}
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

export default TrustStatsBar;
