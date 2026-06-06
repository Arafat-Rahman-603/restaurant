import express from 'express';
import Category from '../models/Category.js';
import Food from '../models/Food.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Food.countDocuments({ category: cat._id, isAvailable: true });
        return {
          ...cat.toObject(),
          count
        };
      })
    );
    res.json({ success: true, data: categoriesWithCounts });
  } catch (err) { next(err); }
});

export default router;
