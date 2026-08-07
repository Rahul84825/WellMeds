import { api } from "./api";

let mapsScriptPromise = null;

// ─────────────────────────────────────────────────────────────────────────────
// LAZY SCRIPT LOADER FOR GOOGLE MAPS JS API
// ─────────────────────────────────────────────────────────────────────────────
export const loadGoogleMapsScript = (apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY) => {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise((resolve, reject) => {
    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not configured in .env");
      resolve(null); // Resolve with null for graceful fallback
      return;
    }

    const existingScript = document.getElementById("google-maps-js-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-js-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        resolve(null);
      }
    };

    script.onerror = (err) => {
      console.error("Failed to load Google Maps SDK:", err);
      resolve(null); // Graceful fallback
    };

    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

// ─────────────────────────────────────────────────────────────────────────────
// BROWSER GPS GEOLOCATION HELPER
// ─────────────────────────────────────────────────────────────────────────────
export const getUserCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND PROXY API WRAPPERS (Server-side Google API Calls)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchStoreLocation = async () => {
  try {
    const res = await api.get("/location/store");
    return res.store || null;
  } catch (err) {
    console.error("fetchStoreLocation Error:", err);
    return null;
  }
};

export const fetchAutocompleteSuggestions = async (input) => {
  if (!input || input.trim().length < 2) return [];
  try {
    const res = await api.post("/location/autocomplete", { input });
    return res.predictions || [];
  } catch (err) {
    console.error("fetchAutocompleteSuggestions Error:", err);
    return [];
  }
};

export const fetchPlaceDetailsById = async (placeId) => {
  if (!placeId) return null;
  try {
    const res = await api.post("/location/place-details", { placeId });
    return res.details || null;
  } catch (err) {
    console.error("fetchPlaceDetailsById Error:", err);
    return null;
  }
};

export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  try {
    const res = await api.post("/location/reverse-geocode", { latitude, longitude });
    return res.result || null;
  } catch (err) {
    console.error("reverseGeocodeCoordinates Error:", err);
    return null;
  }
};

export const geocodeAddressString = async (address) => {
  if (!address) return null;
  try {
    const res = await api.post("/location/geocode", { address });
    return res.result || null;
  } catch (err) {
    console.error("geocodeAddressString Error:", err);
    return null;
  }
};

export const validateDeliveryLocation = async (latitude, longitude) => {
  try {
    const res = await api.post("/location/validate-delivery", { latitude, longitude });
    return res;
  } catch (err) {
    console.error("validateDeliveryLocation Error:", err);
    return {
      success: false,
      isEligible: true,
      distanceKm: 0,
      deliveryFee: 40,
      displayText: "Standard Delivery",
      message: "Delivery validation fallback",
    };
  }
};
