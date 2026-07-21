import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/currency";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import MiniTooltip from "./MiniTooltip";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
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
    setIsAdding(true);
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAdding(false);
    }
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
                   cursor-pointer select-none rounded-2xl
                   bg-white dark:bg-zinc-900
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-[#038076]
                   overflow-hidden
                   wellmeds-product-card"
      >

        {/* ── Image section ── */}
        <div className="relative flex items-center justify-center overflow-hidden
                        bg-slate-50 dark:bg-zinc-950
                        h-[140px] sm:h-[160px] md:h-[175px] w-full shrink-0 rounded-t-2xl product-card-img-wrap">
          <img
            alt={product.name}
            src={product.image || DEFAULT_PRODUCT_IMAGE}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PRODUCT_IMAGE;
            }}
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
        <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2 product-card-details">

          {/* Text block */}
          <div className="flex flex-col items-center text-center gap-0.5">

            {/* Brand */}
            <p className={`text-[9px] md:text-[10px] uppercase tracking-widest
                           font-extrabold truncate product-card-brand
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
                         sm:text-[14px] sm:h-10 product-card-title"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Molecule — tighter gap, own click zone */}
            <div className="mt-0.5 flex h-4 items-center justify-center product-card-molecule-wrap">
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
                             sm:text-[10px] product-card-molecule"
                >
                  {molecule.name}
                </Link>
              ) : (
                <span className="invisible text-[9px]">—</span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="mt-2.5 space-y-2 product-card-price-wrap">

            {/* Price row */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-6 items-baseline justify-center gap-1.5 product-card-price-row">
                <span className="text-[14px] font-black text-[#1D2B5C]
                                 dark:text-zinc-100 sm:text-[15px] md:text-base product-card-price">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[10px] font-semibold text-slate-400 line-through md:text-xs product-card-mrp">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex h-4 items-center justify-center product-card-savings-row">
                {savings > 0 ? (
                  <span className="text-[9px] font-bold text-emerald-600
                                   dark:text-emerald-400 md:text-[10px] product-card-savings">
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
                : `Add ${product.name} to cart`
              }
              className="flex min-h-[40px] w-full cursor-pointer items-center
                         justify-center gap-1.5 rounded-xl px-4 py-2
                         text-xs font-bold text-white select-none sm:text-sm
                         disabled:cursor-not-allowed disabled:opacity-50
                         wellmeds-product-card-cta product-card-cta-btn"
            >
              {isAdding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isOOS ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Product Card Mobile Responsiveness Overrides (≤768px) ── */
        @media (max-width: 768px) {
          .product-card-img-wrap {
            height: 105px !important; /* ~25% height reduction */
          }
          .product-card-details {
            padding: 8px 10px !important; /* Tighter padding */
          }
          .product-card-brand {
            font-size: 8px !important;
          }
          .product-card-title {
            font-size: 11.5px !important;
            line-height: 1.25 !important;
            height: 30px !important; /* Fits exactly 2 lines */
            margin-top: 2px !important;
          }
          .product-card-molecule-wrap {
            height: 12px !important;
            margin-top: 2px !important;
          }
          .product-card-molecule {
            font-size: 8px !important;
          }
          .product-card-price-wrap {
            margin-top: 6px !important;
            gap: 4px !important;
          }
          .product-card-price-row {
            height: 20px !important;
            gap: 4px !important;
          }
          .product-card-price {
            font-size: 13px !important;
          }
          .product-card-mrp {
            font-size: 9px !important;
          }
          .product-card-savings-row {
            height: 12px !important;
          }
          .product-card-savings {
            font-size: 8px !important;
          }
          .product-card-cta-btn {
            min-height: 32px !important;
            font-size: 11px !important;
            padding: 4px 10px !important;
            border-radius: 10px !important;
            margin-top: 6px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;