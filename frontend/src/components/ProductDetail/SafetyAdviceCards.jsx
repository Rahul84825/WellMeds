import React from 'react';
import { getSafetyIcon, getSafetyStatusBadge } from '../../constants/safetyIcons';
import { ShieldAlert } from 'lucide-react';

/**
 * Standardized Safety Advice Cards component for WellMeds.
 * Displays predefined healthcare illustrations mapped to categories with status badges.
 */
const SafetyAdviceCards = ({ safetyCards = [] }) => {
  if (!safetyCards || safetyCards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {safetyCards.map((card, idx) => {
        const categoryName = card.title || card.category || card.icon || 'Safety Notice';
        const iconSrc = getSafetyIcon(categoryName) || getSafetyIcon(card.icon);
        const { label, badgeStyle, dotStyle } = getSafetyStatusBadge(card.status);

        return (
          <article
            key={idx}
            className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-sm transition-all duration-200"
          >
            <div className="flex gap-3 sm:gap-4 items-start">
              {/* Illustration container */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 p-2 border border-slate-100 dark:border-zinc-800/60 flex items-center justify-center">
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={`${categoryName} safety illustration`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-[#004782] dark:text-[#a4c9ff]" />
                )}
              </div>

              {/* Text & Content container */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base leading-snug">
                    {categoryName}
                  </h4>

                  {/* Status Badge Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                    {label}
                  </span>
                </div>

                {card.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SafetyAdviceCards;
