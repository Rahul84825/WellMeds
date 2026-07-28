import { sendEmail } from "../config/email.js";
import {
  renderWaitlistConfirmation,
  renderWelcomeEmail,
  renderPrescriptionReceivedCustomer,
  renderPrescriptionReceivedAdmin,
  renderPrescriptionApproved,
  renderPrescriptionRejected,
  renderOrderConfirmation,
  renderOrderStatusUpdate,
  renderOrderCancelled,
  renderContactAcknowledgementCustomer,
  renderContactNotificationAdmin,
  renderMarketingCampaign,
} from "../templates/emailTemplates.js";

/**
 * Non-blocking email dispatch helper.
 * Prevents API request latency by delegating email transport execution
 * to setImmediate background queue. Errors are safely logged without throwing.
 */
const safeDispatch = (emailData) => {
  setImmediate(async () => {
    try {
      await sendEmail(emailData);
      console.log(`[EMAIL] [SENT] Subject: "${emailData.subject}" -> ${emailData.to}`);
    } catch (err) {
      console.error(`[EMAIL] [FAILED] Subject: "${emailData.subject}" -> ${emailData.to} | Error: ${err.message}`);
    }
  });
};

const getAdminEmail = () => {
  return process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || "admin@wellmeds.in";
};

// ─── 1. Waitlist Confirmation ────────────────────────────────────────────────
export const sendWaitlistConfirmation = (email) => {
  if (!email) return;
  const html = renderWaitlistConfirmation();
  safeDispatch({ to: email, subject: "You're on the WellMeds Waitlist 🎉", html });
};

// ─── 2. Welcome Email ────────────────────────────────────────────────────────
export const sendWelcomeEmail = (email, name = "Patient") => {
  if (!email) return;
  const html = renderWelcomeEmail({ name });
  safeDispatch({ to: email, subject: "Welcome to WellMeds!", html });
};

// ─── 3. Prescription Received (Customer & Admin) ─────────────────────────────
export const sendPrescriptionReceivedCustomer = (email, customerName, rxId, rxFileName) => {
  if (!email) return;
  const html = renderPrescriptionReceivedCustomer({ customerName, rxId, rxFileName });
  safeDispatch({ to: email, subject: `Prescription Received — ${rxId}`, html });
};

export const sendPrescriptionReceivedAdmin = (customerName, rxId, rxFileName) => {
  const adminEmail = getAdminEmail();
  const html = renderPrescriptionReceivedAdmin({ customerName, rxId, rxFileName });
  safeDispatch({ to: adminEmail, subject: `[Admin Alert] New Rx Upload: ${rxId}`, html });
};

// ─── 4. Prescription Review (Approved / Rejected) ────────────────────────────
export const sendPrescriptionApproved = (email, customerName, rxId, prescribedItems, adminNotes) => {
  if (!email) return;
  const html = renderPrescriptionApproved({ customerName, rxId, prescribedItems, adminNotes });
  safeDispatch({ to: email, subject: `Prescription Approved — ${rxId}`, html });
};

export const sendPrescriptionRejected = (email, customerName, rxId, adminNotes) => {
  if (!email) return;
  const html = renderPrescriptionRejected({ customerName, rxId, adminNotes });
  safeDispatch({ to: email, subject: `Prescription Requires Attention — ${rxId}`, html });
};

// Legacy wrapper for backwards compatibility
export const sendPrescriptionReviewEmail = (email, customerName, rxFileName, status, notes) => {
  if (status === "Approved") {
    sendPrescriptionApproved(email, customerName, "RX-DOC", [], notes);
  } else if (status === "Rejected") {
    sendPrescriptionRejected(email, customerName, "RX-DOC", notes);
  } else {
    safeDispatch({
      to: email,
      subject: `WellMeds Prescription Verification Status: ${status}`,
      html: `<p>Dear ${customerName}, your prescription ${rxFileName} status is updated to <strong>${status}</strong>. Notes: ${notes || "None"}</p>`,
    });
  }
};

