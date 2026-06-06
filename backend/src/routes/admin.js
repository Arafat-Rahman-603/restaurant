import express from 'express';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Customer from '../models/Customer.js';
import Coupon from '../models/Coupon.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendStatusUpdateEmail } from '../services/emailService.js';
import { emitOrderStatusUpdate } from '../services/socketService.js';
import upload from '../middleware/upload.js';
import { updateFoodReviewStats } from '../utils/reviewStats.js';

const router = express.Router();
router.use(protect);

// === DASHBOARD STATS ===
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      recentOrders,
      yesterdayOrders,
      thisWeekOrders,
      lastWeekOrders,
      thisWeekRevResult,
      lastWeekRevResult,
      thisWeekCustomers,
      lastWeekCustomers
    ] = await Promise.all([
      Order.countDocuments({ isEmailVerified: true }),
      Order.countDocuments({ isEmailVerified: true, createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([{ $match: { isEmailVerified: true, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Customer.countDocuments(),
      Order.countDocuments({ status: 'Pending', isEmailVerified: true }),
      Order.find({ isEmailVerified: true }).sort({ createdAt: -1 }).limit(10).select('orderId customer total status createdAt'),
      // Yesterday orders
      Order.countDocuments({ isEmailVerified: true, createdAt: { $gte: yesterday, $lt: today } }),
      // This week orders
      Order.countDocuments({ isEmailVerified: true, createdAt: { $gte: oneWeekAgo } }),
      // Last week orders
      Order.countDocuments({ isEmailVerified: true, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
      // This week revenue
      Order.aggregate([
        { $match: { isEmailVerified: true, status: { $ne: 'Cancelled' }, createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Last week revenue
      Order.aggregate([
        { $match: { isEmailVerified: true, status: { $ne: 'Cancelled' }, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // This week customers
      Customer.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      // Last week customers
      Customer.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
    ]);

    // Weekly revenue for chart (last 7 days)
    const weeklyRevenue = await Order.aggregate([
      { $match: { isEmailVerified: true, status: { $ne: 'Cancelled' }, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const thisWeekRevenue = thisWeekRevResult[0]?.total || 0;
    const lastWeekRevenue = lastWeekRevResult[0]?.total || 0;

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
    };

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        pendingOrders,
        recentOrders,
        weeklyRevenue,
        changes: {
          orders: calculateChange(thisWeekOrders, lastWeekOrders),
          todayOrders: calculateChange(todayOrders, yesterdayOrders),
          revenue: calculateChange(thisWeekRevenue, lastWeekRevenue),
          customers: calculateChange(thisWeekCustomers, lastWeekCustomers)
        }
      },
    });
  } catch (err) { next(err); }
});

// === ORDERS MANAGEMENT ===
router.get('/orders', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = { isEmailVerified: true };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();

    // Real-time update
    emitOrderStatusUpdate(order);

    // Send email notification
    if (['Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'].includes(status)) {
      sendStatusUpdateEmail(order).catch(console.error);
    }

    res.json({ success: true, message: `Order status updated to ${status}.`, data: order });
  } catch (err) { next(err); }
});

// === FOOD MANAGEMENT ===
router.get('/foods', async (req, res, next) => {
  try {
    const foods = await Food.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, data: foods });
  } catch (err) { next(err); }
});

router.post('/foods', upload.array('images', 5), async (req, res, next) => {
  try {
    const images = req.files?.map(f => f.path) || [];
    const food = await Food.create({ ...req.body, images });
    res.status(201).json({ success: true, data: food });
  } catch (err) { next(err); }
});

router.put('/foods/:id', upload.array('images', 5), async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.files?.length > 0) updates.images = req.files.map(f => f.path);
    const food = await Food.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ success: false, message: 'Food not found.' });
    res.json({ success: true, data: food });
  } catch (err) { next(err); }
});

router.delete('/foods/:id', async (req, res, next) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food deleted.' });
  } catch (err) { next(err); }
});

// === CATEGORY MANAGEMENT ===
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { next(err); }
});

// === REVIEW MANAGEMENT ===
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('food', 'name')
      .populate('order', 'orderId');
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

router.patch('/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('food', 'name').populate('order', 'orderId');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    await updateFoodReviewStats(typeof review.food === 'object' ? review.food?._id : review.food);
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
});

router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    await updateFoodReviewStats(review.food);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { next(err); }
});

// === COUPON MANAGEMENT ===
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

router.post('/coupons', async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

router.delete('/coupons/:id', async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) { next(err); }
});

export default router;
