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
  RefreshCcw, AlertTriangle, AlertCircle, MapPin, Navigation, Compass, FileText
} from "lucide-react";
import { formatCurrency, roundPrice } from "../utils/currency";
import { useAddress } from "../context/AddressContext";
import UniversalAddressForm from "../components/address/UniversalAddressForm";
import AddressCard from "../components/address/AddressCard";
import AddressSelectorModal from "../components/address/AddressSelectorModal";
import { validateDeliveryLocation } from "../services/googleMapsService";
import GoogleMapPicker from "../components/common/GoogleMapPicker";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import CompleteProfileModal from "../components/auth/CompleteProfileModal";

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
  const { cartItems, subtotal, shipping, tax, total, requiresRx, isCartLocked, modifyCart, clearCart, resetCartPostOrder } = useCart();
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

  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    addAddress,
    selectAddress,
    loading: addressLoading,
  } = useAddress();

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Dynamic Shipping & Google Distance Matrix calculation
  const [dynamicShipping, setDynamicShipping] = useState(0);
  const [shippingMsg, setShippingMsg] = useState("");
  const [deliveryMatrix, setDeliveryMatrix] = useState(null);

  useEffect(() => {
    const calcShipping = async () => {
      if (selectedAddress) {
        try {
          // Check road distance & delivery matrix via Google Maps Platform
          const matrix = await validateDeliveryLocation(selectedAddress.latitude, selectedAddress.longitude);
          setDeliveryMatrix(matrix);

          if (matrix && matrix.success) {
            setDynamicShipping(matrix.deliveryFee !== undefined ? matrix.deliveryFee : 40);
            setShippingMsg(matrix.message || `Driving Distance: ${matrix.distanceKm} km | Est. ${matrix.displayText}`);
          } else {
            const res = await api.calculateDeliveryFee({
              subtotal,
              pincode: selectedAddress.pincode,
              state: selectedAddress.state,
            });
            setDynamicShipping(res.charge);
            setShippingMsg(res.message);
          }
        } catch (e) {
          setDynamicShipping(subtotal >= 500 ? 0 : 50);
        }
      } else {
        setDynamicShipping(subtotal >= 500 ? 0 : 50);
      }
    };
    calcShipping();
  }, [subtotal, selectedAddress]);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); 
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Derived totals with coupon
  const finalTotal = roundPrice(Math.max(0, subtotal - discountAmount + activeShipping));
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
  const [matchingPrescriptions, setMatchingPrescriptions] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [selectingRxId, setSelectingRxId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
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
      setLoadingRxCheck(true);
      try {
        const res = await api.getCartRxStatus();
        if (res && res.success) {
          if (!res.requiresRx) {
            setRxStatus("Verified");
            setHasApprovedRx(true);
            setMatchingPrescriptions([]);
          } else {
            setRxStatus(res.rxStatus || "Prescription Required");
            setHasApprovedRx(res.isEligible || false);
            if (res.reason) setRxMessage(res.reason);
            if (res.prescription) setMatchingRxDoc(res.prescription);
            if (res.matchingPrescriptions) setMatchingPrescriptions(res.matchingPrescriptions);
            if (res.allPrescriptions) setAllPrescriptions(res.allPrescriptions);
          }
        }
      } catch (err) {
        console.error("Failed to check prescription status from backend", err);
      } finally {
        setLoadingRxCheck(false);
      }
    } else {
      setLoadingRxCheck(false);
    }
  }, [requiresRx, user]);

  const handleSelectPrescription = async (prescriptionId) => {
    setSelectingRxId(prescriptionId);
    setOrderError("");
    try {
      const res = await api.selectPrescriptionForCart(prescriptionId);
      if (res && res.success) {
        setRxStatus("Verified");
        setHasApprovedRx(true);
        if (res.prescription) setMatchingRxDoc(res.prescription);
        await checkRxStatus();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to select prescription";
      setOrderError(msg);
    } finally {
      setSelectingRxId(null);
    }
  };

  useEffect(() => {
    checkRxStatus();
  }, [checkRxStatus]);


  // Dynamic automatic status checking (polling every 4 seconds when Pending Verification & multi-tab sync)
  useEffect(() => {
    if (!requiresRx || !user) return;
    let interval;
    if (rxStatus === "Pending Verification") {
      interval = setInterval(() => {
        checkRxStatus();
      }, 4000);
    }

    const handleStorageChange = (e) => {
      if (e.key === "wellmeds_cart_lock_sync") {
        checkRxStatus();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
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
    setOrderError("");

    if (!selectedAddress) {
      return;
    }

    if (requiresRx) {
      if (loadingRxCheck) {
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

      const shippingAddressObj = {
        fullName: selectedAddress.fullName,
        mobile: selectedAddress.mobile,
        altMobile: selectedAddress.altMobile || "",
        houseNo: selectedAddress.houseNo,
        building: selectedAddress.building,
        street: selectedAddress.street,
        landmark: selectedAddress.landmark || "",
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country || "India",
        pincode: selectedAddress.pincode,
        type: selectedAddress.type || "Home",
        deliveryInstructions: selectedAddress.deliveryInstructions || "",
        latitude: selectedAddress.latitude || deliveryMatrix?.latitude || null,
        longitude: selectedAddress.longitude || deliveryMatrix?.longitude || null,
        placeId: selectedAddress.placeId || "",
        formattedAddress: selectedAddress.formattedAddress || "",
        distanceKm: deliveryMatrix?.distanceKm || null,
        estimatedTimeMinutes: deliveryMatrix?.durationMinutes || null,
        deliveryFee: activeShipping,
      };

      const formattedAddressStr = [
        selectedAddress.houseNo,
        selectedAddress.building,
        selectedAddress.street,
        selectedAddress.landmark ? `Near ${selectedAddress.landmark}` : null,
        `${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
        selectedAddress.country || "India",
      ].filter(Boolean).join(", ");

      const baseOrderData = {
        customer: selectedAddress.fullName || user?.name || "Valued Customer",
        email: user?.email || "",
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
        shippingAddress: formattedAddressStr,
        shippingAddressObject: shippingAddressObj,
        paymentMethod: "razorpay",
      };

      // Create Razorpay Order Session
      const orderSession = await api.createRazorpayOrder({
        items: orderItems,
        couponCode: couponApplied?.code || null,
        customer: selectedAddress.fullName || user?.name || "Valued Customer",
        email: user?.email || "",
        shippingAddress: formattedAddressStr,
        shippingAddressObject: shippingAddressObj,
        rxFile: matchingRxDoc?.fileUrl || rxFileName || null,
        requiresRx,
      });


      if (!orderSession.success || !orderSession.razorpayOrder) {
        throw new Error(orderSession.message || "Failed to initialize payment session.");
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Unable to load payment gateway SDK. Please check your network connection.");
      }

      const razorpayOrder = orderSession.razorpayOrder;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        console.warn("[Razorpay] VITE_RAZORPAY_KEY_ID is unconfigured in environment variables.");
      }

      const options = {
        key: razorpayKey || "",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "WellMeds Super Speciality Pharmacy",
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

          api.placeOrder(orderData).catch((err) => {
            console.warn("Client-side signature callback notice (handled by Webhook):", err.message);
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
                resetCartPostOrder();
                navigate(`/order-success?orderId=${statusRes.order.orderId || statusRes.order.razorpayOrderId}`, { state: { order: statusRes.order } });
              }
            } catch (err) {
              console.warn("Order status poll attempt:", attempts, err.message);
            }

            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setPollingTimeout(true);
              resetCartPostOrder();
            }
          }, 2000);
        },
        prefill: {
          name: selectedAddress?.fullName || user?.name || "Valued Customer",
          email: user?.email || "",
          contact: selectedAddress?.phone || user?.phone || user?.mobile || "",
        },
        theme: {
          color: "#038076",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setIsSubmitting(false);
        setOrderError("Payment failed or was cancelled. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error("Failed to place order", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to initialize payment session. Please try again.";
      setOrderError(errMsg);
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
    return <CheckoutAuthGate />;
  }

  // ── Main Checkout UI ──
  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to="/cart" className="text-xs sm:text-sm font-semibold text-[#157a6d] dark:text-emerald-400 hover:underline flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mt-4 mb-1 flex items-center gap-2">
          <span>SECURE CHECKOUT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
          <span>CLINICAL DISPATCH</span>
        </div>
        <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white tracking-tight">
          Checkout
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ── LEFT COLUMN: Shipping & Payment Forms ── */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Shipping Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="font-editorial text-lg sm:text-xl font-semibold text-[#172b26] dark:text-white">
                Shipping Information
              </h3>
              {addresses.length > 0 && !showAddForm && (
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  className="text-xs font-bold text-[#157a6d] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin size={14} /> Change Address ({addresses.length} Saved)
                </button>
              )}
            </div>

            {requiresRx && rxStatus !== "Verified" && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-300 select-none animate-[fade-in_0.2s_ease-out]">
                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-bold">Shipping Locked</h4>
                  <p className="text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed text-xs">
                    Please upload a valid prescription and wait for pharmacist verification to unlock checkout details.
                  </p>
                </div>
              </div>
            )}

            {/* Address Display with Interactive Google Map & Delivery Distance Matrix */}
            {selectedAddress && !showAddForm ? (
              <div className="space-y-3">
                <AddressCard
                  address={selectedAddress}
                  isSelected={true}
                  showActions={false}
                />

                {/* Google Maps Nationwide Delivery Badge */}
                <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#157a6d] dark:text-emerald-300 font-bold">
                    <Navigation size={15} className="shrink-0 text-[#157a6d]" />
                    <span>
                      Pan-India Express Shipping & Dispatch
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 bg-[#bbf7d0] text-[#15803d] border border-emerald-300/40">
                    ✔ Pan-India Delivery
                  </span>
                </div>

                {/* Interactive Route Map Preview */}
                <div className="pt-1">
                  <GoogleMapPicker
                    latitude={selectedAddress.latitude}
                    longitude={selectedAddress.longitude}
                    height="180px"
                    interactive={false}
                    showRoute={true}
                  />
                </div>

                <div className="flex items-center justify-end text-xs font-semibold pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="text-[#157a6d] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#f4f9f7] dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                <p className="text-xs font-bold text-[#172b26] dark:text-zinc-200 mb-3">
                  {addresses.length === 0 ? "Enter Delivery Address (Will be saved automatically)" : "Add New Delivery Address"}
                </p>
                <UniversalAddressForm
                  onSubmit={async (cleanData) => {
                    const newAddr = await addAddress(cleanData);
                    setShowAddForm(false);
                  }}
                  onCancel={addresses.length > 0 ? () => setShowAddForm(false) : null}
                  submitLabel="Save & Use Address"
                />
              </div>
            )}
          </div>

          {/* Rx Verification Card Section */}
          {requiresRx && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h3 className="font-editorial text-lg sm:text-xl font-semibold text-[#172b26] dark:text-white flex items-center gap-2">
                  <Stethoscope size={20} className="text-[#038076]" />
                  Prescription Verification
                </h3>
                <button
                  type="button"
                  onClick={() => setRxInfoModalOpen(true)}
                  className="text-xs font-bold text-[#038076] dark:text-[#84d6b9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud size={14} /> Upload New Prescription
                </button>
              </div>

              {loadingRxCheck ? (
                <div className="py-8 flex justify-center"><Loader size="sm" /></div>
              ) : rxStatus === "Verified" ? (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Prescription Verified for Current Cart</h4>
                        <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Approved</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 truncate max-w-md">
                        Document: <span className="font-bold text-slate-800 dark:text-zinc-200">{matchingRxDoc?.name || "Verified Prescription"}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRxInfoModalOpen(true)}
                    className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Upload New Instead
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Banner */}
                  {rxStatus === "Needs Re-verification" ? (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-sm mb-0.5">Your cart has changed since your last approved prescription</p>
                        <p className="text-amber-700 dark:text-amber-300/80 leading-relaxed">
                          {rxMessage || "Your cart items or quantities differ from previous verification records. Please select a matching prescription below or upload a new one."}
                        </p>
                      </div>
                    </div>
                  ) : rxStatus === "Pending Verification" ? (
                    <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-4 flex items-start gap-3 text-teal-900 dark:text-teal-200 text-xs">
                      <RefreshCcw className="w-5 h-5 text-[#038076] shrink-0 animate-spin mt-0.5" />
                      <div>
                        <p className="font-extrabold text-sm mb-0.5">Waiting for Pharmacist Verification</p>
                        <p className="text-teal-700 dark:text-teal-300/80 leading-relaxed">
                          We are verifying prescription "{matchingRxDoc?.name || "Document"}". Please wait a moment...
                        </p>
                      </div>
                    </div>
                  ) : rxStatus === "Rejected" ? (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-start gap-3 text-rose-900 dark:text-rose-200 text-xs">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-sm mb-0.5">Prescription Verification Declined</p>
                        <p className="text-rose-700 dark:text-rose-300/80 leading-relaxed">
                          {rxMessage || "Your previous prescription was declined by our pharmacist. Please upload a clear prescription document."}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Matching Approved Prescriptions Section (Scenario A, B & D) */}
                  {matchingPrescriptions.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-[#038076]" />
                          Matching Approved Prescription(s) Available ({matchingPrescriptions.length})
                        </p>
                        <span className="text-[11px] text-slate-400">Select one to proceed to payment</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {matchingPrescriptions.map((m) => (
                          <div
                            key={m._id}
                            className="p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-[#038076] transition-all space-y-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{m.name}</h4>
                                <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                                  Approved
                                </span>
                                <span className="bg-teal-100 dark:bg-teal-900/60 text-[#038076] dark:text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                                  Matches Current Cart
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                Uploaded on {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleSelectPrescription(m._id)}
                                disabled={selectingRxId === m._id}
                                className="w-full sm:w-auto bg-[#038076] hover:bg-[#026860] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {selectingRxId === m._id ? (
                                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle2 size={15} />
                                )}
                                <span>Use This Prescription</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* No matching approved prescription found */
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                      <FileText size={32} className="mx-auto text-slate-400 opacity-60" />
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 max-w-sm mx-auto">
                        No approved prescription matches your current cart items. Please upload a valid prescription to continue.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRxInfoModalOpen(true)}
                        className="bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <UploadCloud size={16} /> Upload Prescription
                      </button>
                    </div>
                  )}

                  {/* Always provide Upload New Prescription option */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRxInfoModalOpen(true)}
                      className="text-xs font-bold text-[#038076] dark:text-[#84d6b9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      + Upload a newer prescription document
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selector Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="font-editorial text-lg sm:text-xl font-semibold text-[#172b26] dark:text-white">
                Payment Gateway
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-[#f4f9f7] dark:bg-teal-900/30 text-[#157a6d] dark:text-teal-400 rounded-full border border-[#157a6d]/20">
                Razorpay Secure
              </span>
            </div>

            <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#157a6d]" />
                  <span className="text-xs font-bold text-[#172b26] dark:text-slate-200">
                    Instant & Secure Payment
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Pay using UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Netbanking, or Cred.
                </p>
              </div>
              <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-[#157a6d]">
                <span>Razorpay</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Order Summary ── */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col text-left">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-[#f4f9f7]/50 dark:bg-zinc-900/50">
              <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white">Order Summary</h3>
            </div>

            {/* Item List Scrollable */}
            <div className="max-h-56 overflow-y-auto px-6 py-2 divide-y divide-slate-100 dark:divide-zinc-800/80 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={(item._id || item.id)?.toString()} className="py-3 flex items-start justify-between gap-3 text-sm">
                  <div className="truncate pr-2">
                    <span className="font-bold text-[#172b26] dark:text-white mr-2 text-xs bg-[#f4f9f7] dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200/60">{item.quantity}x</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#172b26] dark:text-white shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div className="p-6 border-y border-slate-100 dark:border-zinc-800 bg-[#f4f9f7]/30 dark:bg-zinc-900/30">
              <p className="text-xs font-bold font-clinical-mono text-[#157a6d] uppercase mb-3">Apply Coupon</p>
              
              {couponApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-full px-4 py-2 animate-[fade-in_0.2s_ease-out]">
                  <div className="flex items-center gap-2 text-[#157a6d] dark:text-emerald-400">
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
                    className="text-[#157a6d] dark:text-emerald-400 hover:underline font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon(couponCode))}
                    disabled={couponLoading}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs font-mono uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#157a6d]/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-4 py-2 rounded-full text-xs font-bold disabled:opacity-40 transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-rose-500 text-xs font-medium mt-2">{couponError}</p>
              )}

              {/* Available Coupons List */}
              {!couponApplied && availableCoupons.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {availableCoupons.map((coupon) => (
                    <div 
                      key={coupon.id} 
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between text-left"
                    >
                      <div>
                        <span className="inline-block bg-[#f4f9f7] text-[#157a6d] dark:text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#157a6d]/20 mb-1">
                          {coupon.code}
                        </span>
                        <p className="font-bold text-xs text-[#172b26] dark:text-white leading-tight">
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
                        className="bg-[#f4f9f7] text-[#157a6d] hover:bg-[#157a6d] hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer select-none border border-[#157a6d]/20"
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
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-[#172b26] dark:text-zinc-100">{formatCurrency(subtotal)}</span>
              </div>
              
              {couponApplied && discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-[#157a6d] dark:text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                <span>Shipping {subtotal >= 499 && subtotal > 0 ? "(Free > ₹499)" : ""}</span>
                <span className="text-[#172b26] dark:text-zinc-100 font-medium">
                  {activeShipping === 0 ? "FREE" : formatCurrency(activeShipping)}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-zinc-400 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <span>GST (12%)</span>
                <span className="text-[#172b26] dark:text-zinc-100 font-medium">{formatCurrency(tax)}</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-[#172b26] dark:text-white">Final Total</span>
                <span className="text-xl font-bold text-[#157a6d] dark:text-emerald-400 tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="p-6 pt-0">
              {orderError && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{orderError}</span>
                </div>
              )}
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
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs ${
                  requiresRx && rxStatus === "Pending Verification"
                    ? "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                    : requiresRx && rxStatus === "Rejected"
                    ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-[0.98]"
                    : "bg-[#157a6d] hover:bg-[#0f5c52] text-white cursor-pointer active:scale-[0.98]"
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

      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />
      </div>
    </div>
  );
};

export default Checkout;

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutAuthGate (Google Authentication Gate)
// ─────────────────────────────────────────────────────────────────────────────
const CheckoutAuthGate = () => {
  const { loginWithGoogle, updateProfile } = useAuth();
  const [step, setStep] = useState("auth"); // auth | complete_profile
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSuccess = async (credential) => {
    setErrorMsg("");
    try {
      const res = await loginWithGoogle(credential);
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep("complete_profile");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Google authentication failed. Please try again.");
    }
  };

  const handleProfileCompleteSubmit = async ({ mobile }) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await updateProfile({ mobile });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800 px-6 py-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#3f257a]/10 text-[#3f257a] dark:text-[#a4c9ff]">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Authentication Required</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Continue with Google to complete your checkout.</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Cart preview pill */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 rounded-lg px-4 py-2.5 border border-slate-200/50 dark:border-zinc-800/50">
              <ShieldCheck size={16} className="text-[#038076] dark:text-[#84d6b9]" />
              <span>Your cart is securely saved and will not be cleared.</span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {step === "auth" && (
              <div className="pt-2">
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={(err) => setErrorMsg(err)}
                  isLoading={isSubmitting}
                />
              </div>
            )}

            {step === "complete_profile" && (
              <CompleteProfileModal
                onSubmit={handleProfileCompleteSubmit}
                isLoading={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};