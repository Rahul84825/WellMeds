import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionUpload from "../components/PrescriptionUpload";
import Modal from "../components/Modal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { UploadCloud, CheckCircle2, ClipboardList, Stethoscope } from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { toast } from "sonner";

const Checkout = () => {
  const { cartItems, subtotal, shipping, tax, total, requiresRx, clearCart } = useCart();
  const { user, loading: authLoading, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  // Rx prescription uploads
  const [rxAttached, setRxAttached] = useState(false);
  const [rxFileName, setRxFileName] = useState("");
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [rxInfoModalOpen, setRxInfoModalOpen] = useState(false);
  const [rxSuccessModalOpen, setRxSuccessModalOpen] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); 
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available coupons on checkout page load
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const couponsList = await api.getCoupons();
        setAvailableCoupons(couponsList);
      } catch (err) {
        console.error("Failed to load checkout coupons", err);
      }
    };
    fetchAvailableCoupons();
  }, []);

  // Derived totals with coupon
  const discountAmount = couponDiscount;
  const activeShipping = couponApplied?.freeDelivery ? 0 : shipping;
  const finalTotal = Math.max(0, subtotal - discountAmount + activeShipping + tax);

  // Checks if all prescription products have Rx attached
  const rxAttachedCheck = !requiresRx || rxAttached || cartItems.every((i) => !i.requiresRx || i.rxUploaded);

  // Check prescription approval status for prescription-required items
  const [loadingRxCheck, setLoadingRxCheck] = useState(requiresRx);
  const [hasApprovedRx, setHasApprovedRx] = useState(false);

  useEffect(() => {
    const checkRxStatus = async () => {
      if (requiresRx && user) {
        try {
          const data = await api.getMyPrescriptions();
          const approved = data.some((rx) => rx.status === "Approved");
          setHasApprovedRx(approved);
        } catch (err) {
          console.error("Failed to check prescription status", err);
        } finally {
          setLoadingRxCheck(false);
        }
      } else {
        setLoadingRxCheck(false);
      }
    };
    checkRxStatus();
  }, [requiresRx, user]);

  // ─────────────────────────────────────────────────────
  // Coupon application
  // ─────────────────────────────────────────────────────
  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const code = codeToApply.trim();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await api.validateCoupon(code, subtotal);
      if (result.success) {
        setCouponApplied(result.coupon);
        setCouponDiscount(result.discountAmount || 0);
        setCouponError("");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid or expired coupon code.";
      setCouponError(msg);
      setCouponApplied(null);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
    setCouponDiscount(0);
  };

  // Auto-apply coupon from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promo = params.get("coupon");
    if (promo) {
      const code = promo.trim().toUpperCase();
      setCouponCode(code);
      if (subtotal > 0) {
        handleApplyCoupon(code);
      }
    }
  }, [subtotal]);

  // ─────────────────────────────────────────────────────
  // Order placement
  // ─────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address || !city || !state || !pincode || !fullName || !email) {
      toast.warning("Please fill in all shipping details.");
      return;
    }

    if (requiresRx) {
      if (loadingRxCheck) {
        toast.info("Verifying prescription status, please wait...");
        return;
      }
      if (!hasApprovedRx && !rxAttachedCheck) {
        setRxInfoModalOpen(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id || item.id,   // MongoDB ObjectId for stock deduction
        id: item._id || item.id,         // fallback
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        customer: fullName,
        email,
        items: orderItems,
        subtotal,
        shipping: activeShipping,
        tax,
        total: finalTotal,
        discount: discountAmount,
        couponCode: couponApplied?.code || null,
        requiresRx,
        rxUploaded: requiresRx ? rxAttachedCheck : false,
        rxFile: rxFileName || cartItems.find((i) => i.rxFile)?.rxFile || null,
        shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
        paymentMethod,
      };

      const completedOrder = await api.placeOrder(orderData);

      // Clear cart
      clearCart();

      // Redirect to success
      navigate("/order-success", { state: { order: completedOrder } });
    } catch (err) {
      console.error("Failed to place order", err);
      const msg = err?.response?.data?.message || "Something went wrong placing your order. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRxSuccess = (data) => {
    setRxFileName(data.fileName);
    setRxAttached(true);
    setRxModalOpen(false);
    setRxSuccessModalOpen(true);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No items to checkout</h2>
        <Link to="/products" className="text-primary hover:underline mt-md inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Guest Auth Gate ─────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="min-h-[60vh] bg-surface relative flex items-center justify-center backdrop-blur-md">
        <LoginRequiredModal
          isOpen={true}
          onClose={() => navigate("/cart")}
          fromPath="/checkout"
        />
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="mb-xl">
        <Link
          to="/cart"
          className="text-body-sm text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Cart</span>
        </Link>
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-xl items-start">
        {/* Left: Shipping and Payment Form */}
        <form onSubmit={handlePlaceOrder} className="flex-1 w-full space-y-md">
          {/* Shipping Address */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Shipping Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="City"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">State</label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="">Select State</option>
                  {[
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
                    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
                    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
                    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                    "Uttar Pradesh", "Uttarakhand", "West Bengal",
                    "Delhi", "Chandigarh", "Puducherry"
                  ].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="6-digit Pincode"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          {/* Rx Prescription Upload Section */}
          {requiresRx && (
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
              <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
                Prescription Verification
              </h3>

              {loadingRxCheck ? (
                <div className="py-md flex justify-center"><Loader size="sm" /></div>
              ) : !hasApprovedRx ? (
                <div className="bg-error-container/20 border-2 border-error/30 rounded-xl p-md space-y-sm text-error text-left">
                  <div className="flex items-start gap-xs">
                    <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Prescription Approval Required</h4>
                      <p className="text-xs mt-1 text-on-surface-variant leading-relaxed">
                        You do not have an approved prescription on file. Regulation requires a verified prescription to complete checkout.
                      </p>
                    </div>
                  </div>
                  <div className="pt-sm border-t border-error/10 flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
                    <p className="text-[10px] text-on-surface-variant leading-tight">
                      Please upload a prescription sheet and await review (takes 5-10 minutes).
                    </p>
                    <Link
                      to="/upload-prescription"
                      className="bg-[#004782] text-white px-sm py-1.5 rounded-lg text-xs font-bold text-center hover:opacity-90 active:scale-95 transition-all inline-block shrink-0"
                    >
                      Upload Prescription
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Regulated items require prescription upload to verify and dispense this order.
                  </p>

                  {rxAttachedCheck ? (
                    <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-md flex items-center justify-between text-secondary">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                        <div>
                          <h4 className="font-label-sm text-label-sm font-bold">Prescription Document Attached</h4>
                          <p className="text-[12px] text-on-surface-variant leading-none mt-0.5">
                            {rxFileName || cartItems.find((i) => i.rxFile)?.rxFile || "Attached from Cart"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setRxAttached(false); setRxFileName(""); }}
                        className="text-error font-bold text-sm hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRxModalOpen(true)}
                      className="w-full py-md border-2 border-dashed border-outline-variant hover:border-primary rounded-xl flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-3xl mb-xs">cloud_upload</span>
                      <span className="font-label-md text-sm font-bold">Attach Prescription Document</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Payment Method
            </h3>

            <div className="flex flex-col sm:flex-row gap-md">
              <label
                className={`flex-1 p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary-container/10 font-bold"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-sm text-on-surface text-sm">UPI (PhonePe / GPay / Paytm)</span>
                </div>
                <span className="material-symbols-outlined text-outline">account_balance_wallet</span>
              </label>

              <label
                className={`flex-1 p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary-container/10 font-bold"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-sm text-on-surface text-sm">Debit / Credit Card</span>
                </div>
                <span className="material-symbols-outlined text-outline">credit_card</span>
              </label>

              <label
                className={`flex-1 p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary-container/10 font-bold"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-sm text-on-surface text-sm">Cash on Delivery</span>
                </div>
                <span className="material-symbols-outlined text-outline">local_shipping</span>
              </label>
            </div>

            {/* Card Input Details */}
            {paymentMethod === "card" && (
              <div className="space-y-sm bg-surface-container-low/50 p-md rounded-xl border border-outline-variant/50 animate-[slide-down_0.2s_ease-out]">
                <div className="space-y-xs">
                  <label className="block text-label-sm font-semibold text-on-surface">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm focus:ring-1 focus:ring-primary text-sm"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-label-sm font-semibold text-on-surface">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm focus:ring-1 focus:ring-primary text-sm"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-label-sm font-semibold text-on-surface">CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm focus:ring-1 focus:ring-primary text-sm"
                      placeholder="***"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Right: Order Summary Preview */}
        <div className="w-full lg:w-[380px] space-y-md">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-md text-left">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Order Review
            </h3>

            <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-outline-variant/40 pr-2">
              {cartItems.map((item) => (
                <div
                  key={(item._id || item.id)?.toString()}
                  className="py-sm flex items-center justify-between gap-sm text-body-sm text-on-surface-variant dark:text-surface-variant"
                >
                  <div className="truncate pr-sm">
                    <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-on-surface">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-outline-variant dark:border-outline/40 pt-md space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-on-surface font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {/* Coupon discount row */}
              {couponApplied && discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-red-500 font-semibold animate-[fade-in_0.2s_ease-out]">
                    <span>Discount ({couponApplied.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface font-bold text-xs border-b border-dashed border-outline-variant/30 pb-xs">
                    <span>Updated Total</span>
                    <span>{formatCurrency(Math.max(0, subtotal - discountAmount))}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span>Shipping {subtotal >= 499 && subtotal > 0 ? "(Free above ₹499)" : ""}</span>
                <span className="text-on-surface font-semibold">
                  {activeShipping === 0 ? "FREE" : formatCurrency(activeShipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span className="text-on-surface font-semibold">{formatCurrency(tax)}</span>
              </div>

              <div className="flex justify-between border-t border-outline-variant dark:border-outline/40 pt-md font-bold text-headline-sm text-on-surface">
                <span>Final Total</span>
                <span className="text-primary dark:text-primary-fixed-dim">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="border-t border-outline-variant/60 pt-md space-y-sm">
              <p className="font-label-sm text-label-sm font-semibold text-on-surface">Apply Coupon</p>
              {couponApplied ? (
                <div className="flex items-center justify-between bg-[#086b53]/10 border border-[#086b53]/20 rounded-xl px-md py-sm animate-[fade-in_0.2s_ease-out]">
                  <div className="flex items-center gap-xs text-[#086b53] dark:text-[#84d6b9]">
                    <span className="material-symbols-outlined text-[18px]">local_offer</span>
                    <span className="font-bold font-mono text-sm">{couponApplied.code}</span>
                    <span className="text-xs">
                      (
                      {couponApplied.discountType === "percentage"
                        ? `${couponApplied.discountValue || couponApplied.discountAmount}% off`
                        : `₹${couponApplied.discountValue || couponApplied.discountAmount} off`}
                      )
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-error text-xs font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-sm">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon(couponCode))}
                    placeholder="Enter coupon code"
                    className="flex-1 p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-md py-sm bg-primary text-white rounded-lg font-label-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all text-sm cursor-pointer select-none"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-error text-xs font-medium">{couponError}</p>
              )}

              {/* Available Coupons list */}
              {!couponApplied && availableCoupons.length > 0 && (
                <div className="mt-md space-y-xs pt-xs border-t border-outline-variant/30 dark:border-outline/10">
                  <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Available Coupons</p>
                  <div className="space-y-sm max-h-[180px] overflow-y-auto pr-xs custom-scrollbar">
                    {availableCoupons.map((coupon) => (
                      <div 
                        key={coupon.id} 
                        className="bg-surface-container-low border border-outline-variant/40 dark:border-outline/15 rounded-xl p-sm flex items-center justify-between text-left relative overflow-hidden"
                      >
                        <div>
                          <span className="inline-block bg-[#004782]/10 text-[#004782] dark:text-primary-fixed-dim font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-[#004782]/20 mb-xs">
                            {coupon.code}
                          </span>
                          <p className="font-bold text-xs text-on-surface leading-tight">
                            {coupon.discountType === "percentage" 
                              ? `${coupon.discountValue || coupon.discountAmount}% OFF` 
                              : `₹${coupon.discountValue || coupon.discountAmount} OFF`}
                          </p>
                          <div className="flex gap-md text-[10px] text-on-surface-variant/80 dark:text-surface-variant/80 mt-xs">
                            <span>Min order: ₹{coupon.minimumOrder || coupon.minOrderValue}</span>
                            <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCode(coupon.code);
                            handleApplyCoupon(coupon.code);
                          }}
                          className="bg-secondary-container/20 text-[#086b53] dark:text-[#84d6b9] hover:bg-secondary hover:text-white px-md py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-secondary text-white font-bold py-md rounded-lg hover:bg-on-secondary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader size="sm" color="white" />
                  Processing Order...
                </>
              ) : (
                "Place Secure Order"
              )}
            </button>

            <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>

      {/* Prescription Info Modal */}
      <Modal
        isOpen={rxInfoModalOpen}
        onClose={() => setRxInfoModalOpen(false)}
        title="Prescription Required"
        maxWidth="max-w-md"
        showCloseButton={true}
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4 select-none">
          {/* Illustration / Icon */}
          <div className="w-16 h-16 rounded-full bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center animate-pulse">
            <ClipboardList className="w-8 h-8" />
          </div>

          <p className="font-body-md text-sm leading-relaxed text-slate-500 dark:text-zinc-400 px-2">
            One or more products in your cart require a valid doctor's prescription before they can be dispatched.
          </p>

          {/* 3 Steps */}
          <div className="w-full space-y-4 my-6 text-left border-y border-slate-100 dark:border-zinc-800/80 py-4">
            {/* Step 1 */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0 border border-teal-100/30">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-150">Step 1</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Upload your doctor's prescription.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff] flex items-center justify-center shrink-0 border border-blue-100/10">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-150">Step 2</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Our licensed pharmacist verifies your prescription.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0 border border-emerald-100/10">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-150">Step 3</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">After approval, your order proceeds for payment and dispatch.</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => {
              setRxInfoModalOpen(false);
              setRxModalOpen(true);
            }}
            className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-2.5 px-4 rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
          >
            I Understand
          </button>
        </div>
      </Modal>

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-md mb-lg text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You must provide a signed doctor's prescription for the items in your order.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleRxSuccess}
          onClose={() => setRxModalOpen(false)}
        />
      </Modal>

      {/* Prescription Success Modal */}
      <Modal
        isOpen={rxSuccessModalOpen}
        onClose={() => setRxSuccessModalOpen(false)}
        title="Prescription Uploaded Successfully"
        maxWidth="max-w-md"
        showCloseButton={true}
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4 select-none">
          {/* Success Checkmark Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="font-body-md text-sm leading-relaxed text-slate-500 dark:text-zinc-400 px-2">
            Our pharmacist will review your prescription shortly. Verification usually takes only a few minutes during business hours. We will notify you once your prescription has been approved.
          </p>

          <button
            onClick={() => {
              setRxSuccessModalOpen(false);
              handlePlaceOrder();
            }}
            className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-2.5 px-4 rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutAuthGate
// Self-contained inline OTP flow shown when a guest navigates to /checkout.
// Never redirects — after verification AuthContext updates and the full
// checkout form renders automatically (component re-evaluates `user`).
// Cart is never touched.
// ─────────────────────────────────────────────────────────────────────────────
const OTP_LEN = 6;
const RESEND_CD = 60;

const sanitiseMsg = (err) => {
  const raw = (err?.response?.data?.message || err?.message || "").toLowerCase();
  if (!raw) return "Something went wrong. Please try again.";
  if (/too many|rate limit/i.test(raw)) return err?.response?.data?.message || "Too many OTP requests. Please wait before trying again.";
  if (/expired/i.test(raw)) return "OTP has expired. Please request a new one.";
  if (/incorrect|wrong|invalid.*otp/i.test(raw)) {
    const rem = err?.response?.data?.remainingAttempts;
    return rem !== undefined ? `Incorrect OTP. ${rem} attempt${rem !== 1 ? "s" : ""} remaining.` : "Incorrect OTP. Please try again.";
  }
  if (/maximum.*attempt|too many.*attempt/i.test(raw)) return "Too many incorrect attempts. Please request a new OTP.";
  if (/valid.*mobile|valid.*number/i.test(raw)) return "Please enter a valid 10-digit mobile number.";
  if (/network error/i.test(err?.message)) return "Unable to connect. Check your internet connection.";
  const safe = err?.response?.data?.message || "";
  return safe && safe.length < 120 ? safe : "Something went wrong. Please try again.";
};

const CheckoutAuthGate = ({ sendOtp, verifyOtp }) => {
  const [step, setStep] = useState("mobile"); // mobile | details | otp
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);

  const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(""));
  const otpRefs = useRef([]);
  const lastVerifiedOtpRef = useRef("");

  // 60s resend countdown
  const [resendCount, setResendCount] = useState(0);
  const resendTimer = useRef(null);
  const startResend = () => {
    setResendCount(RESEND_CD);
    clearInterval(resendTimer.current);
    resendTimer.current = setInterval(() => {
      setResendCount((p) => { if (p <= 1) { clearInterval(resendTimer.current); return 0; } return p - 1; });
    }, 1000);
  };
  useEffect(() => () => clearInterval(resendTimer.current), []);

  // 5m OTP expiry countdown
  const [expiryCount, setExpiryCount] = useState(0);
  const expiryTimer = useRef(null);
  const startExpiry = () => {
    setExpiryCount(5 * 60);
    clearInterval(expiryTimer.current);
    expiryTimer.current = setInterval(() => {
      setExpiryCount((p) => { if (p <= 1) { clearInterval(expiryTimer.current); return 0; } return p - 1; });
    }, 1000);
  };
  useEffect(() => () => clearInterval(expiryTimer.current), []);

  // Handle client-side OTP expiration
  useEffect(() => {
    if (step === "otp" && expiryCount === 0) {
      setOtpDigits(Array(OTP_LEN).fill(""));
      lastVerifiedOtpRef.current = "";
      setError("OTP has expired. Please request a new OTP.");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [expiryCount, step]);

  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("");
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  const doSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!isExistingUser && !name.trim()) { setError("Please enter your full name."); return; }
    setBusy(true);
    try {
      const r = await sendOtp(mobile.trim(), name.trim(), email.trim());
      setIsExistingUser(!!r.isExistingUser);
      if (r.devOtp) setDevHint(r.devOtp);
      setOtpDigits(Array(OTP_LEN).fill(""));
      lastVerifiedOtpRef.current = "";
      setStep("otp");
      startResend();
      startExpiry();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) { setError(sanitiseMsg(err)); }
    finally { setBusy(false); }
  };

  const doVerify = useCallback(async (override) => {
    if (verifying) return;

    const val = override || otpDigits.join("");
    if (val.length < OTP_LEN) { setError(`Please enter all ${OTP_LEN} digits.`); return; }

    // Auto verification only happens once until OTP changes
    if (val === lastVerifiedOtpRef.current) return;
    lastVerifiedOtpRef.current = val;

    console.log("[VERIFY] Started");
    setVerifying(true); setError("");
    try {
      const u = await verifyOtp(mobile.trim(), val, name.trim(), email.trim());
      console.log("[VERIFY] Success");
      setWelcomeName(u?.name || "there");
      setWelcomeDone(true);
      // AuthContext now has user — parent component will re-render and show full checkout
    } catch (err) {
      console.log("[VERIFY] Failed");
      setError(sanitiseMsg(err));
      setOtpDigits(Array(OTP_LEN).fill(""));
      lastVerifiedOtpRef.current = "";
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally { setVerifying(false); }
  }, [otpDigits, mobile, name, email, verifyOtp, verifying]);

  const doResend = async () => {
    if (resendCount > 0) return;
    setError(""); setDevHint(""); setOtpDigits(Array(OTP_LEN).fill(""));
    lastVerifiedOtpRef.current = "";
    setBusy(true);
    try {
      const r = await sendOtp(mobile.trim(), name.trim(), email.trim());
      if (r.devOtp) setDevHint(r.devOtp);
      startResend();
      startExpiry();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) { setError(sanitiseMsg(err)); }
    finally { setBusy(false); }
  };

  const oChange = (i, v) => {
    lastVerifiedOtpRef.current = "";
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[i] = d; setOtpDigits(next); setError("");
    if (d && i < OTP_LEN - 1) otpRefs.current[i + 1]?.focus();
    if (d && i === OTP_LEN - 1) {
      const full = [...next.slice(0, OTP_LEN - 1), d].join("");
      if (full.length === OTP_LEN && !verifying) doVerify(full);
    }
  };

  const oKey = (i, e) => {
    if (e.key === "Backspace") {
      lastVerifiedOtpRef.current = "";
      if (otpDigits[i]) { const n = [...otpDigits]; n[i] = ""; setOtpDigits(n); }
      else if (i > 0) otpRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < OTP_LEN - 1) otpRefs.current[i + 1]?.focus();
  };

  const oPaste = (e) => {
    e.preventDefault();
    lastVerifiedOtpRef.current = "";
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!p) return;
    const next = Array(OTP_LEN).fill("");
    for (let i = 0; i < OTP_LEN; i++) next[i] = p[i] || "";
    setOtpDigits(next);
    otpRefs.current[Math.min(p.length, OTP_LEN - 1)]?.focus();
    if (p.length === OTP_LEN) doVerify(p);
  };

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl text-left">
      <div className="mb-xl">
        <Link to="/cart" className="text-body-sm text-primary hover:underline flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Cart
        </Link>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">Checkout</h1>

      <div className="max-w-md mx-auto">
        {/* Welcome flash */}
        {welcomeDone ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-lg text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-md mx-auto">
              <span className="material-symbols-outlined text-[40px]">waving_hand</span>
            </div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-xs">Welcome, {welcomeName.split(" ")[0]}! 👋</h2>
            <p className="text-body-sm text-on-surface-variant mb-md">Loading your checkout…</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 border-b border-outline-variant px-lg py-md flex items-center gap-md">
              <div className="p-xs rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <div>
                <h2 className="font-semibold text-on-surface text-body-md">Authentication Required</h2>
                <p className="text-body-xs text-on-surface-variant">Continue with your mobile number to complete your order.</p>
              </div>
            </div>

            <div className="p-lg space-y-md">
              {/* Cart preview pill */}
              <div className="flex items-center gap-xs text-body-xs text-on-surface-variant bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50">
                <span className="material-symbols-outlined text-[16px] text-primary">shopping_bag</span>
                <span>Your cart is saved and will not be cleared.</span>
              </div>

              {error && (
                <div role="alert" className="bg-error-container/20 border border-error/30 text-error p-sm rounded-lg text-body-sm flex items-start gap-xs animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[16px] mt-[1px] flex-shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}
              {devHint && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-sm rounded-lg text-body-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">bug_report</span>
                  <span>Dev OTP: <strong className="font-mono tracking-[0.2em]">{devHint}</strong></span>
                </div>
              )}

              {/* STEP: Mobile */}
              {step === "mobile" && (
                <form onSubmit={(e) => {
                  e.preventDefault(); setError("");
                  const c = mobile.trim().replace(/\D/g, "");
                  if (!/^[6-9]\d{9}$/.test(c)) { setError("Please enter a valid 10-digit mobile number starting with 6–9."); return; }
                  setStep("details");
                }} className="space-y-md" noValidate>
                  <div className="space-y-xs">
                    <label htmlFor="gate-mobile" className="block text-sm font-semibold text-on-surface">Mobile Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 flex items-center pl-md h-full pointer-events-none">
                        <span className="text-on-surface-variant font-mono text-sm">+91</span>
                        <div className="ml-sm w-px h-5 bg-outline-variant" />
                      </div>
                      <input id="gate-mobile" type="tel" inputMode="numeric" maxLength={10} autoFocus autoComplete="tel-national"
                        value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                        placeholder="9XXXXXXXXX" aria-label="10-digit mobile number"
                        className="w-full pl-[72px] pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-widest font-mono"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={mobile.length < 10} className="w-full py-sm rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-sm font-bold shadow hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-xs">
                    <span>Continue</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              )}

              {/* STEP: Details */}
              {step === "details" && (
                <form onSubmit={doSendOtp} className="space-y-md" noValidate>
                  <div className="flex items-center gap-xs text-sm text-on-surface-variant bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50">
                    <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
                    <span className="font-mono tracking-wider">+91 {mobile}</span>
                    <button type="button" onClick={() => { setStep("mobile"); setError(""); }} className="ml-auto text-primary text-xs font-bold hover:underline">Change</button>
                  </div>
                  <div className="space-y-xs">
                    <label htmlFor="gate-name" className="block text-sm font-semibold text-on-surface">Full Name <span className="text-error">*</span></label>
                    <input id="gate-name" type="text" autoFocus required autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Your full name"
                      className="w-full px-md py-sm bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div className="space-y-xs">
                    <label htmlFor="gate-email" className="block text-sm font-semibold text-on-surface">Email <span className="text-xs font-normal text-on-surface-variant">(optional)</span></label>
                    <input id="gate-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com"
                      className="w-full px-md py-sm bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <button type="submit" disabled={busy} className="w-full py-sm rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-primary text-sm font-bold shadow hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-xs">
                    {busy ? <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /><span>Sending OTP…</span></> : <><span className="material-symbols-outlined text-[18px]">sms</span><span>Send OTP</span></>}
                  </button>
                </form>
              )}

              {/* STEP: OTP */}
              {step === "otp" && (
                <div className="space-y-md">
                  <div className="flex items-center gap-xs text-sm text-on-surface-variant bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50">
                    <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
                    <span className="font-mono tracking-wider">+91 {mobile}</span>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-on-surface mb-sm text-center block">Enter the {OTP_LEN}-digit code</legend>
                    <div className="flex gap-xs justify-center" onPaste={oPaste} role="group" aria-label="OTP entry">
                      {otpDigits.map((d, i) => (
                        <input key={i} id={`gate-otp-${i + 1}`} ref={(el) => (otpRefs.current[i] = el)}
                          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={d}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          aria-label={`OTP digit ${i + 1} of ${OTP_LEN}`}
                          onChange={(e) => oChange(i, e.target.value)} onKeyDown={(e) => oKey(i, e)} disabled={verifying}
                          className={`w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border-2 bg-surface-container text-on-surface transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${d ? "border-primary bg-primary/5 focus:ring-primary/30" : "border-outline-variant focus:border-primary focus:ring-primary/20"}`}
                        />
                      ))}
                    </div>
                  </fieldset>

                  {!verifying && (
                    <button type="button" onClick={() => doVerify()} disabled={otpDigits.join("").length < OTP_LEN}
                      className="w-full py-sm rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-sm font-bold shadow hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">verified</span><span>Verify & Continue</span>
                    </button>
                  )}
                  {verifying && (
                    <div className="flex items-center justify-center gap-sm py-xs" role="status">
                      <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm text-on-surface-variant">Verifying…</span>
                    </div>
                  )}

                  <div className="text-center space-y-xs">
                    {resendCount > 0
                      ? <p className="text-xs text-on-surface-variant">Resend OTP in <strong className="font-mono">{`0:${resendCount.toString().padStart(2, "0")}`}</strong></p>
                      : <button type="button" onClick={doResend} disabled={busy} className="text-primary text-xs font-bold hover:underline disabled:opacity-50 flex items-center gap-xs mx-auto">
                          <span className="material-symbols-outlined text-[14px]">refresh</span>{busy ? "Sending…" : "Resend OTP"}
                        </button>
                    }
                    
                    {expiryCount > 0 && (
                      <p className="text-body-xs text-on-surface-variant/60" aria-live="off">
                        OTP valid for <span className="font-mono">{`${Math.floor(expiryCount / 60)}:${(expiryCount % 60).toString().padStart(2, "0")}`}</span>
                      </p>
                    )}

                    <button type="button" onClick={() => { setStep("details"); setError(""); }} className="text-xs text-on-surface-variant hover:underline">← Change details</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

