import { useState } from "react";
import { Truck, Check, Lock, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useCart } from "../../hooks/useCart";

const PurchaseCard = ({
  product,
  handleBuyNow,
  handleAddToCart,
  discountPercent
}) => {
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

  return (
    <aside className="w-full max-w-[380px] mx-auto text-xs select-none lg:sticky lg:top-24">
      <div className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-855/60 p-4 rounded-3xl shadow-lg space-y-3">
        
        {/* 1. Price Section */}
        <div className="bg-slate-50/50 dark:bg-zinc-955/20 py-2 px-3 rounded-2xl border border-slate-100 dark:border-zinc-855 text-left">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#004782] dark:text-primary-fixed-dim">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-slate-400 line-through text-xs font-bold">
                  MRP {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-405 mt-0.5 font-medium">Inclusive of all taxes & GST</p>
        </div>

        {/* 2. Product Variant Card */}
        {variants.length > 0 && (
          <div className="space-y-1.5 text-left">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Choose Pack Size</span>
            <div className="grid grid-cols-1 gap-2">
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIdx === idx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#038076] bg-[#038076]/5 dark:bg-[#038076]/10"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 bg-transparent"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-800 dark:text-zinc-100">{v.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Unit Price: {formatCurrency(v.price)}</span>
                    </div>
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-[#038076] bg-[#038076]" : "border-slate-300 dark:border-zinc-700"
                    }`}>
                      {isSelected && <Check size={10} className="text-white stroke-[3.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Product Quantity/Pack Label */}
        <div className="text-center font-bold text-slate-800 dark:text-zinc-150 uppercase tracking-wide text-[11px] py-1 border-y border-slate-100 dark:border-zinc-800/60">
          {selectedVariant.name}
        </div>

        {/* 4. Buy Button */}
        <div className="space-y-2 pt-0.5">
          <button
            onClick={handleBuyNow}
            disabled={product.inStock === false || product.stock === 0}
            className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold h-11 rounded-xl transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 outline-none cursor-pointer text-xs shadow-sm"
          >
            Buy Now
          </button>

          {/* 5. Add To Cart + Quantity Interaction */}
          {isInCart ? (
            <div className="flex items-center border border-[#038076] rounded-xl bg-slate-50/50 dark:bg-zinc-900/60 h-10 w-full justify-between p-0.5 animate-[fade-in_0.20s_ease-out]">
              <button
                type="button"
                onClick={() => updateQuantity(productId, cartItem.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 outline-none rounded-lg cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-extrabold text-xs text-slate-800 dark:text-zinc-100">{cartItem.quantity} in Cart</span>
              <button
                type="button"
                onClick={() => updateQuantity(productId, cartItem.quantity + 1)}
                disabled={cartItem.quantity >= (product.stock || 30)}
                className="w-8 h-8 flex items-center justify-center text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 outline-none rounded-lg cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false || product.stock === 0}
              className="w-full border border-[#004782] text-[#004782] dark:text-[#a4c9ff] dark:border-[#a4c9ff]/50 hover:bg-[#004782]/5 font-bold h-10 rounded-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 outline-none cursor-pointer text-xs"
            >
              Add to Cart
            </button>
          )}
        </div>

        {/* 6. Delivery Section */}
        <div className="text-left bg-slate-50 dark:bg-zinc-955/20 py-2 px-3 rounded-xl border border-slate-100 dark:border-zinc-855 space-y-0.5">
          <p className="font-bold text-[10px] text-slate-500 flex items-center gap-1.5">
            <Truck size={12} className="text-[#086b53]" /> Delivery Location: Pune
          </p>
          <p className="text-[11px] font-extrabold text-[#086b53] dark:text-emerald-400">Free delivery by Tomorrow, 2:00 PM</p>
        </div>

        {/* 7. Trust Information */}
        <div className="space-y-1.5 pt-2.5 border-t border-slate-150 dark:border-zinc-800/80 text-left">
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-400">
            <Check size={12} className="text-emerald-500 shrink-0" />
            <span>100% Genuine Product</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-400">
            <Lock size={11} className="text-[#004782] shrink-0" />
            <span>Secure Encrypted Payment</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-400">
            <ShieldCheck size={12} className="text-[#086b53] shrink-0" />
            <span>Pharmacist Verified</span>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default PurchaseCard;
