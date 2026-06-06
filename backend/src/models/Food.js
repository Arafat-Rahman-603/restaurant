import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  ingredients: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  preparationTime: { type: Number, default: 20 }, // in minutes
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

foodSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Food', foodSchema);
