import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { updateFoodReviewStats } from '../utils/reviewStats.js';

const router = express.Router();

router.get('/status/:foodId', protectCustomer, async (req, res, next) => {
  try {
    const { foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'Invalid food ID.' });
    }

    const [review, deliveredOrder] = await Promise.all([
      Review.findOne({ customerId: req.customer._id, food: foodId }).populate('food', 'name'),
      Order.findOne({
        'customer.email': req.customer.email,
        status: 'Delivered',
        isEmailVerified: true,
        'items.food': foodId,
      }).sort({ createdAt: -1 }).select('orderId createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        hasPurchased: Boolean(deliveredOrder),
        hasReviewed: Boolean(review),
        canReview: Boolean(deliveredOrder) && !review,
        review,
        deliveredOrder,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/reviews — public approved reviews (optionally for a food)
router.get('/', async (req, res, next) => {
  try {
    const { foodId, limit = 10 } = req.query;
    const query = { isApproved: true };
    if (foodId) query.food = foodId;
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('food', 'name')
      .populate('order', 'orderId');
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

// POST /api/reviews — submit a review
router.post('/', protectCustomer, async (req, res, next) => {
  try {
    const { foodId, rating, comment } = req.body;
    const parsedRating = Number(rating);

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'Invalid food ID.' });
    }
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please write at least 10 characters.' });
    }

    const existingReview = await Review.findOne({ customerId: req.customer._id, food: foodId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
    }

    const order = await Order.findOne({
      'customer.email': req.customer.email,
      status: 'Delivered',
      isEmailVerified: true,
      'items.food': foodId,
    }).sort({ createdAt: -1 });
    if (!order) {
      return res.status(400).json({ success: false, message: 'You can review this product after a delivered order.' });
    }

    const review = await Review.create({
      customerId: req.customer._id,
      customer: { name: req.customer.name, email: req.customer.email },
      food: foodId,
      order: order._id,
      rating: parsedRating,
      comment: comment.trim(),
    });

    res.status(201).json({ success: true, message: 'Review submitted! It will appear after approval.', data: review });
  } catch (err) { next(err); }
});

export default router;
