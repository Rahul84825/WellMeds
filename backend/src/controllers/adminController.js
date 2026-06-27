import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Prescription } from "../models/Prescription.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

export const uploadAdminImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const secureUrl = await uploadToCloudinary(req.file.path, "medishop_images");
    res.status(200).json({ success: true, url: secureUrl });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOf30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProductsCount,
      totalOrdersCount,
      totalUsersCount,
      totalCategoriesCount,
      salesAggregate,
      pendingOrdersCount,
      pendingRxVerification,
      todaySalesAggregate,
      monthlySalesAggregate,
      recentOrders,
      recentPrescriptions,
      topSellingAggregate,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalSales: { $sum: "$finalAmount" } } },
      ]),
      Order.countDocuments({ status: { $in: ["Pending", "Processing", "Prescription Review", "Approved", "Packed", "Shipped"] } }),
      Prescription.countDocuments({ status: "Pending Review" }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, todaySales: { $sum: "$finalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOf30DaysAgo }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, monthlySales: { $sum: "$finalAmount" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Prescription.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", name: { $first: "$items.name" }, totalQuantity: { $sum: "$items.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
      ]),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(5).lean(),
    ]);

    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;
    const todaySales = todaySalesAggregate.length > 0 ? todaySalesAggregate[0].todaySales : 0;
    const monthlySales = monthlySalesAggregate.length > 0 ? monthlySalesAggregate[0].monthlySales : 0;

    const topSellingProducts = topSellingAggregate.map(item => {
      const p = item.productDetails || {};
      return {
        id: item._id,
        _id: item._id,
        name: item.name || p.name || "Unknown Product",
        category: p.category || "OTC",
        image: p.image || "",
        stock: p.stock || 0,
        unitsSold: item.totalQuantity
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalProductsCount,
        totalOrdersCount,
        totalUsersCount,
        totalCategoriesCount,
        pendingOrdersCount,
        pendingRxVerification,
        todaySales,
        monthlySales,
      },
      recentOrders,
      recentPrescriptions,
      topSellingProducts,
      lowStockProducts,
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
