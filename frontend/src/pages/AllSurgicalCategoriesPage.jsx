import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import { Search, X, FolderOpen, ChevronRight } from "lucide-react";

// Icon mapping utility for surgical categories
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

const AllSurgicalCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    document.title = "Surgical & Medical Supply Categories | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Browse clinical-grade surgical instruments, diagnostic equipment, and medical supplies by category at WellMeds."
    );
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumb */}
      <nav className="flex items-center text-[12px] text-slate-500 gap-1.5 mb-6 font-medium select-none">
        <Link to="/" className="hover:text-[#038076] transition-colors">
          Home
        </Link>
        <ChevronRight size={14} className="text-slate-300 shrink-0" />
        <Link to="/surgical" className="hover:text-[#038076] transition-colors">
          Surgical
        </Link>
        <ChevronRight size={14} className="text-slate-300 shrink-0" />
        <span className="text-[#004782] dark:text-[#a4c9ff] font-bold">
          Categories
        </span>
      </nav>

      {/* Page Title & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10 pb-6 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h1 className="font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-zinc-100 tracking-tight">
            Surgical & Medical Supply Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
            Browse clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and medical supplies by category.
          </p>
        </div>

        {/* Dynamic Category Search */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 w-full md:w-80 shadow-xs focus-within:border-[#004782] transition-colors">
          <Search size={18} className="text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search surgical categories..."
            className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 font-medium"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5"
              aria-label="Clear category search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Surgical Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-6 gap-x-4 justify-items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-[110px] md:w-[170px] flex flex-col items-center animate-pulse"
            >
              <div className="w-[110px] h-[110px] md:w-[170px] md:h-[170px] bg-slate-100 dark:bg-zinc-800 rounded-[16px] md:rounded-[18px]" />
              <div className="h-3.5 bg-slate-100 dark:bg-zinc-800 rounded w-20 mt-2 md:hidden" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-6 gap-x-4 justify-items-center">
          {filteredCategories.map((cat, idx) => (
            <CategoryCard key={(cat._id || cat.id)?.toString()} category={cat} isSurgical={true} index={idx} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 my-4 shadow-2xs">
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
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Clear Search
            </button>
            <button
              onClick={() => navigate("/surgical")}
              className="px-4 py-2 rounded-full bg-[#004782] text-white text-xs font-semibold hover:bg-[#003766] transition-colors"
            >
              Go to Surgical Landing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSurgicalCategoriesPage;
