import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getUserCurrentPosition,
  reverseGeocodeCoordinates,
  checkPincodeValidation,
} from "../services/googleMapsService";

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  pincode: "411021",
  city: "Pune",
  state: "Maharashtra",
  country: "India",
  displayText: "411021, Pune",
  deliverable: true,
  isPune: true,
  estimatedDelivery: "⚡ 1 Day (Express in Pune)",
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("wellmeds_delivery_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.pincode || parsed.city || parsed.state || parsed.name || parsed.displayText)) {
          const isPune = Boolean(
            parsed.isPune ||
            (parsed.pincode && (parsed.pincode.startsWith("411") || parsed.pincode.startsWith("412"))) ||
            (parsed.city && parsed.city.toLowerCase().includes("pune")) ||
            (parsed.district && parsed.district.toLowerCase().includes("pune")) ||
            (parsed.displayText && parsed.displayText.toLowerCase().includes("pune")) ||
            (parsed.name === "Pune")
          );

          const cityOrDistrict = isPune ? "Pune" : (parsed.district || parsed.city || parsed.state || "India");
          const cleanDisplayText = parsed.pincode
            ? `${parsed.pincode}, ${cityOrDistrict}`
            : (parsed.displayText || cityOrDistrict);

          return {
            pincode: parsed.pincode || (isPune ? "411021" : ""),
            city: parsed.city || (isPune ? "Pune" : ""),
            district: parsed.district || (isPune ? "Pune" : ""),
            state: parsed.state || (isPune ? "Maharashtra" : ""),
            country: parsed.country || "India",
            displayText: cleanDisplayText,
            deliverable: parsed.deliverable !== undefined ? parsed.deliverable : true,
            isPune,
            estimatedDelivery: parsed.estimatedDelivery || (isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)"),
          };
        }
      }
    } catch (e) {
      console.warn("Failed to parse saved location from localStorage:", e);
    }
    return DEFAULT_LOCATION;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const openLocationModal = useCallback(() => {
    setLocationError("");
    setIsLocationModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
    setLocationError("");
  }, []);

  const setLocation = useCallback((loc) => {
    if (!loc) return;
    const isPune = Boolean(
      loc.isPune ||
      (loc.pincode && (loc.pincode.startsWith("411") || loc.pincode.startsWith("412"))) ||
      (loc.city && loc.city.toLowerCase().includes("pune")) ||
      (loc.district && loc.district.toLowerCase().includes("pune")) ||
      (loc.locality && loc.locality.toLowerCase().includes("pune")) ||
      (loc.displayText && loc.displayText.toLowerCase().includes("pune")) ||
      (loc.name && loc.name.toLowerCase().includes("pune"))
    );

    const cityOrDistrict = isPune ? "Pune" : (loc.district || loc.city || loc.state || "India");
    const displayText = loc.pincode ? `${loc.pincode}, ${cityOrDistrict}` : (loc.displayText || cityOrDistrict);

    const formattedLocation = {
      pincode: loc.pincode || "",
      locality: loc.locality || cityOrDistrict,
      city: isPune ? "Pune" : (loc.city || loc.district || ""),
      district: loc.district || (isPune ? "Pune" : ""),
      state: loc.state || (isPune ? "Maharashtra" : ""),
      country: loc.country || "India",
      displayText,
      deliverable: loc.deliverable !== undefined ? loc.deliverable : true,
      isPune,
      estimatedDelivery: loc.estimatedDelivery || (isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)"),
      formattedAddress: loc.formattedAddress || "",
    };

    setSelectedLocation(formattedLocation);

    try {
      localStorage.setItem("wellmeds_delivery_location", JSON.stringify(formattedLocation));
      localStorage.setItem("wellmeds_location", formattedLocation.locality || formattedLocation.city || "Pune");
    } catch (e) {
      console.warn("Failed to persist location to localStorage:", e);
    }

    window.dispatchEvent(
      new CustomEvent("wellmeds_location_changed", { detail: formattedLocation })
    );
  }, []);

  // Listen to external custom events
  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail && e.detail.displayText !== selectedLocation.displayText) {
        setSelectedLocation(e.detail);
      }
    };
    window.addEventListener("wellmeds_location_changed", handleLocationChange);
    return () => window.removeEventListener("wellmeds_location_changed", handleLocationChange);
  }, [selectedLocation.displayText]);

  const [pendingDetectedAddress, setPendingDetectedAddress] = useState(null);

  // GPS Detection Action
  const detectGPSLocation = useCallback(async () => {
    setDetectingLocation(true);
    setLocationError("");
    try {
      const position = await getUserCurrentPosition();
      const geocoded = await reverseGeocodeCoordinates(
        position.latitude,
        position.longitude
      );

      if (geocoded && (geocoded.pincode || geocoded.city || geocoded.formattedAddress)) {
        setPendingDetectedAddress(geocoded);
        setDetectingLocation(false);
        return { success: true, location: geocoded };
      } else {
        const msg = "Could not resolve address from GPS coordinates. Please enter pincode manually.";
        setLocationError(msg);
        setDetectingLocation(false);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || "Failed to detect device location.";
      setLocationError(msg);
      setDetectingLocation(false);
      return { success: false, message: msg };
    }
  }, []);

  // Manual Pincode Validation Action
  const validatePincode = useCallback(async (pincode) => {
    setLocationError("");
    try {
      const res = await checkPincodeValidation(pincode);
      return res;
    } catch (err) {
      const msg = err.message || "Failed to validate pincode.";
      setLocationError(msg);
      return { success: false, deliverable: false, message: msg };
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        setLocation,
        detectGPSLocation,
        validatePincode,
        detectingLocation,
        locationError,
        setLocationError,
        pendingDetectedAddress,
        setPendingDetectedAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};

export default LocationContext;
