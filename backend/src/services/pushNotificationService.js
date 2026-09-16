import webpush from "web-push";
import { PushSubscription } from "../models/PushSubscription.js";
import { User } from "../models/User.js";

// Initialize VAPID configuration safely
let vapidConfigured = false;

const initVapid = () => {
  if (vapidConfigured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@wellmeds.in";

  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      vapidConfigured = true;
      return true;
    } catch (err) {
      console.warn("[PUSH] VAPID initialization warning:", err.message);
      return false;
    }
  }
  return false;
};

// Clean up defunct or revoked subscriptions (404 Not Found or 410 Gone)
const handleSubscriptionError = async (err, subscription) => {
  if (err.statusCode === 404 || err.statusCode === 410) {
    try {
      await PushSubscription.deleteOne({ _id: subscription._id });
      console.log(`[PUSH] Removed expired/invalid push subscription: ${subscription.endpoint.slice(0, 40)}...`);
    } catch (cleanupErr) {
      console.error("[PUSH] Error cleaning up subscription:", cleanupErr.message);
    }
  } else {
    console.warn(`[PUSH] Failed to send push to ${subscription.endpoint.slice(0, 40)}... Status: ${err.statusCode || "N/A"} - ${err.message}`);
  }
};

/**
 * Register or update push subscription for an authenticated user.
 * Atomically reassigns subscription if the same endpoint is used by another user (account-switching safety).
 */
export const subscribeUser = async (userId, subscriptionData, userAgent = "") => {
  if (!subscriptionData || !subscriptionData.endpoint || !subscriptionData.keys) {
    throw new Error("Invalid push subscription structure.");
  }

  const { endpoint, keys } = subscriptionData;
  if (!keys.p256dh || !keys.auth) {
    throw new Error("Missing required cryptographic keys (p256dh or auth).");
  }

  const subscription = await PushSubscription.findOneAndUpdate(
    { endpoint: endpoint.trim() },
    {
      user: userId,
      endpoint: endpoint.trim(),
      keys: {
        p256dh: String(keys.p256dh).trim(),
        auth: String(keys.auth).trim(),
      },
      userAgent: userAgent || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return subscription;
};

/**
 * Unsubscribe a single browser/device endpoint for the authenticated user.
 * Ownership check ensures customer A cannot delete customer B's subscription.
 */
export const unsubscribeSubscription = async (userId, endpoint) => {
  if (!endpoint) {
    throw new Error("Subscription endpoint is required.");
  }

  const result = await PushSubscription.deleteOne({
    endpoint: endpoint.trim(),
    user: userId,
  });

  return result.deletedCount > 0;
};

/**
 * Send push notification to all active devices of a given user.
 * Verifies user notification preference for transactional orders.
 */
export const sendPushToUser = async (userId, payload) => {
  if (!initVapid() || !userId) return;

  try {
    const user = await User.findById(userId).select("notificationPreferences");
    if (!user) return;

    // Check transactional order notification preference (defaults to true)
    if (payload.category === "order") {
      const orderPushEnabled = user.notificationPreferences?.orderPush !== false;
      if (!orderPushEnabled) {
        return; // User has opted out of order push notifications
      }
    }

    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) return;

    const stringifiedPayload = JSON.stringify({
      title: payload.title || "WellMeds Update",
      body: payload.body || "",
      icon: payload.icon || "/favicon.png",
      badge: payload.badge || "/favicon.png",
      url: payload.url || "/profile?tab=orders",
      type: payload.type || "GENERAL",
      entityId: payload.entityId || "",
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        try {
          await webpush.sendNotification(pushConfig, stringifiedPayload);
        } catch (err) {
          await handleSubscriptionError(err, sub);
        }
      })
    );
  } catch (err) {
    console.error("[PUSH] Error sending push to user:", err.message);
  }
};

/**
 * Send operational push notification to all authorized administrators.
 */
export const sendPushToAdmins = async (payload) => {
  if (!initVapid()) return;

  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    if (!adminUsers || adminUsers.length === 0) return;

    const adminIds = adminUsers.map((a) => a._id);
    const subscriptions = await PushSubscription.find({ user: { $in: adminIds } });
    if (!subscriptions || subscriptions.length === 0) return;

    const stringifiedPayload = JSON.stringify({
      title: payload.title || "WellMeds Admin Alert",
      body: payload.body || "",
      icon: payload.icon || "/favicon.png",
      badge: payload.badge || "/favicon.png",
      url: payload.url || "/admin",
      type: payload.type || "ADMIN_ALERT",
      entityId: payload.entityId || "",
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        try {
          await webpush.sendNotification(pushConfig, stringifiedPayload);
        } catch (err) {
          await handleSubscriptionError(err, sub);
        }
      })
    );
  } catch (err) {
    console.error("[PUSH] Error sending operational push to admins:", err.message);
  }
};

