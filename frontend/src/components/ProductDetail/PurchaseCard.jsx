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
    <aside className="w-full max-w-[380px] mx-auto text-xs select-none lg:sticky lg:top-24 font-mono">
      {/* Main Prescription Purchase Card */}
      <div className="pdp-paper-card p-5 space-y-4 text-left">
        {/* 1. Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="pdp-serif-title text-3xl font-bold text-[#157a6d] leading-none">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[#5f776e] line-through text-xs font-semibold">
                MRP {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-[#5f776e]">Inclusive of all taxes & GST</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[#157a6d] font-extrabold bg-[#f0f8f5] px-2 py-0.5 rounded">
                SAVE {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="pdp-dashed-line my-1 w-full" />

        {/* 2. Choose Pack Size (Variants Selector) */}
        {variants.length > 0 && (
          <div className="space-y-2 text-left">
            <span className="block text-[10px] font-bold text-[#5f776e] uppercase tracking-wider">Select Packaging Option</span>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIdx === idx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`w-full rounded-xl border text-left cursor-pointer transition-all flex flex-col overflow-hidden ${
                      isSelected
                        ? "border-[#157a6d] bg-[#f0f8f5] ring-1 ring-[#157a6d]"
                        : "border-[#dde8e3] hover:border-[#c3d4cc] bg-white"
                    }`}
                  >
                    <div className="p-2.5 flex justify-between items-center border-b border-[#dde8e3] w-full">
                      <span className="font-bold text-xs text-[#172b26] truncate max-w-[80%]">
                        {v.name}
                      </span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#157a6d] flex items-center justify-center shrink-0">
                          <Check size={10} className="text-white stroke-[3.5]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#c3d4cc] shrink-0" />
                      )}
                    </div>
                    <div className="p-2.5 text-left w-full">
                      <span className="font-medium text-[11px] text-[#5f776e]">
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
        <div className="text-center font-bold text-[#3f544d] uppercase tracking-wider text-[11px] py-1 bg-[#f4f8f6] rounded-md border border-[#dde8e3]">
          {packDescription}
        </div>

        {/* 4. CTA Block: Buy Now / Go to Cart & Cart Controls */}
        <div className="space-y-2.5">
          {isInCart ? (
            <>
              {/* Go To Cart ↗ */}
              <button
                onClick={handleGoToCart}
                className="pdp-btn-primary w-full h-11"
              >
                Go To Cart <span className="text-sm font-semibold">↗</span>
              </button>

              {/* Quantity selector */}
              <div className="flex items-center justify-center bg-[#f4f8f6] h-11 w-full rounded-xl p-1 gap-6 border border-[#dde8e3] animate-[fade-in_0.20s_ease-out]">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-white border border-[#c3d4cc] flex items-center justify-center text-[#172b26] hover:bg-[#f0f8f5] cursor-pointer shadow-2xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">remove</span>
                </button>
                <span className="w-8 h-8 rounded-full bg-[#157a6d] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= (product.stock || 30)}
                  className="w-8 h-8 rounded-full bg-white border border-[#c3d4cc] flex items-center justify-center text-[#172b26] hover:bg-[#f0f8f5] cursor-pointer shadow-2xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">add</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.inStock === false || product.stock === 0}
                className="pdp-btn-primary w-full h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              {/* Add to Cart Outline */}
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false || product.stock === 0}
                className="pdp-btn-secondary w-full h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add To Cart <ShoppingCart size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 6. Fulfillment / Delivery Summary Card */}
      <div className="pdp-paper-card p-3.5 rounded-xl flex items-center gap-3 w-full mt-3 text-xs text-left">
        <div className="w-9 h-9 rounded-full bg-[#f0f8f5] border border-[#c3d4cc] flex items-center justify-center shrink-0 text-[#157a6d]">
          <Calendar size={18} />
        </div>
        <div className="space-y-0.5 font-mono">
          <p className="text-[#5f776e] font-medium">
            Delivering to: <span className="text-[#172b26] font-bold">Pune, 411035</span>
            <span className="inline-block align-middle ml-1 text-[#5f776e] text-[10px]">▼</span>
          </p>
          <p className="text-[#5f776e] font-medium">
            Estimated Delivery: <span className="text-[#157a6d] font-bold">3 - 4 Business Days</span>
          </p>
        </div>
      </div>

      {/* 7. Prescription Trust Guarantees */}
      <div className="flex justify-around items-center gap-2 pt-3 text-[10px] font-bold text-[#5f776e] w-full px-1">
        <div className="flex items-center gap-1">
          <Check size={12} className="text-[#157a6d] shrink-0" />
          <span>100% Genuine</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock size={11} className="text-[#157a6d] shrink-0" />
          <span>Licensed Rx</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-[#157a6d] shrink-0" />
          <span>Cold Chain</span>
        </div>
      </div>
    </aside>
  );
};

export default PurchaseCard;
