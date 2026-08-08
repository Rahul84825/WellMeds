import React, { useState, useEffect } from "react";
import ProductDeliveryModal, { calculateDeliveryDates } from "./ProductDeliveryCheck";
import { ChevronDown, Calendar } from "lucide-react";
import { useAddress } from "../../context/AddressContext";

const DeliveryCard = () => {
  const { selectedAddress } = useAddress();
  const [modalOpen, setModalOpen] = useState(false);
  const [locationState, setLocationState] = useState(() => {
    const saved = localStorage.getItem("wellmeds_delivery_location");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      pincode: "600017",
      city: "Chennai",
      displayText: "Chennai, 600017",
    };
  });

  // Sync with user's selected address if available
  useEffect(() => {
    if (selectedAddress && selectedAddress.pincode) {
      const updated = {
        pincode: selectedAddress.pincode,
        city: selectedAddress.city || "Pune",
        displayText: `${selectedAddress.city || "Pune"}, ${selectedAddress.pincode}`,
      };
      setLocationState(updated);
      localStorage.setItem("wellmeds_delivery_location", JSON.stringify(updated));
    }
  }, [selectedAddress]);

  const handleSelectLocation = (loc) => {
    const updated = {
      pincode: loc.pincode,
      city: loc.city || "",
      displayText: loc.displayText || loc.pincode,
    };
    setLocationState(updated);
    localStorage.setItem("wellmeds_delivery_location", JSON.stringify(updated));
  };

  const datesText = calculateDeliveryDates(locationState.pincode, locationState.city);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="pdp-paper-card p-3.5 flex items-center justify-between text-left font-sans select-none border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-[#157a6d] dark:hover:border-emerald-400 transition-all cursor-pointer group shadow-xs h-full"
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-full bg-[#157a6d]/10 dark:bg-emerald-950/50 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="truncate">
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate flex items-center gap-1">
              <span>Delivering to:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-100 group-hover:text-[#157a6d] transition-colors">
                {locationState.displayText}
              </span>
              <ChevronDown size={13} className="text-slate-500 group-hover:text-[#157a6d] shrink-0" />
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-snug font-semibold truncate">
              Delivery by: <span className="font-bold text-[#157a6d] dark:text-emerald-300">{datesText}</span>
            </p>
          </div>
        </div>
      </div>

      <ProductDeliveryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={locationState}
      />
    </>
  );
};

export default DeliveryCard;
