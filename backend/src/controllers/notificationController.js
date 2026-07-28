import { Notification } from "../models/Notification.js";
import { Subscriber } from "../models/Subscriber.js";

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

// Subscribe email from Maintenance / Coming Soon page (Hardened & Secured)
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
        message: "You are already on our notification list!",
        duplicate: true,
      });
    }

    // Persist new subscriber
    await Subscriber.create({
      email: normalizedEmail,
      source: "maintenance_page",
    });

    return res.status(200).json({
      success: true,
      message: "Subscription registered successfully.",
    });
  } catch (error) {
    // Handle MongoDB duplicate key race condition gracefully
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already on our notification list!",
        duplicate: true,
      });
    }
    next(error);
  }
};

