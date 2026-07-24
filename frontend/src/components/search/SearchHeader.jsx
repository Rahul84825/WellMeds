import React from "react";
import { Search, FlaskConical, Pill, CheckCircle } from "lucide-react";

const SearchHeader = ({
  query,
  totalProducts = 0,
  loading = false,
  matchedMolecules = [],
  activeMoleculeName = null,
}) => {
  const moleculeCount = matchedMolecules.length;
  const mainMolecule = activeMoleculeName || (matchedMolecules[0]?.name);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title and Query Info */}
        <div className="space-y-1.5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] rounded-full font-bold text-xs">
              <Search size={13} />
              <span>Search Results</span>
            </span>

            {mainMolecule && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 rounded-full font-extrabold text-xs">
                <FlaskConical size={13} />
                <span>Matched by Salt: {mainMolecule}</span>
              </span>
            )}
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Search results for: <span className="text-[#038076] dark:text-[#52d6c9]">"{query}"</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {loading ? (
              "Searching pharmaceutical catalog..."
            ) : totalProducts > 0 ? (
              <>
                Showing <strong className="text-slate-900 dark:text-white font-bold">{totalProducts}</strong> {totalProducts === 1 ? "brand" : "brands"}
                {mainMolecule ? ` containing ${mainMolecule}.` : " matching your search criteria."}
              </>
            ) : (
              `No matching products found for "${query}".`
            )}
          </p>
        </div>

        {/* Dynamic Summary Chip */}
        {!loading && totalProducts > 0 && (
          <div className="shrink-0 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3 sm:px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0">
              <Pill size={20} />
            </div>
            <div className="text-left text-xs">
              <p className="font-extrabold text-slate-900 dark:text-zinc-100">100% Genuine Brands</p>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600" /> Guaranteed Quality & Pricing
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Matched Molecules Pills Bar */}
      {!loading && matchedMolecules.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-[#038076] shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Matched Active Molecule(s):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedMolecules.map((mol) => (
              <a
                key={mol.id || mol._id}
                href={`/products?molecule=${encodeURIComponent(mol.name)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-[#038076] hover:text-white dark:hover:bg-[#038076] rounded-lg font-bold text-xs text-slate-700 dark:text-zinc-200 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs"
              >
                <span>{mol.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