/**
 * High-level helper for customer order state transitions.
 * Ensures minimal, safe payload without sensitive personal or medical info.
 */
export const sendOrderPushNotification = (order, eventType) => {
  if (!order || !order.user) return;

  const orderId = order.orderId || "";
  let payload = null;

  switch (eventType) {
    case "CONFIRMED":
      payload = {
        title: "Order Confirmed",
        body: `Your WellMeds order #${orderId} has been confirmed.`,
        url: "/profile?tab=orders",
        type: "ORDER_CONFIRMED",
        entityId: orderId,
        category: "order",
      };
      break;

    case "PROCESSING":
      payload = {
        title: "Order Processing",
        body: `Your order #${orderId} is being prepared by our pharmacy team.`,
        url: "/profile?tab=orders",
        type: "ORDER_PROCESSING",
        entityId: orderId,
        category: "order",
      };
      break;

    case "PACKED":
      payload = {
        title: "Order Packed",
        body: `Your order #${orderId} has been packed securely.`,
        url: "/profile?tab=orders",
        type: "ORDER_PACKED",
        entityId: orderId,
        category: "order",
      };
      break;

    case "SHIPPED":
      payload = {
        title: "Order Shipped",
        body: `Your order #${orderId} is out for delivery.`,
        url: "/profile?tab=orders",
        type: "ORDER_SHIPPED",
        entityId: orderId,
        category: "order",
      };
      break;

    case "DELIVERED":
      payload = {
        title: "Order Delivered",
        body: `Your order #${orderId} has been successfully delivered.`,
        url: "/profile?tab=orders",
        type: "ORDER_DELIVERED",
        entityId: orderId,
        category: "order",
      };
      break;

    case "CANCELLED":
      payload = {
        title: "Order Cancelled",
        body: `Your order #${orderId} has been cancelled.`,
        url: "/profile?tab=orders",
        type: "ORDER_CANCELLED",
        entityId: orderId,
        category: "order",
      };
      break;

    default:
      break;
  }

  if (payload) {
    // Non-blocking async dispatch
    setImmediate(() => {
      sendPushToUser(order.user, payload);
    });
  }
};

/**
 * High-level helper for prescription workflow updates.
 * Safe & minimal: never contains specific diagnoses or drug names in OS notifications.
 */
export const sendPrescriptionPushNotification = (userId, eventType, data = {}) => {
  if (!userId) return;

  let payload = null;

  switch (eventType) {
    case "SUBMITTED":
      payload = {
        title: "Prescription Uploaded",
        body: "Your prescription has been received and queued for review.",
        url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        type: "RX_SUBMITTED",
        entityId: data.rxId || "",
        category: "prescription",
      };
      break;

    case "CART_READY":
      payload = {
        title: "Prescription Cart Ready",
        body: "Your prescribed items have been prepared. Review your cart to proceed.",
        url: "/cart",
        type: "RX_CART_READY",
        entityId: data.rxId || "",
        category: "prescription",
      };
      break;

    case "APPROVED":
      payload = {
        title: "Prescription Approved",
        body: "Your prescription was verified. You can now checkout your order.",
        url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        type: "RX_APPROVED",
        entityId: data.rxId || "",
        category: "prescription",
      };
      break;

    case "REJECTED":
      payload = {
        title: "Prescription Update",
        body: "Your prescription requires review. Please tap to view pharmacist notes.",
        url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        type: "RX_REJECTED",
        entityId: data.rxId || "",
        category: "prescription",
      };
      break;

    default:
      break;
  }

  if (payload) {
    setImmediate(() => {
      sendPushToUser(userId, payload);
    });
  }
};

/**
 * Operational notification dispatcher for authorized admins.
 */
export const sendAdminOperationalPush = (eventType, data = {}) => {
  let payload = null;

  switch (eventType) {
    case "NEW_ORDER":
      payload = {
        title: "New Order Placed",
        body: `Order #${data.orderId || ""} verified and placed.`,
        url: "/admin/orders",
        type: "ADMIN_NEW_ORDER",
        entityId: data.orderId || "",
      };
      break;

    case "NEW_PRESCRIPTION":
      payload = {
        title: "Prescription Review Needed",
        body: "A new prescription document has been submitted for verification.",
        url: "/admin/prescriptions",
        type: "ADMIN_NEW_RX",
        entityId: data.rxId || "",
      };
      break;

    case "ORDER_CANCELLED":
      payload = {
        title: "Order Cancelled",
        body: `Order #${data.orderId || ""} was cancelled.`,
        url: "/admin/orders",
        type: "ADMIN_ORDER_CANCELLED",
        entityId: data.orderId || "",
      };
      break;

    default:
      break;
  }

  if (payload) {
    setImmediate(() => {
      sendPushToAdmins(payload);
    });
  }
};
