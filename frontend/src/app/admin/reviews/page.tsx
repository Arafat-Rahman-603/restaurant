'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Star } from 'lucide-react';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    api.get('/admin/reviews').then(res => setReviews(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const approveReview = async (id: string) => {
    try {
      await api.patch(`/admin/reviews/${id}/approve`);
      setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: true } : r));
      toast.success('Review approved!');
    } catch { toast.error('Failed to approve review.'); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Review deleted.');
    } catch { toast.error('Failed to delete review.'); }
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.isApproved).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Reviews</h1>
        <p className="text-gray-400 text-sm">Moderate customer reviews and ratings.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'from-blue-500/20 to-blue-600/5' },
          { label: 'Pending Approval', value: pendingCount, color: 'from-yellow-500/20 to-yellow-600/5' },
          { label: 'Approved', value: reviews.length - pendingCount, color: 'from-green-500/20 to-green-600/5' },
        ].map(card => (
          <div key={card.label} className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border border-dark-400 text-center`}>
            <p className="text-white font-black text-2xl">{card.value}</p>
            <p className="text-gray-400 text-xs mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-primary-500 text-white' : 'bg-dark-DEFAULT border border-dark-400 text-gray-400 hover:border-primary-500/50'}`}>
            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-dark-50 rounded-2xl border border-dark-400 p-5 space-y-3">
            <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-20" /></div></div>
            <Skeleton className="h-16 w-full" />
          </div>
        )) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No reviews in this category.</div>
        ) : filtered.map((review, i) => (
          <motion.div key={review._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`bg-dark-50 rounded-2xl border p-5 transition-all ${review.isApproved ? 'border-dark-400' : 'border-yellow-500/30'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center text-primary-500 font-bold text-sm">
                  {review.customer.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{review.customer.name}</p>
                  <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!review.isApproved && (
                  <span className="px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-semibold">Pending</span>
                )}
                {review.isApproved && (
                  <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-semibold">Live</span>
                )}
              </div>
            </div>

            <StarRating rating={review.rating} size="sm" />

            <p className="text-gray-400 text-sm leading-relaxed mt-2 mb-4 line-clamp-3">"{review.comment}"</p>

            {typeof review.food === 'object' && review.food?.name && (
              <p className="text-primary-500 text-xs font-semibold mb-3 flex items-center gap-1">
                <Star className="w-3 h-3" /> {review.food.name}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!review.isApproved && (
                <button onClick={() => approveReview(review._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 text-xs font-semibold transition-colors">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              <button onClick={() => deleteReview(review._id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
