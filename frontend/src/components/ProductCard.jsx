import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import { formatCurrency } from "../utils/currency";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [rxUploadOpen, setRxUploadOpen] = useState(false);
  const [localRxFile, setLocalRxFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // 'rx' | 'coldChain' | null

  const productId = (product._id || product.id)?.toString();

  React.useEffect(() => {
    if (!activeTooltip) return;
    const handleOutsideClick = () => setActiveTooltip(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [activeTooltip]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    
    setIsAdding(true);
    try {
      if (product.requiresRx && localRxFile) {
        await addToCart({ ...product, rxUploaded: true, rxFile: localRxFile }, 1);
      } else {
        await addToCart(product, 1);
      }
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRxSuccess = (data) => {
    setLocalRxFile(data.fileName);
    setRxUploadOpen(false);
    // Add to cart with prescription data attached
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, 1);
    toast.success(`${product.name} added to cart with prescription!`);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    const diff = product.originalPrice - product.price;
    const pct = Math.round((diff / product.originalPrice) * 100);
    return `${pct}% OFF`;
  };

  const savings = product.originalPrice && product.originalPrice > product.price 
    ? product.originalPrice - product.price 
    : 0;

  // Resolve molecule
  const molecule = product.molecules && product.molecules.length > 0 ? product.molecules[0] : null;

  const isRx = product.isPrescriptionRequired || product.requiresRx || false;
  const isColdChain = product.isColdChain || false;

  const toggleRxTooltip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltip(activeTooltip === "rx" ? null : "rx");
  };

  const toggleColdChainTooltip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltip(activeTooltip === "coldChain" ? null : "coldChain");
  };

  return (
    <>
      <div 
        role="group"
        aria-label={`Product card for ${product.name}`}
        className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-sm sm:p-md flex flex-col justify-between h-full transition-all duration-300 md:hover:shadow-xl md:hover:-translate-y-1.5 hover:border-primary/30 dark:hover:border-primary/50 select-none text-left shadow-xs"
      >
        
        {/* Product Image Section (45-50% height) */}
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-955 flex items-center justify-center shrink-0 h-[140px] sm:h-[160px] md:h-[180px] w-full">
          <img
            alt={product.name}
            className="max-h-[90%] max-w-[90%] object-contain p-1 transition-transform duration-500 md:group-hover:scale-104"
            src={product.image}
            loading="lazy"
          />
          
          {/* Badges Stack (Vertical top-left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {calculateDiscount() && (
              <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                {calculateDiscount()}
              </span>
            )}
            {product.stock === 0 ? (
              <span className="bg-slate-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Out of Stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Low Stock
              </span>
            ) : null}
            {product.badge && product.badge !== "Rx Required" && product.badge !== "Top Rated" && product.badge !== "Low Stock" && (
              <span className="bg-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                {product.badge}
              </span>
            )}
          </div>
 
          {/* Top Right Badges Overlay */}
          {(isRx || isColdChain) && (
            <div className="absolute top-2 right-2 flex flex-col items-center gap-2 z-20">
              {/* Rx Badge */}
              {isRx && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleRxTooltip}
                    onMouseEnter={() => setActiveTooltip("rx")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-955/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-9 sm:h-9"
                  >
                    <span className="font-extrabold text-[11px] tracking-tight">Rx</span>
                  </button>
                  {activeTooltip === "rx" && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-60 bg-slate-900 dark:bg-zinc-950 text-white rounded-xl shadow-xl border border-slate-800 dark:border-zinc-800 p-sm z-50 pointer-events-auto transition-all duration-200 origin-right animate-tooltip text-left">
                      <div className="font-bold text-xs mb-1 flex items-center gap-1.5 text-rose-400">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        Prescription Required
                      </div>
                      <div className="text-[10px] leading-relaxed text-slate-300">
                        A valid doctor's prescription is required before this medicine can be purchased.
                      </div>
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 dark:bg-zinc-950 border-r border-t border-slate-800 dark:border-zinc-800"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Cold Chain Badge */}
              {isColdChain && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleColdChainTooltip}
                    onMouseEnter={() => setActiveTooltip("coldChain")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-955/40 border border-sky-200 dark:border-sky-900 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-9 sm:h-9"
                  >
                    <span className="material-symbols-outlined text-[18px]">ac_unit</span>
                  </button>
                  {activeTooltip === "coldChain" && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-60 bg-slate-900 dark:bg-zinc-950 text-white rounded-xl shadow-xl border border-slate-800 dark:border-zinc-800 p-sm z-50 pointer-events-auto transition-all duration-200 origin-right animate-tooltip text-left">
                      <div className="font-bold text-xs mb-1 flex items-center gap-1.5 text-sky-400">
                        <span className="material-symbols-outlined text-[15px]">ac_unit</span>
                        Temperature Controlled
                      </div>
                      <div className="text-[10px] leading-relaxed text-slate-300">
                        This medicine is shipped using certified cold-chain logistics to maintain the required storage temperature throughout delivery.
                      </div>
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 dark:bg-zinc-950 border-r border-t border-slate-800 dark:border-zinc-800"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
 
        {/* Product Details Section */}
        <div className="pt-sm pb-xs flex-1 flex flex-col justify-between">
          <div className="space-y-1 text-center">
            
            {/* Brand */}
            <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-extrabold truncate ${product.brand ? "text-slate-400 dark:text-zinc-500" : "text-transparent select-none"}`}>
              {product.brand || "Placeholder"}
            </p>
 
            {/* Product Title */}
            <Link 
              to={`/products/${product.slug || productId}`} 
              aria-label={`View details for ${product.name}`}
              className="block hover:text-primary dark:hover:text-primary-fixed-dim transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-sm"
            >
              <h3 className="text-center font-extrabold text-[13px] sm:text-[14px] text-slate-800 dark:text-zinc-100 leading-snug line-clamp-2 h-10 sm:h-12 overflow-hidden hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" title={product.name}>
                {product.name}
              </h3>
            </Link>
 
            {/* Molecule Link (Dynamic secondary navigation) */}
            <div className="h-4 sm:h-5 flex items-center justify-center mt-1">
              {molecule ? (
                <Link 
                  to={`/molecules/${molecule.slug}`} 
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Search other medicines containing molecule ${molecule.name}`}
                  className="inline-block text-[9px] sm:text-[10px] font-black tracking-wider text-[#038076]/80 dark:text-[#84d6b9]/80 hover:text-[#038076] dark:hover:text-[#84d6b9] hover:underline cursor-pointer uppercase truncate max-w-full"
                  title={molecule.name}
                >
                  {molecule.name}
                </Link>
              ) : (
                <span className="text-transparent select-none text-[9px] sm:text-[10px]">-</span>
              )}
            </div>
          </div>
 
          {/* Pricing & Add to Cart */}
          <div className="mt-3 space-y-md">
            
            {/* Price section */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-baseline justify-center gap-xs h-6">
                <span className="text-[14px] sm:text-[15px] md:text-base font-black text-slate-800 dark:text-zinc-100">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <span className="text-slate-400 line-through text-[10px] md:text-xs font-semibold">
                    {formatCurrency(product.originalPrice)}
                  </span>
                ) : null}
              </div>
              
              {/* Savings Slot (Fixed Height to align cards) */}
              <div className="h-4 sm:h-5 flex items-center justify-center">
                {savings > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[9px] md:text-[10px] font-bold">
                    You Save {formatCurrency(savings)}
                  </span>
                ) : (
                  <span className="text-transparent select-none text-[9px] md:text-[10px]">-</span>
                )}
              </div>
            </div>
 
            {/* Add to Cart full-width button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              aria-label={
                product.stock === 0 
                  ? "Out of Stock" 
                  : isRx && !localRxFile 
                    ? "Upload prescription to purchase product" 
                    : `Add ${product.name} to cart`
              }
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#004782] to-[#038076] hover:opacity-95 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs shadow-xs hover:shadow-md hover:shadow-[#038076]/10 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer min-h-[44px]"
            >
              {isAdding ? (
                <RefreshCw className="animate-spin h-4 w-4" />
              ) : product.stock === 0 ? (
                "Out of Stock"
              ) : isRx && !localRxFile ? (
                "Upload Rx & Add"
              ) : (
                "Add to Cart"
              )}
            </button>
 
          </div>
        </div>
      </div>
 
      {/* Prescription Upload Modal */}
      <Modal
        isOpen={rxUploadOpen}
        onClose={() => setRxUploadOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-sm mb-md text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You are adding a regulated prescription drug: <strong className="text-on-surface">{product.name}</strong>.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            To proceed, upload a valid medical prescription signed by a certified practitioner.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleRxSuccess}
          onClose={() => setRxUploadOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ProductCard;
