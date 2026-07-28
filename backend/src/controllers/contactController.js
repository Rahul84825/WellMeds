import { sendContactAcknowledgement, sendAdminContactNotification } from "../services/emailService.js";

/**
 * POST /api/contact
 * Handles public contact form inquiries.
 * Validates inputs, acknowledges customer, and alerts admin support.
 */
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const sanitizedName = name.trim();
    const sanitizedSubject = subject ? subject.trim() : "General Support";
    const sanitizedMessage = message.trim();

    // Non-blocking email dispatch
    sendContactAcknowledgement(normalizedEmail, sanitizedName);
    sendAdminContactNotification({
      name: sanitizedName,
      email: normalizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    });

    res.status(200).json({
      success: true,
      message: "Thank you for contacting WellMeds! Our support agents will reach out to you shortly.",
    });
  } catch (error) {
    next(error);
  }
};
