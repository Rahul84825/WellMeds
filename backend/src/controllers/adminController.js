import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Prescription } from "../models/Prescription.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import XLSX from "xlsx";

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
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

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
      outOfStockProducts,
      dailySalesAggregate,
      orderStatusAggregate,
      categoryDistributionAggregate,
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
      Product.find({ inStock: false }).limit(5).lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOf7DaysAgo },
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$finalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } }
      ]),
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
        inStock: p.inStock !== undefined ? p.inStock : true,
        unitsSold: item.totalQuantity
      };
    });

    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const match = dailySalesAggregate.find(item => item._id === dateStr);
      dailySales.push({
        date: dateStr,
        day: dayLabel,
        sales: match ? match.sales : 0,
        orders: match ? match.orders : 0
      });
    }

    const orderStatusDistribution = orderStatusAggregate.map(item => ({
      status: item._id,
      count: item.count
    }));

    const categoryDistribution = categoryDistributionAggregate.map(item => ({
      categoryName: item.categoryDetails ? item.categoryDetails.name : "OTC/Other",
      count: item.count
    }));

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
      outOfStockProducts,
      dailySales,
      orderStatusDistribution,
      categoryDistribution
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

export const getSalesReport = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    
    const data = orders.map(order => ({
      "Order ID": order.orderId,
      "Customer Name": order.customer,
      "Email": order.email,
      "Date": order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "",
      "Status": order.status,
      "Subtotal (INR)": order.subtotal,
      "Shipping (INR)": order.shipping,
      "Tax (INR)": order.tax,
      "Discount (INR)": order.discountAmount,
      "Coupon Code": order.couponCode || "None",
      "Total Paid (INR)": order.finalAmount,
      "Payment Method": order.paymentMethod,
      "Payment Status": order.paymentStatus,
      "Rx Required": order.requiresRx ? "Yes" : "No",
      "Rx Uploaded": order.rxUploaded ? "Yes" : "No",
      "Shipping Address": order.shippingAddress,
      "Items Purchased": order.items.map(item => `${item.name} (x${item.quantity})`).join(", ")
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const maxLens = {};
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key] || "");
        maxLens[key] = Math.max(maxLens[key] || key.length, val.length);
      });
    });
    worksheet["!cols"] = Object.keys(maxLens).map(key => ({
      wch: Math.min(Math.max(maxLens[key] + 2, 10), 50)
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=sales_report_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const getCustomersReport = async (req, res, next) => {
  try {
    const users = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
    
    const ordersSummary = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$finalAmount" }
        }
      }
    ]);

    const statsMap = {};
    ordersSummary.forEach(item => {
      if (item._id) {
        statsMap[item._id.toString()] = {
          totalOrders: item.totalOrders,
          totalSpent: item.totalSpent
        };
      }
    });

    const data = users.map(user => {
      const stats = statsMap[user._id.toString()] || { totalOrders: 0, totalSpent: 0 };
      return {
        "User ID": user._id.toString(),
        "Customer Name": user.name,
        "Email": user.email || "N/A",
        "Mobile Number": user.mobile || "N/A",
        "Auth Provider": user.authProvider || "N/A",
        "Is Verified": user.isVerified ? "Yes" : "No",
        "Profile Completed": user.isProfileCompleted ? "Yes" : "No",
        "Registration Date": user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "",
        "Last Login Date": user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-IN") : "N/A",
        "Total Orders (Non-Cancelled)": stats.totalOrders,
        "Total Spent (INR)": stats.totalSpent
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    const maxLens = {};
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key] || "");
        maxLens[key] = Math.max(maxLens[key] || key.length, val.length);
      });
    });
    worksheet["!cols"] = Object.keys(maxLens).map(key => ({
      wch: Math.min(Math.max(maxLens[key] + 2, 10), 50)
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Report");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=customers_report_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

