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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Surgical & Medical Supply Categories | WellMeds"
        description="Browse clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and medical supplies by category at WellMeds."
        canonical="/surgical/categories"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Surgical Categories
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── SURGICAL CATEGORIES GRID ── */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[110px] md:w-[155px] flex flex-col items-center animate-pulse"
                  >
                    <div className="w-[110px] h-[110px] md:w-[155px] md:h-[155px] bg-slate-100 dark:bg-zinc-800 rounded-[20px] border border-slate-300 dark:border-zinc-700" />
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-20 mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
                {filteredCategories.map((cat, idx) => (
                  <CategoryCard
                    key={cat._id || cat.id || idx}
                    category={cat}
                    isSurgical={true}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <Package size={40} className="mx-auto text-slate-400" />
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                  No Categories Found
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  We couldn't find any surgical category matching "{searchVal}".
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
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
    </div>
  );
};

export default AllSurgicalCategoriesPage;
