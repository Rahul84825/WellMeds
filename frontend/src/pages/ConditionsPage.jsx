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
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 text-left">
      <SEO
        title="Medical Conditions & Therapeutic Index | WellMeds"
        description="Explore clinical prescription medicines and health treatments organized by medical condition and therapeutic speciality at WellMeds."
        canonical="/conditions"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Medical Conditions
          </h1>
        </div>
      </div>

      {/* ── 2. CONDITIONS GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-12 text-left">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] shadow-xs">
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
                  className="group flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[24px] hover:border-[#157a6d]/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer min-h-[140px]"
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
