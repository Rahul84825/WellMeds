import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, FolderOpen, Phone, FileText } from "lucide-react";
import { api } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";

const AllCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.error("Failed to load categories on All Categories page", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="All Categories & Therapeutic Specialities | WellMeds"
        description="Browse all medical conditions, therapeutic categories, and healthcare specialities at WellMeds. Licensed pharmacy delivery across India."
        canonical="/categories"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Browse Categories
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── CATEGORIES GRID ── */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-[110px] md:w-[155px] flex flex-col items-center animate-pulse">
                    <div className="w-[110px] h-[110px] md:w-[155px] md:h-[155px] bg-slate-100 dark:bg-zinc-800 rounded-[20px] border border-slate-300 dark:border-zinc-700" />
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-20 mt-2" />
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-5 justify-items-center">
                {categories.map((cat, idx) => (
                  <CategoryCard key={(cat._id || cat.id)?.toString()} category={cat} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 bg-[#f4f9f7] text-[#157a6d] rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <FolderOpen size={28} />
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                  No Categories Found
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Go to Homepage</span>
                </button>
              </div>
            )}
          </div>

          {/* ── WHY WELLMEDS BAR ── */}
          <WhyWellMedsBar />
        </div>
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default AllCategoriesPage;
