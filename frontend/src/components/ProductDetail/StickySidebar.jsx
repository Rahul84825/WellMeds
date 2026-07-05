import React from "react";
import SimilarProducts from "./SimilarProducts";
import TableOfContents from "./TableOfContents";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

const StickySidebar = ({
  similarProducts,
  product,
  computedSections,
  activeSection,
  sectionRefs
}) => {
  // Better alternatives: similar products with lower price
  const alternatives = (similarProducts || [])
    .filter(item => item.price < product.price)
    .slice(0, 2);

  return (
    <aside className="w-full lg:w-[22%] shrink-0 lg:sticky lg:top-24 space-y-md order-2 lg:order-1 select-none text-left">
      {/* Similar Medicines */}
      <SimilarProducts similarProducts={similarProducts} product={product} />

      {/* Better Alternatives Card */}
      {alternatives.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-xs">
          <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-zinc-150 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800 mb-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">health_and_safety</span>
            Cheaper Alternatives
          </h3>
          <div className="space-y-sm">
            {alternatives.map((item) => {
              const savings = product.price - item.price;
              return (
                <Link
                  key={item.slug || item._id}
                  to={`/products/${item.slug}`}
                  className="block p-sm rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[10px] text-slate-700 dark:text-zinc-200 truncate max-w-[70%]">
                      {item.name}
                    </h4>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      Save {formatCurrency(savings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-xs">
                    <span className="text-[8px] text-slate-400 font-semibold truncate max-w-[65%]">{item.brand}</span>
                    <span className="font-black text-[11px] text-slate-700 dark:text-zinc-200 shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Table of Contents */}
      <TableOfContents
        computedSections={computedSections}
        activeSection={activeSection}
        sectionRefs={sectionRefs}
      />
    </aside>
  );
};

export default StickySidebar;
