import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { RefreshCw, ShoppingCart, Plus, Minus, ShieldCheck, Thermometer } from "lucide-react";
import { toast } from "sonner";
import MiniTooltip from "./MiniTooltip";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";

/**
 * Global ProductCard — WellMeds Design System V2 (Editorial Identity)
 * Reusable product sheet presentation card used across Home, Search, Categories, & Recommendations.
 */
const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // 'rx' | 'coldChain' | null

  if (!product) return null;

  const productId = (product._id || product.id)?.toString();
  const productUrl = `/products/${product.slug || productId}`;
  const molecule = product.molecules?.length > 0 ? product.molecules[0] : null;
  const isRx = product.isPrescriptionRequired || product.requiresRx || false;
  const isColdChain = product.isColdChain || false;
  const isOOS = product.inStock === false || product.stock === 0;
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const rawBrand = product.brand || product.manufacturer;
  const brandName = typeof rawBrand === "object" ? (rawBrand?.name || rawBrand?.title || "WELLMEDS SPECIALTY") : (rawBrand || "WELLMEDS SPECIALTY");

  const rawCategory = product.category;
  const categoryName = typeof rawCategory === "object" ? (rawCategory?.name || rawCategory?.title || "Specialty Healthcare") : (rawCategory || "Specialty Healthcare");

  const cartItem = cartItems?.find((item) => {
    const itemPId = (item.product?._id || item.product?.id || item._id || item.id)?.toString();
    return itemPId === productId;
  });
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  React.useEffect(() => {
    if (!activeTooltip) return;
    const h = () => setActiveTooltip(null);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [activeTooltip]);

  const handleCardClick = (e) => {
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

  const handleIncrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateQuantity(productId, cartQuantity + 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity.");
    }
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (cartQuantity <= 1) {
        await removeFromCart(productId);
      } else {
        await updateQuantity(productId, cartQuantity - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity.");
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOOS) return;
    try {
      if (cartQuantity === 0) {
        await addToCart(product, 1);
      }
      navigate("/checkout");
    } catch (err) {
      console.error(err);
      toast.error("Failed to proceed to checkout.");
    }
  };

  const toggleTooltip = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(productUrl);
      }}
      className="group relative flex h-full flex-col justify-between
                 cursor-pointer select-none rounded-xl
                 bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800
                 hover:border-[#157a6d]/40 dark:hover:border-[#157a6d]/60
                 hover:shadow-[0_12px_32px_rgba(23,43,38,0.08)] transition-all duration-250
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#157a6d]
                 overflow-hidden text-left"
    >
      {/* Top Image Frame with Soft Mint Vignette */}
      <div className="relative flex items-center justify-center overflow-hidden
                      bg-[#f4f9f7] dark:bg-zinc-950
                      h-[160px] sm:h-[185px] md:h-[200px] w-full shrink-0
                      border-b border-[#dde8e3] dark:border-zinc-800 p-0">
        <img
          alt={product.name}
          src={product.image || DEFAULT_PRODUCT_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
          loading="lazy"
          className="w-full h-full object-cover select-none
                     transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Left Status & Discount Badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="w-fit rounded-md bg-[#157a6d] text-white px-2 py-0.5 text-[10px] font-bold font-clinical-mono tracking-wider shadow-xs">
              SAVE {discountPercent}%
            </span>
          )}
          {isOOS && (
            <span className="w-fit rounded-md bg-zinc-700 text-white px-2 py-0.5 text-[10px] font-bold font-clinical-mono uppercase tracking-wider">
              OUT OF STOCK
            </span>
          )}
          {product.badge &&
            !["Rx Required", "Top Rated", "Low Stock"].includes(product.badge) && (
              <span className="w-fit rounded-md bg-[#b08d3e] text-white px-2 py-0.5 text-[10px] font-bold font-clinical-mono uppercase tracking-wider">
                {product.badge}
              </span>
            )}
        </div>

        {/* Top Right Rx & Cold Chain Pills */}
        {(isRx || isColdChain) && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
            {isRx && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleTooltip("rx", e)}
                  onMouseEnter={isTouchDevice ? undefined : () => setActiveTooltip("rx")}
                  onMouseLeave={isTouchDevice ? undefined : () => setActiveTooltip(null)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center
                             rounded-full bg-[#157a6d] text-white shadow-xs
                             transition-transform hover:scale-105 active:scale-95 border border-[#157a6d]"
                  aria-label="Prescription Required"
                >
                  <span className="text-[11px] font-black font-sans tracking-tight leading-none">Rx</span>
                </button>
                <MiniTooltip
                  text="Prescription Required"
                  active={activeTooltip === "rx"}
                  textColor="text-[#84d6b9]"
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
                  className="flex h-7 w-7 cursor-pointer items-center justify-center
                             rounded-full bg-[#0b6c8a] text-white shadow-xs
                             transition-transform hover:scale-105 active:scale-95 border border-[#0b6c8a]"
                  aria-label="Cold Chain Product"
                >
                  <Thermometer className="h-3.5 w-3.5" />
                </button>
                <MiniTooltip
                  text="Store at 2–8°C"
                  active={activeTooltip === "coldChain"}
                  textColor="text-sky-300"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col justify-between p-4 text-left bg-white dark:bg-zinc-900">
        <div>
          {/* Brand / Manufacturer Monospace Tag */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-clinical-mono text-[10px] font-semibold text-[#5f776e] uppercase tracking-widest truncate">
              {brandName}
            </span>
            {isRx && (
              <span className="inline-flex items-center gap-1 text-[9px] font-clinical-mono font-bold text-[#157a6d] bg-[#e7f0ea] dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                <ShieldCheck className="w-2.5 h-2.5 shrink-0" /> RX VERIFIED
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            className="font-editorial text-sm sm:text-base font-semibold text-[#172b26] dark:text-zinc-100 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#157a6d] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Molecule / Active Salt Subtitle */}
          <div className="mt-1 h-5 flex items-center overflow-hidden">
            {molecule ? (
              <Link
                to={`/molecules/${molecule.slug}`}
                onClick={(e) => e.stopPropagation()}
                title={molecule.name}
                className="font-clinical-mono text-[11px] text-[#157a6d] dark:text-[#38a394] underline hover:text-[#0f6157] truncate block max-w-full"
              >
                {molecule.name}
              </Link>
            ) : (
              <span className="font-clinical-mono text-[11px] text-[#5f776e]/70 truncate">
                {categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Cart Action Block */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-[#c3d4cc] dark:border-zinc-800">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-clinical-mono text-lg sm:text-xl font-bold text-[#172b26] dark:text-zinc-100">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-clinical-mono text-xs text-[#5f776e] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="font-clinical-mono text-[10px] font-bold text-[#157a6d]">
                SAVE ₹{savings}
              </span>
            )}
          </div>

          {/* Cart Stepper OR Add To Cart */}
          <div className="mt-3">
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-2 w-full h-9">
                <div className="flex items-center justify-between bg-[#e7f0ea] dark:bg-zinc-800 border border-[#c3d4cc] dark:border-zinc-700 rounded-lg px-2 min-w-[90px] h-full shrink-0">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-6 h-6 rounded-md bg-[#157a6d] hover:bg-[#0f6157] text-white flex items-center justify-center font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-clinical-mono font-bold text-xs text-[#172b26] dark:text-zinc-100 px-1">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-6 h-6 rounded-md bg-[#157a6d] hover:bg-[#0f6157] text-white flex items-center justify-center font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 h-full py-1.5 px-3 rounded-lg bg-[#157a6d] hover:bg-[#0f6157] text-white font-clinical-mono font-bold text-xs tracking-wider uppercase flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOOS || isAdding}
                className="w-full py-2 px-3 rounded-lg bg-[#157a6d] hover:bg-[#0f6157] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-clinical-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer h-9"
              >
                {isAdding ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isOOS ? (
                  "OUT OF STOCK"
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);