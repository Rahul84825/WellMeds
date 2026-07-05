import React from "react";
import MoleculeLink from "./MoleculeLink";
import { Share2, ShieldCheck } from "lucide-react";

const ProductInfo = ({ product, handleShare }) => {
  return (
    <div className="space-y-sm text-left animate-[fade-in_0.2s_ease-out] flex-1 flex flex-col justify-between h-full">
      
      {/* Category and badges row */}
      <div className="flex flex-wrap gap-xs items-center justify-between">
        <div className="flex flex-wrap gap-xs items-center">
          <span className="bg-[#004782]/10 text-primary dark:text-[#a4c9ff] text-[9px] font-black uppercase tracking-wider px-md py-[4px] rounded-full border border-primary/10 shadow-xs">
            {product.category?.name || product.category}
          </span>
          {product.requiresRx ? (
            <span className="bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider px-md py-[4px] rounded-full flex items-center gap-1 shadow-xs select-none">
              <ShieldCheck size={11} /> Rx Required
            </span>
          ) : (
            <span className="bg-[#086b53]/10 text-secondary dark:text-[#84d6b9] text-[9px] font-black uppercase tracking-wider px-md py-[4px] rounded-full flex items-center gap-1 shadow-xs select-none border border-[#086b53]/10">
              OTC Medicine
            </span>
          )}
          {product.isColdChain && (
            <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[9px] font-black uppercase tracking-wider px-md py-[4px] rounded-full flex items-center gap-1 shadow-xs select-none">
              <span className="material-symbols-outlined text-[13px] leading-none">ac_unit</span> Cold Chain
            </span>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-full transition-all cursor-pointer"
          title="Share Product"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Brand, Name, & Manufacturer details */}
      <div className="space-y-1">
        <p className="text-body-md text-[#004782] dark:text-[#a4c9ff] font-extrabold uppercase tracking-widest text-[10px]">
          {product.brand}
        </p>
        <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-black leading-tight">
          {product.name}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-md gap-y-1 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold pt-1">
          {product.manufacturer && (
            <p>
              Mfg by: <span className="text-slate-700 dark:text-zinc-200 font-bold">{product.manufacturer}</span>
            </p>
          )}
          {product.marketer && (
            <p>
              Marketer: <span className="text-slate-700 dark:text-zinc-200 font-bold">{product.marketer}</span>
            </p>
          )}
          {product.country && (
            <p>
              Country of Origin: <span className="text-slate-700 dark:text-zinc-200 font-bold">{product.country}</span>
            </p>
          )}
          <p>
            Import Status: <span className="text-slate-700 dark:text-zinc-200 font-bold">{product.isImported ? `Imported (from ${product.importedCountry || "Abroad"})` : "Domestic Product"}</span>
          </p>
        </div>
      </div>
      
      {/* Salt Composition */}
      {product.molecules && product.molecules.length > 0 && (
        <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/80 mt-xs">
          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">science</span> Salt Composition
          </span>
          <div className="flex flex-wrap gap-xs items-center">
            {product.molecules.map((mol, idx) => (
              <MoleculeLink key={mol.slug || idx} molecule={mol} />
            ))}
          </div>
        </div>
      )}

      {/* Available Strengths, Pack Size & Category Dynamic parameters */}
      <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 gap-sm text-[11px] font-semibold">
        {product.strength && (
          <div>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Available Strength</span>
            <span className="text-slate-700 dark:text-zinc-200">{product.strength}</span>
          </div>
        )}
        {product.packSize && (
          <div>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Pack Size</span>
            <span className="text-slate-700 dark:text-zinc-200">{product.packSize}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
