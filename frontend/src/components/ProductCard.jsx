import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { RefreshCw, ShoppingCart, Plus, Minus, ShieldCheck, Thermometer } from "lucide-react";
import MiniTooltip from "./MiniTooltip";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { calculateSavings, calculateDiscountPercent, formatPrice } from "../utils/currency";

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

  const savings = calculateSavings(product.originalPrice, product.price);
  const discountPercent = calculateDiscountPercent(product.originalPrice, product.price);

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
    } catch (err) {
      console.error(err);
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
      {/* Top Image Frame matching Reference Design */}
      <div className="relative flex items-center justify-center overflow-hidden
                      bg-white dark:bg-zinc-950
                      h-[160px] sm:h-[180px] md:h-[190px] w-full shrink-0
                      border-b border-slate-100 dark:border-zinc-800 p-3 sm:p-4">
        <img
          alt={product.name}
          src={product.image || DEFAULT_PRODUCT_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
          loading="lazy"
          decoding="async"
          className="max-w-[85%] max-h-[85%] object-contain select-none"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
        />

        {/* Top Left Status & Discount Badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="w-fit rounded-full bg-[#bbf7d0] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-300 px-3 py-1 text-xs font-bold font-sans shadow-2xs">
              {discountPercent}% Off
            </span>
          )}
          {isOOS && (
            <span className="w-fit rounded-full bg-zinc-800 text-white px-3 py-1 text-[11px] font-bold font-sans uppercase tracking-wider">
              Out of Stock
            </span>
          )}
          {product.badge &&
            !["Rx Required", "Top Rated", "Low Stock"].includes(product.badge) && (
              <span className="w-fit rounded-full bg-[#fef08a] text-[#854d0e] px-3 py-1 text-[11px] font-bold font-sans uppercase tracking-wider">
                {product.badge}
              </span>
            )}
        </div>

        {/* Top Right Rx & Cold Chain Circular Icons */}
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
                             transition-transform hover:scale-110 active:scale-95 border border-[#157a6d]"
                  aria-label="Prescription Required"
                >
                  <span className="text-[12px] font-extrabold font-serif leading-none">Rx</span>
                </button>
                <MiniTooltip
                  text="Prescription Required"
                  active={activeTooltip === "rx"}
                  textColor="text-[#157a6d] dark:text-emerald-400"
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
                             rounded-full bg-[#0ea5e9] text-white shadow-xs
                             transition-transform hover:scale-110 active:scale-95 border border-[#0ea5e9]"
                  aria-label="Cold Chain Product (2–8°C)"
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
      <div className="flex flex-1 flex-col justify-between p-4 text-left bg-white dark:bg-zinc-900 font-sans">
        <div>
          {/* Product Title */}
          <h3
            className="font-sans text-base sm:text-lg font-bold text-[#1F2937] dark:text-zinc-100 leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] group-hover:text-[#157a6d] transition-colors"
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
                className="font-sans text-[12px] sm:text-xs font-medium text-[#157a6d] dark:text-[#38a394] underline hover:text-[#0f6157] truncate block max-w-full uppercase tracking-wider"
              >
                {molecule.name}
              </Link>
            ) : (
              <span className="font-sans text-[12px] sm:text-xs font-medium text-[#157a6d]/80 dark:text-zinc-400 truncate uppercase tracking-wider">
                {categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Cart Action Block */}
        <div className="mt-3">
          {/* Current Price & MRP */}
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white leading-none">
              ₹{formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-sans text-xs sm:text-sm text-[#6B7280] dark:text-zinc-500 line-through">
                ₹{formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Savings Section with Dashed Divider Above */}
          <div className="mt-2.5 pt-2 border-t border-dashed border-[#dde8e3] dark:border-zinc-800 min-h-[1.75rem] flex items-center">
            {savings > 0 ? (
              <div className="font-sans text-xs sm:text-sm text-[#4B5563] dark:text-zinc-300 font-normal">
                You Save:{" "}
                <span className="font-bold text-[#16a34a] dark:text-emerald-400">
                  ₹{formatPrice(savings)} ({discountPercent}%)
                </span>
              </div>
            ) : (
              <div className="font-sans text-xs text-[#6B7280] dark:text-zinc-400 font-normal">
                Best Price Guaranteed
              </div>
            )}
          </div>

          {/* Cart Stepper OR Add To Cart Button */}
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
                  <span className="font-sans font-bold text-xs text-[#172b26] dark:text-zinc-100 px-1">
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
                  className="flex-1 h-full py-1.5 px-3 rounded-lg bg-[#157a6d] hover:bg-[#0f6157] text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOOS || isAdding}
                className="w-full py-2 px-3 rounded-lg bg-[#157a6d] hover:bg-[#0f6157] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer h-9"
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