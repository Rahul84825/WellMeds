import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";

const router = express.Router();

// All address routes are protected for authenticated users with complete profiles
router.use(protect, requireProfileComplete);

router.route("/")
  .get(getAddresses)
  .post(addAddress);

router.route("/:id")
  .put(updateAddress)
  .delete(deleteAddress);

router.patch("/:id/default", setDefaultAddress);

export default router;
