import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, ShieldCheck, ShoppingCart, Calendar } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useCart } from "../../hooks/useCart";

const PurchaseCard = ({
  product,
  handleBuyNow,
  handleAddToCart,
  discountPercent
}) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const productId = (product._id || product.id)?.toString();
  const cartItem = cartItems?.find((item) => item.id === productId);
  const isInCart = !!cartItem;

  // Helper to parse available packings/variants from database product
  const getVariants = (prod) => {
    const packingsStr = prod.productSpecifications?.availablePackings || prod.availablePackings;
    if (packingsStr && typeof packingsStr === "string" && packingsStr.trim().length > 0) {
      return packingsStr.split(",").map((p, idx) => ({
        id: idx,
        name: p.trim(),
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
      }));
    }
    
    // Default fallback to product's own packSize
    const defaultPackSize = prod.packSize || prod.productSpecifications?.packSize || "1 Unit";
    return [
      {
        id: 0,
        name: defaultPackSize,
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
      }
    ];
  };

  const variants = getVariants(product);
  const selectedVariant = variants[selectedVariantIdx] || variants[0];

  const variantNameUpper = selectedVariant.name.toUpperCase();
  const packSizeUpper = (product.packSize || product.productSpecifications?.packSize || "").toUpperCase();
  const packDescription = variantNameUpper + (packSizeUpper && !variantNameUpper.includes(packSizeUpper) ? ` OF ${packSizeUpper}` : "");

  const handleGoToCart = () => {
    navigate("/cart");
  };

  return (
    <aside className="w-full max-w-[380px] mx-auto text-xs select-none lg:sticky lg:top-24">
      
      {/* Main Card Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-3xl shadow-lg space-y-3.5 text-left">
        
        {/* 1. Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#02665e] dark:text-primary-fixed-dim leading-none">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-slate-400 line-through text-xs font-bold">
                MRP {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-455 dark:text-zinc-500 font-medium">Inclusive of all taxes</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[#086b53] dark:text-emerald-400 font-extrabold">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-b border-dashed border-slate-200 dark:border-zinc-800/80 my-2.5 w-full"></div>

        {/* 2. Choose Pack Size (Variants Selector) */}
        {variants.length > 0 && (
          <div className="space-y-1.5 text-left">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Select Option</span>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIdx === idx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`w-full rounded-2xl border text-left cursor-pointer transition-all flex flex-col overflow-hidden ${
                      isSelected
                        ? "border-[#038076] dark:border-[#038076] ring-1 ring-[#038076]"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 bg-transparent"
                    }`}
                  >
                    {/* Top half: Name and selection indicator */}
                    <div className="bg-slate-50 dark:bg-zinc-850 p-2.5 flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/35 w-full">
                      <span className="font-bold text-xs text-slate-800 dark:text-zinc-150 truncate max-w-[80%]">
                        {v.name}
                      </span>
                      {isSelected ? (
                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-white stroke-[3.5]" />
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-zinc-700 shrink-0" />
                      )}
                    </div>
                    {/* Bottom half: Unit Price */}
                    <div className="bg-white dark:bg-zinc-900 p-2.5 text-left w-full">
                      <span className="font-medium text-[11px] text-slate-500 dark:text-zinc-400">
                        {formatCurrency(v.price)}/Unit
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Pack Description */}
        <div className="text-center font-black text-slate-655 dark:text-zinc-300 uppercase tracking-wide text-[10.5px] py-1">
          {packDescription}
        </div>

        {/* 4. CTA Block: Buy Now / Go to Cart & Cart Controls */}
        <div className="space-y-2.5">
          {isInCart ? (
            <>
              {/* Go To Cart ↗ */}
              <button
                onClick={handleGoToCart}
                className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold h-11 rounded-xl transition-all hover:shadow-md active:scale-98 flex items-center justify-center gap-1 outline-none cursor-pointer text-xs shadow-sm"
              >
                Go To Cart <span className="text-sm font-semibold">↗</span>
              </button>

              {/* Rounded quantity selector */}
              <div className="flex items-center justify-center bg-slate-50 dark:bg-zinc-950/20 h-11 w-full rounded-xl p-1 gap-6 border border-slate-100 dark:border-zinc-800/40 animate-[fade-in_0.20s_ease-out] product-detail-qty-selector">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-850 cursor-pointer shadow-xs transition-colors product-detail-qty-btn"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">remove</span>
                </button>
                <span className="w-8 h-8 rounded-full bg-[#086b53] text-white flex items-center justify-center font-extrabold text-xs shadow-xs product-detail-qty-val">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= (product.stock || 30)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-850 cursor-pointer shadow-xs transition-colors product-detail-qty-btn"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">add</span>
                </button>
              </div>
              <style>{`
                @media (max-width: 768px) {
                  .product-detail-qty-selector {
                    height: 36px !important;
                    gap: 12px !important;
                    border-radius: 10px !important;
                  }
                  .product-detail-qty-btn {
                    width: 28px !important;
                    height: 28px !important;
                  }
                  .product-detail-qty-btn span {
                    font-size: 14px !important;
                  }
                  .product-detail-qty-val {
                    width: 28px !important;
                    height: 28px !important;
                    font-size: 11px !important;
                  }
                }
              `}</style>
            </>
          ) : (
            <>
              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.inStock === false || product.stock === 0}
                className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold h-11 rounded-xl transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 outline-none cursor-pointer text-xs shadow-sm"
              >
                Buy Now
              </button>

              {/* Add to Cart Outline */}
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false || product.stock === 0}
                className="w-full border border-[#038076] text-[#038076] dark:text-[#84d6b9] dark:border-[#84d6b9]/50 hover:bg-[#038076]/5 font-bold h-11 rounded-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 outline-none cursor-pointer text-xs"
              >
                Add <ShoppingCart size={14} />
              </button>
            </>
          )}
        </div>

      </div>

      {/* 6. Separate Delivery Card Block */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-sm flex items-center gap-3 w-full mt-3 text-xs text-left">
        <div className="w-9 h-9 rounded-full bg-slate-55 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-[#038076]">
          <Calendar size={18} />
        </div>
        <div className="space-y-0.5">
          <p className="text-slate-400 font-medium">
            Delivering to: <span className="text-slate-800 dark:text-zinc-200 font-bold">Pune, 411035</span>
            <span className="inline-block align-middle ml-1 text-slate-450 text-[10px]">▼</span>
          </p>
          <p className="text-slate-455 dark:text-zinc-400 font-medium">
            Delivery by: <span className="text-[#038076] dark:text-emerald-400 font-extrabold">18 Jul - 19 Jul</span>
          </p>
        </div>
      </div>

      {/* 7. Horizontal Trust Badges */}
      <div className="flex justify-around items-center gap-2 pt-3.5 text-[9.5px] font-bold text-slate-400 w-full px-1">
        <div className="flex items-center gap-1">
          <Check size={11} className="text-emerald-500 shrink-0" />
          <span>Genuine Product</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock size={10} className="text-[#004782] shrink-0" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-[#086b53] shrink-0" />
          <span>Verified</span>
        </div>
      </div>

    </aside>
  );
};

export default PurchaseCard;
