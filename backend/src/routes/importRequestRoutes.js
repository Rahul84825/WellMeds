import express from "express";
import { createImportRequest } from "../controllers/importRequestController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", optionalProtect, upload.single("prescription"), createImportRequest);

export default router;