// ─── 5. Order Emails ─────────────────────────────────────────────────────────
export const sendOrderConfirmation = (order) => {
  if (!order || !order.email) return;
  const html = renderOrderConfirmation({ order });
  safeDispatch({ to: order.email, subject: `Order Confirmed — ${order.orderId}`, html });
};

export const sendOrderStatusEmail = (email, customerName, orderId, status) => {
  if (!email) return;
  const dummyOrder = { customer: customerName, orderId };
  const html = renderOrderStatusUpdate({ order: dummyOrder, status });
  safeDispatch({ to: email, subject: `WellMeds Order ${orderId} Status Update: ${status}`, html });
};

export const sendOrderStatusUpdate = (order, status) => {
  if (!order || !order.email) return;
  const html = renderOrderStatusUpdate({ order, status });
  safeDispatch({ to: order.email, subject: `Order ${order.orderId} Status Update: ${status}`, html });
};

export const sendOrderCancelled = (order) => {
  if (!order || !order.email) return;
  const html = renderOrderCancelled({ order });
  safeDispatch({ to: order.email, subject: `Order Cancelled — ${order.orderId}`, html });
};

// ─── 6. Contact Form Emails ──────────────────────────────────────────────────
export const sendContactAcknowledgement = (email, name) => {
  if (!email) return;
  const html = renderContactAcknowledgementCustomer({ name });
  safeDispatch({ to: email, subject: "We received your enquiry — WellMeds", html });
};

export const sendAdminContactNotification = ({ name, email, subject, message }) => {
  const adminEmail = getAdminEmail();
  const html = renderContactNotificationAdmin({ name, email, subject, message });
  safeDispatch({ to: adminEmail, subject: `[Admin Alert] New Enquiry from ${name}`, html });
};

// ─── 7. Bulk / Marketing Campaign ───────────────────────────────────────────
export const sendBulkWaitlistEmail = (subscribers, subject, messageContent) => {
  if (!Array.isArray(subscribers) || subscribers.length === 0) return;
  const html = renderMarketingCampaign({
    subject,
    title: subject,
    bodyHtml: messageContent,
    ctaText: "Visit WellMeds Store",
    ctaUrl: "https://wellmeds.in",
  });

  subscribers.forEach((sub) => {
    const targetEmail = typeof sub === "string" ? sub : sub.email;
    if (targetEmail) {
      safeDispatch({ to: targetEmail, subject, html });
    }
  });
};

// ─── 8. Account & Security Emails ────────────────────────────────────────────
export const sendVerificationEmail = (email, name, token) => {
  if (!email) return;
  const frontendUrl = process.env.FRONTEND_URL || "https://wellmeds.in";
  const verificationLink = `${frontendUrl.replace(/\/$/, "")}/verify-email?token=${token}`;
  const html = renderMarketingCampaign({
    subject: "Verify Your WellMeds Email Address",
    title: "Verify Your Email Address",
    bodyHtml: `<p>Dear ${name},</p><p>Please click the button below to verify your email address and activate your WellMeds account.</p>`,
    ctaText: "Verify Email Address",
    ctaUrl: verificationLink,
  });
  safeDispatch({ to: email, subject: "Verify Your WellMeds Email Address", html });
};

export const sendPasswordResetEmail = (email, name, token) => {
  if (!email) return;
  const frontendUrl = process.env.FRONTEND_URL || "https://wellmeds.in";
  const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  const html = renderMarketingCampaign({
    subject: "Reset Your WellMeds Password",
    title: "Reset Password Request",
    bodyHtml: `<p>Dear ${name},</p><p>Click below to reset the password for your WellMeds account. This link is valid for 1 hour.</p>`,
    ctaText: "Reset Password",
    ctaUrl: resetLink,
  });
  safeDispatch({ to: email, subject: "Reset Your WellMeds Password", html });
};
