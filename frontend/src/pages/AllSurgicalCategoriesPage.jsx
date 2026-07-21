import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Search, X, FolderOpen, ChevronRight, Scissors, Shield, 
  Bandage, Syringe, Bed, Stethoscope, Activity, Heart, Thermometer, Layers 
} from "lucide-react";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xs animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
                <div className="w-16 h-5 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            const IconComponent = getSurgicalIcon(cat.icon);
            return (
              <div
                key={cat.id || cat._id}
                onClick={() => navigate(`/surgical/${cat.slug}`)}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#004782]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full select-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-955 rounded-2xl p-2.5 flex items-center justify-center border border-slate-200/80 dark:border-zinc-800 shrink-0 transition-colors group-hover:bg-[#004782]/5">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                          alt={cat.name}
                        />
                      ) : (
                        <IconComponent
                          size={22}
                          className="text-slate-400 group-hover:text-[#004782] transition-colors"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 group-hover:border-[#004782]/20 group-hover:bg-[#004782]/5 group-hover:text-[#004782] transition-colors">
                      {cat.productCount || 0} items
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base group-hover:text-[#004782] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {cat.description || `Browse quality ${cat.name} equipment and tools.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-[#004782] dark:text-[#a4c9ff] font-bold text-xs gap-1 pt-4 mt-auto group-hover:underline">
                  <span>Browse Category Products</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
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
