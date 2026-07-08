import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import { formatCurrency } from "../utils/currency";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import MiniTooltip from "./MiniTooltip";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [rxUploadOpen, setRxUploadOpen]   = useState(false);
  const [localRxFile, setLocalRxFile]     = useState(null);
  const [isAdding, setIsAdding]           = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // 'rx' | 'coldChain' | null

  const productId  = (product._id || product.id)?.toString();
  const productUrl = `/products/${product.slug || productId}`;
  const molecule   = product.molecules?.length > 0 ? product.molecules[0] : null;
  const isRx       = product.isPrescriptionRequired || product.requiresRx || false;
  const isColdChain= product.isColdChain || false;
  const isOOS      = product.inStock === false || product.stock === 0;
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price : 0;

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    return `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`;
  };

  React.useEffect(() => {
    if (!activeTooltip) return;
    const h = () => setActiveTooltip(null);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [activeTooltip]);

  const handleCardClick = (e) => {
    // Don't navigate if user clicked a button, link, or the molecule area
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(productUrl);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOOS) return;
    if (isRx && !localRxFile) { setRxUploadOpen(true); return; }
    setIsAdding(true);
    try {
      await addToCart(
        isRx && localRxFile
          ? { ...product, rxUploaded: true, rxFile: localRxFile }
          : product,
        1
      );
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
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, 1);
    toast.success(`${product.name} added to cart with prescription!`);
  };

  const toggleTooltip = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  const discount = calculateDiscount();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name}`}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === "Enter") navigate(productUrl); }}
        className="group relative flex h-full flex-col justify-between
                   cursor-pointer select-none rounded-2xl border
                   border-slate-100 dark:border-zinc-800/80
                   bg-white dark:bg-zinc-900
                   shadow-sm transition-all duration-300
                   md:hover:-translate-y-1.5
                   md:hover:shadow-[0_12px_32px_rgba(3,128,118,0.12)]
                   md:hover:border-[#038076]/30
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-[#038076]"
      >

        {/* ── Top accent line (teal gradient, matches hero) ── */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#004782] to-[#038076]
                        opacity-0 transition-opacity duration-300
                        group-hover:opacity-100 rounded-t-2xl" />

        {/* ── Image section ── */}
        <div className="relative flex items-center justify-center overflow-hidden
                        bg-slate-50 dark:bg-zinc-950
                        h-[140px] sm:h-[160px] md:h-[175px] w-full shrink-0 rounded-t-2xl">
          <img
            alt={product.name}
            src={product.image}
            loading="lazy"
            className="max-h-[88%] max-w-[88%] object-contain p-1
                       transition-transform duration-500 md:group-hover:scale-105"
          />

          {/* Left badges */}
          <div className="pointer-events-none absolute left-2 top-2 z-10
                          flex flex-col gap-1">
            {discount && (
              <span className="w-fit rounded-full bg-rose-600 px-2 py-0.5
                               text-[9px] font-black uppercase text-white shadow-sm">
                {discount}
              </span>
            )}
            {isOOS && (
              <span className="w-fit rounded-full bg-slate-500 px-2 py-0.5
                               text-[9px] font-black uppercase text-white shadow-sm">
                Out of Stock
              </span>
            )}
            {product.badge &&
              !["Rx Required","Top Rated","Low Stock"].includes(product.badge) && (
              <span className="w-fit rounded-full bg-[#038076] px-2 py-0.5
                               text-[9px] font-black uppercase text-white shadow-sm">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right-side Rx / Cold Chain badges */}
        {(isRx || isColdChain) && (
          <div className="absolute right-3 top-[calc(3px+10px)] z-20
                          flex flex-col items-center gap-2">
            {isRx && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleTooltip("rx", e)}
                  onMouseEnter={isTouchDevice ? undefined : () => setActiveTooltip("rx")}
                  onMouseLeave={isTouchDevice ? undefined : () => setActiveTooltip(null)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center
                             rounded-full border border-rose-200 bg-rose-50
                             text-rose-600 shadow-sm transition-all duration-300
                             hover:scale-110 active:scale-90
                             dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                >
                  <span className="text-[11px] font-extrabold tracking-tight">Rx</span>
                </button>
                <MiniTooltip
                  text="Prescription Only"
                  active={activeTooltip === "rx"}
                  textColor="text-rose-400"
                />
              </div>
            )}

            {isColdChain && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleTooltip("coldChain", e)}
                  onMouseEnter={isTouchDevice ? undefined : () => setActiveTooltip("coldChain")}
                  onMouseLeave={isTouchDevice ? undefined : () => setActiveTooltip(null)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center
                             rounded-full border border-sky-200 bg-sky-50
                             text-sky-600 shadow-sm transition-all duration-300
                             hover:scale-110 active:scale-90
                             dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-400"
                >
                  <span className="material-symbols-outlined text-[16px]">ac_unit</span>
                </button>
                <MiniTooltip
                  text="Store at 2–8°C"
                  active={activeTooltip === "coldChain"}
                  textColor="text-sky-400"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Product details ── */}
        <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2">

          {/* Text block */}
          <div className="flex flex-col items-center text-center gap-0.5">

            {/* Brand */}
            <p className={`text-[9px] md:text-[10px] uppercase tracking-widest
                           font-extrabold truncate
                           ${product.manufacturer || product.brand
                             ? "text-slate-400 dark:text-zinc-500"
                             : "invisible"}`}>
              {product.manufacturer || product.brand || "—"}
            </p>

            {/* Product name */}
            <h3
              className="mt-0.5 line-clamp-2 h-9 overflow-hidden text-center
                         text-[13px] font-extrabold leading-snug
                         text-[#1D2B5C] dark:text-zinc-100
                         transition-colors group-hover:text-[#038076]
                         sm:text-[14px] sm:h-10"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Molecule — tighter gap, own click zone */}
            <div className="mt-0.5 flex h-4 items-center justify-center">
              {molecule ? (
                <Link
                  to={`/molecules/${molecule.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Search medicines with ${molecule.name}`}
                  title={molecule.name}
                  className="max-w-full truncate text-[9px] font-black uppercase
                             tracking-wider text-[#038076]/75
                             hover:text-[#038076] hover:underline
                             dark:text-[#84d6b9]/75 dark:hover:text-[#84d6b9]
                             sm:text-[10px]"
                >
                  {molecule.name}
                </Link>
              ) : (
                <span className="invisible text-[9px]">—</span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="mt-2.5 space-y-2">

            {/* Price row */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-6 items-baseline justify-center gap-1.5">
                <span className="text-[14px] font-black text-[#1D2B5C]
                                 dark:text-zinc-100 sm:text-[15px] md:text-base">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[10px] font-semibold text-slate-400 line-through md:text-xs">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex h-4 items-center justify-center">
                {savings > 0 ? (
                  <span className="text-[9px] font-bold text-emerald-600
                                   dark:text-emerald-400 md:text-[10px]">
                    You Save {formatCurrency(savings)}
                  </span>
                ) : (
                  <span className="invisible text-[9px]">—</span>
                )}
              </div>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOOS || isAdding}
              aria-label={
                isOOS ? "Out of Stock"
                : isRx && !localRxFile ? "Upload prescription to add"
                : `Add ${product.name} to cart`
              }
              className="flex min-h-[40px] w-full cursor-pointer items-center
                         justify-center gap-1.5 rounded-xl px-4 py-2
                         text-xs font-bold text-white shadow-sm
                         transition-all duration-300 active:scale-[0.98]
                         select-none sm:text-sm
                         bg-gradient-to-r from-[#004782] to-[#038076]
                         hover:opacity-90 hover:shadow-md
                         hover:shadow-[#038076]/15
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isOOS ? (
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

      {/* Prescription modal */}
      <Modal
        isOpen={rxUploadOpen}
        onClose={() => setRxUploadOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="mb-4 space-y-2 text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You are adding a regulated prescription drug:{" "}
            <strong className="text-on-surface">{product.name}</strong>.
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