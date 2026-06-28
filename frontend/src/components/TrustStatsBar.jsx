import React from "react";
import { 
  Users, 
  IndianRupee, 
  ShieldCheck, 
  Truck 
} from "lucide-react";

const TrustStatsBar = () => {
  const stats = [
    {
      id: "pharmacists",
      icon: ShieldCheck,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      value: "Verified",
      label: "Licensed Pharmacists",
      caption: "All prescriptions verified by certified experts",
    },
    {
      id: "patients",
      icon: Users,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      value: "1000+",
      label: "Happy Patients",
    },
    {
      id: "savings",
      icon: IndianRupee,
      iconColor: "text-[#086b53] dark:text-[#84d6b9]",
      value: "Up To 85%",
      label: "Savings on Medicines",
    },
    {
      id: "genuine",
      icon: ShieldCheck,
      iconColor: "text-[#086b53] dark:text-[#84d6b9]",
      value: "100%",
      label: "Genuine Medicines",
    },
    {
      id: "delivery",
      icon: Truck,
      iconColor: "text-[#004782] dark:text-[#a4c9ff]",
      value: "2 Hours",
      label: "Pune Delivery",
    },
  ];

  return (
    <section className="py-16 bg-surface-container/30 dark:bg-surface-container-high/20 transition-colors duration-300">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/20 p-lg md:p-xl rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.005] hover:shadow-md relative overflow-hidden">
          
          {/* Subtle gradient background overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#004782]/2 to-[#086b53]/2 pointer-events-none"></div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-lg lg:gap-y-0 relative z-10 items-stretch">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.id}
                  className={`flex flex-col items-center text-center px-lg py-sm lg:py-0 transition-transform duration-200 hover:-translate-y-0.5 group ${
                    index < 4 ? "lg:border-r lg:border-outline-variant/30 lg:dark:border-outline/20" : ""
                  } ${
                    stat.id === "delivery" ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center mb-sm group-hover:scale-105 transition-transform duration-200">
                    <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  
                  {/* Stat Value */}
                  <span className="text-3xl font-extrabold text-[#004782] dark:text-primary-fixed-dim leading-none mb-xs">
                    {stat.value}
                  </span>
                  
                  {/* Stat Label */}
                  <span className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant font-bold leading-tight">
                    {stat.label}
                  </span>

                  {/* Caption (if exists) */}
                  {stat.caption && (
                    <p className="text-[11px] text-on-surface-variant/70 dark:text-surface-variant/70 max-w-[160px] mt-xs leading-normal">
                      {stat.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustStatsBar;
