import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionUpload from "../components/Shared/PrescriptionUpload";
import Modal from "../components/Shared/Modal";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checks if all prescription products have Rx attached
  const rxAttachedCheck = !requiresRx || rxAttached || cartItems.every(i => !i.requiresRx || i.rxUploaded);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!address || !city || !state || !zip || !fullName || !email) {
      alert("Please fill in all shipping details.");
      return;
    }

    if (requiresRx && !rxAttachedCheck) {
      setRxModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const orderData = {
        customer: fullName,
        email,
        items: orderItems,
        total,
        rxUploaded: requiresRx,
        rxFile: rxFileName || cartItems.find(i => i.rxFile)?.rxFile || null,
        shippingAddress: `${address}, ${city}, ${state} ${zip}`,
        paymentMethod
      };

      const completedOrder = await api.placeOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Redirect to success
      navigate("/order-success", { state: { order: completedOrder } });
    } catch (err) {
      console.error("Failed to place order", err);
      alert("Something went wrong placing your order. Please try again.");
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
        <Link to="/products" className="text-primary hover:underline mt-md inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="mb-xl">
        <Link to="/cart" className="text-body-sm text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-xs">
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
                        {rxFileName || cartItems.find(i => i.rxFile)?.rxFile || "Attached from Cart"}
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
                <div className="border border-outline-variant dark:border-outline rounded-xl p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md bg-surface-container-low/50">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-error text-[26px]">warning</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Rx Missing</h4>
                      <p className="text-body-sm text-on-surface-variant leading-tight">
                        Please upload your active prescription document to submit.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRxModalOpen(true)}
                    className="bg-secondary text-white px-lg py-sm rounded-lg font-label-md font-bold hover:bg-on-secondary-container transition-all"
                  >
                    Upload Rx
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Payment Method
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-md">
              <label className={`flex-1 p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "credit-card" ? "border-primary bg-primary-container/10 font-bold" : "border-outline-variant hover:bg-surface-container-low"
              }`}>
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

              <label className={`flex-1 p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "cod" ? "border-primary bg-primary-container/10 font-bold" : "border-outline-variant hover:bg-surface-container-low"
              }`}>
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
        <div className="w-full lg:w-[360px] bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-md text-left">
          <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
            Order Review
          </h3>
          
          <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-outline-variant/40 pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="py-sm flex items-center justify-between gap-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
                <div className="truncate pr-sm">
                  <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant dark:border-outline/40 pt-md space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-on-surface font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-on-surface font-semibold">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.25%)</span>
              <span className="text-on-surface font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant dark:border-outline/40 pt-md font-bold text-headline-sm text-on-surface">
              <span>Total Price</span>
              <span className="text-primary dark:text-primary-fixed-dim">${total.toFixed(2)}</span>
            </div>
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
