import React, { Fragment } from "react";
import MoleculeLink from "./MoleculeLink";
import { Share2, Stethoscope, Snowflake, Pill } from "lucide-react";

const ProductAttributeIcon = ({ type }) => {
  if (type === "rx") {
    return <Stethoscope size={14} className="text-[#004782] dark:text-[#a4c9ff] shrink-0" />;
  }
  if (type === "coldChain") {
    return <Snowflake size={14} className="text-sky-500 dark:text-sky-400 shrink-0" />;
  }
  if (type === "otc") {
    return <Pill size={14} className="text-[#086b53] dark:text-[#84d6b9] shrink-0" />;
  }
  return null;
};

const ProductInfo = ({ product, handleShare }) => {
  return (
    <div className="space-y-2.5 text-left animate-[fade-in_0.2s_ease-out] flex-1 flex flex-col justify-start gap-2.5 h-full">
      
      {/* Product Name & Share Button Row */}
      <div className="flex justify-between items-start gap-sm">
        <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-black leading-tight">
          {product.name}
        </h1>
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-full transition-all cursor-pointer shrink-0"
          title="Share Product"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Category and badges row */}
      <div className="flex flex-wrap gap-sm items-center">
        
        {product.requiresRx ? (
          <span className="text-[#111827] dark:text-zinc-100 font-medium text-xs flex items-center gap-3 select-none transition-opacity hover:opacity-80">
            <ProductAttributeIcon type="rx" /> Rx Required
          </span>
        ) : (
          <span className="text-[#111827] dark:text-zinc-100 font-medium text-xs flex items-center gap-3 select-none transition-opacity hover:opacity-80">
            <ProductAttributeIcon type="otc" /> OTC Medicine
          </span>
        )}
        {product.isColdChain && (
          <span className="text-[#111827] dark:text-zinc-100 font-medium text-xs flex items-center gap-3 select-none transition-opacity hover:opacity-80">
            <ProductAttributeIcon type="coldChain" /> Cold Chain
          </span>
        )}
      </div>
      
      {/* Salt Composition */}
      {product.molecules && product.molecules.length > 0 && (
        <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/80 mt-xs">
          <span className="block text-xs font-bold text-[#111827] dark:text-zinc-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
            <span className="material-symbols-outlined text-[13px] leading-none text-slate-700 dark:text-zinc-350">science</span> Salt Composition
          </span>
          <div className="flex flex-wrap items-center text-xs">
            {product.molecules.map((mol, idx) => (
              <Fragment key={mol.slug || idx}>
                <MoleculeLink molecule={mol} />
                {idx < product.molecules.length - 1 && <span className="text-slate-400 mr-2">,&nbsp;</span>}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Manufacturer */}
      {(product.manufacturer || product.brand) && (
        <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/80 mt-xs">
          <span className="block text-[11px] font-bold text-[#111827] dark:text-zinc-100 uppercase tracking-wider mb-1 select-none">
            Manufacturer
          </span>
          <p className="text-[#123C7A] dark:text-[#a4c9ff] font-bold uppercase tracking-[0.1em] text-sm">
            {product.manufacturer || product.brand}
          </p>
        </div>
      )}

      {/* Non-Refundable Notice */}
      {(product.isNonRefundable || product.prepaidOnly) && (
        <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/80 mt-xs">
          <p className="text-blue-650 dark:text-blue-400 font-bold text-xs">
            Non-Refundable
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
