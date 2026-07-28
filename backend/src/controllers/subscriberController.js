import { Subscriber } from "../models/Subscriber.js";
import { sendBulkWaitlistEmail } from "../services/emailService.js";

// GET /api/admin/subscribers (View, Search, Filter, Sort, Pagination)
export const getSubscribers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const notifiedFilter = req.query.notified; // 'true', 'false', or empty

    const query = {};

    if (search) {
      query.email = { $regex: search.trim(), $options: "i" };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (notifiedFilter === "true") {
      query.notified = true;
    } else if (notifiedFilter === "false") {
      query.notified = false;
    }

    const total = await Subscriber.countDocuments(query);
    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      subscribers,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/subscribers/:id/notified
export const markAsNotified = async (req, res, next) => {
  const { id } = req.params;
  try {
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }

    subscriber.notified = !subscriber.notified;
    subscriber.notifiedAt = subscriber.notified ? new Date() : null;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: `Subscriber marked as ${subscriber.notified ? "Notified" : "Unnotified"}`,
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/subscribers/:id
export const deleteSubscriber = async (req, res, next) => {
  const { id } = req.params;
  try {
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.status(200).json({ success: true, message: "Subscriber deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/subscribers/bulk-notify
export const bulkNotifySubscribers = async (req, res, next) => {
  const { ids, subject, message } = req.body;
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one subscriber" });
    }

    const subscribers = await Subscriber.find({ _id: { $in: ids } });
    if (subscribers.length === 0) {
      return res.status(404).json({ success: false, message: "No matching subscribers found" });
    }

    const emailSubject = subject || "WellMeds Launch & Special Announcement 🎉";
    const emailContent = message || "<p>We are thrilled to announce that WellMeds is now live! Explore our healthcare catalog today.</p>";

    // Send broadcast email in background
    sendBulkWaitlistEmail(subscribers, emailSubject, emailContent);

    // Update notification status in database
    await Subscriber.updateMany(
      { _id: { $in: ids } },
      { $set: { notified: true, notifiedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: `Broadcast email queued for ${subscribers.length} subscriber(s).`,
      count: subscribers.length,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/subscribers/bulk-delete
export const bulkDeleteSubscribers = async (req, res, next) => {
  const { ids } = req.body;
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one subscriber" });
    }

    const result = await Subscriber.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} subscriber(s) deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/subscribers/export
export const exportSubscribersCSV = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    
    let csv = "ID,Email,Source,SubscribedAt,Status,Notified,NotifiedAt\n";
    subscribers.forEach((s) => {
      const notifiedAtStr = s.notifiedAt ? s.notifiedAt.toISOString() : "";
      csv += `"${s._id}","${s.email}","${s.source}","${s.createdAt.toISOString()}","${s.status}","${s.notified}","${notifiedAtStr}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="wellmeds-subscribers.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
