import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index(
  { customerId: 1, food: 1 },
  {
    unique: true,
    partialFilterExpression: {
      customerId: { $exists: true },
      food: { $exists: true },
    },
  }
);

export default mongoose.model('Review', reviewSchema);
