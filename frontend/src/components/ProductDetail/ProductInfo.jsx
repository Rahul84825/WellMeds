import React, { Fragment } from "react";
import MoleculeLink from "./MoleculeLink";
import { Share2, Stethoscope, Snowflake, Pill } from "lucide-react";

const ProductAttributeIcon = ({ type }) => {
  if (type === "rx") {
    return <Stethoscope size={15} className="text-[#157a6d] shrink-0" />;
  }
  if (type === "coldChain") {
    return <Snowflake size={15} className="text-sky-600 shrink-0" />;
  }
  if (type === "otc") {
    return <Pill size={15} className="text-[#157a6d] shrink-0" />;
  }
  return null;
};

const ProductInfo = ({ product, handleShare }) => {
  return (
    <div className="space-y-4 text-left flex-1 flex flex-col justify-start h-full text-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Eyebrow / Category Specialty Tag */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-mono font-bold uppercase tracking-[2.5px] text-[#b08d3e]">
          {product.category?.name || product.category || "Specialty Medicine"}
        </span>
        {product.requiresRx && (
          <span className="inline-flex items-center gap-1.5 border border-[#157a6d] rounded-sm px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-widest text-[#157a6d]">
            <span className="font-serif font-black">℞</span> Prescription Required
          </span>
        )}
      </div>

      {/* Product Name & Share Button Row */}
      <div className="flex justify-between items-start gap-4">
        <h1
          className="text-3xl sm:text-4xl font-bold text-black leading-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {product.name}
        </h1>
        <button
          onClick={handleShare}
          className="p-2.5 text-black hover:text-[#157a6d] hover:bg-[#f4f9f7] rounded-sm border border-[#c3d4cc] transition-all cursor-pointer shrink-0 shadow-2xs"
          title="Share Product"
          aria-label="Share Product"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Attribute Badges */}
      <div className="flex flex-wrap gap-3 items-center font-mono text-xs">
        {product.requiresRx ? (
          <span className="text-black font-bold flex items-center gap-2 bg-[#f4f9f7] px-3 py-1.5 rounded-sm border border-[#c3d4cc]">
            <ProductAttributeIcon type="rx" /> Rx Required
          </span>
        ) : (
          <span className="text-black font-bold flex items-center gap-2 bg-[#f4f9f7] px-3 py-1.5 rounded-sm border border-[#c3d4cc]">
            <ProductAttributeIcon type="otc" /> OTC Medicine
          </span>
        )}
        {product.isColdChain && (
          <span className="text-sky-900 font-bold flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-sm border border-sky-200">
            <ProductAttributeIcon type="coldChain" /> Cold Chain Storage
          </span>
        )}
      </div>
      
      {/* Salt Composition */}
      {product.molecules && product.molecules.length > 0 && (
        <div className="pt-3.5 border-t border-dashed border-[#c3d4cc] mt-1">
          <span className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
            <span className="material-symbols-outlined text-[15px] leading-none text-[#157a6d]">science</span> Active Molecule Composition
          </span>
          <div className="flex flex-wrap items-center font-mono text-sm font-bold text-black break-words max-w-full gap-y-1">
            {product.molecules.map((mol, idx) => (
              <Fragment key={mol.slug || idx}>
                <MoleculeLink molecule={mol} />
                {idx < product.molecules.length - 1 && <span className="text-black mr-2">,&nbsp;</span>}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Manufacturer Stamp */}
      {(product.manufacturer || product.brand) && (
        <div className="pt-3.5 border-t border-dashed border-[#c3d4cc] mt-1">
          <span className="block font-mono text-[11px] font-bold text-black uppercase tracking-widest mb-1 select-none">
            Manufactured / Marketed By
          </span>
          <p className="font-mono text-sm font-extrabold text-[#157a6d] uppercase tracking-wider">
            {product.manufacturer || product.brand}
          </p>
        </div>
      )}

      {/* Policy Notice */}
      {(product.prepaidOnly || product.isNonRefundable) && (
        <div className="pt-3 border-t border-dashed border-[#c3d4cc] mt-1">
          <p className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-sm border border-amber-300 inline-block">
            {product.prepaidOnly && product.isNonRefundable
              ? "Prepaid Only · Non-Returnable Medicine"
              : product.prepaidOnly
              ? "Prepaid Orders Only"
              : "Non-Returnable Medicine"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
