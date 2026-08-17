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
    <aside className="w-full max-w-[380px] mx-auto text-xs select-none lg:sticky lg:top-24 font-sans text-black">
      {/* Main Prescription Purchase Card */}
      <div className="pdp-paper-card p-5 space-y-4 text-left">
        {/* 1. Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="pdp-serif-title text-3xl font-bold text-[#157a6d] leading-none font-sans">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-black line-through text-xs font-bold">
                MRP {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[11px] font-sans font-bold">
            <span className="text-black">Inclusive of all taxes & GST</span>
            {discountPercent > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#bbf7d0] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-300 px-3 py-1 text-xs font-bold font-sans shadow-2xs">
                {discountPercent}% Off
              </span>
            )}
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="pdp-dashed-line my-1 w-full" />

        {/* 2. Choose Pack Size (Variants Selector) */}
        {variants.length > 0 && (
          <div className="space-y-2 text-left">
            <span className="block text-[10px] font-bold text-black uppercase tracking-wider font-sans">Select Packaging Option</span>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIdx === idx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`w-full rounded-sm border text-left cursor-pointer transition-all flex flex-col overflow-hidden ${
                      isSelected
                        ? "border-[#157a6d] bg-[#f4f9f7] ring-1 ring-[#157a6d]"
                        : "border-[#dde8e3] hover:border-[#c3d4cc] bg-white"
                    }`}
                  >
                    <div className="p-2.5 flex justify-between items-center border-b border-[#dde8e3] w-full">
                      <span className="font-bold text-xs text-black truncate max-w-[80%] font-sans">
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
                      <span className="font-bold text-[11px] text-black font-sans">
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
        <div className="text-center font-bold text-black uppercase tracking-wider text-[11px] py-1 bg-[#f4f9f7] rounded-sm border border-[#dde8e3] font-sans">
          {packDescription}
        </div>

        {/* 4. CTA Block: Buy Now / Go to Cart & Cart Controls */}
        <div className="space-y-2.5">
          {isInCart ? (
            <>
              {/* Go To Cart ↗ */}
              <button
                onClick={handleGoToCart}
                className="pdp-btn-primary w-full h-11 text-xs tracking-widest font-bold uppercase rounded-sm"
              >
                Go To Cart <span className="text-sm font-semibold">↗</span>
              </button>

              {/* Quantity selector */}
              <div className="flex items-center justify-center bg-[#f4f9f7] h-11 w-full rounded-sm p-1 gap-6 border border-[#dde8e3] animate-[fade-in_0.20s_ease-out]">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity - 1)}
                  className="w-8 h-8 rounded-sm bg-white border border-[#c3d4cc] flex items-center justify-center text-black hover:border-[#157a6d] cursor-pointer shadow-2xs transition-colors font-bold font-sans"
                >
                  -
                </button>
                <span className="w-8 h-8 rounded-sm bg-[#157a6d] text-white flex items-center justify-center font-bold text-xs shadow-2xs font-sans">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= (product.stock || 30)}
                  className="w-8 h-8 rounded-sm bg-white border border-[#c3d4cc] flex items-center justify-center text-black hover:border-[#157a6d] cursor-pointer shadow-2xs transition-colors font-bold font-sans"
                >
                  +
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

        {/* 5. Trust Badges Footer */}
        <div className="pt-2 space-y-2 text-left font-sans text-xs text-black font-bold border-t border-dashed border-[#c3d4cc]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#157a6d] shrink-0" />
            <span>100% Genuine Pharmacy Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[#157a6d] shrink-0" />
            <span>Encrypted Checkout & Secure Payment</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PurchaseCard;
