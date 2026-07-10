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
  Layers,
  ArrowRight
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
    <section className="py-10 md:py-14 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 medical-pattern opacity-20 pointer-events-none"></div>
 
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight
                           text-[#1D2B5C] dark:text-zinc-100 ">
              Surgical &amp; Medical <span className="text-[#038076]">Supplies</span>
            </h2>
          </div>

          {/* CTA Button */}
          <Link
            to="/surgical/all"
            className="hidden md:inline-flex items-center gap-2 self-end
                       rounded-full bg-[#004782] px-5 py-2.5
                       text-[13px] font-bold text-white shadow-md
                       transition-all hover:bg-[#003866] hover:-translate-y-0.5 hover:shadow-lg shrink-0"
          >
            Browse Catalogue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
 
        {/* Main Categories Display */}
        {loading ? (
          <div className="min-h-[220px] flex items-center justify-center rounded-xl border border-slate-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-slate-400 text-xs font-semibold animate-pulse">Loading surgical categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-8 rounded-xl text-center">
            <p className="text-slate-400 text-xs font-semibold">No surgical categories available. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {categories.map((cat) => {
              const IconComponent = getSurgicalIcon(cat.icon);
              const isThemeGreen = cat.displayOrder % 2 === 0;
              const iconBgClass = isThemeGreen
                ? "bg-[#038076]/10 text-[#038076] dark:bg-[#038076]/20 dark:text-[#84d6b9]"
                : "bg-[#004782]/10 text-[#004782] dark:bg-[#004782]/20 dark:text-[#a4c9ff]";
              
              return (
                <Link
                  key={cat.id || cat._id}
                  to={`/surgical/${cat.slug}`}
                  className="group flex flex-col justify-between rounded-xl border
                             border-slate-100 bg-white p-5
                             transition-all duration-300
                             hover:-translate-y-1
                             hover:border-[#038076]/25
                             hover:shadow-[0_6px_20px_rgba(3,128,118,0.08)]
                             dark:border-zinc-800 dark:bg-zinc-900
                             dark:hover:border-[#038076]/40"
                >
                  {/* Top content */}
                  <div>
                    {/* Icon container */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 shrink-0 ${iconBgClass}`}>
                      {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover rounded-lg" alt={cat.name} />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-extrabold text-[#1D2B5C] dark:text-zinc-100 mb-1.5 group-hover:text-[#038076] transition-colors leading-tight text-left">
                      {cat.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 dark:text-zinc-400 font-normal text-[12px] leading-relaxed line-clamp-2 text-left">
                      {cat.description || `Explore authentic ${cat.name} products.`}
                    </p>
                  </div>

                  {/* Bottom link */}
                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/50 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#038076] group-hover:text-[#004782] dark:group-hover:text-[#a4c9ff] transition-colors">
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center md:hidden">
          <Link
            to="/surgical/all"
            className="inline-flex items-center gap-2 rounded-full bg-[#004782] px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:bg-[#003866]"
          >
            Browse Catalogue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
 
      </div>
    </section>
  );
};

export default SurgicalProductsSection;
