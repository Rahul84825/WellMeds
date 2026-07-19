import React from "react";
import { Link } from "react-router-dom";
import { FileText, Stethoscope, ShieldCheck, FlaskConical, ChevronRight } from "lucide-react";

const QuickActionCards = () => {
  const cards = [
    {
      id: 1,
      title: "Essential Recovery Kits",
      actionText: "EXPLORE NOW",
      icon: FileText,
      to: "/surgical",
      ariaLabel: "Essential Recovery Kits. EXPLORE NOW.",
      orderClass: "order-2 md:order-none",
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
      to: "/upload-prescription",
      ariaLabel: "Upload Prescription. Upload Now.",
      orderClass: "order-3 md:order-none",
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
      to: "/how-we-keep-you-safe",
      ariaLabel: "Keep You Safe. LEARN MORE.",
      orderClass: "order-1 md:order-none",
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
      to: "/wellness",
      ariaLabel: "Get 30% off on Wellness Products. EXPLORE NOW.",
      orderClass: "order-4 md:order-none",
      colors: {
        cardBg: "bg-[#fff0f2] hover:bg-[#ffe3e7]",
        cardBorder: "border-[#ffd6db] hover:border-[#ffbdc5]",
        iconColor: "text-[#e11d48]",
        actionColor: "text-[#be185d]",
      }
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 w-full quick-actions-container">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.id}
              to={card.to}
              className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/45 w-full h-24 md:h-auto md:min-h-[88px] quick-action-card-link ${card.orderClass} ${card.colors.cardBg} ${card.colors.cardBorder}`}
              aria-label={card.ariaLabel}
            >
              {/* Left: Icon Container with subtle background */}
              <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/70 flex items-center justify-center shadow-sm quick-action-icon-wrap">
                {card.badge && (
                  <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-[#ba1a1a] rounded uppercase tracking-wider leading-none select-none z-10">
                    {card.badge}
                  </span>
                )}
                <IconComponent className={`w-5 h-5 sm:w-7 sm:h-7 ${card.colors.iconColor}`} />
              </div>

              {/* Center: Title and Action Label */}
              <div className="flex-grow min-w-0 px-2 sm:px-3 text-left quick-action-text-wrap">
                <h3 className="font-bold text-slate-800 text-[11px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-tight mb-0.5 font-poppins truncate-two-lines quick-action-title">
                  {card.title}
                </h3>
                <p className={`text-[8px] sm:text-[10px] md:text-[11px] font-extrabold tracking-wider uppercase font-poppins quick-action-cta ${card.colors.actionColor}`}>
                  {card.actionText}
                </p>
              </div>

              {/* Right: Clean Chevron Arrow */}
              <div className="flex-shrink-0 quick-action-chevron-wrap">
                <ChevronRight className="w-4 h-4 sm:w-5 h-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .quick-actions-container {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            width: 100% !important;
            gap: 8px !important;
            padding: 4px 4px !important;
          }
          .quick-action-card-link {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            width: 76px !important;
            min-width: 76px !important;
            max-width: 80px !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            transform: none !important;
          }
          .quick-action-card-link:hover {
            transform: none !important;
            box-shadow: none !important;
          }
          .quick-action-icon-wrap {
            width: 76px !important;
            height: 76px !important;
            border-radius: 20px !important;
            border: 1px solid #e2e8f0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 6px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
          }
          
          /* Custom border/bg colors on mobile */
          .quick-action-card-link.bg-\\[\\#e6f7f0\\] .quick-action-icon-wrap { background-color: #e6f7f0 !important; border-color: #c3efdb !important; }
          .quick-action-card-link.bg-\\[\\#f0eefc\\] .quick-action-icon-wrap { background-color: #f0eefc !important; border-color: #dedbfb !important; }
          .quick-action-card-link.bg-\\[\\#fdf6e2\\] .quick-action-icon-wrap { background-color: #fdf6e2 !important; border-color: #f3e8c4 !important; }
          .quick-action-card-link.bg-\\[\\#fff0f2\\] .quick-action-icon-wrap { background-color: #fff0f2 !important; border-color: #ffd6db !important; }

          .quick-action-icon-wrap svg {
            width: 32px !important;
            height: 32px !important;
          }
          .quick-action-text-wrap {
            text-align: center !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .quick-action-title {
            font-size: 11px !important;
            font-weight: 500 !important;
            line-height: 1.25 !important;
            color: #334155 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            white-space: normal !important;
            margin: 0 !important;
          }
          .quick-action-cta {
            display: none !important;
          }
          .quick-action-chevron-wrap {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default QuickActionCards;