import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Building,
  ArrowRight,
  ArrowLeft,
  Zap,
  Truck,
  User,
  Phone,
  Bookmark,
  Check,
  Sparkles,
} from "lucide-react";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../hooks/useAuth";
import { useAddress } from "../../context/AddressContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

export const LocationSelectorModal = () => {
  const {
    selectedLocation,
    isLocationModalOpen,
    closeLocationModal,
    setLocation,
    detectGPSLocation,
    validatePincode,
    detectingLocation,
    locationError,
    setLocationError,
    pendingDetectedAddress,
    setPendingDetectedAddress,
  } = useLocationContext();

  const { user, openLoginModal } = useAuth();
  const { addresses, addAddress, selectAddress } = useAddress();

  // Mode: "select" | "confirm"
  const [modalMode, setModalMode] = useState("select");

  // Manual Pincode Form State
  const [pincodeInput, setPincodeInput] = useState("");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Address Confirmation Form State
  const [confirmForm, setConfirmForm] = useState({
    fullName: "",
    mobile: "",
    altMobile: "",
    houseNo: "",
    building: "",
    street: "",
    landmark: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    type: "Home",
    deliveryInstructions: "",
    isDefault: false,
    latitude: null,
    longitude: null,
    placeId: "",
    formattedAddress: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Reset states when modal is closed or opened
  useEffect(() => {
    if (!isLocationModalOpen) {
      setModalMode("select");
      setPincodeStatus(null);
      setPincodeInput("");
      setFormErrors({});
      setIsSavingAddress(false);
    }
  }, [isLocationModalOpen]);

  if (!isLocationModalOpen) return null;

  // Handle Manual 6-digit Pincode Check
  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    const cleanPin = String(pincodeInput || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPincodeStatus({
        success: false,
        deliverable: false,
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
      return;
    }

    setCheckingPincode(true);
    setPincodeStatus(null);
    setLocationError("");

    try {
      const res = await validatePincode(cleanPin);
      if (res && res.success && res.deliverable) {
        setPincodeStatus({
          success: true,
          deliverable: true,
          message: res.message || `✓ We deliver to ${cleanPin}`,
          location: res,
        });

        setTimeout(() => {
          setLocation(res);
          closeLocationModal();
          setPincodeStatus(null);
          setPincodeInput("");
        }, 400);
      } else {
        setPincodeStatus({
          success: false,
          deliverable: false,
          message: res?.message || "Sorry, we currently don't deliver to this location.",
        });
      }
    } catch (err) {
      setPincodeStatus({
        success: false,
        deliverable: false,
        message: err.message || "Failed to verify pincode. Please try again.",
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  // Handle GPS "Use current location" Click -> Transition to "confirm" mode
  const handleDetectGPS = async () => {
    setPincodeStatus(null);
    setLocationError("");
    const res = await detectGPSLocation();
    if (res && res.success && res.location) {
      const loc = res.location;
      setConfirmForm({
        fullName: user?.name || "",
        mobile: user?.mobile || user?.phone || "",
        altMobile: "",
        houseNo: loc.houseNo || "",
        building: loc.building || loc.street || "",
        street: loc.street || "",
        landmark: loc.landmark || "",
        city: loc.city || "Pune",
        state: loc.state || "Maharashtra",
        pincode: loc.pincode || "",
        type: "Home",
        deliveryInstructions: "",
        isDefault: addresses && addresses.length === 0,
        latitude: loc.latitude || null,
        longitude: loc.longitude || null,
        placeId: loc.placeId || "",
        formattedAddress: loc.formattedAddress || "",
      });
      setModalMode("confirm");
    }
  };

  // Select Saved Address
  const handleSelectSavedAddress = (addr) => {
    if (selectAddress) {
      selectAddress(addr._id || addr.id);
    }
    const isPune = (addr.pincode && (addr.pincode.startsWith("411") || addr.pincode.startsWith("412"))) ||
                   (addr.city && addr.city.toLowerCase().includes("pune"));

    const displayLocality = addr.street || addr.landmark || addr.city || (isPune ? "Pune" : "");

    const loc = {
      pincode: addr.pincode || "",
      locality: displayLocality,
      city: addr.city || (isPune ? "Pune" : ""),
      state: addr.state || (isPune ? "Maharashtra" : ""),
      country: addr.country || "India",
      displayText: addr.pincode ? `${addr.pincode}, ${displayLocality}` : displayLocality,
      deliverable: true,
      isPune,
      estimatedDelivery: isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)",
      formattedAddress: addr.formattedAddress || `${addr.houseNo ? addr.houseNo + ", " : ""}${addr.street ? addr.street + ", " : ""}${addr.city}`,
    };

    setLocation(loc);
    closeLocationModal();
  };

  // Validate Confirmation Form
  const validateAddressForm = () => {
    const errs = {};
    if (!confirmForm.fullName.trim()) errs.fullName = "Full name is required";
    if (!confirmForm.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(confirmForm.mobile.trim())) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!confirmForm.houseNo.trim()) errs.houseNo = "Flat / House No is required";
    if (!confirmForm.building.trim()) errs.building = "Building / Society name is required";
    if (!confirmForm.street.trim()) errs.street = "Street / Area is required";
    if (!confirmForm.city.trim()) errs.city = "City is required";
    if (!confirmForm.state.trim()) errs.state = "State is required";
    if (!confirmForm.pincode.trim()) {
      errs.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(confirmForm.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit PIN code";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Confirmed Address Submission
  const handleConfirmAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setIsSavingAddress(true);
    const isPune = confirmForm.pincode.startsWith("411") || confirmForm.pincode.startsWith("412") ||
                   confirmForm.city.toLowerCase().includes("pune");

    const fullFormatted = [
      confirmForm.houseNo,
      confirmForm.building,
      confirmForm.street,
      confirmForm.landmark ? `Near ${confirmForm.landmark}` : null,
      `${confirmForm.city}, ${confirmForm.state} - ${confirmForm.pincode}`,
      "India",
    ].filter(Boolean).join(", ");

    const cleanAddressData = {
      fullName: confirmForm.fullName.trim(),
      mobile: confirmForm.mobile.trim(),
      altMobile: confirmForm.altMobile.trim(),
      houseNo: confirmForm.houseNo.trim(),
      building: confirmForm.building.trim(),
      street: confirmForm.street.trim(),
      landmark: confirmForm.landmark.trim(),
      city: confirmForm.city.trim(),
      state: confirmForm.state.trim(),
      country: "India",
      pincode: confirmForm.pincode.trim(),
      type: confirmForm.type || "Home",
      deliveryInstructions: confirmForm.deliveryInstructions.trim(),
      isDefault: Boolean(confirmForm.isDefault),
      latitude: confirmForm.latitude,
      longitude: confirmForm.longitude,
      placeId: confirmForm.placeId,
      formattedAddress: fullFormatted,
    };

    const displayLocality = cleanAddressData.street || cleanAddressData.building || cleanAddressData.city;

    const loc = {
      pincode: cleanAddressData.pincode,
      locality: displayLocality,
      city: cleanAddressData.city,
      state: cleanAddressData.state,
      country: "India",
      displayText: `${cleanAddressData.pincode}, ${displayLocality}`,
      deliverable: true,
      isPune,
      estimatedDelivery: isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)",
      formattedAddress: fullFormatted,
    };

    try {
      if (user) {
        // Save to Database via AddressContext
        const saved = await addAddress(cleanAddressData);
        if (saved && selectAddress) {
          selectAddress(saved._id || saved.id);
        }
      } else {
        // Guest user: Cache temporarily in localStorage
        try {
          localStorage.setItem("wellmeds_guest_address", JSON.stringify(cleanAddressData));
        } catch (e) {}
      }

      setLocation(loc);
      closeLocationModal();
    } catch (err) {
      console.error("Failed to save confirmed address:", err);
      setLocationError(err.message || "Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
      case "home":
        return <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "Work":
      case "work":
        return <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 w-full max-w-[460px] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {modalMode === "confirm" ? (
              <button
                type="button"
                onClick={() => setModalMode("select")}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                aria-label="Back to location options"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 id="location-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {modalMode === "confirm" ? "Confirm Delivery Address" : "Choose your location"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {modalMode === "confirm"
                  ? "Enter flat & contact details for delivery"
                  : "Select your delivery location for accurate delivery times"}
              </p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close location modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">

          {/* ========================================================================= */}
          {/* MODE 1: LOCATION SELECTION (Pincode, GPS Trigger, Saved Addresses)         */}
          {/* ========================================================================= */}
          {modalMode === "select" && (
            <>
              {/* Current Selection Banner */}
              {selectedLocation?.displayText && (
                <div className="bg-[#edf7f2] dark:bg-[#122822] border border-[#c3e6d6] dark:border-[#1d3d34] rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#038076] dark:text-[#84d6b9] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Current Location
                      </span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {selectedLocation.displayText}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    {selectedLocation.estimatedDelivery || "⚡ Express"}
                  </span>
                </div>
              )}

              {/* Manual Pincode Input Form */}
              <div>
                <label htmlFor="pincode-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Enter pincode
                </label>
                <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="pincode-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPincodeInput(val);
                        if (pincodeStatus) setPincodeStatus(null);
                      }}
                      placeholder="Enter 6-digit pincode (e.g. 411021)"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#038076] focus:ring-2 focus:ring-[#038076]/20 transition-all shadow-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={checkingPincode || pincodeInput.trim().length !== 6}
                    className="h-11 px-4 rounded-xl bg-[#038076] hover:bg-[#02635c] active:bg-[#014d47] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    {checkingPincode ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </form>

                {pincodeStatus && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      pincodeStatus.deliverable
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                    }`}
                  >
                    {pincodeStatus.deliverable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{pincodeStatus.message}</span>
                  </div>
                )}
              </div>

              {/* GPS Auto-Detect Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={detectingLocation}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-teal-50/50 hover:border-[#038076]/40 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-[#038076] dark:bg-teal-950/80 dark:text-[#84d6b9] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {detectingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 fill-current" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {detectingLocation ? "Detecting your location..." : "Use current location"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {detectingLocation ? "Requesting browser GPS permission..." : "Using browser GPS detection"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#038076] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {locationError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span className="bg-white dark:bg-zinc-950 px-2">OR</span>
                </div>
              </div>

              {/* Option 3: Saved Addresses or Login Card */}
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Saved Addresses
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {addresses?.length || 0} saved
                    </span>
                  </div>

                  {addresses && addresses.length > 0 ? (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-0.5">
                      {addresses.map((addr) => {
                        const isSelected = selectedLocation?.pincode === addr.pincode;
                        return (
                          <button
                            key={addr._id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#038076] bg-[#edf7f2] dark:bg-[#122822] text-[#038076] dark:text-[#84d6b9]"
                                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-55 dark:bg-zinc-900/60"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {getAddressIcon(addr.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                                  {addr.type || "Address"}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-bold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                                {addr.houseNo ? `${addr.houseNo}, ` : ""}
                                {addr.street ? `${addr.street}, ` : ""}
                                {addr.city} {addr.pincode}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#038076] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic py-1">
                      No saved addresses found. Addresses saved during checkout will appear here.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeLocationModal();
                    if (openLoginModal) openLoginModal();
                  }}
                  className="w-full p-3 rounded-xl border border-dashed border-[#038076]/40 bg-[#edf7f2]/50 hover:bg-[#edf7f2] dark:bg-[#122822]/40 dark:hover:bg-[#122822] text-[#038076] dark:text-[#84d6b9] flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Login to view saved addresses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: CONFIRM & COMPLETE DETECTED GPS ADDRESS                            */}
          {/* ========================================================================= */}
          {modalMode === "confirm" && (
            <form onSubmit={handleConfirmAddressSubmit} className="space-y-3">
              {/* Detected Location Highlight Card */}
              <div className="bg-[#edf7f2] dark:bg-[#122822] border border-[#c3e6d6] dark:border-[#1d3d34] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#038076] dark:text-[#84d6b9]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GPS Location Detected</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {confirmForm.pincode.startsWith("411") ? "⚡ 1 Day in Pune" : "🚚 2–4 Days"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {confirmForm.street ? `${confirmForm.street}, ` : ""}{confirmForm.city}, {confirmForm.state} - {confirmForm.pincode}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Please add your flat / house number and recipient contact to complete this address.
                </p>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={confirmForm.fullName}
                    onChange={(e) => {
                      setConfirmForm({ ...confirmForm, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-xl border ${
                      formErrors.fullName ? "border-red-500" : "border-slate-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 inset-y-0 flex items-center pointer-events-none text-xs font-bold text-slate-400 select-none leading-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={confirmForm.mobile}
                      onChange={(e) => {
                        setConfirmForm({ ...confirmForm, mobile: e.target.value.replace(/\D/g, "") });
                        if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: undefined });
                      }}
                      className={`w-full h-10 pl-11 pr-3 rounded-xl border ${
                        formErrors.mobile ? "border-red-500" : "border-slate-300 dark:border-zinc-700"
                      } bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]`}
                    />
                  </div>
                  {formErrors.mobile && (
                    <p className="text-[10px] text-red-500 mt-0.5">{formErrors.mobile}</p>
                  )}
                </div>
              </div>

              {/* Flat No & Building */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Flat / House No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 304, A-Wing"
                    value={confirmForm.houseNo}
                    onChange={(e) => {
                      setConfirmForm({ ...confirmForm, houseNo: e.target.value });
                      if (formErrors.houseNo) setFormErrors({ ...formErrors, houseNo: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-xl border ${
                      formErrors.houseNo ? "border-red-500" : "border-slate-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]`}
                  />
                  {formErrors.houseNo && (
                    <p className="text-[10px] text-red-500 mt-0.5">{formErrors.houseNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Building / Society <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Society"
                    value={confirmForm.building}
                    onChange={(e) => {
                      setConfirmForm({ ...confirmForm, building: e.target.value });
                      if (formErrors.building) setFormErrors({ ...formErrors, building: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-xl border ${
                      formErrors.building ? "border-red-500" : "border-slate-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]`}
                  />
                  {formErrors.building && (
                    <p className="text-[10px] text-red-500 mt-0.5">{formErrors.building}</p>
                  )}
                </div>
              </div>

              {/* Street & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Street / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baner Road"
                    value={confirmForm.street}
                    onChange={(e) => {
                      setConfirmForm({ ...confirmForm, street: e.target.value });
                      if (formErrors.street) setFormErrors({ ...formErrors, street: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-xl border ${
                      formErrors.street ? "border-red-500" : "border-slate-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]`}
                  />
                  {formErrors.street && (
                    <p className="text-[10px] text-red-500 mt-0.5">{formErrors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Big Bazaar"
                    value={confirmForm.landmark}
                    onChange={(e) => setConfirmForm({ ...confirmForm, landmark: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]"
                  />
                </div>
              </div>

              {/* City, State, PIN Code */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={confirmForm.city}
                    onChange={(e) => setConfirmForm({ ...confirmForm, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <select
                    value={confirmForm.state}
                    onChange={(e) => setConfirmForm({ ...confirmForm, state: e.target.value })}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={confirmForm.pincode}
                    onChange={(e) => setConfirmForm({ ...confirmForm, pincode: e.target.value.replace(/\D/g, "") })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Address Type Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Save Address As
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "Home", label: "Home", icon: Home },
                    { id: "Work", label: "Work", icon: Briefcase },
                    { id: "Other", label: "Other", icon: Bookmark },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = confirmForm.type === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setConfirmForm({ ...confirmForm, type: item.id })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#038076] text-white border-[#038076] shadow-sm"
                            : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={13} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Address Toggle */}
              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Set as Default Address</p>
                  <p className="text-[10px] text-slate-400">Pre-selects this address during checkout</p>
                </div>
                <input
                  type="checkbox"
                  checked={confirmForm.isDefault}
                  onChange={(e) => setConfirmForm({ ...confirmForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#038076] rounded cursor-pointer"
                />
              </label>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode("select")}
                  disabled={isSavingAddress}
                  className="w-1/3 h-11 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-2/3 h-11 rounded-xl bg-[#038076] hover:bg-[#02635c] active:bg-[#014d47] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>1 Day Delivery in Pune</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span>Pan-India Express Dispatch</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationSelectorModal;
