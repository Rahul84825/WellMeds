import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Prescription } from "../models/Prescription.js";
import { User } from "../models/User.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProductsCount,
      totalOrdersCount,
      totalUsersCount,
      salesAggregate,
      pendingRxVerification,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalSales: { $sum: "$total" } } },
      ]),
      Prescription.countDocuments({ status: "Pending Review" }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalProductsCount,
        totalOrdersCount,
        totalUsersCount,
        pendingRxVerification,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'customer' or 'admin'" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
