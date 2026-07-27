import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { Search, ShieldAlert, ChevronRight } from "lucide-react";

const MoleculesPage = () => {
  const navigate = useNavigate();
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [activeLetter, setActiveLetter] = useState("ALL");

  const letters = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const alphabetFilterOptions = ["ALL", ...letters];

  useEffect(() => {
    document.title = "Find Medicine by Molecules | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Search and browse medicines by their active chemical ingredients or molecules. Compare generics, strengths, and find alternative brands."
    );

    const fetchMolecules = async () => {
      try {
        const list = await api.getMolecules();
        setMolecules(list || []);
      } catch (err) {
        console.error("Failed to load molecules", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMolecules();
  }, []);

  // Filter molecules by search query
  const filteredMolecules = molecules.filter((m) => {
    const query = searchVal.toLowerCase().trim();
    if (!query) return true;
    return (
      m.name?.toLowerCase().includes(query) ||
      m.aliases?.some((alias) => alias.toLowerCase().includes(query))
    );
  });

  // Group filtered molecules by starting letter
  const groupedMolecules = {};
  filteredMolecules.forEach((m) => {
    const firstChar = m.letter ? m.letter.toUpperCase() : m.name ? m.name.charAt(0).toUpperCase() : "#";
    const groupKey = letters.includes(firstChar) ? firstChar : "#";
    if (!groupedMolecules[groupKey]) {
      groupedMolecules[groupKey] = [];
    }
    groupedMolecules[groupKey].push(m);
  });

  const handleLetterClick = (letter) => {
    setActiveLetter(letter);
    if (letter === "ALL") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Determine available letters that have molecules
  const availableLetters = letters.filter(
    (l) => groupedMolecules[l] && groupedMolecules[l].length > 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-slate-400 gap-1.5 mb-5 font-medium select-none">
        <span
          className="cursor-pointer hover:text-[#038076] transition-colors"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <ChevronRight size={12} className="text-slate-300 dark:text-zinc-600" />
        <span className="text-[#038076] dark:text-[#a4c9ff] font-semibold">Molecules</span>
      </nav>

      {/* Page Title & Search Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Find medicine by molecules
          </h1>
        </div>

        {/* Live Filter Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Medicines..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#038076]/20 focus:border-[#038076] transition-all text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 font-normal"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Selector Subbar */}
      <div className="sticky top-16 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-30 py-3 mb-8 border-b border-slate-200/60 dark:border-zinc-800/60 flex flex-wrap items-center gap-1 sm:gap-1.5 select-none">
        {alphabetFilterOptions.map((letter) => {
          const isAll = letter === "ALL";
          const isActive = activeLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              onClick={() => handleLetterClick(letter)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none flex items-center justify-center shrink-0 ${
                isActive
                  ? "bg-[#038076] text-white font-semibold shadow-xs"
                  : "bg-transparent text-slate-600 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800 hover:text-[#038076] dark:hover:text-[#84d6b9] font-normal"
              }`}
            >
              {isAll ? "All" : letter}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : activeLetter !== "ALL" ? (
        /* Single Letter Filtered View */
        groupedMolecules[activeLetter] && groupedMolecules[activeLetter].length > 0 ? (
          <div className="max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-[#038076] dark:text-[#84d6b9] mb-5 pb-2 border-b border-slate-200/70 dark:border-zinc-800">
              {activeLetter}
            </h2>
            <ul className="space-y-4">
              {groupedMolecules[activeLetter].map((mol) => (
                <li key={mol.id || mol._id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/molecule/${mol.slug}`)}
                    className="group w-full text-left py-1 cursor-pointer transition-colors block"
                  >
                    <span className="font-normal text-xs sm:text-sm text-slate-800 dark:text-zinc-200 group-hover:text-[#038076] dark:group-hover:text-[#84d6b9] uppercase tracking-wide break-words leading-relaxed block">
                      {mol.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          /* Empty State when selected letter has no molecules */
          <div className="py-24 text-center select-none animate-[fade-in_0.3s_ease-out]">
            <div className="w-28 h-28 mx-auto mb-5 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-zinc-900/60 text-slate-300 dark:text-zinc-600">
              <svg
                className="w-16 h-16 opacity-75"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.15" />
                <circle cx="5" cy="6" r="2.5" fill="currentColor" fillOpacity="0.15" />
                <circle cx="19" cy="6" r="2.5" fill="currentColor" fillOpacity="0.15" />
                <circle cx="12" cy="20" r="2.5" fill="currentColor" fillOpacity="0.15" />
                <line x1="7.2" y1="7.2" x2="9.8" y2="9.8" />
                <line x1="16.8" y1="7.2" x2="14.2" y2="9.8" />
                <line x1="12" y1="15" x2="12" y2="17.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No molecules with this letter!
            </p>
          </div>
        )
      ) : availableLetters.length > 0 ? (
        /* ALL Letters View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 lg:gap-x-14 gap-y-12 items-start">
          {availableLetters.map((letter) => (
            <div
              key={letter}
              id={`section-${letter}`}
              className="scroll-mt-36 animate-[fade-in_0.3s_ease-out]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#038076] dark:text-[#84d6b9] mb-5 pb-2 border-b border-slate-200/70 dark:border-zinc-800">
                {letter}
              </h2>

              <ul className="space-y-4">
                {groupedMolecules[letter].map((mol) => (
                  <li key={mol.id || mol._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/molecule/${mol.slug}`)}
                      className="group w-full text-left py-1 cursor-pointer transition-colors block"
                    >
                      <span className="font-normal text-xs sm:text-sm text-slate-800 dark:text-zinc-200 group-hover:text-[#038076] dark:group-hover:text-[#84d6b9] uppercase tracking-wide break-words leading-relaxed block">
                        {mol.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        /* Search Query No Results Found */
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldAlert className="mx-auto text-slate-300 dark:text-zinc-700 mb-4" size={48} />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
            No Molecules Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            We couldn't find any chemical active ingredients matching your search query. Try another keyword.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoleculesPage;
