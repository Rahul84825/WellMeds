import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionUpload from "../components/PrescriptionUpload";
import Modal from "../components/Modal";

const Checkout = () => {
  const { cartItems, subtotal, shipping, tax, total, requiresRx, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  // Rx prescription uploads
  const [rxAttached, setRxAttached] = useState(false);
  const [rxFileName, setRxFileName] = useState("");
  const [rxModalOpen, setRxModalOpen] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // { code, discountType, discountAmount }
  const [couponLoading, setCouponLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived totals with coupon
  const discountAmount =
    couponApplied
      ? couponApplied.discountType === "percentage"
        ? (subtotal * couponApplied.discountAmount) / 100
        : couponApplied.discountAmount
      : 0;
  const finalTotal = Math.max(0, total - discountAmount);

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
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await api.applyCoupon(couponCode.trim(), subtotal);
      if (result.success) {
        setCouponApplied(result.coupon);
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

  // ─────────────────────────────────────────────────────
  // Order placement
  // ─────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address || !city || !state || !zip || !fullName || !email) {
      alert("Please fill in all shipping details.");
      return;
    }

    if (requiresRx) {
      if (loadingRxCheck) {
        alert("Verifying prescription status, please wait...");
        return;
      }
      if (!hasApprovedRx) {
        alert("Prescription Approval Required");
        return;
      }
    }

    if (requiresRx && !rxAttachedCheck) {
      setRxModalOpen(true);
      return;
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
        shipping,
        tax,
        total: finalTotal,
        discount: discountAmount,
        couponCode: couponApplied?.code || null,
        requiresRx,
        rxUploaded: requiresRx ? rxAttachedCheck : false,
        rxFile: rxFileName || cartItems.find((i) => i.rxFile)?.rxFile || null,
        shippingAddress: `${address}, ${city}, ${state} ${zip}`,
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
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRxSuccess = (data) => {
    setRxFileName(data.fileName);
    setRxAttached(true);
    setRxModalOpen(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-max-width mx-auto px-margin-desktop py-xxl text-center">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No items to checkout</h2>
        <Link to="/products" className="text-primary hover:underline mt-md inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
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
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="State"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="ZIP"
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
                  paymentMethod === "credit-card"
                    ? "border-primary bg-primary-container/10 font-bold"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === "credit-card"}
                    onChange={() => setPaymentMethod("credit-card")}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-sm text-on-surface text-sm">Credit / Debit Card</span>
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

            {/* Credit Card Input Forms */}
            {paymentMethod === "credit-card" && (
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
                  key={item.id}
                  className="py-sm flex items-center justify-between gap-sm text-body-sm text-on-surface-variant dark:text-surface-variant"
                >
                  <div className="truncate pr-sm">
                    <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-on-surface">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-outline-variant dark:border-outline/40 pt-md space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-on-surface font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-on-surface font-semibold">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.25%)</span>
                <span className="text-on-surface font-semibold">${tax.toFixed(2)}</span>
              </div>

              {/* Coupon discount row */}
              {couponApplied && discountAmount > 0 && (
                <div className="flex justify-between text-secondary font-semibold">
                  <span>Coupon ({couponApplied.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-outline-variant dark:border-outline/40 pt-md font-bold text-headline-sm text-on-surface">
                <span>Total Price</span>
                <span className="text-primary dark:text-primary-fixed-dim">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="border-t border-outline-variant/60 pt-md space-y-sm">
              <p className="font-label-sm text-label-sm font-semibold text-on-surface">Coupon Code</p>
              {couponApplied ? (
                <div className="flex items-center justify-between bg-secondary-container/20 border border-secondary/20 rounded-lg px-md py-sm">
                  <div className="flex items-center gap-xs text-secondary">
                    <span className="material-symbols-outlined text-[18px]">local_offer</span>
                    <span className="font-bold font-mono text-sm">{couponApplied.code}</span>
                    <span className="text-xs">
                      (
                      {couponApplied.discountType === "percentage"
                        ? `${couponApplied.discountAmount}% off`
                        : `$${couponApplied.discountAmount} off`}
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
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    placeholder="Enter coupon code"
                    className="flex-1 p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-md py-sm bg-primary text-white rounded-lg font-label-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all text-sm"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-error text-xs font-medium">{couponError}</p>
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
    </div>
  );
};

export default Checkout;
