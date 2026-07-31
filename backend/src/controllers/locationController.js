import { getStoreInfo, validateDeliveryRadius } from "../services/locationService.js";

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

export const validateDelivery = async (req, res, next) => {
  try {
    const validationResult = validateDeliveryRadius();
    return res.status(200).json({
      success: true,
      ...validationResult,
    });
  } catch (error) {
    next(error);
  }
};

export const geocodeAddress = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    results: [],
  });
};

export const reverseGeocodeCoords = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    placeName: "Pan-India Address",
  });
};
