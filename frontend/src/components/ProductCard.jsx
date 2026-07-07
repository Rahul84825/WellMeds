import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import { formatCurrency } from "../utils/currency";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
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
    e.stopPropagation();
    if (product.inStock === false || product.stock === 0) return;
    
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

  const handleCardClick = (e) => {
    navigate(`/products/${product.slug || productId}`);
  };

  return (
    <>
      <div 
        role="button"
        tabIndex="0"
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e);
          }
        }}
        aria-label={`Product card for ${product.name}`}
        className="group relative w-full max-w-[300px] mx-auto bg-white dark:bg-zinc-900 border border-[#E8EEF3] dark:border-zinc-800 rounded-[24px] p-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-250 ease-out hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(15,79,156,0.08)] hover:border-teal-500/20 dark:hover:border-teal-500/30 cursor-pointer flex flex-col justify-between h-full select-none text-left"
      >
        {/* Top Badges and Tooltips Row */}
        <div className="flex justify-between items-start w-full mb-3 shrink-0">
          {/* Discount Badge & Stock Status on Top Left */}
          <div className="flex flex-col gap-1 z-10">
            {calculateDiscount() && (
              <span className="bg-[#0f8f87] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm w-fit tracking-wider">
                {calculateDiscount()}
              </span>
            )}
            {product.inStock === false || product.stock === 0 ? (
              <span className="bg-slate-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Out of Stock
              </span>
            ) : null}
            {product.badge && product.badge !== "Rx Required" && product.badge !== "Top Rated" && product.badge !== "Low Stock" && (
              <span className="bg-[#0f8f87] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                {product.badge}
              </span>
            )}
          </div>

          {/* Rx & Cold Chain Icons on Top Right */}
          {(isRx || isColdChain) && (
            <div className="flex items-center gap-2 z-20">
              {/* Rx Badge */}
              {isRx && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleRxTooltip}
                    onMouseEnter={() => setActiveTooltip("rx")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#E8EEF3] dark:border-zinc-700 text-rose-600 dark:text-rose-450 flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer min-w-0 min-h-0"
                  >
                    <span className="font-extrabold text-[12px] tracking-tight">Rx</span>
                  </button>
                  
                  {/* Compact Rx Tooltip Pill */}
                  {activeTooltip === "rx" && (
                    <div className="absolute bottom-full right-0 mb-2 w-max bg-slate-900 dark:bg-zinc-950 text-white rounded-[10px] border border-slate-800 dark:border-zinc-850 px-3 py-2 shadow-md z-50 transition-all duration-200 ease-out text-center">
                      <span className="font-medium text-[11px] leading-none block whitespace-nowrap text-rose-400">Prescription Required</span>
                      <div className="absolute bottom-[-4px] right-[16px] rotate-45 w-2 h-2 bg-slate-900 dark:bg-zinc-950 border-b border-r border-slate-800 dark:border-zinc-850"></div>
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
                    className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-[#E8EEF3] dark:border-zinc-700 text-[#0f4f9c] dark:text-[#a4c9ff] flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer min-w-0 min-h-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">ac_unit</span>
                  </button>

                  {/* Compact Cold Chain Tooltip Pill */}
                  {activeTooltip === "coldChain" && (
                    <div className="absolute bottom-full right-0 mb-2 w-max bg-slate-900 dark:bg-zinc-950 text-white rounded-[10px] border border-slate-800 dark:border-zinc-850 px-3 py-2 shadow-md z-50 transition-all duration-200 ease-out text-center">
                      <span className="font-medium text-[11px] leading-none block whitespace-nowrap text-[#a4c9ff]">Keep Refrigerated</span>
                      <div className="absolute bottom-[-4px] right-[16px] rotate-45 w-2 h-2 bg-slate-900 dark:bg-zinc-950 border-b border-r border-slate-800 dark:border-zinc-850"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Image Section */}
        <div className="relative overflow-hidden flex items-center justify-center shrink-0 h-[180px] w-full mb-4">
          <img
            alt={product.name}
            className="max-h-full max-w-full object-contain p-2 transition-transform duration-250 ease-out group-hover:scale-[1.03]"
            src={product.image}
            loading="lazy"
          />
        </div>

        {/* Details and Actions */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-left w-full">
            {/* Brand / Manufacturer */}
            <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 truncate ${product.manufacturer || product.brand ? "text-[#0f4f9c]/60 dark:text-[#a4c9ff]/60" : "text-transparent select-none"}`}>
              {product.manufacturer || product.brand || "Placeholder"}
            </p>

            {/* Product Title */}
            <h3 className="font-bold text-[15px] text-[#0f172a] dark:text-zinc-150 leading-snug line-clamp-2 h-[44px] overflow-hidden mb-1.5" title={product.name}>
              {product.name}
            </h3>

            {/* Molecule Link */}
            <div className="h-5 flex items-center mb-3">
              {molecule ? (
                <Link 
                  to={`/molecules/${molecule.slug}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-bold tracking-wider text-[#0f8f87] dark:text-[#84d6b9] hover:text-[#0f4f9c] dark:hover:text-[#a4c9ff] hover:underline cursor-pointer uppercase truncate max-w-full"
                  title={molecule.name}
                >
                  {molecule.name}
                </Link>
              ) : (
                <span className="text-transparent select-none text-[10px]">-</span>
              )}
            </div>
          </div>

          <div className="w-full">
            {/* Price section */}
            <div className="flex flex-col mb-4">
              <div className="flex items-baseline gap-2 h-6">
                <span className="text-[18px] font-bold text-[#0f172a] dark:text-zinc-100">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <span className="text-[#94a3b8] line-through text-[13px] font-semibold">
                    {formatCurrency(product.originalPrice)}
                  </span>
                ) : null}
              </div>
              
              {/* Savings Row */}
              <div className="h-5 flex items-center">
                {savings > 0 ? (
                  <span className="text-[#0f8f87] dark:text-[#84d6b9] text-[11px] font-semibold">
                    You Save: {formatCurrency(savings)} ({calculateDiscount()})
                  </span>
                ) : (
                  <span className="text-transparent select-none text-[11px]">-</span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={(product.inStock === false || product.stock === 0) || isAdding}
              aria-label={
                product.inStock === false || product.stock === 0 
                  ? "Out of Stock" 
                  : isRx && !localRxFile 
                    ? "Upload prescription to purchase product" 
                    : `Add ${product.name} to cart`
              }
              className="w-full h-[54px] bg-gradient-to-r from-[#0f4f9c] to-[#0f8f87] hover:opacity-95 text-white rounded-[16px] font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-[#0f8f87]/15 active:scale-[0.98] transition-all duration-250 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {isAdding ? (
                <RefreshCw className="animate-spin h-5 w-5" />
              ) : product.inStock === false || product.stock === 0 ? (
                "Out of Stock"
              ) : isRx && !localRxFile ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>Upload Rx & Add</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Upload Modal */}
      <div onClick={(e) => e.stopPropagation()}>
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
      </div>
    </>
  );
};

export default ProductCard;
