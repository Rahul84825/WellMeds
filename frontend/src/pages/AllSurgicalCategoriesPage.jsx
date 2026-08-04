import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, FolderOpen, Stethoscope, Search } from "lucide-react";
import { api } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import SEO from "../components/common/SEO";

const AllSurgicalCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchSurgicalCategories = async () => {
      setLoading(true);
      try {
        const list = await api.getSurgicalCategories();
        if (isMounted) {
          const activeList = (list || [])
            .filter((cat) => cat.status !== "Inactive" && cat.isActive !== false)
            .sort((a, b) => a.name.localeCompare(b.name));
          setCategories(activeList);
        }
      } catch (err) {
        console.error("Failed to load surgical categories", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSurgicalCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const q = searchVal.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = cat.name?.toLowerCase().includes(q);
    const descMatch = cat.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Surgical", url: "/surgical" },
    { name: "Surgical Categories", url: "/surgical/categories" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Surgical & Medical Supply Categories | WellMeds"
        description="Browse clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and medical supplies by category at WellMeds."
        canonical="/surgical/categories"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* ── HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#004782]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              <Link to="/surgical" className="hover:text-[#157a6d] transition-colors">Surgical</Link>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Categories</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>SURGICAL & MEDICAL EQUIPMENT</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                Surgical Categories
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Browse clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and medical supplies by category.
              </p>
            </div>
          </div>
        </div>

        {/* ── SURGICAL CATEGORIES GRID WRAPPED IN A SINGLE BIG WHITE CARD ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[110px] md:w-[155px] flex flex-col items-center animate-pulse"
                >
                  <div className="w-[110px] h-[110px] md:w-[155px] md:h-[155px] bg-slate-100 dark:bg-zinc-800 rounded-[20px] border border-slate-200 dark:border-zinc-700" />
                  <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-20 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
              {filteredCategories.map((cat, idx) => (
                <CategoryCard key={(cat._id || cat.id)?.toString()} category={cat} isSurgical={true} index={idx} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-zinc-500">
                <FolderOpen size={28} />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-zinc-100">
                No Surgical Categories Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                We couldn't find any surgical category matching "{searchVal}".
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSearchVal("")}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => navigate("/surgical")}
                  className="px-4 py-2 rounded-full bg-[#157a6d] hover:bg-[#0f5c52] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Go to Surgical Landing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
      </div>
    </div>
  );
};

export default AllSurgicalCategoriesPage;
