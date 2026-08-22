import express from "express";
import {
  getStoreLocation,
  getPlacesAutocomplete,
  getPlaceDetails,
  geocodeAddress,
  reverseGeocodeCoords,
  checkPincodeLocation,
  calculateDistance,
  validateDelivery,
} from "../controllers/locationController.js";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

// Rate limiter for location lookups
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min
  message: { success: false, message: "Too many location requests. Please try again later." },
});

router.get("/store", getStoreLocation);
router.post("/autocomplete", locationLimiter, getPlacesAutocomplete);
router.post("/place-details", locationLimiter, getPlaceDetails);
router.post("/geocode", locationLimiter, geocodeAddress);
router.post("/reverse-geocode", locationLimiter, reverseGeocodeCoords);
router.post("/check-pincode", locationLimiter, checkPincodeLocation);
router.post("/calculate-distance", locationLimiter, calculateDistance);
router.post("/validate-delivery", locationLimiter, validateDelivery);

export default router;
