import {
  getStoreInfo,
  fetchGooglePlacesAutocomplete,
  fetchGooglePlaceDetails,
  geocodeAddressGoogle,
  reverseGeocodeGoogle,
  validatePincodeService,
  calculateDistanceMatrixGoogle,
} from "../services/locationService.js";

// GET /api/location/store
export const getStoreLocation = async (req, res, next) => {
  try {
    const storeInfo = getStoreInfo();
    return res.status(200).json({
      success: true,
      store: storeInfo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/autocomplete
export const getPlacesAutocomplete = async (req, res, next) => {
  try {
    const { input } = req.body;
    const predictions = await fetchGooglePlacesAutocomplete(input);
    return res.status(200).json({
      success: true,
      predictions,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/place-details
export const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId } = req.body;
    if (!placeId) {
      return res.status(400).json({ success: false, message: "Place ID is required" });
    }
    const details = await fetchGooglePlaceDetails(placeId);
    return res.status(200).json({
      success: true,
      details,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/geocode
export const geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: "Address string is required" });
    }
    const result = await geocodeAddressGoogle(address);
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/reverse-geocode
export const reverseGeocodeCoords = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric latitude (-90 to 90) and longitude (-180 to 180) are required.",
      });
    }

    const result = await reverseGeocodeGoogle(lat, lng);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Could not resolve address for provided coordinates.",
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/check-pincode
export const checkPincodeLocation = async (req, res, next) => {
  try {
    const { pincode } = req.body;
    if (!pincode) {
      return res.status(400).json({
        success: false,
        deliverable: false,
        message: "Pincode is required.",
      });
    }

    const result = await validatePincodeService(pincode);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/location/calculate-distance
export const calculateDistance = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const distanceResult = await calculateDistanceMatrixGoogle(latitude, longitude);
    return res.status(200).json({
      success: true,
      ...distanceResult,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/location/validate-delivery (Nationwide Delivery across India)
export const validateDelivery = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const store = getStoreInfo();

    let distanceResult = {
      distanceKm: 0,
      displayText: "Pan-India Express Dispatch",
      deliveryFee: 99,
    };

    if (latitude && longitude) {
      distanceResult = await calculateDistanceMatrixGoogle(latitude, longitude);
    }

    return res.status(200).json({
      success: true,
      isEligible: true, // Always eligible across India
      message: "✔ Pan-India Express Delivery Available",
      ...distanceResult,
      store,
    });
  } catch (error) {
    next(error);
  }
};
