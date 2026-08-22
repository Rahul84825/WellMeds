import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Clock,
  Navigation,
  Copy,
  Check,
  Store,
} from "lucide-react";
import { useLocationContext } from "../context/LocationContext";
import BUSINESS_INFO from "../config/businessInfo";

// Exact Official Google Maps Directions Link provided for WellMeds Pharmacy Baner
const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/dir//Wellmeds+Pharmacy+Baner+Pashan+Balewadi+Aundh+Pune+%E2%80%93+Medicines,+Supplements+%26+Home+Delivery,+Wellmeds+Shop+No+3,+Echelon+Apartment,+Baner+-+Pashan+Link+Rd,+Baner,+Pune,+Maharashtra+411021/@18.6501265,73.7830858,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bc2bffd675bf687:0x866871240c185cd7!2m2!1d73.7931374!2d18.5519701?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D";

// Exact Verified Coordinates of WellMeds Pharmacy Physical Store (from Google Maps listing)
const STORE_COORDINATES = {
  lat: 18.5519701,
  lng: 73.7931374,
};

// Offline physical store configuration
const OFFLINE_STORE_DETAILS = {
  id: "wellmeds-physical-store",
  name: "WellMeds Pharmacy",
  address:
    BUSINESS_INFO?.address?.formatted ||
    "Shop Number 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021",
  shortAddress:
    BUSINESS_INFO?.address?.shortFormatted ||
    "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune",
  phone: "7798795353",
  displayPhone: "7798795353",
  hours: "08:00 AM - 11:00 PM",
  openHour: 8,
  closeHour: 23,
};

// High-precision Haversine formula to compute great-circle distance in KM
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm;
};

// Formats the distance into readable user-friendly string
const formatDistanceString = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return null;
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

// Check if store is currently open based on user's current local time
const checkIsStoreOpen = (openHour, closeHour) => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return currentHour >= openHour && currentHour < closeHour;
};

const PharmaciesNearYou = () => {
  const { selectedLocation } = useLocationContext();

  const [copiedId, setCopiedId] = useState(null);
  const [deviceCoords, setDeviceCoords] = useState(null);

  // Attempt seamless silent GPS lookup if user coordinates aren't in context yet
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      setDeviceCoords({
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude,
      });
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos?.coords) {
            setDeviceCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {
          // Graceful ignore if permission denied or unavailable
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude]);

  // Compute live distance using verified store coordinates
  const distanceBadgeText = useMemo(() => {
    const userLat = deviceCoords?.lat || selectedLocation?.latitude;
    const userLng = deviceCoords?.lng || selectedLocation?.longitude;

    if (userLat && userLng) {
      const rawDistance = calculateHaversineDistance(
        userLat,
        userLng,
        STORE_COORDINATES.lat,
        STORE_COORDINATES.lng
      );
      return formatDistanceString(rawDistance);
    }

    // If device coordinates not available, show clean location badge instead of a fake number
    return null;
  }, [deviceCoords, selectedLocation?.latitude, selectedLocation?.longitude]);

  const isStoreOpen = useMemo(() => {
    return checkIsStoreOpen(
      OFFLINE_STORE_DETAILS.openHour,
      OFFLINE_STORE_DETAILS.closeHour
    );
  }, []);

  const handleCopyPhone = (phoneNumber, e) => {
    e.stopPropagation();
    try {
      navigator.clipboard?.writeText(phoneNumber);
      setCopiedId("phone");
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.warn("Failed to copy phone number", err);
    }
  };

  const handleOpenDirections = () => {
    window.open(GOOGLE_MAPS_DIRECTIONS_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-10 md:py-14 w-full bg-white dark:bg-zinc-950 border-t border-[#dde8e3] dark:border-zinc-900 transition-colors">
      <div className="home-section-container">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="hidden sm:flex font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] dark:text-emerald-400 uppercase mb-1.5 items-center gap-2">
            <Store className="w-3.5 h-3.5" />
            <span>OUR PHYSICAL PRESENCE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#157a6d] dark:bg-emerald-400" />
            <span>OFFLINE STORE</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
            Pharmacies Near You
          </h2>
        </div>

        {/* Store Card Display */}
        <div className="flex flex-wrap gap-5 items-stretch">
          <div className="w-full sm:w-[380px] md:w-[410px] max-w-full">
            <div className="h-full bg-white dark:bg-zinc-900/90 rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none hover:border-[#157a6d]/40 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-200 group">
              {/* Card Top: Store Name & Live Distance */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug m-0">
                    {OFFLINE_STORE_DETAILS.name}
                  </h3>

                  {/* Dynamic Distance Badge (Calculated in real-time from user GPS coordinates) */}
                  {distanceBadgeText && (
                    <span className="shrink-0 text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-200 font-sans tracking-tight bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {distanceBadgeText}
                    </span>
                  )}
                </div>

                {/* Address Row */}
                <div className="flex items-start gap-2.5 mb-3.5 text-left">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-zinc-500 mt-0.5 shrink-0 group-hover:text-[#157a6d] dark:group-hover:text-emerald-400 transition-colors" />
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {OFFLINE_STORE_DETAILS.address}
                  </p>
                </div>

                {/* Timings & Live Status Row */}
                <div className="flex items-center gap-2 mb-4 text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400">
                  <Clock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    {OFFLINE_STORE_DETAILS.hours}
                  </span>
                  {isStoreOpen ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full text-xs border border-emerald-200/60 dark:border-emerald-800/40 ml-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Open Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full text-xs border border-amber-200/60 dark:border-amber-800/40 ml-auto">
                      Closed Now
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom: Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Get Directions Button (Targeting verified Google Maps link) */}
                  <button
                    type="button"
                    onClick={handleOpenDirections}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-zinc-200 hover:border-[#157a6d] hover:bg-[#157a6d] hover:text-white dark:hover:bg-emerald-600 dark:hover:border-emerald-600 transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <Navigation className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Get Directions</span>
                  </button>

                  {/* Phone Number / Copy Button */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleCopyPhone(OFFLINE_STORE_DETAILS.phone, e)
                    }
                    title="Click to copy phone number"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-700/80 transition-all duration-150 cursor-pointer active:scale-[0.98]"
                  >
                    {copiedId === "phone" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-[scale-in_0.2s_ease-out]" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Copied!
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="truncate font-mono">
                          {OFFLINE_STORE_DETAILS.displayPhone}
                        </span>
                        <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(PharmaciesNearYou);
