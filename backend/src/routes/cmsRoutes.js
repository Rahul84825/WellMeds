import express from "express";
import {
  getImportedMedicinePage,
  updateImportedMedicinePage,
  getPAPPage,
  updatePAPPage
} from "../controllers/cmsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Imported Medicines CMS routes
router.get("/imported", getImportedMedicinePage);
router.put("/imported", protect, admin, upload.single("image"), updateImportedMedicinePage);

// PAP CMS routes
router.get("/pap", getPAPPage);
router.put("/pap", protect, admin, upload.single("image"), updatePAPPage);

export default router;
