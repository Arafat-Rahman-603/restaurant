'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Clock, Zap, Heart } from 'lucide-react';
import { Food } from '@/types';
import { formatPrice, calculateDiscount, getImageUrl, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface FoodCardProps {
  food: Food;
  index?: number;
}

export default function FoodCard({ food, index = 0 }: FoodCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const discount = calculateDiscount(food.price, food.discountPrice);
  const displayPrice = food.discountPrice || food.price;
  const isLiked = mounted ? hasItem(food._id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(food);
    toast.success(`${food.name} added to cart!`);
    router.push('/cart');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative bg-dark-50 rounded-2xl overflow-hidden border border-dark-400 hover:border-primary-500/50 transition-all duration-300 shadow-card hover:shadow-card-hover"
    >
      <Link href={`/menu/${food._id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImageUrl(food.images)}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-DEFAULT/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {food.isFeatured && (
              <span className="px-2.5 py-1 rounded-lg bg-primary-500 text-white text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> Featured
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(food);
              const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
              if (token) {
                api.post('/customers/me/wishlist', { foodId: food._id }).catch(() => {});
              }
              toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <Heart className={cn('w-4 h-4 transition-colors', isLiked ? 'fill-red-500 text-red-500' : 'text-white')} />
          </button>

          {/* Prep Time */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-lg">
            <Clock className="w-3 h-3 text-primary-500" />
            <span className="text-white text-xs font-medium">{food.preparationTime}min</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-base mb-1 group-hover:text-primary-500 transition-colors duration-200 line-clamp-1">
            {food.name}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
            {food.description}
          </p>

          {/* Rating */}
          {food.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-3.5 h-3.5',
                      star <= Math.round(food.ratings)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-xs">({food.reviewCount})</span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary-500 font-bold text-lg">{formatPrice(displayPrice)}</span>
              {food.discountPrice && (
                <span className="text-gray-500 text-sm line-through ml-2">{formatPrice(food.price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
