import pregnancyImg from '../assets/safetyadvice/PREGNANCY.png';
import breastfeedingImg from '../assets/safetyadvice/BREASTFEEDING.png';
import alcoholImg from '../assets/safetyadvice/ALCOHOL.png';
import drivingImg from '../assets/safetyadvice/DRIVING FRONT.png';
import liverImg from '../assets/safetyadvice/LIVER.png';
import kidneyImg from '../assets/safetyadvice/KIDNEY.png';

/**
 * Predefined list of Safety Categories for WellMeds.
 * Designed for easy extensibility when adding new healthcare categories.
 */
export const SAFETY_CATEGORIES = [
  { id: 'Pregnancy', label: 'Pregnancy', icon: pregnancyImg, alt: 'Pregnancy safety advice illustration' },
  { id: 'Breast Feeding', label: 'Breast Feeding', icon: breastfeedingImg, alt: 'Breast Feeding safety advice illustration' },
  { id: 'Alcohol', label: 'Alcohol', icon: alcoholImg, alt: 'Alcohol safety advice illustration' },
  { id: 'Driving', label: 'Driving', icon: drivingImg, alt: 'Driving safety advice illustration' },
  { id: 'Liver', label: 'Liver', icon: liverImg, alt: 'Liver function safety advice illustration' },
  { id: 'Kidney', label: 'Kidney', icon: kidneyImg, alt: 'Kidney function safety advice illustration' },
];

/**
 * Normalized mapping dictionary for category lookup.
 */
export const SAFETY_ICON_MAP = {
  pregnancy: pregnancyImg,
  'breast feeding': breastfeedingImg,
  breastfeeding: breastfeedingImg,
  lactation: breastfeedingImg,
  alcohol: alcoholImg,
  driving: drivingImg,
  liver: liverImg,
  kidney: kidneyImg,
};

/**
 * Helper to get the correct illustration image based on category or icon string.
 * @param {string} categoryOrIcon 
 * @returns {string|null} Image asset URL or null if not found
 */
export const getSafetyIcon = (categoryOrIcon) => {
  if (!categoryOrIcon) return null;
  const key = String(categoryOrIcon).trim().toLowerCase();
  return SAFETY_ICON_MAP[key] || null;
};

/**
 * Standardized status badge color profiles & styling.
 * @param {string} status 
 * @returns {{ label: string, badgeStyle: string, dotStyle: string }}
 */
export const getSafetyStatusBadge = (status = '') => {
  const s = String(status).trim().toLowerCase();
  
  if (s.includes('safe') && !s.includes('unsafe')) {
    return {
      label: status || 'Safe',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
      dotStyle: 'bg-emerald-500',
    };
  }
  
  if (s.includes('unsafe') || s.includes('avoid') || s.includes('dangerous') || s.includes('harmful')) {
    return {
      label: status || 'Unsafe',
      badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
      dotStyle: 'bg-rose-500',
    };
  }
  
  if (s.includes('caution') || s.includes('moderate') || s.includes('warning') || s.includes('monitor')) {
    return {
      label: status || 'Use With Caution',
      badgeStyle: 'bg-amber-50 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
      dotStyle: 'bg-amber-500',
    };
  }
  
  if (s.includes('consult') || s.includes('doctor') || s.includes('physician') || s.includes('advice')) {
    return {
      label: status || 'Consult Doctor',
      badgeStyle: 'bg-orange-50 text-orange-900 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50',
      dotStyle: 'bg-orange-500',
    };
  }

  return {
    label: status || 'Unknown',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    dotStyle: 'bg-slate-400',
  };
};
