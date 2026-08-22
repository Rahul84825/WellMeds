import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// PHARMACY STORE LOCATION CONFIGURATION (Nationwide Delivery)
// ─────────────────────────────────────────────────────────────────────────────
export const getStoreInfo = () => {
  const storeLat = parseFloat(process.env.STORE_LATITUDE || "18.5590");
  const storeLng = parseFloat(process.env.STORE_LONGITUDE || "73.7868");
  const storeAddress = process.env.STORE_ADDRESS || "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune";
  const storePincode = process.env.STORE_PINCODE || "411021";

  return {
    name: "WellMeds Pharmacy",
    address: storeAddress,
    city: "Pune",
    state: "Maharashtra",
    pincode: storePincode,
    country: "India",
    latitude: storeLat,
    longitude: storeLng,
    phone: "+91 7798795353",
    email: "info@wellmeds.in",
    workingHours: "08:00 AM - 11:00 PM (Mon - Sun)",
    panIndiaDelivery: true,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// NATIONWIDE DELIVERY VALIDATION (Always Eligible Across India)
// ─────────────────────────────────────────────────────────────────────────────
export const validateDeliveryRadius = (lat, lng) => {
  return {
    isEligible: true,
    distanceKm: 0,
    message: "✔ Pan-India Express Delivery Available",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HAVERSINE DISTANCE HELPER (Optional utility for driver/route tools)
// ─────────────────────────────────────────────────────────────────────────────
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

// ─────────────────────────────────────────────────────────────────────────────
// DECOUPLED DELIVERY FEE CALCULATION (Decoupled from Distance/Radius)
// ─────────────────────────────────────────────────────────────────────────────
export const calculateDeliveryFee = (orderAmount = 0) => {
  const freeThreshold = parseFloat(process.env.FREE_DELIVERY_THRESHOLD || "500");
  if (orderAmount >= freeThreshold) {
    return 0; // Free delivery for orders >= ₹500
  }
  return 50; // Standard flat delivery fee
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATED DELIVERY TIME CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
export const formatEstimatedTime = (googleDurationMinutes = null) => {
  if (googleDurationMinutes !== null && googleDurationMinutes > 0) {
    const totalMins = Math.round(googleDurationMinutes + 15);
    return {
      minutes: totalMins,
      displayText: totalMins <= 45 ? "30–45 mins" : totalMins <= 60 ? "45–60 mins" : `${totalMins-15}–${totalMins+15} mins`,
    };
  }
  return { minutes: 1440, displayText: "Pan-India Express Dispatch" };
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE PLACES AUTOCOMPLETE SERVICE (All Cities & Localities Across India)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchGooglePlacesAutocomplete = async (input) => {
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !input || input.trim().length < 2) {
    return [];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
    const response = await axios.get(url, {
      params: {
        input: input.trim(),
        key: apiKey,
        components: "country:in", // India-wide search
        language: "en",
      },
    });

    if (response.data.status === "OK") {
      return response.data.predictions.map((p) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || "",
      }));
    }
    return [];
  } catch (error) {
    console.error("Google Places Autocomplete Error:", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE PLACE DETAILS SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const fetchGooglePlaceDetails = async (placeId) => {
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !placeId) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: "address_component,formatted_address,geometry,name,place_id",
        language: "en",
      },
    });

    if (response.data.status === "OK" && response.data.result) {
      const res = response.data.result;
      const components = res.address_components || [];

      const getComponent = (types) => {
        const c = components.find((comp) =>
          types.some((t) => comp.types.includes(t))
        );
        return c ? c.long_name : "";
      };

      const pincode = getComponent(["postal_code"]);
      const city =
        getComponent(["locality", "administrative_area_level_3", "administrative_area_level_2"]) || "";
      const state =
        getComponent(["administrative_area_level_1"]) || "";
      const country = getComponent(["country"]) || "India";
      const street =
        getComponent(["route", "sublocality_level_1", "neighborhood"]) ||
        res.name ||
        "";
      const landmark = getComponent(["sublocality_level_2", "premise"]) || "";

      return {
        placeId: res.place_id,
        name: res.name || "",
        formattedAddress: res.formatted_address || "",
        latitude: res.geometry?.location?.lat || null,
        longitude: res.geometry?.location?.lng || null,
        pincode,
        city,
        state,
        country,
        street,
        landmark,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Place Details Error:", error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE GEOCODING SERVICE (Address -> Lat/Lng)
// ─────────────────────────────────────────────────────────────────────────────
export const geocodeAddressGoogle = async (addressString) => {
  const apiKey =
    process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !addressString) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address: addressString,
        key: apiKey,
        components: "country:IN",
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const first = response.data.results[0];
      return {
        latitude: first.geometry.location.lat,
        longitude: first.geometry.location.lng,
        formattedAddress: first.formatted_address,
        placeId: first.place_id,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Geocoding Error:", error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: CLEAN POST OFFICE OR AREA NAME
// ─────────────────────────────────────────────────────────────────────────────
const cleanAreaName = (name) => {
  if (!name) return "";
  return String(name)
    .trim()
    .replace(/\s+(S\.O|B\.O|H\.O|SO|BO|HO)$/i, "")
    .trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE REVERSE GEOCODING SERVICE (Lat/Lng -> Address & Delivery Info)
// ─────────────────────────────────────────────────────────────────────────────
export const reverseGeocodeGoogle = async (lat, lng) => {
  const apiKey =
    process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || lat === undefined || lng === undefined) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        latlng: `${lat},${lng}`,
        key: apiKey,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      let pincode = "";
      let sublocality = "";
      let neighborhood = "";
      let localityCity = "";
      let subDistrict = "";
      let district = "";
      let state = "";
      let country = "India";
      let houseNo = "";
      let building = "";
      let street = "";
      let landmark = "";
      const formattedAddress = response.data.results[0].formatted_address || "";
      const placeId = response.data.results[0].place_id || "";

      for (const result of response.data.results) {
        const components = result.address_components || [];
        const getComp = (types) => {
          const c = components.find((comp) =>
            types.some((t) => comp.types.includes(t))
          );
          return c ? c.long_name : "";
        };

        if (!pincode) pincode = getComp(["postal_code"]);
        if (!sublocality) sublocality = getComp(["sublocality_level_1", "sublocality_level_2", "sublocality"]);
        if (!neighborhood) neighborhood = getComp(["neighborhood"]);
        if (!localityCity) localityCity = getComp(["locality", "postal_town"]);
        if (!subDistrict) subDistrict = getComp(["administrative_area_level_3"]);
        if (!district) district = getComp(["administrative_area_level_2"]);
        if (!state) state = getComp(["administrative_area_level_1"]);
        if (!country) country = getComp(["country"]) || "India";
        if (!houseNo) houseNo = getComp(["street_number", "premise", "subpremise"]);
        if (!building) building = getComp(["building", "premise"]);
        if (!street) street = getComp(["route", "sublocality_level_1", "neighborhood"]);
        if (!landmark) landmark = getComp(["sublocality_level_2"]);

        if (pincode && (sublocality || neighborhood) && localityCity && state) break;
      }

      // If sublocality is missing but we have pincode, fallback to India Post
      let postOfficeName = "";
      if (pincode && !sublocality && !neighborhood) {
        try {
          const postRes = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, { timeout: 2500 });
          if (postRes.data?.[0]?.Status === "Success" && postRes.data[0]?.PostOffice?.length > 0) {
            postOfficeName = cleanAreaName(postRes.data[0].PostOffice[0].Name);
            if (!district) district = postRes.data[0].PostOffice[0].District || "";
          }
        } catch (e) {
          // Non-blocking fallback
        }
      }

      const specificLocality = cleanAreaName(sublocality || neighborhood || postOfficeName);
      const administrativeCity = localityCity || subDistrict || district || (pincode.startsWith("411") ? "Pune" : "");
      
      const isPune =
        (pincode && (pincode.startsWith("411") || pincode.startsWith("412"))) ||
        (administrativeCity && (administrativeCity.toLowerCase().includes("pune") || administrativeCity.toLowerCase().includes("pimpri-chinchwad"))) ||
        (district && district.toLowerCase().includes("pune"));

      const cityDisplay = isPune ? "Pune" : (administrativeCity || specificLocality || state || "India");
      const displayText = pincode
        ? `${pincode}, ${cityDisplay}`
        : cityDisplay;

      return {
        success: true,
        formattedAddress,
        placeId,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        houseNo,
        building,
        street,
        landmark,
        locality: specificLocality || administrativeCity,
        city: administrativeCity || (isPune ? "Pune" : ""),
        district: district || "",
        state: state || (isPune ? "Maharashtra" : ""),
        country: country || "India",
        pincode: pincode || "",
        deliverable: true,
        isPune: Boolean(isPune),
        estimatedDelivery: isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)",
        displayText,
        message: isPune
          ? `✓ Express 1-Day Delivery available in ${cityDisplay}`
          : `✓ We deliver to ${displayText}`,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Reverse Geocoding Error:", error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PINCODE VALIDATION & DYNAMIC LOCALITY RESOLUTION SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const validatePincodeService = async (pincode) => {
  const pin = String(pincode || "").trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return {
      success: false,
      deliverable: false,
      message: "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  let sublocality = "";
  let neighborhood = "";
  let postalTown = "";
  let localityCity = "";
  let subDistrict = "";
  let district = "";
  let state = "";
  let country = "India";
  let postOfficeName = "";

  const apiKey =
    process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  // 1. Query Google Geocoding for structured geographic components
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json`;
      const response = await axios.get(url, {
        params: {
          address: pin,
          components: "country:IN",
          key: apiKey,
        },
        timeout: 4000,
      });

      if (response.data.status === "OK" && response.data.results?.length > 0) {
        for (const result of response.data.results) {
          const components = result.address_components || [];
          const getComp = (types) => {
            const c = components.find((comp) =>
              types.some((t) => comp.types.includes(t))
            );
            return c ? c.long_name : "";
          };

          if (!sublocality) sublocality = getComp(["sublocality_level_1", "sublocality_level_2", "sublocality"]);
          if (!neighborhood) neighborhood = getComp(["neighborhood"]);
          if (!postalTown) postalTown = getComp(["postal_town"]);
          if (!localityCity) localityCity = getComp(["locality", "postal_town"]);
          if (!subDistrict) subDistrict = getComp(["administrative_area_level_3"]);
          if (!district) district = getComp(["administrative_area_level_2"]);
          if (!state) state = getComp(["administrative_area_level_1"]);
          if (!country) country = getComp(["country"]) || "India";

          if (sublocality && localityCity && state) break;
        }
      }
    } catch (e) {
      console.warn("Google Geocoding lookup error:", e.message);
    }
  }

  // 2. Query India Post API for official Post Office and locality fallback
  try {
    const postRes = await axios.get(`https://api.postalpincode.in/pincode/${pin}`, { timeout: 3000 });
    if (postRes.data?.[0]?.Status === "Success" && postRes.data[0]?.PostOffice?.length > 0) {
      const poList = postRes.data[0].PostOffice;
      const primaryPO = poList[0];
      postOfficeName = cleanAreaName(primaryPO.Name);
      if (!district) district = primaryPO.District || "";
      if (!state) state = primaryPO.State || "";
      if (!localityCity) {
        localityCity = primaryPO.Block !== "NA" && primaryPO.Block ? primaryPO.Block : primaryPO.District;
      }
    }
  } catch (e) {
    console.warn("India Post API lookup error:", e.message);
  }

  // 3. Resolve user-facing locality priority:
  //    POST OFFICE / LOCALITY -> SUBLOCALITY -> NEIGHBORHOOD -> POSTAL TOWN -> CITY -> DISTRICT -> STATE
  const resolvedSpecificLocality = cleanAreaName(sublocality || neighborhood || postOfficeName || postalTown);
  const resolvedCity = localityCity || subDistrict || district || (pin.startsWith("411") ? "Pune" : pin.startsWith("400") ? "Mumbai" : "");

  const isPune =
    pin.startsWith("411") ||
    pin.startsWith("412") ||
    (resolvedCity && (resolvedCity.toLowerCase().includes("pune") || resolvedCity.toLowerCase().includes("pimpri-chinchwad"))) ||
    (district && district.toLowerCase().includes("pune"));

  const cityDisplay = isPune ? "Pune" : (resolvedCity || resolvedSpecificLocality || district || state || "India");
  const deliveryTime = isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)";
  const displayText = `${pin}, ${cityDisplay}`;

  return {
    success: true,
    deliverable: true,
    pincode: pin,
    locality: resolvedSpecificLocality || cityDisplay,
    city: resolvedCity || (isPune ? "Pune" : ""),
    district: district || "",
    state: state || (isPune ? "Maharashtra" : ""),
    country: country || "India",
    isPune: Boolean(isPune),
    estimatedDelivery: deliveryTime,
    displayText,
    message: isPune
      ? `✓ Express 1-Day Delivery available in ${cityDisplay}`
      : `✓ We deliver to ${displayText}`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL GOOGLE DISTANCE MATRIX SERVICE (Utility for future route/tracking tools)
// ─────────────────────────────────────────────────────────────────────────────
export const calculateDistanceMatrixGoogle = async (destLat, destLng) => {
  const apiKey =
    process.env.GOOGLE_DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const store = getStoreInfo();

  if (!destLat || !destLng) {
    return {
      distanceKm: 0,
      durationMinutes: 0,
      displayText: "Pan-India Express Dispatch",
      isEligible: true,
      deliveryFee: 50,
    };
  }

  if (!apiKey) {
    const fallbackDist = calculateHaversineDistance(
      store.latitude,
      store.longitude,
      destLat,
      destLng
    );
    return {
      distanceKm: fallbackDist,
      durationMinutes: 1440,
      displayText: "Pan-India Express Dispatch",
      isEligible: true,
      deliveryFee: 50,
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
    const response = await axios.get(url, {
      params: {
        origins: `${store.latitude},${store.longitude}`,
        destinations: `${destLat},${destLng}`,
        mode: "driving",
        key: apiKey,
      },
    });

    if (
      response.data.status === "OK" &&
      response.data.rows?.[0]?.elements?.[0]?.status === "OK"
    ) {
      const element = response.data.rows[0].elements[0];
      const distanceMeters = element.distance.value;
      const durationSeconds = element.duration.value;

      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
      const durationMinutes = Math.round(durationSeconds / 60);

      return {
        distanceKm,
        durationMinutes,
        displayText: `${distanceKm} km | Est. ${durationMinutes} mins`,
        isEligible: true, // Always eligible across India
        deliveryFee: 50,
      };
    }

    const fallbackDist = calculateHaversineDistance(
      store.latitude,
      store.longitude,
      destLat,
      destLng
    );

    return {
      distanceKm: fallbackDist,
      durationMinutes: 1440,
      displayText: "Pan-India Express Dispatch",
      isEligible: true,
      deliveryFee: 50,
    };
  } catch (error) {
    console.error("Google Distance Matrix Error:", error.message);
    return {
      distanceKm: 0,
      durationMinutes: 1440,
      displayText: "Pan-India Express Dispatch",
      isEligible: true,
      deliveryFee: 50,
    };
  }
};
