import express from 'express';
import mongoose from 'mongoose';
import Food from '../models/Food.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/foods - List with search, filter, sort, paginate
router.get('/', async (req, res, next) => {
  try {
    const { search, category, sortBy = 'createdAt', order = 'desc', page = 1, limit = 12, featured, popular } = req.query;

    const query = { isAvailable: true };
    if (search) query.$text = { $search: search };
    
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // If category slug is not found, force query to return no results
          query.category = new mongoose.Types.ObjectId();
        }
      }
    }
    if (featured === 'true') query.isFeatured = true;
    if (popular === 'true') query.isPopular = true;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [foods, total] = await Promise.all([
      Food.find(query).populate('category', 'name slug icon').sort(sortOptions).skip(skip).limit(parseInt(limit)),
      Food.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: foods,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
});

// GET /api/foods/:id
router.get('/:id', async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name slug icon');
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.json({ success: true, data: food });
  } catch (err) { next(err); }
});

export default router;
