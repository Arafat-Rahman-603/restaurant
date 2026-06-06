import Review from '../models/Review.js';
import Food from '../models/Food.js';

export const updateFoodReviewStats = async (foodId) => {
  if (!foodId) return;

  const approvedReviews = await Review.find({ food: foodId, isApproved: true }).select('rating');
  const reviewCount = approvedReviews.length;
  const averageRating = reviewCount
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  await Food.findByIdAndUpdate(foodId, {
    ratings: Number(averageRating.toFixed(1)),
    reviewCount,
  });
};
