import express from "express";
import { submitContactForm } from "../controllers/contactController.js";
import { subscribeLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public contact endpoint (rate limited)
router.post("/", subscribeLimiter, submitContactForm);

export default router;
