'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FoodCard from '../menu/FoodCard';
import { FoodCardSkeleton } from '../ui/Skeleton';
import { Food } from '@/types';
import api from '@/lib/axios';

export default function FeaturedBurgers() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/foods?featured=true&limit=3&category=burgers').then(res => {
      const data = res.data.data;
      setFoods(data.length > 0 ? data : FALLBACK_FOODS);
    }).catch(() => setFoods(FALLBACK_FOODS)).finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🍔 Signature Selection</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Burgers</h2>
          <p className="text-gray-400 mt-2 max-w-md">Our most-loved burgers, crafted with premium ingredients and smashed to perfection.</p>
        </div>
        <Link href="/menu?category=burgers" className="hidden sm:flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all duration-200">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(3).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)
          : foods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)
        }
      </div>
    </section>
  );
}

const FALLBACK_FOODS: Food[] = [
  { _id: '1', name: 'Classic Smash Burger', description: 'Double smash patty, American cheese, caramelized onions, pickles, our secret sauce on a brioche bun.', price: 280, discountPrice: 250, category: { _id: 'c1', name: 'Burgers', slug: 'burgers', icon: '🍔', isActive: true, sortOrder: 1 }, images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'], isAvailable: true, isFeatured: true, isPopular: true, preparationTime: 15, ratings: 4.8, reviewCount: 124, createdAt: '' },
  { _id: '2', name: 'BBQ Bacon Burger', description: 'Juicy beef patty with crispy bacon, BBQ sauce, cheddar cheese, lettuce and tomato.', price: 320, category: { _id: 'c1', name: 'Burgers', slug: 'burgers', icon: '🍔', isActive: true, sortOrder: 1 }, images: ['https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800'], isAvailable: true, isFeatured: true, isPopular: false, preparationTime: 18, ratings: 4.7, reviewCount: 89, createdAt: '' },
  { _id: '3', name: 'Spicy Volcano Burger', description: 'Fire grilled patty, jalapeños, habanero sauce, pepper jack cheese.', price: 300, category: { _id: 'c1', name: 'Burgers', slug: 'burgers', icon: '🍔', isActive: true, sortOrder: 1 }, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800'], isAvailable: true, isFeatured: true, isPopular: true, preparationTime: 20, ratings: 4.9, reviewCount: 201, createdAt: '' },
];
