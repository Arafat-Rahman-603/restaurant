import express from 'express';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Coupon from '../models/Coupon.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { emitNewOrder } from '../services/socketService.js';
import { protectCustomer } from '../middleware/customerAuth.js';

const router = express.Router();

// POST /api/orders — place order directly (requires customer authentication)
router.post('/', protectCustomer, async (req, res, next) => {
  try {
    const { customer, items, couponCode, notes } = req.body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: 'Customer delivery details are required.' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = subtotal >= 500 ? 0 : 60;
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
      if (coupon && coupon.usedCount < coupon.maxUses && subtotal >= coupon.minOrderAmount) {
        discount = coupon.discountType === 'percentage'
          ? Math.round(subtotal * coupon.discountValue / 100)
          : coupon.discountValue;
      }
    }

    const total = subtotal + deliveryCharge - discount;

    const order = await Order.create({
      customer,
      items,
      subtotal,
      deliveryCharge,
      discount,
      total,
      couponCode: couponCode || null,
      notes,
      isEmailVerified: true,
      statusHistory: [{ status: 'Pending' }],
    });

    // Update customer stats
    await Customer.findByIdAndUpdate(
      req.customer._id,
      {
        $push: { orders: order._id },
        $inc: { totalOrders: 1, totalSpent: order.total },
      }
    );

    // Update coupon usage
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    // Emit socket event to admin
    emitNewOrder(order);

    // Send confirmation email
    sendOrderConfirmationEmail(order).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Order confirmed successfully!',
      data: { _id: order._id, orderId: order.orderId, total: order.total },
    });
  } catch (err) { next(err); }
});

// GET /api/orders/:orderId/track
router.get('/:orderId/track', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('-otpCode -otpExpiry')
      .populate('items.food', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

export default router;
