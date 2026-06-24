import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

export const placeOrder = async (req, res, next) => {
  const orderData = req.body;

  try {
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;

    // Validate stock and adjust inventory levels
    for (const item of orderData.items) {
      const product = await Product.findById(item.product || item.id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.name}` });
      }
    }

    // Create the order
    const order = await Order.create({
      ...orderData,
      orderId,
      user: req.user._id,
      customer: req.user.name,
      email: req.user.email,
      items: orderData.items.map((item) => ({
        product: item.product || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: orderData.requiresRx ? "Prescription Review" : "Processing",
    });

    // Deduct stock levels
    for (const item of orderData.items) {
      const productId = item.product || item.id;
      const product = await Product.findById(productId);
      
      const newStock = Math.max(0, product.stock - item.quantity);
      let badge = product.badge;
      if (newStock === 0) badge = "Out of Stock";
      else if (newStock <= 10) badge = "Low Stock";

      await Product.findByIdAndUpdate(productId, {
        stock: newStock,
        badge,
      });
    }

    // Send order confirmation email
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
    } catch (err) {
      console.warn("Order status email failed:", err.message);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params; // orderId or _id
  const { status } = req.body;

  try {
    // Find by custom orderId or Mongoose _id
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Trigger status email notification
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
    } catch (err) {
      console.warn("Order status update email failed:", err.message);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    // Replenish stock levels
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const newStock = product.stock + item.quantity;
        let badge = product.badge;
        if (newStock > 10 && (badge === "Out of Stock" || badge === "Low Stock")) {
          badge = "";
        }
        await Product.findByIdAndUpdate(item.product, {
          stock: newStock,
          badge,
        });
      }
    }

    // Send order cancel email
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, "Cancelled");
    } catch (err) {
      console.warn("Cancel email notification failed:", err.message);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
