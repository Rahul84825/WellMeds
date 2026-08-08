import React, { useState, useEffect } from "react";
import { X, MapPin, Navigation, Loader2, ChevronRight, Home, Briefcase, Building } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAddress } from "../../context/AddressContext";
import { getUserCurrentPosition, reverseGeocodeCoordinates } from "../../services/googleMapsService";

export const calculateDeliveryDates = (pincode, city) => {
  const today = new Date();
  let startOffset = 1;
  let endOffset = 2;

  const pinStr = String(pincode || "").trim();
  if (pinStr.startsWith("411") || pinStr.startsWith("412") || (city && city.toLowerCase().includes("pune"))) {
    startOffset = 0;
    endOffset = 1;
  } else if (pinStr.startsWith("400") || pinStr.startsWith("421") || (city && city.toLowerCase().includes("mumbai"))) {
    startOffset = 1;
    endOffset = 2;
  } else {
    startOffset = 2;
    endOffset = 4;
  }

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + startOffset);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + endOffset);

  const formatShort = (d) => {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return `${formatShort(startDate)} - ${formatShort(endDate)}`;
};

const ProductDeliveryModal = ({ isOpen, onClose, onSelectLocation, currentLocation }) => {
  const { user, openLoginModal } = useAuth();
  const { addresses } = useAddress();
  const [pincodeInput, setPincodeInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentLocation?.pincode) {
      setPincodeInput(currentLocation.pincode);
    }
  }, [currentLocation]);

  if (!isOpen) return null;

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length < 6) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code");
      return;
    }
    setErrorMsg("");
    setChecking(true);

    setTimeout(() => {
      onSelectLocation({
        pincode: pincodeInput.trim(),
        city: "",
        displayText: pincodeInput.trim(),
      });
      setChecking(false);
      onClose();
    }, 300);
  };

  const handleDetectGPS = async () => {
    setLocating(true);
    setErrorMsg("");
    try {
      const pos = await getUserCurrentPosition();
      const geocoded = await reverseGeocodeCoordinates(pos.latitude, pos.longitude);
      if (geocoded && geocoded.pincode) {
        onSelectLocation({
          pincode: geocoded.pincode,
          city: geocoded.city || "Detected City",
          displayText: `${geocoded.city || "City"}, ${geocoded.pincode}`,
        });
        onClose();
      } else {
        setErrorMsg("Could not resolve pincode from your GPS position. Please type manually.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to detect device location");
    } finally {
      setLocating(false);
    }
  };

  const handleSelectSavedAddress = (addr) => {
    onSelectLocation({
      pincode: addr.pincode,
      city: addr.city,
      displayText: `${addr.city || "City"}, ${addr.pincode}`,
      addressLabel: addr.type || "Saved Address",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative animate-[scale-in_0.15s_ease-out]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Where do you want the delivery?
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Get access to your Addresses, Orders, and Wishlist
          </p>
        </div>

        {/* BEFORE LOGIN: Sign In Action Button */}
        {!user && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                openLoginModal();
              }}
              className="w-full bg-[#157a6d] hover:bg-[#0f5c52] text-white font-bold text-xs sm:text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Sign in to see your location
            </button>
          </div>
        )}

        {/* AFTER LOGIN: Saved Addresses List */}
        {user && addresses && addresses.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Your Saved Delivery Addresses
            </p>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <button
                  type="button"
                  key={addr._id || addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-[#157a6d] dark:hover:border-emerald-400 bg-slate-50/50 dark:bg-zinc-800/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 truncate">
                    {addr.type === "Home" ? (
                      <Home size={16} className="text-[#157a6d] mt-0.5 shrink-0" />
                    ) : addr.type === "Work" ? (
                      <Briefcase size={16} className="text-[#157a6d] mt-0.5 shrink-0" />
                    ) : (
                      <Building size={16} className="text-[#157a6d] mt-0.5 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{addr.type || "Address"}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({addr.pincode})</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {addr.houseNo ? `${addr.houseNo}, ` : ""}{addr.street || addr.city}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-[#157a6d] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative border-t border-slate-200 dark:border-zinc-800 my-3">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 px-3 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
            Or Enter Pincode
          </span>
        </div>

        {/* Pincode Input Form */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Select pincode to see product availability
          </p>

          <form onSubmit={handlePincodeSubmit} className="relative flex items-center">
            <MapPin size={16} className="absolute left-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter Pincode"
              className="w-full pl-10 pr-20 py-2.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
            />
            <button
              type="submit"
              disabled={checking || pincodeInput.trim().length < 6}
              className="absolute right-2 px-3 py-1 bg-[#157a6d] hover:bg-[#0f5c52] text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-all cursor-pointer"
            >
              {checking ? <Loader2 size={13} className="animate-spin" /> : "Check"}
            </button>
          </form>
        </div>



        {/* Error Feedback */}
        {errorMsg && (
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDeliveryModal;
