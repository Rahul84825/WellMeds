import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { FlaskConical, Search, ArrowRight, ShieldAlert } from "lucide-react";

const MoleculesPage = () => {
  const navigate = useNavigate();
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    document.title = "Browse Medicines By Molecules | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Search and browse medicines by their active chemical ingredients or molecules. Compare generics, strengths, and find alternative brands.");

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
      m.name.toLowerCase().includes(query) ||
      m.aliases?.some((alias) => alias.toLowerCase().includes(query))
    );
  });

  // Group filtered molecules by letter
  const groupedMolecules = {};
  filteredMolecules.forEach((m) => {
    const char = m.letter ? m.letter.toUpperCase() : "#";
    const groupKey = alphabet.includes(char) ? char : "#";
    if (!groupedMolecules[groupKey]) {
      groupedMolecules[groupKey] = [];
    }
    groupedMolecules[groupKey].push(m);
  });

  const handleLetterClick = (letter) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">Molecules</span>
      </nav>

      {/* Alphabet Navigation Subbar */}
      <div className="sticky top-16 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md z-30 py-sm border-b border-slate-200/60 dark:border-zinc-800/60 mb-xl flex flex-wrap gap-xs items-center select-none overflow-x-auto scrollbar-none">
        {alphabet.map((letter) => {
          const hasMolecules = groupedMolecules[letter] && groupedMolecules[letter].length > 0;
          return (
            <button
              key={letter}
              type="button"
              disabled={!hasMolecules}
              onClick={() => handleLetterClick(letter)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center border ${
                hasMolecules
                  ? "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-[#038076] hover:bg-[#038076] hover:text-white hover:border-[#038076] hover:-translate-y-0.5"
                  : "bg-slate-100/50 dark:bg-zinc-900/30 border-transparent text-slate-350 dark:text-zinc-700 cursor-not-allowed"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : Object.keys(groupedMolecules).length > 0 ? (
        <div className="space-y-xl">
          {alphabet
            .filter((letter) => groupedMolecules[letter] && groupedMolecules[letter].length > 0)
            .map((letter) => (
              <section
                key={letter}
                id={`section-${letter}`}
                className="scroll-mt-32 p-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl shadow-xs space-y-md animate-[fade-in_0.3s_ease-out]"
              >
                {/* Section Letter Heading */}
                <div className="flex items-center gap-sm border-b border-slate-100 dark:border-zinc-800 pb-sm select-none">
                  <span className="w-10 h-10 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] font-black text-lg flex items-center justify-center border border-[#038076]/20">
                    {letter}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Molecules List</span>
                </div>

                {/* Molecule Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                  {groupedMolecules[letter].map((mol) => (
                    <div
                      key={mol.id || mol._id}
                      onClick={() => navigate(`/molecule/${mol.slug}`)}
                      className="group flex items-center justify-between p-sm bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-[#038076]/5 dark:hover:bg-[#038076]/5 border border-slate-100/60 dark:border-zinc-850 rounded-2xl cursor-pointer transition-all duration-300 hover:border-[#038076]/25 hover:-translate-x-0.5"
                    >
                      <div className="space-y-xs truncate pr-xs">
                        <span className="font-extrabold text-sm text-slate-700 dark:text-zinc-200 group-hover:text-[#038076] transition-colors group-hover:underline truncate block">
                          {mol.name}
                        </span>
                        {mol.aliases && mol.aliases.length > 0 && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold truncate block">
                            Aliases: {mol.aliases.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-xs shrink-0 pl-sm">
                        <span className="text-[10px] font-bold px-sm py-0.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 text-slate-450 group-hover:border-[#038076]/20 group-hover:bg-white/40">
                          {mol.productCount || 0} Products
                        </span>
                        <ArrowRight size={14} className="text-[#038076] opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldAlert className="mx-auto text-slate-300 dark:text-zinc-700 mb-md" size={48} />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Molecules Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            We couldn't find any chemical active ingredients matching your search query. Try another keyword.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoleculesPage;
