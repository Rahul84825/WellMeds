import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";
import { ShoppingCart, PhoneCall, RefreshCw, Star, Shield, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { RxBadge, StockBadge, SavingsBadge, BestValueBadge, ComparisonBadge } from "./Badges";

const SearchResultCard = ({ product, comparisonTag = null }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const productId = (product._id || product.id)?.toString();
  const productUrl = `/products/${product.slug || productId}`;
  const isRx = product.isPrescriptionRequired || product.requiresRx || false;
  const isOOS = product.inStock === false || product.stock === 0;

  const manufacturer = product.manufacturer || product.brand || "WELLMEDS";
  const strength = product.strength || product.productSpecifications?.strength || "";
  const molecule = product.molecules?.length > 0 ? product.molecules[0] : null;
  const saltName = molecule?.name || product.genericName || product.composition?.[0]?.ingredient || "";

  const cartItem = cartItems?.find((item) => {
    const itemPId = (item.product?._id || item.product?.id || item._id || item.id)?.toString();
    return itemPId === productId;
  });
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const originalPrice = product.originalPrice || product.mrp || 0;
  const price = product.price || 0;
  const savings = originalPrice > price ? originalPrice - price : 0;
  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const isBestValue = discountPercent >= 20 || product.badge === "Best Value";

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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(productUrl); }}
      className="group relative flex flex-col justify-between h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#038076]/40 dark:hover:border-[#038076]/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#038076] text-left cursor-pointer overflow-hidden"
    >
      {/* Top Badges Area */}
      <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {comparisonTag && <ComparisonBadge type={comparisonTag} />}
          {isBestValue && !comparisonTag && <BestValueBadge />}
          {discountPercent > 0 && !isBestValue && !comparisonTag && (
            <SavingsBadge discountPercent={discountPercent} />
          )}
        </div>

        {isRx && <RxBadge className="scale-90 origin-right shrink-0" />}
      </div>

      {/* Image & Main Info Container */}
      <div className="flex flex-col gap-3">
        {/* Product Image Container */}
        <div className="relative w-full h-36 sm:h-40 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/80 p-3 flex items-center justify-center overflow-hidden">
          <img
            alt={product.name}
            src={product.image || DEFAULT_PRODUCT_IMAGE}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PRODUCT_IMAGE;
            }}
            loading="lazy"
            className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
          />

          {isOOS && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-2">
              <span className="bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Text Information */}
        <div className="space-y-1.5">
          {/* Brand & Strength */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
            <span className="truncate uppercase tracking-wider">
              {manufacturer}
            </span>
            {strength && (
              <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md shrink-0">
                {strength}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100 group-hover:text-[#038076] transition-colors leading-snug line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Active Molecule / Salt */}
          {saltName && (
            <p className="text-xs text-[#038076] dark:text-[#84d6b9] font-medium truncate flex items-center gap-1">
              <span className="font-semibold text-slate-400 dark:text-zinc-500 shrink-0">Salt:</span>
              <span className="truncate">{saltName}</span>
            </p>
          )}

          {/* Trust/Rating Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold pt-0.5">
            <Star size={12} fill="currentColor" />
            <span>4.8</span>
            <span className="text-slate-400 font-normal">| Verified Clinical Quality</span>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
        {/* Pricing Row */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              {formatCurrency(price)}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-slate-400 dark:text-zinc-500 line-through ml-2">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {savings > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Save {formatCurrency(savings)}
            </span>
          )}
        </div>

        {/* Action Button: Add to Cart / Stepper OR Notify Pharmacist */}
        {isOOS ? (
          <a
            href={`https://wa.me/917420909445?text=Hi%2C%20I%20want%20to%20order%20${encodeURIComponent(product.name)}%20which%20is%20currently%20out%20of%20stock.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <PhoneCall size={14} />
            <span>Notify Pharmacist</span>
          </a>
        ) : cartQuantity > 0 ? (
          <div className="flex items-center gap-2 w-full h-10">
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl px-2 py-1 flex-1 h-full">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-[#038076] hover:bg-[#02665e] text-white font-bold text-sm flex items-center justify-center shadow-2xs active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white px-2">
                {cartQuantity} in Cart
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-[#038076] hover:bg-[#02665e] text-white font-bold text-sm flex items-center justify-center shadow-2xs active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-2.5 px-3 rounded-xl bg-[#038076] hover:bg-[#02665e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer h-10"
          >
            {isAdding ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchResultCard;
