import React from 'react';
import { getSafetyIcon, getSafetyStatusBadge } from '../../constants/safetyIcons';
import { ShieldAlert } from 'lucide-react';

const VALID_CATEGORIES = [
  'pregnancy',
  'breast feeding',
  'breastfeeding',
  'alcohol',
  'driving',
  'liver',
  'kidney'
];

const SafetyAdviceCards = ({ safetyCards = [] }) => {
  const validCards = (safetyCards || []).filter((card) => {
    if (!card) return false;
    const cat = String(card.title || card.category || card.icon || '')
      .trim()
      .toLowerCase();
    return VALID_CATEGORIES.includes(cat);
  });

  if (!validCards || validCards.length === 0) {
    return (
      <div className="p-4 bg-[#f4f8f6] rounded-xl border border-dashed border-[#c3d4cc] text-center select-none font-sans">
        <p className="text-xs text-[#5f776e] font-medium font-sans">
          No specific safety advice recorded for this medicine.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 select-none font-sans">
      {validCards.map((card, idx) => {
        const categoryName = card.title || card.category || card.icon || 'Safety Notice';
        const iconSrc = getSafetyIcon(categoryName) || getSafetyIcon(card.icon);
        const { label, badgeStyle, dotStyle } = getSafetyStatusBadge(card.status);
        const descriptionText = card.description || card.desc || card.details || card.content || '';

        return (
          <article
            key={idx}
            className="p-4 bg-white rounded-xl border border-[#dde8e3] hover:border-[#c3d4cc] shadow-2xs transition-all font-sans"
          >
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 shrink-0 rounded-lg bg-[#f0f8f5] p-2 border border-[#c3d4cc] flex items-center justify-center">
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={`${categoryName} safety advice illustration`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-[#157a6d]" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-sans text-base font-bold text-[#172b26]">
                    {categoryName}
                  </h4>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                    {label}
                  </span>
                </div>

                {descriptionText ? (
                  <p className="text-xs text-[#3f544d] leading-relaxed pt-0.5 break-words font-sans">
                    {descriptionText}
                  </p>
                ) : (
                  <p className="text-xs text-[#5f776e] italic font-sans">
                    Consult your doctor or pharmacist for clinical guidance.
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
