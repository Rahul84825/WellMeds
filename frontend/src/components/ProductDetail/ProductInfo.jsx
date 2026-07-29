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
    <div className="space-y-4 text-left flex-1 flex flex-col justify-start h-full">
      {/* Eyebrow / Category Specialty Tag */}
      <div className="flex items-center gap-2">
        <span className="pdp-rx-badge">
          {product.category?.name || "Specialty Medicine"}
        </span>
        {product.requiresRx && (
          <span className="bg-[#157a6d] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Prescription Required
          </span>
        )}
      </div>

      {/* Product Name & Share Button Row */}
      <div className="flex justify-between items-start gap-4">
        <h1 className="pdp-serif-title text-2xl md:text-3xl text-[#0f172a] leading-snug font-bold">
          {product.name}
        </h1>
        <button
          onClick={handleShare}
          className="p-2.5 text-[#334155] hover:text-[#157a6d] hover:bg-[#f0f8f5] rounded-full border border-[#dde8e3] transition-all cursor-pointer shrink-0 shadow-2xs"
          title="Share Product"
          aria-label="Share Product"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Attribute Badges */}
      <div className="flex flex-wrap gap-3 items-center font-mono text-xs">
        {product.requiresRx ? (
          <span className="text-[#0f172a] font-semibold flex items-center gap-2 bg-[#f4f8f6] px-3 py-1.5 rounded-lg border border-[#c3d4cc]">
            <ProductAttributeIcon type="rx" /> Rx Required
          </span>
        ) : (
          <span className="text-[#0f172a] font-semibold flex items-center gap-2 bg-[#f4f8f6] px-3 py-1.5 rounded-lg border border-[#c3d4cc]">
            <ProductAttributeIcon type="otc" /> OTC Medicine
          </span>
        )}
        {product.isColdChain && (
          <span className="text-sky-800 font-semibold flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
            <ProductAttributeIcon type="coldChain" /> Cold Chain Storage
          </span>
        )}
      </div>
      
      {/* Salt Composition */}
      {product.molecules && product.molecules.length > 0 && (
        <div className="pt-3.5 border-t border-dashed border-[#c3d4cc] mt-1">
          <span className="block font-mono text-xs font-bold text-[#334155] uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
            <span className="material-symbols-outlined text-[15px] leading-none text-[#157a6d]">science</span> Active Molecule Composition
          </span>
          <div className="flex flex-wrap items-center font-mono text-sm break-words max-w-full gap-y-1">
            {product.molecules.map((mol, idx) => (
              <Fragment key={mol.slug || idx}>
                <MoleculeLink molecule={mol} />
                {idx < product.molecules.length - 1 && <span className="text-[#334155] mr-2">,&nbsp;</span>}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Manufacturer Prescription Stamp */}
      {(product.manufacturer || product.brand) && (
        <div className="pt-3.5 border-t border-dashed border-[#c3d4cc] mt-1">
          <span className="block font-mono text-[11px] font-bold text-[#334155] uppercase tracking-widest mb-1 select-none">
            Manufactured / Marketed By
          </span>
          <p className="font-mono text-sm font-black text-[#157a6d] uppercase tracking-wider">
            {product.manufacturer || product.brand}
          </p>
        </div>
      )}

      {/* Policy Notice */}
      {(product.prepaidOnly || product.isNonRefundable) && (
        <div className="pt-3 border-t border-dashed border-[#c3d4cc] mt-1">
          <p className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block">
            {product.prepaidOnly && product.isNonRefundable
              ? "Prepaid Only · Non-Returnable Medicine"
              : product.prepaidOnly
              ? "Prepaid Orders Only"
              : "Non-Returnable Medical Product"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
