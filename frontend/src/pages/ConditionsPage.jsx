import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import {
  Search,
  X,
  Pill,
  Heart,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  FolderOpen
} from "lucide-react";

// Icon mapper for categories
const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "pill":
      return Pill;
    case "monitor_heart":
      return HeartPulse;
    case "medical_services":
      return Stethoscope;
    case "medical_information":
      return ShieldCheck;
    case "face":
      return Sparkles;
    case "spa":
      return Heart;
    default:
      return Pill;
  }
};

const ConditionsPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const list = await api.getCategories();
        if (isMounted) {
          const activeList = (list || [])
            .filter((cat) => cat.status === "Active" || cat.isActive === true)
            .sort((a, b) => a.name.localeCompare(b.name));
          setCategories(activeList);
        }
      } catch (err) {
        console.error("Failed to load categories on Conditions page", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchVal.trim().toLowerCase())
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Medical Conditions", url: "/conditions" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 select-none">
      <SEO
        title="Medical Conditions & Therapeutic Index | WellMeds"
        description="Explore clinical prescription medicines and health treatments organized by medical condition and therapeutic speciality at WellMeds."
        canonical="/conditions"
        breadcrumbs={breadcrumbs}
      />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative bg-[#f4f9f7] dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800 py-12 md:py-16 overflow-hidden text-left">
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#157a6d 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-[#157a6d]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-[#157a6d] transition-colors">Medicines</Link>
            <ChevronRight size={12} />
            <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Medical Conditions</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
            <Activity size={14} className="text-[#b08d3e]" />
            <span>CLINICAL THERAPEUTIC SPECTRUM</span>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
              Medical Conditions & <span className="text-[#157a6d] dark:text-emerald-400">Therapies</span>
            </h1>
            <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
              Browse authentic prescription medicines, biological therapies, and specialty formulations organized by therapeutic condition.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. CONDITIONS GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] shadow-xs">
            <Loader size="lg" />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCategories.map((cat) => {
              const IconComp = getCategoryIcon(cat.icon);
              return (
                <Link
                  key={cat._id || cat.id}
                  to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[24px] hover:border-[#157a6d]/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer min-h-[140px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-[#157a6d] group-hover:text-white transition-colors duration-300">
                    <IconComp size={22} />
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-[#172b26] dark:text-white group-hover:text-[#157a6d] transition-colors leading-tight line-clamp-2 px-1">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 space-y-3">
            <div className="w-14 h-14 bg-[#f4f9f7] dark:bg-zinc-800 text-[#157a6d] rounded-2xl flex items-center justify-center mx-auto">
              <FolderOpen size={28} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">No Medical Conditions Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto font-sans">
              We couldn't find any medical condition matching "{searchVal}".
            </p>
          </div>
        )}

        {/* ── 3. REUSABLE WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
      </main>

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default ConditionsPage;
