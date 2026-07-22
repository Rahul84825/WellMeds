import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionUpload from "../components/PrescriptionUpload";
import Modal from "../components/Modal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { 
  UploadCloud, CheckCircle2, ClipboardList, Stethoscope, Clock, 
  ArrowLeft, Tag, Info, ArrowRight, ShieldCheck, Lock, Trash2, 
  RefreshCcw, AlertTriangle, AlertCircle
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { toast } from "sonner";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, subtotal, shipping, tax, total, requiresRx, clearCart } = useCart();
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      openLoginModal("/checkout");
      navigate("/cart", { replace: true });
    }
  }, [authLoading, user, openLoginModal, navigate]);

  // Payment Recovery check: if user returns with a paid draft order
  useEffect(() => {
    const recoverOrder = async () => {
      if (!user) return;
      try {
        const orders = await api.getUserOrders();
        // Look for any order placed in the last 15 minutes that is Paid and has a Razorpay Order ID
        const recentPaidOrder = orders.find(order => {
          const isRecent = new Date() - new Date(order.createdAt) < 15 * 60 * 1000;
          return isRecent && order.paymentStatus === "Paid" && order.razorpayOrderId;
        });

        if (recentPaidOrder) {
          toast.success("Recovered successfully paid order!");
          clearCart();
          navigate("/order-success", { state: { order: recentPaidOrder }, replace: true });
        }
      } catch (err) {
        console.warn("Payment recovery check failed:", err.message);
      }
    };
    
    if (user && cartItems.length > 0) {
      recoverOrder();
    }
  }, [user, cartItems, navigate, clearCart]);

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

  // Dynamic Rx verification states
  const [rxStatus, setRxStatus] = useState("Prescription Required"); // Prescription Required | Needs Re-verification | Pending Verification | Rejected | Verified
  const [rxMessage, setRxMessage] = useState("");
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [matchingRxDoc, setMatchingRxDoc] = useState(null);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); 
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pollingTimeout, setPollingTimeout] = useState(false);

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

  // Helper to normalize items in cart for matching CartSnapshot
  const getRxCartItems = useCallback((items) => {
    return items.filter(item => item.requiresRx).map(item => ({
      productId: (item._id || item.id)?.toString(),
      name: item.name,
      quantity: item.quantity,
      strength: item.strength || item.specifications?.find(s => s.label?.toLowerCase() === 'strength')?.value || '',
      packSize: item.packSize || item.specifications?.find(s => s.label?.toLowerCase() === 'pack size' || s.label?.toLowerCase() === 'packsize')?.value || ''
    }));
  }, []);

  // Helper to compare a snapshot with the current cart
  const isSnapshotMatchingCart = useCallback((snapshot, items) => {
    if (!snapshot || !Array.isArray(snapshot.items)) return false;
    const rxCart = getRxCartItems(items);
    const snapshotItems = snapshot.items;
    
    if (rxCart.length !== snapshotItems.length) return false;
    
    return rxCart.every(cartItem => {
      const match = snapshotItems.find(snapItem => snapItem.productId === cartItem.productId);
      if (!match) return false;
      return (
        match.quantity === cartItem.quantity &&
        match.strength === cartItem.strength &&
        match.packSize === cartItem.packSize
      );
    });
  }, [getRxCartItems]);

  const checkRxStatus = useCallback(async () => {
    if (requiresRx && user) {
      try {
        const data = await api.getMyPrescriptions();
        setMyPrescriptions(data);
        
        // Find if there is any prescription matching the current cart snapshot
        const match = data.find(rx => isSnapshotMatchingCart(rx.cartSnapshot, cartItems));
        setMatchingRxDoc(match);
        
        if (match) {
          if (match.status === "Approved") {
            setRxStatus("Verified");
            setHasApprovedRx(true);
          } else if (match.status === "Pending Review" || match.status === "Under Verification") {
            setRxStatus("Pending Verification");
            setHasApprovedRx(false);
          } else if (match.status === "Rejected") {
            setRxStatus("Rejected");
            setRxMessage(match.adminNotes || "Your prescription was rejected by our pharmacist.");
            setHasApprovedRx(false);
          } else {
            setRxStatus("Prescription Required");
            setHasApprovedRx(false);
          }
        } else {
          setHasApprovedRx(false);
          const hasAnyRx = data.length > 0;
          if (hasAnyRx) {
            setRxStatus("Needs Re-verification");
          } else {
            setRxStatus("Prescription Required");
          }
        }
      } catch (err) {
        console.error("Failed to check prescription status", err);
      } finally {
        setLoadingRxCheck(false);
      }
    } else {
      setLoadingRxCheck(false);
    }
  }, [requiresRx, user, cartItems, isSnapshotMatchingCart]);

  useEffect(() => {
    checkRxStatus();
  }, [checkRxStatus]);

  // Dynamic automatic status checking (polling every 8 seconds when Pending Verification)
  useEffect(() => {
    if (!requiresRx || !user) return;
    let interval;
    if (rxStatus === "Pending Verification") {
      interval = setInterval(() => {
        checkRxStatus();
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [requiresRx, user, rxStatus, checkRxStatus]);

  // Coupon application
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

  // Order placement
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (!address || !city || !state || !pincode || !fullName || !email) {
      toast.warning("Please fill in all shipping details.");
      return;
    }

    if (requiresRx) {
      if (loadingRxCheck) {
        toast.info("Verifying prescription status, please wait...");
        return;
      }
      if (rxStatus === "Prescription Required" || rxStatus === "Needs Re-verification") {
        setRxInfoModalOpen(true);
        return;
      }
      if (rxStatus === "Rejected") {
        setRxModalOpen(true);
        return;
      }
      if (rxStatus === "Pending Verification") {
        toast.info("Waiting for pharmacist verification. Please wait until approved.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id || item.id,
        id: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const baseOrderData = {
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
        rxUploaded: requiresRx ? (rxStatus === "Verified") : false,
        rxFile: matchingRxDoc?.fileUrl || rxFileName || null,
        shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
        paymentMethod,
      };

      if (paymentMethod === "cod") {
        const completedOrder = await api.placeOrder(baseOrderData);
        clearCart();
        navigate("/order-success", { state: { order: completedOrder } });
      } else {
        // Online Payment Flow via Razorpay
        const orderSession = await api.createRazorpayOrder({
          items: orderItems,
          couponCode: couponApplied?.code || null,
          customer: fullName,
          email: email,
          shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
          rxFile: matchingRxDoc?.fileUrl || rxFileName || null,
          requiresRx
        });
        
        if (!orderSession.success || !orderSession.razorpayOrder) {
          throw new Error(orderSession.message || "Failed to initialize payment order session.");
        }

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error("Unable to load payment gateway script. Please check your connection.");
        }

        const razorpayOrder = orderSession.razorpayOrder;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkeyid123",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "WellMeds Pharmacy",
          description: "Online Medicine Checkout",
          order_id: razorpayOrder.id,
          handler: async function (response) {
            setPaymentProcessing(true);
            setIsSubmitting(true);
            
            const orderData = {
              ...baseOrderData,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };
            
            api.placeOrder(orderData).catch(err => {
              console.warn("Client-side placeOrder fallback failed (will rely on Webhook):", err.message);
            });

            let attempts = 0;
            const maxAttempts = 30;
            
            const interval = setInterval(async () => {
              attempts++;
              try {
                const statusRes = await api.getOrderStatus(response.razorpay_order_id);
                if (statusRes.success && statusRes.paymentStatus === "Paid") {
                  clearInterval(interval);
                  setPaymentProcessing(false);
                  setPollingTimeout(false);
                  setIsSubmitting(false);
                  clearCart();
                  navigate("/order-success", { state: { order: statusRes.order } });
                }
              } catch (err) {
                console.warn("Polling order status failed attempt:", attempts, err.message);
              }

              if (attempts >= maxAttempts) {
                clearInterval(interval);
                setPollingTimeout(true);
                clearCart();
              }
            }, 2000);
          },
          prefill: {
            name: fullName,
            email: email,
            contact: user?.phone || user?.mobile || "",
          },
          theme: {
            color: "#02665e", // Updated to match primary brand color
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              toast.info("Payment cancelled.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error(`Payment transaction failed: ${response.error.description}`);
          setIsSubmitting(false);
        });
        rzp.open();
      }
    } catch (err) {
      console.error("Failed to place order", err);
      const msg = err?.response?.data?.message || err?.message || "Something went wrong placing your order. Please try again.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const handleRxSuccess = (data) => {
    setRxFileName(data.fileName);
    setRxAttached(true);
    setRxModalOpen(false);
    setRxSuccessModalOpen(true);
    checkRxStatus();
  };

  // ── Empty State ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 animate-[fade-in_0.3s_ease-out] flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No items to checkout</h2>
        <Link
          to="/products"
          className="bg-[#02665e] hover:bg-[#014d47] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 mt-4"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Guest Auth Gate ──
  if (!authLoading && !user) {
    return <CheckoutAuthGate sendOtp={api.sendOtp} verifyOtp={api.verifyOtp} />;
  }

  // ── Main Checkout UI ──
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <div className="mb-8">
        <Link to="/cart" className="text-sm font-semibold text-[#02665e] dark:text-[#52d6c9] hover:underline flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-4">
          Checkout
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ── LEFT COLUMN: Shipping & Payment Forms ── */}
        <form onSubmit={handlePlaceOrder} className="flex-1 w-full space-y-6">
          
          {/* Shipping Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-4">
              Shipping Information
            </h3>

            {requiresRx && rxStatus !== "Verified" && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-300 select-none animate-[fade-in_0.2s_ease-out]">
                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-bold">Shipping Locked</h4>
                  <p className="text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                    Please upload a valid prescription and wait for pharmacist verification to unlock checkout details.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={requiresRx && rxStatus !== "Verified"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={requiresRx && rxStatus !== "Verified"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Street Address</label>
              <input
                type="text"
                required
                disabled={requiresRx && rxStatus !== "Verified"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">City</label>
                <input
                  type="text"
                  required
                  disabled={requiresRx && rxStatus !== "Verified"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
                  placeholder="City"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">State</label>
                <select
                  required
                  disabled={requiresRx && rxStatus !== "Verified"}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
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
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Pincode</label>
                <input
                  type="text"
                  required
                  disabled={requiresRx && rxStatus !== "Verified"}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all disabled:opacity-60"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          {/* Rx Verification Card */}
          {requiresRx && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-4">
                Prescription Verification
              </h3>

              {loadingRxCheck ? (
                <div className="py-6 flex justify-center"><Loader size="sm" /></div>
              ) : rxStatus === "Verified" ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Prescription Verified</h4>
                      <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">
                        {matchingRxDoc?.name || "Verified Prescription Document"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRxModalOpen(true)}
                    className="text-[#038076] dark:text-[#84d6b9] font-bold text-xs hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : rxStatus === "Pending Verification" ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-amber-800 dark:text-amber-300">
                  <div className="flex items-start gap-3">
                    <RefreshCcw className="w-6 h-6 text-amber-500 shrink-0 animate-spin" />
                    <div>
                      <h4 className="font-bold text-sm">Waiting for Pharmacist Verification</h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed mt-0.5">
                        We are verifying prescription "{matchingRxDoc?.name || "Document"}". Please wait a moment...
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => checkRxStatus()}
                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              ) : rxStatus === "Rejected" ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 space-y-3 text-left">
                  <div className="flex items-start gap-3 text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Prescription Rejected</h4>
                      <p className="text-xs text-rose-700/80 dark:text-rose-400/80 leading-relaxed mt-0.5">
                        Reason: {rxMessage || "Prescription does not meet regulated criteria."}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-rose-200/50 dark:border-rose-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-[11px] text-rose-700/70 dark:text-rose-400/70">Please upload a valid, signed doctor's prescription sheet.</span>
                    <button
                      type="button"
                      onClick={() => setRxModalOpen(true)}
                      className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Upload Prescription
                    </button>
                  </div>
                </div>
              ) : rxStatus === "Needs Re-verification" ? (
                <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-xl p-4 space-y-3 text-left">
                  <div className="flex items-start gap-3 text-sky-800 dark:text-sky-300">
                    <AlertCircle className="w-6 h-6 text-sky-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Needs Re-verification</h4>
                      <p className="text-xs text-sky-700/80 dark:text-sky-400/80 leading-relaxed mt-0.5">
                        Your cart items or quantities have changed since your last prescription upload. Previous verification is invalidated.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-sky-200/50 dark:border-sky-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-[11px] text-sky-700/70 dark:text-sky-400/70">Regulation requires you to upload a prescription for the current cart snapshot.</span>
                    <button
                      type="button"
                      onClick={() => setRxInfoModalOpen(true)}
                      className="bg-[#038076] hover:bg-[#02655f] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Upload Prescription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 space-y-3 text-left">
                  <div className="flex items-start gap-3 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Prescription Required</h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed mt-0.5">
                        You are purchasing regulated medicines. Please upload a valid medical prescription signed by a certified doctor.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-amber-200/50 dark:border-amber-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-[11px] text-amber-700/70 dark:text-amber-400/70">Verifications are processed by our licensed pharmacists.</span>
                    <button
                      type="button"
                      onClick={() => setRxInfoModalOpen(true)}
                      className="bg-[#3f257a] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#321c62] transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Upload Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selector Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-4">
              Payment Method
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <label
                className={`relative flex-1 p-4 border rounded-xl flex flex-col gap-2 cursor-pointer transition-all select-none ${
                  paymentMethod === "upi"
                    ? "border-[#3f257a] bg-[#3f257a]/5 dark:bg-[#3f257a]/10 ring-1 ring-[#3f257a]/20"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-500"
                } ${requiresRx && rxStatus !== "Verified" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    disabled={requiresRx && rxStatus !== "Verified"}
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="text-[#3f257a] focus:ring-[#3f257a] h-4 w-4 disabled:opacity-50"
                  />
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
                <span className={`text-sm font-semibold mt-1 ${paymentMethod === 'upi' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>UPI</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 leading-tight">PhonePe, GPay, Paytm</span>
              </label>

              <label
                className={`relative flex-1 p-4 border rounded-xl flex flex-col gap-2 cursor-pointer transition-all select-none ${
                  paymentMethod === "card"
                    ? "border-[#3f257a] bg-[#3f257a]/5 dark:bg-[#3f257a]/10 ring-1 ring-[#3f257a]/20"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-500"
                } ${requiresRx && rxStatus !== "Verified" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    disabled={requiresRx && rxStatus !== "Verified"}
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="text-[#3f257a] focus:ring-[#3f257a] h-4 w-4 disabled:opacity-50"
                  />
                  <span className="material-symbols-outlined text-xl">credit_card</span>
                </div>
                <span className={`text-sm font-semibold mt-1 ${paymentMethod === 'card' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>Card</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 leading-tight">Credit or Debit Card</span>
              </label>

              <label
                className={`relative flex-1 p-4 border rounded-xl flex flex-col gap-2 cursor-pointer transition-all select-none ${
                  paymentMethod === "cod"
                    ? "border-[#3f257a] bg-[#3f257a]/5 dark:bg-[#3f257a]/10 ring-1 ring-[#3f257a]/20"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-500"
                } ${requiresRx && rxStatus !== "Verified" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    disabled={requiresRx && rxStatus !== "Verified"}
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-[#3f257a] focus:ring-[#3f257a] h-4 w-4 disabled:opacity-50"
                  />
                  <span className="material-symbols-outlined text-xl">local_shipping</span>
                </div>
                <span className={`text-sm font-semibold mt-1 ${paymentMethod === 'cod' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>Cash on Delivery</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 leading-tight">Pay when you receive</span>
              </label>
            </div>

            {/* Card Input Details */}
            {paymentMethod === "card" && (
              <div className="space-y-4 bg-slate-50 dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-[fade-in_0.2s_ease-out]">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all"
                      placeholder="***"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* ── RIGHT COLUMN: Order Summary ── */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col text-left">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Order Summary</h3>
            </div>

            {/* Item List Scrollable */}
            <div className="max-h-56 overflow-y-auto px-6 py-2 divide-y divide-slate-100 dark:divide-zinc-800/80 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={(item._id || item.id)?.toString()} className="py-3 flex items-start justify-between gap-3 text-sm">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 dark:text-white mr-2 text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{item.quantity}x</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div className="p-6 border-y border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200 mb-3">Apply Coupon</p>
              
              {couponApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-2 animate-[fade-in_0.2s_ease-out]">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Tag size={14} />
                    <span className="font-bold font-mono text-sm">{couponApplied.code}</span>
                    <span className="text-xs font-medium">
                      (-{couponApplied.discountType === "percentage"
                        ? `${couponApplied.discountValue || couponApplied.discountAmount}%`
                        : `₹${couponApplied.discountValue || couponApplied.discountAmount}`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code here"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon(couponCode))}
                    disabled={couponLoading}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-rose-500 text-xs font-medium mt-2">{couponError}</p>
              )}

              {/* Available Coupons List (Expandable style) */}
              {!couponApplied && availableCoupons.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {availableCoupons.map((coupon) => (
                    <div 
                      key={coupon.id} 
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between text-left"
                    >
                      <div>
                        <span className="inline-block bg-[#3f257a]/10 text-[#3f257a] dark:text-[#a4c9ff] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#3f257a]/20 mb-1">
                          {coupon.code}
                        </span>
                        <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountValue || coupon.discountAmount}% OFF` 
                            : `₹${coupon.discountValue || coupon.discountAmount} OFF`}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Min order: ₹{coupon.minimumOrder || coupon.minOrderValue}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode(coupon.code);
                          handleApplyCoupon(coupon.code);
                        }}
                        className="bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] hover:bg-[#038076] hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">{formatCurrency(subtotal)}</span>
              </div>
              
              {couponApplied && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400">
                <span>Shipping {subtotal >= 499 && subtotal > 0 ? "(Free > ₹499)" : ""}</span>
                <span className="text-slate-900 dark:text-zinc-100 font-medium">
                  {activeShipping === 0 ? "FREE" : formatCurrency(activeShipping)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <span>GST (12%)</span>
                <span className="text-slate-900 dark:text-zinc-100 font-medium">{formatCurrency(tax)}</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">Final Total</span>
                <span className="text-xl font-bold text-[#02665e] dark:text-[#a4c9ff] tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={
                  requiresRx && rxStatus !== "Verified"
                    ? (e) => {
                        e.preventDefault();
                        if (rxStatus === "Rejected") {
                          setRxModalOpen(true);
                        } else if (rxStatus === "Prescription Required" || rxStatus === "Needs Re-verification") {
                          setRxInfoModalOpen(true);
                        }
                      }
                    : handlePlaceOrder
                }
                disabled={isSubmitting || (requiresRx && rxStatus === "Pending Verification")}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                  requiresRx && rxStatus === "Pending Verification"
                    ? "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                    : requiresRx && rxStatus === "Rejected"
                    ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-[0.98]"
                    : requiresRx && rxStatus !== "Verified"
                    ? "bg-[#02665e] hover:bg-[#014d47] text-white cursor-pointer active:scale-[0.98]"
                    : "bg-[#02665e] hover:bg-[#014d47] text-white cursor-pointer active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <><Loader size="sm" color="white" /> Processing...</>
                ) : requiresRx && rxStatus === "Pending Verification" ? (
                  <><Clock className="w-4 h-4 animate-spin" /> Verifying Rx...</>
                ) : requiresRx && rxStatus === "Rejected" ? (
                  "Upload New Prescription"
                ) : requiresRx && rxStatus !== "Verified" ? (
                  "Upload Prescription"
                ) : (
                  <><Lock size={16}/> Place Secure Order</>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                <ShieldCheck size={14} />
                <span>Secured with 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Prescription Info Modal */}
      <Modal
        isOpen={rxInfoModalOpen}
        onClose={() => setRxInfoModalOpen(false)}
        title="Prescription Required"
        maxWidth="max-w-md"
        showCloseButton={true}
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4 select-none">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-xl animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-full bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center border border-[#038076]/10 shadow-lg">
              <ClipboardList className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 bg-[#086b53] text-white p-1 rounded-full border border-white text-[10px]">
                <Clock size={12} className="animate-spin" />
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 px-2 font-medium">
            One or more medicines in your cart require a valid doctor's prescription before they can be processed.
          </p>

          <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-[#038076] dark:text-[#84d6b9] inline-flex items-center gap-1.5">
            <Clock size={14} />
            <span>Estimated verification time: 5-10 mins</span>
          </div>

          <div className="w-full space-y-3 my-6 text-left border-y border-slate-100 dark:border-zinc-800/80 py-6">
            <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">Step 1</span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">Upload your doctor's prescription.</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 2</span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">Our pharmacist verifies your medicines.</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450">Step 3</span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">Complete payment and we'll dispatch.</p>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => { setRxInfoModalOpen(false); setRxModalOpen(true); }}
              className="flex-1 bg-[#038076] hover:bg-[#02655f] text-white py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Upload Prescription
            </button>
            <button
              onClick={() => setRxInfoModalOpen(false)}
              className="flex-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 mb-6 text-left">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            You must provide a signed doctor's prescription for the items in your order.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleRxSuccess}
          onClose={() => setRxModalOpen(false)}
          cartSnapshot={{
            items: getRxCartItems(cartItems),
            timestamp: new Date().toISOString(),
            userId: user?._id || user?.id
          }}
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
        <div className="flex flex-col items-center text-center space-y-6 py-4 select-none">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 flex items-center justify-center border border-emerald-250/20 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-3 px-2">
            <p className="font-semibold text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
              Our licensed pharmacist will review your prescription shortly.
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              You will receive a notification after verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 font-medium border border-slate-100 dark:border-zinc-700/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Verification is usually completed within business hours.</span>
            </div>
          </div>

          <button
            onClick={() => setRxSuccessModalOpen(false)}
            className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </Modal>

      {/* Payment Processing Modal */}
      {paymentProcessing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 select-none animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            {!pollingTimeout ? (
              <>
                <div className="relative w-16 h-16 rounded-full bg-[#038076]/10 flex items-center justify-center mx-auto mb-2 text-[#038076]">
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Payment Processing...</h4>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Confirming transaction parameters with the banking gateway. Please do not close or refresh this page.
                </p>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/20 flex items-center justify-center mx-auto mb-2">
                  <Info className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Confirming Payment</h4>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  We're still confirming your payment. You may safely close this page. We'll notify you once your order is confirmed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentProcessing(false);
                    setPollingTimeout(false);
                    setIsSubmitting(false);
                    navigate("/orders");
                  }}
                  className="w-full mt-6 bg-[#038076] hover:bg-[#02655f] text-white py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Go to My Orders
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutAuthGate (Redesigned)
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
    if (val === lastVerifiedOtpRef.current) return;
    lastVerifiedOtpRef.current = val;

    setVerifying(true); setError("");
    try {
      const u = await verifyOtp(mobile.trim(), val, name.trim(), email.trim());
      setWelcomeName(u?.name || "there");
      setWelcomeDone(true);
    } catch (err) {
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
    <div className="max-w-6xl mx-auto px-4 py-12 text-left">
      <div className="mb-8">
        <Link to="/cart" className="text-sm font-semibold text-[#3f257a] hover:underline flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-4">Checkout</h1>
      </div>

      <div className="max-w-md mx-auto mt-12">
        {welcomeDone ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl text-center animate-[fade-in_0.3s_ease-out]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3f257a]/10 text-[#3f257a] mb-5 mx-auto">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {welcomeName.split(" ")[0]}!</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Loading your checkout...</p>
            <div className="flex justify-center">
              <Loader size="sm" color="#3f257a" />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800 px-6 py-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-[#3f257a]/10 text-[#3f257a] dark:text-[#a4c9ff]">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Authentication Required</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Continue with your mobile number to checkout.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Cart preview pill */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 rounded-lg px-4 py-2.5 border border-slate-200/50 dark:border-zinc-800/50">
                <ShieldCheck size={16} className="text-[#038076] dark:text-[#84d6b9]" />
                <span>Your cart is securely saved and will not be cleared.</span>
              </div>

              {error && (
                <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {devHint && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <span className="font-bold">Dev OTP:</span>
                  <strong className="font-mono tracking-widest text-sm">{devHint}</strong>
                </div>
              )}

              {/* STEP: Mobile */}
              {step === "mobile" && (
                <form onSubmit={(e) => {
                  e.preventDefault(); setError("");
                  const c = mobile.trim().replace(/\D/g, "");
                  if (!/^[6-9]\d{9}$/.test(c)) { setError("Please enter a valid 10-digit mobile number."); return; }
                  setStep("details");
                }} className="space-y-6" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="gate-mobile" className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Mobile Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 flex items-center pl-4 h-full pointer-events-none">
                        <span className="text-slate-500 font-mono text-sm">+91</span>
                        <div className="ml-3 w-px h-5 bg-slate-200 dark:bg-zinc-700" />
                      </div>
                      <input id="gate-mobile" type="tel" inputMode="numeric" maxLength={10} autoFocus autoComplete="tel-national"
                        value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                        placeholder="9XXXXXXXXX" aria-label="10-digit mobile number"
                        className="w-full pl-[76px] pr-4 py-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20 transition-all font-mono tracking-widest"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={mobile.length < 10} className="w-full py-3 rounded-xl bg-[#02665e] hover:bg-[#014d47] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-2">
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* STEP: Details */}
              {step === "details" && (
                <form onSubmit={doSendOtp} className="space-y-6" noValidate>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 rounded-lg px-4 py-2 border border-slate-200 dark:border-zinc-800/50">
                    <span className="font-mono tracking-wider">+91 {mobile}</span>
                    <button type="button" onClick={() => { setStep("mobile"); setError(""); }} className="text-[#02665e] dark:text-[#52d6c9] text-xs font-bold hover:underline">Change</button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="gate-name" className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Full Name <span className="text-rose-500">*</span></label>
                      <input id="gate-name" type="text" autoFocus required autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Your full name"
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#02665e]/20 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="gate-email" className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">Email Address <span className="font-normal text-slate-400">(optional)</span></label>
                      <input id="gate-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#02665e]/20 transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-[#02665e] hover:bg-[#014d47] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-2">
                    {busy ? <Loader size="sm" color="white" /> : "Send OTP"}
                  </button>
                </form>
              )}

              {/* STEP: OTP */}
              {step === "otp" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 rounded-lg px-4 py-2 border border-slate-200 dark:border-zinc-800/50">
                    <span className="font-mono tracking-wider">+91 {mobile}</span>
                    <button type="button" onClick={() => { setStep("details"); setError(""); }} className="text-[#02665e] dark:text-[#52d6c9] text-xs font-bold hover:underline">Edit</button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 text-center block">Enter the {OTP_LEN}-digit code</label>
                    <div className="flex gap-2 justify-center" onPaste={oPaste}>
                      {otpDigits.map((d, i) => (
                        <input key={i} id={`gate-otp-${i + 1}`} ref={(el) => (otpRefs.current[i] = el)}
                          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={d}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          onChange={(e) => oChange(i, e.target.value)} onKeyDown={(e) => oKey(i, e)} disabled={verifying}
                          className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border-2 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white transition-all focus:outline-none disabled:opacity-60 ${d ? "border-[#02665e] focus:ring-4 focus:ring-[#02665e]/20" : "border-slate-200 dark:border-zinc-800 focus:border-[#02665e] focus:ring-4 focus:ring-[#02665e]/20"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {!verifying ? (
                    <button type="button" onClick={() => doVerify()} disabled={otpDigits.join("").length < OTP_LEN}
                      className="w-full py-3 rounded-xl bg-[#02665e] hover:bg-[#014d47] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-2">
                      Verify & Continue
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader size="sm" />
                      <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">Verifying...</span>
                    </div>
                  )}

                  <div className="text-center space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50">
                    {resendCount > 0 ? (
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Resend OTP in <strong className="font-mono">{`0:${resendCount.toString().padStart(2, "0")}`}</strong></p>
                    ) : (
                      <button type="button" onClick={doResend} disabled={busy} className="text-[#02665e] dark:text-[#52d6c9] text-xs font-bold hover:underline disabled:opacity-50">
                        {busy ? "Sending..." : "Resend OTP"}
                      </button>
                    )}
                    {expiryCount > 0 && (
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                        OTP valid for <span className="font-mono">{`${Math.floor(expiryCount / 60)}:${(expiryCount % 60).toString().padStart(2, "0")}`}</span>
                      </p>
                    )}
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