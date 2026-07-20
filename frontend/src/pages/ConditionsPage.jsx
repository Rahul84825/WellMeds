import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
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

  useEffect(() => {
    document.title = "Medical Conditions & Therapeutic Categories | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Explore clinical prescription medicines and health treatments organized by medical condition and therapeutic speciality at WellMeds."
    );
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-md font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/products")}>Medicines</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">Conditions</span>
      </nav>

      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="font-extrabold text-3xl md:text-4xl text-slate-800 dark:text-zinc-100 tracking-tight">
            Medical Conditions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse authentic prescription medicines, biological therapies, and specialty formulations by medical condition.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-md py-2.5 w-full md:w-80 shadow-xs">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search condition..."
            className="bg-transparent border-none outline-none w-full text-xs ml-xs dark:text-zinc-200 placeholder-slate-400 font-medium"
          />
          {searchVal && (
            <button onClick={() => setSearchVal("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Conditions Grid Layout inspired by reference image */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-xs">
          <Loader size="lg" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
          {filteredCategories.map((cat) => {
            const IconComp = getCategoryIcon(cat.icon);
            return (
              <Link
                key={cat._id || cat.id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center justify-center p-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-[#038076] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer min-h-[140px]"
              >
                {/* Soft Pastel Icon Wrapper */}
                <div className="w-14 h-14 rounded-2xl bg-[#038076]/8 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mb-sm group-hover:bg-[#038076] group-hover:text-white transition-colors duration-200">
                  <IconComp size={26} />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-zinc-100 group-hover:text-[#038076] dark:group-hover:text-[#84d6b9] transition-colors leading-tight px-1 line-clamp-2">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-3xl p-xl">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-md text-slate-400">
            <FolderOpen size={28} />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Conditions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            We couldn't find any medical condition matching "{searchVal}".
          </p>
        </div>
      )}

    </div>
  );
};

export default ConditionsPage;
