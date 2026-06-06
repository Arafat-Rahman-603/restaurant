'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Clock, Star, ChevronLeft, Flame, Heart, MessageSquare, Send } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StarRating from '@/components/ui/StarRating';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';
import { Food, Review, ReviewStatus } from '@/types';
import { formatPrice, calculateDiscount, getImageUrl, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore(s => s.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const rehydrateStores = async () => {
      await Promise.all([
        useWishlistStore.persist.rehydrate(),
        useAuthStore.persist.rehydrate(),
      ]);
      setMounted(true);
      setAuthReady(true);
    };

    rehydrateStores();
  }, []);

  useEffect(() => {
    api.get(`/foods/${id}`).then(res => setFood(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);
    api.get('/reviews', { params: { foodId: id, limit: 20 } })
      .then(res => setReviews(res.data.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!authReady) return;
    if (!token) {
      setReviewStatus(null);
      setReviewStatusLoading(false);
      return;
    }

    setReviewStatusLoading(true);
    api.get(`/reviews/status/${id}`)
      .then(res => setReviewStatus(res.data.data))
      .catch(() => setReviewStatus(null))
      .finally(() => setReviewStatusLoading(false));
  }, [authReady, id, token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <FoodCardSkeleton />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 rounded-xl w-full" />)}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!food) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 flex items-center justify-center text-center">
          <div>
            <p className="text-5xl mb-4">😔</p>
            <h1 className="text-2xl font-bold text-white mb-2">Food item not found</h1>
            <Link href="/menu" className="text-primary-500 hover:underline">Back to Menu</Link>
          </div>
        </main>
      </>
    );
  }

  const displayPrice = food.discountPrice || food.price;
  const discount = calculateDiscount(food.price, food.discountPrice);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(food);
    toast.success(`${quantity}x ${food.name} added to cart!`);
    router.push('/cart');
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/menu/${id}`)}`);
      return;
    }

    if (reviewComment.trim().length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        foodId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviewStatus((current) => current ? {
        ...current,
        hasReviewed: true,
        canReview: false,
        review: res.data.data,
      } : {
        hasPurchased: true,
        hasReviewed: true,
        canReview: false,
        review: res.data.data,
        deliveredOrder: null,
      });
      setReviewComment('');
      setReviewRating(5);
      toast.success(res.data.message || 'Review submitted!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/menu" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Menu
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="rounded-2xl overflow-hidden h-80 sm:h-96 mb-3">
                <img src={getImageUrl(food.images, activeImage)} alt={food.name} className="w-full h-full object-cover" />
              </div>
              {food.images.length > 1 && (
                <div className="flex gap-2">
                  {food.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary-500' : 'border-dark-400'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {food.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-primary-500/10 text-primary-500 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                      <Flame className="w-3 h-3" /> Featured
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-black text-white">{food.name}</h1>
                </div>
                {discount > 0 && (
                  <span className="bg-accent text-white px-3 py-1.5 rounded-xl text-sm font-bold flex-shrink-0">-{discount}%</span>
                )}
              </div>

              {food.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={food.ratings} size="md" />
                  <span className="text-white font-semibold">{food.ratings}</span>
                  <span className="text-gray-400 text-sm">({food.reviewCount} reviews)</span>
                </div>
              )}

              <p className="text-gray-400 leading-relaxed">{food.description}</p>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Preparation time: <strong className="text-white">{food.preparationTime} minutes</strong></span>
              </div>

              {food.ingredients && food.ingredients.length > 0 && (
                <div>
                  <p className="text-white font-semibold mb-2 text-sm">Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {food.ingredients.map(ing => (
                      <span key={ing} className="px-3 py-1 rounded-full bg-dark-50 border border-dark-400 text-gray-400 text-xs">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {food.nutritionInfo && (
                <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-dark-50 border border-dark-400">
                  {[
                    { label: 'Calories', value: food.nutritionInfo.calories, unit: 'kcal' },
                    { label: 'Protein', value: food.nutritionInfo.protein, unit: 'g' },
                    { label: 'Carbs', value: food.nutritionInfo.carbs, unit: 'g' },
                    { label: 'Fat', value: food.nutritionInfo.fat, unit: 'g' },
                  ].filter(n => n.value).map(n => (
                    <div key={n.label} className="text-center">
                      <p className="text-primary-500 font-bold">{n.value}{n.unit}</p>
                      <p className="text-gray-500 text-xs">{n.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing & Quantity */}
              <div className="pt-4 border-t border-dark-400">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-primary-500 font-black text-3xl">{formatPrice(displayPrice)}</span>
                  {food.discountPrice && <span className="text-gray-500 text-lg line-through">{formatPrice(food.price)}</span>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-dark-50 border border-dark-400 rounded-xl p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-dark-300 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-lg bg-dark-300 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={handleAddToCart} className="flex-1 btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-xs" /> 
                    <span className="sm:block hidden">Add {quantity} to Cart — </span>
                    {formatPrice(displayPrice * quantity)}
                  </button>
                  <button
                    onClick={() => {
                      toggleWishlist(food);
                      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
                      if (storedToken) {
                        api.post('/customers/me/wishlist', { foodId: food._id }).catch(() => {});
                      }
                      toast.success(mounted && hasItem(food._id) ? 'Removed from wishlist' : 'Added to wishlist');
                    }}
                    className="w-12 h-12 rounded-xl bg-dark-50 border border-dark-400 hover:border-primary-500/50 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                    title={mounted && hasItem(food._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={cn("w-5 h-5 transition-colors", mounted && hasItem(food._id) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-14 grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-50 border border-dark-400 rounded-3xl p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 text-xs font-semibold mb-3">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Customer Reviews
                  </div>
                  <h2 className="text-md md:text-2xl font-black text-white">What customers say</h2>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">
                    Read approved reviews for this product.
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <StarRating rating={food.ratings} size="sm" />
                    <span className="text-white font-bold">{food.ratings.toFixed(1)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{food.reviewCount} review{food.reviewCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-4">
                {reviewsLoading ? [...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-dark-400 bg-dark-DEFAULT p-5 animate-pulse">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="space-y-2">
                        <div className="h-4 w-28 rounded bg-dark-300" />
                        <div className="h-3 w-20 rounded bg-dark-300" />
                      </div>
                      <div className="h-4 w-24 rounded bg-dark-300" />
                    </div>
                    <div className="h-4 w-full rounded bg-dark-300 mb-2" />
                    <div className="h-4 w-3/4 rounded bg-dark-300" />
                  </div>
                )) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-dark-400 bg-dark-DEFAULT p-8 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-white font-bold">No reviews yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Be the first customer to leave feedback for this item.</p>
                  </div>
                ) : reviews.map((review) => (
                  <article key={review._id} className="rounded-2xl border border-dark-400 bg-dark-DEFAULT p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-white font-semibold">{review.customer.name}</p>
                        <p className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                  </article>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-dark-50 border border-dark-400 rounded-3xl p-6 sm:p-7 h-fit"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-md md:text-xl font-black text-white">Write a review</h2>
                  <p className="text-gray-400 text-xs md:text-sm">One review per customer for this product.</p>
                </div>
              </div>

              {!authReady || reviewStatusLoading ? (
                <div className="py-10 text-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Checking review access...</p>
                </div>
              ) : !token || !user ? (
                <div className="rounded-2xl border border-dark-400 bg-dark-DEFAULT p-5">
                  <p className="text-white font-semibold mb-2">Login to leave a review</p>
                  <p className="text-gray-400 text-sm mb-4">You need an account and a delivered order for this product.</p>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/menu/${id}`)}`}
                    className="btn-primary inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm"
                  >
                    Login to Review
                  </Link>
                </div>
              ) : reviewStatus?.hasReviewed && reviewStatus.review ? (
                <div className="rounded-2xl border border-dark-400 bg-dark-DEFAULT p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">Your review has been submitted</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {reviewStatus.review.isApproved ? 'It is visible to customers now.' : 'It is waiting for admin approval.'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${reviewStatus.review.isApproved ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                      {reviewStatus.review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating rating={reviewStatus.review.rating} size="sm" />
                    {typeof reviewStatus.review.order === 'object' && reviewStatus.review.order?.orderId && (
                      <span className="text-gray-500 text-xs">Order #{reviewStatus.review.order.orderId}</span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">{reviewStatus.review.comment}</p>
                </div>
              ) : reviewStatus && !reviewStatus.hasPurchased ? (
                <div className="rounded-2xl border border-dark-400 bg-dark-DEFAULT p-5">
                  <p className="text-white font-semibold mb-2">Review unlocks after delivery</p>
                  <p className="text-gray-400 text-sm">
                    Place this order and wait until it is delivered before posting a review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <p className="text-gray-400 text-sm mb-3">Your rating</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors ${value <= reviewRating ? 'border-primary-500/50 bg-primary-500/10 text-primary-500' : 'border-dark-400 bg-dark-DEFAULT text-gray-600 hover:text-primary-500'}`}
                        >
                          <Star className={cn('w-5 h-5', reviewRating >= value && 'fill-current')} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {reviewStatus?.deliveredOrder?.orderId && (
                    <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 px-4 py-3 text-sm text-gray-300">
                      Reviewing delivered order #{reviewStatus.deliveredOrder.orderId}
                    </div>
                  )}

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Your comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={5}
                      placeholder="Tell other customers what you liked about this product..."
                      className="w-full rounded-2xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-primary-500 resize-none"
                    />
                    <p className="text-gray-500 text-xs mt-2">Minimum 10 characters.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReview ? 'Submitting review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
