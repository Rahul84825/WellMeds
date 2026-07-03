import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, ArrowLeft } from "lucide-react";

const MoleculesComingSoonPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Molecule Browsing Coming Soon | WellMeds";
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-margin-desktop py-xxl flex flex-col items-center justify-center min-h-[75vh] animate-[fade-in_0.4s_ease-out] text-center">
      {/* Visual representation of a Molecule/Science */}
      <div className="relative mb-lg">
        <div className="absolute inset-0 bg-[#038076]/10 rounded-full blur-2xl transform scale-150 animate-pulse" />
        <div className="relative w-24 h-24 bg-gradient-to-tr from-[#004782] to-[#038076] text-white rounded-3xl flex items-center justify-center shadow-lg border border-white/10 group">
          <FlaskConical size={44} className="animate-[wiggle_3s_infinite_ease-in-out]" />
        </div>
      </div>

      <div className="space-y-sm max-w-xl">
        <span className="inline-block bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest border border-[#038076]/20">
          Feature Pipeline
        </span>
        <h1 className="font-extrabold text-3xl md:text-4xl text-slate-800 dark:text-zinc-100 tracking-tight">
          Molecule-Based Browsing
        </h1>
        <p className="text-[#038076] dark:text-[#a4c9ff] font-bold text-sm tracking-wide">
          COMING SOON IN THE NEXT VERSION
        </p>
        <p className="text-sm text-slate-400 dark:text-zinc-400 leading-relaxed font-medium">
          We are building an advanced molecular catalog system. Soon, you will be able to search and browse products by active pharmaceutical ingredients (APIs), compare generics, and view chemical structure descriptions for precise clinical matching.
        </p>
      </div>

      {/* Feature Checklist Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md w-full max-w-lg mt-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-md shadow-sm text-left">
        <div className="flex items-start gap-sm">
          <span className="text-[#038076] font-black text-sm pt-0.5">✓</span>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Generic Ingredient Mapping</h4>
            <p className="text-[11px] text-slate-400">Compare products sharing the exact molecular composition.</p>
          </div>
        </div>
        <div className="flex items-start gap-sm">
          <span className="text-[#038076] font-black text-sm pt-0.5">✓</span>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Strength Filtering</h4>
            <p className="text-[11px] text-slate-400">Filter clinical formulations by active ingredient concentration.</p>
          </div>
        </div>
        <div className="flex items-start gap-sm">
          <span className="text-[#038076] font-black text-sm pt-0.5">✓</span>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Bioequivalence Insights</h4>
            <p className="text-[11px] text-slate-400">Read pharmacologist-reviewed data on generic alternatives.</p>
          </div>
        </div>
        <div className="flex items-start gap-sm">
          <span className="text-[#038076] font-black text-sm pt-0.5">✓</span>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Safety & Synergy Alerts</h4>
            <p className="text-[11px] text-slate-400">Automatic detection of drug interactions on molecular level.</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-sm mt-xl w-full justify-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-xs border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 px-lg py-sm rounded-xl font-bold text-xs hover:bg-slate-50 transition-all select-none cursor-pointer w-full sm:w-auto"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs hover:opacity-90 transition-all select-none cursor-pointer w-full sm:w-auto"
        >
          Return to Storefront
        </button>
      </div>
    </div>
  );
};

export default MoleculesComingSoonPage;
