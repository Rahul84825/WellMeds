import React from "react";
import { FileText, Stethoscope, ShieldCheck, FlaskConical, ChevronRight } from "lucide-react";

const QuickActionCards = () => {
  const cards = [
    {
      id: 1,
      title: "Essential Recovery Kits",
      actionText: "EXPLORE NOW",
      icon: FileText,
      href: "#",
      ariaLabel: "Essential Recovery Kits. EXPLORE NOW.",
      colors: {
        cardBg: "bg-[#e6f7f0] hover:bg-[#d6f2e6]",
        cardBorder: "border-[#c3efdb] hover:border-[#ade4cb]",
        iconColor: "text-[#028076]",
        actionColor: "text-[#028076]",
      }
    },
    {
      id: 2,
      title: "Upload Your Medical Prescription",
      actionText: "UPLOAD NOW",
      icon: Stethoscope,
      href: "#",
      ariaLabel: "Upload Prescription. Upload Now.",
      colors: {
        cardBg: "bg-[#f0eefc] hover:bg-[#e4e1fb]",
        cardBorder: "border-[#dedbfb] hover:border-[#cdb9fa]",
        iconColor: "text-[#6366f1]",
        actionColor: "text-[#6366f1]",
      }
    },
    {
      id: 3,
      title: "How We Keep You Safe",
      actionText: "LEARN MORE",
      badge: "New",
      icon: ShieldCheck,
      href: "#",
      ariaLabel: "Keep You Safe. LEARN MORE.",
      colors: {
        cardBg: "bg-[#fdf6e2] hover:bg-[#faf0cb]",
        cardBorder: "border-[#f3e8c4] hover:border-[#e9d69e]",
        iconColor: "text-[#d97706]",
        actionColor: "text-[#b45309]",
      }
    },
    {
      id: 4,
      title: "Get 30% off on Wellness Products",
      actionText: "EXPLORE NOW",
      icon: FlaskConical,
      href: "#",
      ariaLabel: "Get 30% off on Wellness Products. EXPLORE NOW.",
      colors: {
        cardBg: "bg-[#fff0f2] hover:bg-[#ffe3e7]",
        cardBorder: "border-[#ffd6db] hover:border-[#ffbdc5]",
        iconColor: "text-[#e11d48]",
        actionColor: "text-[#be185d]",
      }
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <a
            key={card.id}
            href={card.href}
            className={`group flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 w-full min-h-[88px] ${card.colors.cardBg} ${card.colors.cardBorder}`}
            aria-label={card.ariaLabel}
          >
            {/* Left: Icon Container with subtle background */}
            <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
              {card.badge && (
                <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-[#ba1a1a] rounded uppercase tracking-wider leading-none select-none z-10">
                  {card.badge}
                </span>
              )}
              <IconComponent className={`w-7 h-7 ${card.colors.iconColor}`} />
            </div>

            {/* Center: Title and Action Label */}
            <div className="flex-grow min-w-0 px-3 text-left">
              <h3 className="font-bold text-slate-800 text-[14px] sm:text-[15px] leading-tight mb-0.5 font-poppins">
                {card.title}
              </h3>
              <p className={`text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase font-poppins ${card.colors.actionColor}`}>
                {card.actionText}
              </p>
            </div>

            {/* Right: Clean Chevron Arrow */}
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default QuickActionCards;
