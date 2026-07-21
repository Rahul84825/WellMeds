import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { api } from "../services/api";
import clinicalExcellenceImg from "../assets/clinical/clinical_Excellence.png";
import { 
  Trash2, ShoppingCart, Phone, Mail, ChevronRight, ChevronDown, 
  Home, Plus, Minus, ArrowRight, ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    tax,
    total,
    requiresRx,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showOffers, setShowOffers] = useState(false);

  // Auto-apply coupon from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promo = params.get("coupon");
    if (promo) {
      const code = promo.trim().toUpperCase();
      setCouponCode(code);
      if (subtotal > 0) {
        const applyPromo = async () => {
          try {
            const res = await api.validateCoupon(code, subtotal);
            if (res.success) {
              setCouponApplied(true);
              setCouponDiscount(res.discountAmount || 0);
              toast.success(res.message || "Coupon applied successfully!");
            } else {
              toast.error(res.message || "Invalid coupon code.");
            }
          } catch (err) {
            const msg = err.response?.data?.message || "Failed to validate coupon.";
            toast.error(msg);
          }
        };
        applyPromo();
      }
    }
  }, [subtotal]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success) {
        setCouponApplied(true);
        setCouponDiscount(res.discountAmount || 0);
        toast.success(res.message || "Coupon applied successfully!");
      } else {
        toast.error(res.message || "Invalid coupon code.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to validate coupon.";
      toast.error(msg);
    }
  };

  // Pricing Calculations matching Reference Image
  const originalTotal = cartItems.reduce((acc, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    return acc + (origPrice * item.quantity);
  }, 0);

  const wellMedsDiscount = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const totalSavings = wellMedsDiscount + couponDiscount;
  const finalTotal = subtotal - couponDiscount;

  const rxItemsCount = cartItems.filter(item => item.isPrescriptionRequired || item.requiresRx).length;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 animate-[fade-in_0.3s_ease-out] text-center">
        <div className="max-w-md mx-auto space-y-4 py-12">
          <div className="w-20 h-20 rounded-full bg-[#f0edfd] dark:bg-purple-950/40 text-[#3f257a] dark:text-[#a4c9ff] flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            Looks like you haven't added any medicines or health essentials to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-[#3f257a] hover:bg-[#321c62] text-white px-8 py-3 rounded-full font-bold text-sm active:scale-95 transition-all shadow-md mt-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-xs font-semibold text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 select-none">
        <Link to="/" className="hover:text-[#038076] transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-zinc-200 font-bold">Cart</span>
      </nav>

      {/* 2-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* LEFT COLUMN: Cart Items & Trust Banner */}
        <div className="w-full lg:w-[68%] space-y-6">
          
          {/* Main Cart Container Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            
            {/* Header row inside card */}
            <div className="flex items-center justify-between pb-3">
              <h2 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-zinc-100">
                {cartCount} {cartCount === 1 ? "Item" : "Items"} in your cart
              </h2>
              <Link
                to="/products"
                className="text-[#3f257a] dark:text-[#a4c9ff] font-extrabold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Add more items</span>
                <span className="w-4 h-4 rounded-full bg-[#3f257a] text-white flex items-center justify-center text-xs font-black">+</span>
              </Link>
            </div>

            {/* Sub-header for Rx item count */}
            <div className="pt-3 pb-3 border-t border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300">
              <span className="text-[#3f257a] dark:text-[#a4c9ff]">{rxItemsCount} Prescription</span> {rxItemsCount === 1 ? "Item" : "Items"} in your cart
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 pt-2">
              {cartItems.map((item) => {
                const itemId = item.id || item._id;
                const isRxItem = item.isPrescriptionRequired || item.requiresRx || false;
                const isColdChain = item.isColdChain || false;
                const discountPercent = item.originalPrice && item.originalPrice > item.price
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                const manufacturer = item.manufacturer || item.brand || "WELLMEDS";
                const packSize = item.packSize || item.productSpecifications?.packSize || "1 UNIT";
                const moleculeName = item.molecules?.[0]?.name || item.genericName || item.productSpecifications?.genericName;

                return (
                  <div key={itemId} className="py-4 first:pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                    
                    {/* Left side: Thumbnail & Product Specs */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#eef3f7] dark:bg-zinc-955 rounded-2xl p-2 relative flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-800 select-none">
                        <img
                          alt={item.name}
                          src={item.image || DEFAULT_PRODUCT_IMAGE}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PRODUCT_IMAGE;
                          }}
                          className="max-h-[90%] max-w-[90%] object-contain"
                        />
                        {discountPercent > 0 && (
                          <span className="bg-[#cbf7cf] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-400 font-bold text-[9px] px-1.5 py-0.5 rounded-md absolute bottom-1 left-1 shadow-2xs">
                            {discountPercent}% Off
                          </span>
                        )}
                      </div>

                      {/* Info Block */}
                      <div className="flex-1 min-w-0 space-y-0.5 pr-2">
                        <Link
                          to={`/products/${item.slug || item.id}`}
                          className="font-bold text-sm sm:text-base text-slate-800 dark:text-zinc-100 hover:text-[#038076] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide truncate">
                          By {manufacturer}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase truncate">
                          {packSize}
                        </p>
                        {moleculeName && (
                          <p className="text-[10px] font-bold text-[#5a6a85] dark:text-zinc-400 uppercase truncate">
                            {moleculeName}
                          </p>
                        )}

                        {/* Badges under title */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {isRxItem && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3f257a] text-white text-[9px] font-black shadow-2xs" title="Prescription Required">
                              Rx
                            </span>
                          )}
                          {isColdChain && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#009bde] text-white shadow-2xs" title="Store at 2-8°C">
                              <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Stepper, Delete, Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
                      
                      {/* Stepper Control */}
                      <div className="flex items-center bg-[#f0edfd] dark:bg-purple-950/40 border border-[#7c75f2]/30 rounded-xl px-1.5 py-1 gap-2.5 select-none">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-[#7c75f2] hover:bg-[#6860ee] text-white flex items-center justify-center font-bold text-xs shadow-2xs transition-transform active:scale-90 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs text-slate-800 dark:text-zinc-100 min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-[#7c75f2] hover:bg-[#6860ee] text-white flex items-center justify-center font-bold text-xs shadow-2xs transition-transform active:scale-90 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete Icon */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Price Display */}
                      <div className="text-right min-w-[100px] shrink-0">
                        <p className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-zinc-100">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-[11px] font-normal text-slate-400 dark:text-zinc-500 line-through">
                            MRP: ₹{(item.originalPrice * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8000+ Products Trust Banner Card */}
          <div className="bg-gradient-to-r from-[#e8f1fc] via-[#e6f4fc] to-[#eef2ff] dark:from-zinc-900 dark:to-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden select-none">
            <img
              src={clinicalExcellenceImg}
              alt="Clinical Excellence Doctors"
              className="w-48 sm:w-56 object-contain shrink-0"
            />
            <div className="flex-1 space-y-1 text-center md:text-left">
              <h3 className="font-extrabold text-xl sm:text-2xl text-[#3f257a] dark:text-[#a4c9ff]">
                8000+ Products
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed max-w-sm">
                We've got your back with top-notch quality! Every product is carefully checked so you get only the best!
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-[#3f257a] dark:text-[#a4c9ff]">
                <ShieldCheck size={16} />
                <span className="text-[11px] font-bold">100% Genuine Clinical Supplies</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Checkout */}
        <div className="w-full lg:w-[32%] space-y-4 shrink-0">
          
          {/* Checkout Steps bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full py-3 px-6 shadow-xs flex items-center justify-between select-none">
            <div className="w-8 h-8 rounded-full bg-[#3f257a] text-white flex items-center justify-center shadow-2xs">
              <ShoppingCart size={15} />
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-zinc-800 mx-2" />
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 font-bold text-xs flex items-center justify-center">
              Rx
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-zinc-800 mx-2" />
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
            </div>
          </div>

          {/* Need Support Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full py-2.5 px-5 shadow-xs flex items-center justify-between select-none">
            <span className="font-bold text-slate-700 dark:text-zinc-200 text-xs sm:text-sm">Need Support?</span>
            <div className="flex items-center gap-2">
              <a 
                href="tel:+919876543210" 
                className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#3f257a] dark:text-[#a4c9ff] flex items-center justify-center hover:bg-purple-100 transition-colors shadow-2xs"
                title="Call Support"
              >
                <Phone size={14} />
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-2xs"
                title="WhatsApp Support"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>
              <a 
                href="mailto:support@wellmeds.com" 
                className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center hover:bg-sky-100 transition-colors shadow-2xs"
                title="Email Support"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3 text-left relative overflow-hidden select-none">
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span>Total MRP</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {formatCurrency(originalTotal)}
                </span>
              </div>

              {wellMedsDiscount > 0 && (
                <div className="flex justify-between items-center text-[#15803d] dark:text-emerald-400 font-bold">
                  <span>WellMeds Discount</span>
                  <span>-{formatCurrency(wellMedsDiscount)}</span>
                </div>
              )}

              {couponApplied && (
                <div className="flex justify-between items-center text-[#15803d] dark:text-emerald-400 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span>Cart Total</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2.5 flex justify-between items-center text-sm font-extrabold text-slate-800 dark:text-zinc-100">
                <span>Order Total</span>
                <span className="text-[#3f257a] dark:text-[#a4c9ff] text-base sm:text-lg">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Total Savings Pill Card */}
            {totalSavings > 0 && (
              <div className="bg-[#e6f9ed] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-full p-2.5 px-3.5 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-[11px] shadow-2xs">
                    ₹
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#15803d] dark:text-emerald-400">
                    {formatCurrency(totalSavings)} Saved
                  </span>
                </div>
                <ChevronDown size={16} className="text-[#15803d] dark:text-emerald-400" />
              </div>
            )}
          </div>

          {/* Offers Available Accordion Container */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-all">
            <button
              type="button"
              onClick={() => setShowOffers(!showOffers)}
              className="w-full p-3 px-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors select-none text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#22c55e] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  ₹
                </div>
                <span className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Offers available</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ChevronRight size={16} className={`transition-transform duration-200 ${showOffers ? "rotate-90" : ""}`} />
              </div>
            </button>

            {showOffers && (
              <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 animate-[fade-in_0.2s_ease-out]">
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="flex-grow p-2.5 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-100 uppercase placeholder:normal-case"
                  />
                  <button
                    type="submit"
                    disabled={couponApplied || !couponCode.trim()}
                    className="bg-[#3f257a] hover:bg-[#321c62] text-white px-4 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer select-none"
                  >
                    Apply
                  </button>
                </form>
                {couponApplied && (
                  <div className="mt-2.5 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                    <span>Coupon {couponCode} Applied (-{formatCurrency(couponDiscount)})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponApplied(false);
                        setCouponDiscount(0);
                        setCouponCode("");
                      }}
                      className="text-rose-600 font-bold hover:underline cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Address / Proceed to Checkout Button */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openLoginModal("/checkout");
              } else {
                navigate("/checkout");
              }
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#3f257a] hover:bg-[#321c62] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer select-none"
          >
            <span>{user ? "Proceed to Checkout" : "Add Address"}</span>
            <Home size={18} />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Cart;
