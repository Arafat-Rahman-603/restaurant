import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// GET /api/coupons — list active, unexpired coupons
router.get('/', async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

// POST /api/coupons/validate
router.post('/validate', async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    if (coupon.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ৳${coupon.minOrderAmount}.` });
    }

    const discount = coupon.discountType === 'percentage'
      ? Math.round(orderAmount * coupon.discountValue / 100)
      : coupon.discountValue;

    res.json({ success: true, data: { coupon, discount }, message: `Coupon applied! You save ৳${discount}.` });
  } catch (err) { next(err); }
});

export default router;
