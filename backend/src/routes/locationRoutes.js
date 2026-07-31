import express from "express";
import {
  getStoreLocation,
  validateDelivery,
  geocodeAddress,
  reverseGeocodeCoords,
} from "../controllers/locationController.js";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

// Rate limiter for public location lookups
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 min
  message: { success: false, message: "Too many location requests. Please try again later." },
});

router.get("/store", getStoreLocation);
router.post("/validate-delivery", locationLimiter, validateDelivery);
router.post("/geocode", locationLimiter, geocodeAddress);
router.post("/reverse-geocode", locationLimiter, reverseGeocodeCoords);

export default router;
