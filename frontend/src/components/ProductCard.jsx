import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import MiniTooltip from "./MiniTooltip";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
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

  const cartItem = cartItems?.find((item) => {
    const itemPId = (item.product?._id || item.product?.id || item._id || item.id)?.toString();
    return itemPId === productId;
  });
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price 
    : 0;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
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
      onKeyDown={(e) => { if (e.key === "Enter") navigate(productUrl); }}
      className="group relative flex h-full flex-col justify-between
                 cursor-pointer select-none rounded-2xl
                 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800
                 hover:shadow-md transition-all duration-200
                 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-[#038076]
                 overflow-hidden text-left"
    >
      {/* ── Image section with full-width light background and bottom border line ── */}
      <div className="relative flex items-center justify-center overflow-hidden
                      bg-[#eef3f7] dark:bg-zinc-955
                      h-[125px] sm:h-[145px] md:h-[160px] w-full shrink-0
                      border-b border-slate-200/80 dark:border-zinc-800/80 p-2.5">
        <img
          alt={product.name}
          src={product.image || DEFAULT_PRODUCT_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
          loading="lazy"
          className="max-h-[90%] max-w-[90%] object-contain select-none
                     transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-left Badges */}
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="w-fit rounded-lg bg-[#cbf7cf] dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-[#15803d] dark:text-emerald-400 shadow-2xs">
              {discountPercent}% Off
            </span>
          )}
          {isOOS && (
            <span className="w-fit rounded-lg bg-slate-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-2xs">
              Out of Stock
            </span>
          )}
          {product.badge &&
            !["Rx Required", "Top Rated", "Low Stock"].includes(product.badge) && (
            <span className="w-fit rounded-lg bg-[#038076] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-2xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Top-right Badges (Rx & Cold Chain) */}
        {(isRx || isColdChain) && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
            {isRx && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleTooltip("rx", e)}
                  onMouseEnter={isTouchDevice ? undefined : () => setActiveTooltip("rx")}
                  onMouseLeave={isTouchDevice ? undefined : () => setActiveTooltip(null)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center
                             rounded-full bg-[#3f257a] text-white shadow-xs
                             transition-transform hover:scale-110 active:scale-95"
                  aria-label="Rx Required"
                >
                  <span className="text-[9px] font-black tracking-tight">Rx</span>
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
                  className="flex h-6 w-6 cursor-pointer items-center justify-center
                             rounded-full bg-[#009bde] text-white shadow-xs
                             transition-transform hover:scale-110 active:scale-95"
                  aria-label="Cold Chain"
                >
                  <span className="material-symbols-outlined text-[13px]">ac_unit</span>
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
      </div>

      {/* ── Product details ── */}
      <div className="flex flex-1 flex-col justify-between p-3 text-center">

        {/* Header: Title & Molecule */}
        <div className="flex flex-col items-center">
          <h3
            className="line-clamp-2 h-8 sm:h-9 overflow-hidden text-center text-xs sm:text-sm font-bold leading-snug text-slate-800 dark:text-zinc-100 transition-colors group-hover:text-[#038076]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Molecule Subtitle */}
          <div className="mt-0.5 h-4 flex items-center justify-center">
            {molecule ? (
              <Link
                to={`/molecules/${molecule.slug}`}
                onClick={(e) => e.stopPropagation()}
                title={molecule.name}
                className="text-[10px] font-semibold text-[#5a6a85] dark:text-zinc-400 uppercase tracking-wider underline hover:text-[#038076]"
              >
                {molecule.name}
              </Link>
            ) : (
              <span className="invisible text-[10px]">—</span>
            )}
          </div>
        </div>

        {/* Pricing & Savings */}
        <div className="mt-2 flex flex-col items-center">
          {/* Main Price Row */}
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-[#3f257a] dark:text-[#a4c9ff]">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Dashed Border Line */}
          <div className="w-full border-b border-dashed border-slate-200 dark:border-zinc-800 my-1.5" />

          {/* Savings Line */}
          <div className="h-4 flex items-center justify-center text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {savings > 0 ? (
              <span>
                You Save: <span className="font-bold text-[#00a859] dark:text-emerald-400">₹{savings} ({discountPercent}%)</span>
              </span>
            ) : (
              <span className="invisible">—</span>
            )}
          </div>

          {/* Action Area: Add to Cart OR Quantity Stepper + Buy Now */}
          {cartQuantity > 0 ? (
            <div className="mt-2 flex items-center gap-1.5 w-full h-[34px] sm:h-[36px]">
              {/* Stepper Control */}
              <div className="flex items-center justify-between bg-[#f0edfd] dark:bg-purple-950/40 border border-[#3f257a]/30 rounded-lg sm:rounded-xl px-1 py-0.5 min-w-[72px] sm:min-w-[80px] h-full shrink-0">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-5 h-5 rounded-full bg-[#3f257a] hover:bg-[#321c62] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs transition-transform active:scale-90 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-extrabold text-[11px] text-slate-800 dark:text-zinc-100 px-0.5 text-center">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-5 h-5 rounded-full bg-[#3f257a] hover:bg-[#321c62] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs transition-transform active:scale-90 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-full py-1.5 px-2.5 rounded-lg sm:rounded-xl bg-[#3f257a] hover:bg-[#321c62] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOOS || isAdding}
              className="mt-2 w-full py-2 px-3 rounded-lg sm:rounded-xl bg-[#3f257a] hover:bg-[#321c62] disabled:opacity-50 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer h-[34px] sm:h-[36px]"
            >
              {isAdding ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : isOOS ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart size={14} />
                  <span>Add to cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;