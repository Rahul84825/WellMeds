import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Scissors, 
  Shield, 
  Bandage, 
  Syringe, 
  Bed, 
  Stethoscope, 
  Activity, 
  Heart, 
  Thermometer, 
  Layers 
} from "lucide-react";

// Helper icon mapping utility
const getSurgicalIcon = (iconName) => {
  const mapping = {
    scissors: Scissors,
    shield: Shield,
    bandage: Bandage,
    syringe: Syringe,
    bed: Bed,
    stethoscope: Stethoscope,
    activity: Activity,
    heart: Heart,
    thermometer: Thermometer,
    layers: Layers,
    wheelchair: Activity,
    walking: Activity,
    lungs: Activity,
    bone: Activity,
    band_aid: Bandage,
  };
  return mapping[String(iconName).toLowerCase()] || Activity;
};

const SurgicalProductsSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCats = async () => {
      try {
        const list = await api.getSurgicalCategories();
        if (active) {
          setCategories(list.slice(0, 6)); // Display top 6 categories
        }
      } catch (err) {
        console.error("Failed to load surgical categories on home page", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchCats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-5 md:py-20 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 medical-pattern opacity-30 pointer-events-none"></div>
 
      <div className="max-w-7xl mx-auto px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-xl items-center">
          
          {/* Left Column: 35% Width Marketing */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6 text-left animate-[fade-in_0.4s_ease-out]">
            <div className="space-y-3 md:space-y-4">
              <span className="inline-block bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Clinical Grade Catalogue
              </span>
              <h2 className="font-extrabold text-[22px] md:text-3xl lg:text-4xl text-on-surface leading-tight tracking-tight">
                Surgical &amp; Medical <br />
                <span className="text-[#004782] dark:text-primary-fixed-dim">Equipment Supplies</span>
              </h2>
              <p className="text-[13px] md:text-base text-on-surface-variant dark:text-surface-variant leading-relaxed max-w-md">
                Equip your hospital, clinic, or diagnostic facility with certified medical essentials, sterile instruments, and consumable supplies from verified manufacturers.
              </p>
            </div>
 
            {/* Action CTA Button */}
            <div>
              <Link
                to="/surgical/all"
                className="inline-flex items-center justify-center bg-[#004782] hover:bg-[#003c70] text-white h-[45px] md:py-3.5 px-6 md:px-8 rounded-xl font-semibold text-sm md:text-base shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 select-none"
              >
                Browse Catalogue
              </Link>
            </div>
 
            {/* Trust Badges */}
            <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-slate-100 dark:border-zinc-800 text-[11px] md:text-sm text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <span className="text-[#086b53] font-black text-base">&#10003;</span> Certified Medical Products
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#086b53] font-black text-base">&#10003;</span> Trusted Manufacturers
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#004782] font-black text-base">&#10003;</span> Fast Delivery
              </div>
            </div>
          </div>
 
          {/* Right Column: 65% Width Grid Categories */}
          <div className="lg:col-span-8 w-full">
            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <span className="text-slate-400 text-xs font-semibold">Loading surgical categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-8 rounded-2xl text-center">
                <p className="text-slate-400 text-xs font-semibold">No surgical categories available. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {categories.map((cat) => {
                  const IconComponent = getSurgicalIcon(cat.icon);
                  const isThemeGreen = cat.displayOrder % 2 === 0;
                  const iconBgClass = isThemeGreen
                    ? "bg-[#086b53]/10 text-[#086b53] dark:bg-[#086b53]/20 dark:text-[#84d6b9]"
                    : "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]";
                  
                  return (
                    <Link
                      key={cat.id || cat._id}
                      to={`/surgical/${cat.slug}`}
                      className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-4 md:p-7 rounded-2xl shadow-xs transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-sm hover:border-[#004782]/20 flex items-start gap-4 md:gap-5 group"
                    >
                      {/* Icon Circle */}
                      <div className={`w-9 h-9 md:w-13 md:h-13 min-w-[36px] md:min-w-[52px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${iconBgClass}`}>
                        {cat.image ? (
                          <img src={cat.image} className="w-full h-full object-cover rounded-lg" alt={cat.name} />
                        ) : (
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                        )}
                      </div>
  
                      {/* Content */}
                      <div className="space-y-1 md:space-y-1.5 text-left">
                        <h4 className="text-[16px] md:text-base text-on-surface font-extrabold group-hover:text-[#004782] dark:group-hover:text-primary-fixed-dim transition-colors leading-snug">
                          {cat.name}
                        </h4>
                        <p className="text-slate-500 dark:text-zinc-400 font-normal text-[13px] md:text-sm leading-relaxed line-clamp-2">
                          {cat.description || `Explore authentic ${cat.name} products.`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
 
        </div>
      </div>
    </section>
  );
};

export default SurgicalProductsSection;
