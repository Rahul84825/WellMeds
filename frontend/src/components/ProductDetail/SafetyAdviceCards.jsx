import React from 'react';
import { getSafetyIcon, getSafetyStatusBadge } from '../../constants/safetyIcons';
import { ShieldAlert } from 'lucide-react';

/**
 * Standardized Safety Advice Cards component for WellMeds.
 * Displays predefined healthcare illustrations mapped to categories with status badges.
 */
const VALID_CATEGORIES = [
  'pregnancy',
  'breast feeding',
  'breastfeeding',
  'alcohol',
  'driving',
  'liver',
  'kidney'
];

/**
 * Standardized Safety Advice Cards component for WellMeds.
 * Displays only admin-selected healthcare categories with status badges and descriptions.
 */
const SafetyAdviceCards = ({ safetyCards = [] }) => {
  // Only render cards that match the 6 explicitly defined Admin Safety Categories
  const validCards = (safetyCards || []).filter((card) => {
    if (!card) return false;
    const cat = String(card.title || card.category || card.icon || '')
      .trim()
      .toLowerCase();
    return VALID_CATEGORIES.includes(cat);
  });

  if (!validCards || validCards.length === 0) {
    return (
      <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center select-none">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium font-sans">
          No safety information available for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 select-none font-sans">
      {validCards.map((card, idx) => {
        const categoryName = card.title || card.category || card.icon || 'Safety Notice';
        const iconSrc = getSafetyIcon(categoryName) || getSafetyIcon(card.icon);
        const { label, badgeStyle, dotStyle } = getSafetyStatusBadge(card.status);
        const descriptionText = card.description || card.desc || card.details || card.content || '';

        return (
          <article
            key={idx}
            className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-sm transition-all duration-200"
          >
            <div className="flex gap-3 sm:gap-4 items-start">
              {/* Illustration container */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 p-2 border border-slate-100 dark:border-zinc-800/60 flex items-center justify-center">
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={`${categoryName} safety advice illustration`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-[#004782] dark:text-[#a4c9ff]" />
                )}
              </div>

              {/* Text & Content container */}
              <div className="flex-1 min-w-0 space-y-1.5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base leading-snug font-sans">
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

                {descriptionText ? (
                  <p className="text-xs sm:text-sm text-slate-650 dark:text-zinc-300 leading-relaxed font-normal font-sans pt-0.5 break-words">
                    {descriptionText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic font-sans">
                    Consult your doctor or medical specialist for specific advice.
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
