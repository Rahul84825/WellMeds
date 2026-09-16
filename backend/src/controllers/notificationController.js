import { Notification } from "../models/Notification.js";
import { Subscriber } from "../models/Subscriber.js";
import { User } from "../models/User.js";
import { sendWaitlistConfirmation } from "../services/emailService.js";
import { subscribeUser, unsubscribeSubscription } from "../services/pushNotificationService.js";

// Fetch notifications for logged in user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
export const markAsRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// Subscribe email from Maintenance / Coming Soon page (Hardened & Secured with Email Dispatch)
export const subscribeEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    // Duplicate check
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You are already on our waitlist.",
        duplicate: true,
      });
    }

    // Persist new subscriber
    await Subscriber.create({
      email: normalizedEmail,
      source: req.body.source || "maintenance_page",
      subscribedAt: new Date(),
      status: "Subscribed",
      notified: false,
    });

    // Send confirmation email in background
    sendWaitlistConfirmation(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: "Thank you for joining the WellMeds waitlist! A confirmation email has been sent.",
    });
  } catch (error) {
    // Handle MongoDB duplicate key race condition gracefully
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already on our waitlist.",
        duplicate: true,
      });
    }
    next(error);
  }
};

// Return public VAPID key to client (Private key is NEVER returned)
export const getVapidPublicKey = (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  res.status(200).json({ success: true, publicKey });
};

// Register or reassign browser Web Push subscription
export const subscribePush = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || typeof endpoint !== "string" || !keys || typeof keys !== "object") {
      return res.status(400).json({ success: false, message: "Invalid push subscription payload." });
    }

    if (!keys.p256dh || !keys.auth) {
      return res.status(400).json({ success: false, message: "Subscription keys (p256dh, auth) are required." });
    }

    const userAgent = req.headers["user-agent"] || "";
    const subscription = await subscribeUser(req.user._id, { endpoint, keys }, userAgent);

    return res.status(201).json({
      success: true,
      message: "Push subscription registered successfully.",
      subscriptionId: subscription._id,
    });
  } catch (error) {
    next(error);
  }
};

// Unsubscribe a specific browser endpoint for authenticated user
export const unsubscribePush = async (req, res, next) => {
  try {
    const endpoint = req.body?.endpoint || req.query?.endpoint;
    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({ success: false, message: "Subscription endpoint is required." });
    }

    const removed = await unsubscribeSubscription(req.user._id, endpoint);
    return res.status(200).json({
      success: true,
      message: removed ? "Push subscription removed." : "Subscription was not active for this account.",
    });
  } catch (error) {
    next(error);
  }
};

// Get notification preferences for authenticated user
export const getNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences");
    res.status(200).json({
      success: true,
      preferences: {
        orderPush: user?.notificationPreferences?.orderPush !== false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update notification preferences for authenticated user
export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { orderPush } = req.body;
    const update = {};
    if (typeof orderPush === "boolean") {
      update["notificationPreferences.orderPush"] = orderPush;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, select: "notificationPreferences" }
    );

    res.status(200).json({
      success: true,
      preferences: {
        orderPush: user?.notificationPreferences?.orderPush !== false,
      },
    });
  } catch (error) {
    next(error);
  }
};
