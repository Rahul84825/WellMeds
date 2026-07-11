import React from "react";
import { Heart, FileText, Shield, Percent, ArrowRight } from "lucide-react";

const QuickActionCards = () => {
  const cards = [
    {
      id: 1,
      title: "Patient Assistance Program",
      subtitle: "Helping patients reduce treatment costs.",
      icon: Heart,
      href: "#",
      ariaLabel: "Patient Assistance Program. Helping patients reduce treatment costs.",
      colors: {
        cardBg: "bg-rose-50/60 hover:bg-rose-50",
        cardBorder: "border-rose-100/80 hover:border-rose-200",
        iconBg: "bg-white text-rose-600 shadow-rose-100/50",
        iconColor: "text-rose-600",
        arrowColors: "bg-white text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-rose-200/50",
      }
    },
    {
      id: 2,
      title: "Order By Prescription",
      subtitle: "Upload your prescription securely.",
      icon: FileText,
      href: "#",
      ariaLabel: "Order By Prescription. Upload your prescription securely.",
      colors: {
        cardBg: "bg-sky-50/60 hover:bg-sky-50",
        cardBorder: "border-sky-100/80 hover:border-sky-200",
        iconBg: "bg-white text-sky-700 shadow-sky-100/50",
        iconColor: "text-sky-700",
        arrowColors: "bg-white text-sky-700 group-hover:bg-sky-700 group-hover:text-white group-hover:shadow-sky-200/50",
      }
    },
    {
      id: 3,
      title: "Why Choose WellMeds?",
      subtitle: "Trusted by thousands across India.",
      icon: Shield,
      href: "#",
      ariaLabel: "Why Choose WellMeds? Trusted by thousands across India.",
      colors: {
        cardBg: "bg-emerald-50/60 hover:bg-emerald-50",
        cardBorder: "border-emerald-100/80 hover:border-emerald-200",
        iconBg: "bg-white text-emerald-700 shadow-emerald-100/50",
        iconColor: "text-emerald-700",
        arrowColors: "bg-white text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white group-hover:shadow-emerald-200/50",
      }
    },
    {
      id: 4,
      title: "Wellness Offers",
      subtitle: "Exclusive savings every day.",
      icon: Percent,
      href: "#",
      ariaLabel: "Wellness Offers. Exclusive savings every day.",
      colors: {
        cardBg: "bg-amber-50/60 hover:bg-amber-50",
        cardBorder: "border-amber-100/80 hover:border-amber-200",
        iconBg: "bg-white text-amber-700 shadow-amber-100/50",
        iconColor: "text-amber-700",
        arrowColors: "bg-white text-amber-700 group-hover:bg-amber-700 group-hover:text-white group-hover:shadow-amber-200/50",
      }
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <a
            key={card.id}
            href={card.href}
            className={`group flex items-center justify-between p-5 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full min-h-[110px] md:min-h-[120px] lg:h-[120px] ${card.colors.cardBg} ${card.colors.cardBorder}`}
            aria-label={card.ariaLabel}
          >
            {/* Left: Circular Icon Container */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 ${card.colors.iconBg}`}>
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Center: Typography */}
            <div className="flex-grow min-w-0 px-4 text-left">
              <h3 className="font-semibold text-slate-800 text-base leading-tight mb-1 font-poppins">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600 leading-snug font-poppins">
                {card.subtitle}
              </p>
            </div>

            {/* Right: Circular Arrow Button */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-sm group-hover:shadow-md ${card.colors.arrowColors}`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default QuickActionCards;
