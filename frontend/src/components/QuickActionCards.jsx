import React from "react";
import { Link } from "react-router-dom";
import { FileText, HeartPulse, MessageSquare, Tag, ChevronRight } from "lucide-react";

const QuickActionCards = () => {
  const cards = [
    {
      id: 1,
      title: "Patient Assistance Program",
      actionText: "LEARN MORE",
      icon: HeartPulse,
      to: "/patient-assistance-program",
      ariaLabel: "Patient Assistance Program. LEARN MORE.",
      orderClass: "order-1 md:order-none",
      colors: {
        cardBg: "bg-[#fff0eb] hover:bg-[#ffe5dc]",
        cardBorder: "border-[#ffe0d3] hover:border-[#ffd0bd]",
        iconColor: "text-[#ff4d4d]",
        actionColor: "text-[#ff4d4d]",
      }
    },
    {
      id: 2,
      title: "Order By Prescription",
      actionText: "UPLOAD NOW",
      icon: FileText,
      to: "/upload-prescription",
      ariaLabel: "Order By Prescription. UPLOAD NOW.",
      orderClass: "order-2 md:order-none",
      colors: {
        cardBg: "bg-[#edf2f7] hover:bg-[#e2ebf3]",
        cardBorder: "border-[#dbe7f0] hover:border-[#cbdced]",
        iconColor: "text-[#004782]",
        actionColor: "text-[#004782]",
      }
    },
    {
      id: 3,
      title: "Why People Love Us?",
      actionText: "READ REVIEWS",
      icon: MessageSquare,
      to: "/how-we-keep-you-safe",
      ariaLabel: "Why People Love Us? READ REVIEWS.",
      orderClass: "order-3 md:order-none",
      colors: {
        cardBg: "bg-[#eafaf1] hover:bg-[#dbf5e7]",
        cardBorder: "border-[#d3f4e2] hover:border-[#bbf0d2]",
        iconColor: "text-[#038076]",
        actionColor: "text-[#038076]",
      }
    },
    {
      id: 4,
      title: "How We give 85% Discount?",
      actionText: "EXPLORE NOW",
      icon: Tag,
      to: "/about",
      ariaLabel: "How We give 85% Discount? EXPLORE NOW.",
      orderClass: "order-4 md:order-none",
      colors: {
        cardBg: "bg-[#fff0f3] hover:bg-[#ffe3e8]",
        cardBorder: "border-[#ffd9e1] hover:border-[#ffbfcc]",
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
          /* Custom pastel border/bg colors override on mobile */
          .quick-action-card-link.bg-\\[\\#fff0eb\\] .quick-action-icon-wrap { background-color: #fff0eb !important; border-color: #ffe0d3 !important; }
          .quick-action-card-link.bg-\\[\\#edf2f7\\] .quick-action-icon-wrap { background-color: #edf2f7 !important; border-color: #dbe7f0 !important; }
          .quick-action-card-link.bg-\\[\\#eafaf1\\] .quick-action-icon-wrap { background-color: #eafaf1 !important; border-color: #d3f4e2 !important; }
          .quick-action-card-link.bg-\\[\\#fff0f3\\] .quick-action-icon-wrap { background-color: #fff0f3 !important; border-color: #ffd9e1 !important; }

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
