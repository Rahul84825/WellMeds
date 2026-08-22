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
  Zap,
  Truck,
} from "lucide-react";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../hooks/useAuth";
import { useAddress } from "../../context/AddressContext";

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
  } = useLocationContext();

  const { user, openLoginModal } = useAuth();
  const { addresses, selectAddress } = useAddress();

  // Manual Pincode Form State
  const [pincodeInput, setPincodeInput] = useState("");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Reset states when modal is closed or opened
  useEffect(() => {
    if (!isLocationModalOpen) {
      setPincodeStatus(null);
      setPincodeInput("");
      setLocationError("");
    }
  }, [isLocationModalOpen, setLocationError]);

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

  // Handle GPS "Use current location" Click -> Direct Location Update (No extra forms)
  const handleDetectGPS = async () => {
    setPincodeStatus(null);
    setLocationError("");
    const res = await detectGPSLocation();
    if (res && res.success && res.location) {
      const loc = res.location;
      setLocation(loc);
      closeLocationModal();
    }
  };

  // Select Saved Address
  const handleSelectSavedAddress = (addr) => {
    if (selectAddress) {
      selectAddress(addr._id || addr.id);
    }
    const isPune = (addr.pincode && (addr.pincode.startsWith("411") || addr.pincode.startsWith("412"))) ||
                   (addr.city && addr.city.toLowerCase().includes("pune"));

    const cityDisplay = isPune ? "Pune" : (addr.city || addr.state || "India");

    const loc = {
      pincode: addr.pincode || "",
      locality: addr.street || addr.landmark || addr.city || cityDisplay,
      city: addr.city || (isPune ? "Pune" : ""),
      state: addr.state || (isPune ? "Maharashtra" : ""),
      country: addr.country || "India",
      displayText: addr.pincode ? `${addr.pincode}, ${cityDisplay}` : cityDisplay,
      deliverable: true,
      isPune,
      estimatedDelivery: isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)",
      formattedAddress: addr.formattedAddress || `${addr.houseNo ? addr.houseNo + ", " : ""}${addr.street ? addr.street + ", " : ""}${addr.city}`,
    };

    setLocation(loc);
    closeLocationModal();
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
            <div className="w-8 h-8 rounded-full bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 id="location-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Choose your location
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Select your delivery location for accurate delivery times
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
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-900/60"
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
