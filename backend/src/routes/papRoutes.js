import express from "express";
import { applyPAP } from "../controllers/papController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/apply",
  optionalProtect,
  upload.fields([
    { name: "prescription", maxCount: 1 },
    { name: "documents", maxCount: 1 }
  ]),
  applyPAP
);

export default router;
