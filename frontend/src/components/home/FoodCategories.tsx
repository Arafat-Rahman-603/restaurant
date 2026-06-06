'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/axios';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

const CATEGORY_STYLES = [
  { color: 'from-orange-500/20 to-orange-600/5', border: 'hover:border-orange-500/50' },
  { color: 'from-yellow-500/20 to-yellow-600/5', border: 'hover:border-yellow-500/50' },
  { color: 'from-red-500/20 to-red-600/5', border: 'hover:border-red-500/50' },
  { color: 'from-green-500/20 to-green-600/5', border: 'hover:border-green-500/50' },
  { color: 'from-blue-500/20 to-blue-600/5', border: 'hover:border-blue-500/50' },
  { color: 'from-purple-500/20 to-purple-600/5', border: 'hover:border-purple-500/50' },
  { color: 'from-pink-500/20 to-pink-600/5', border: 'hover:border-pink-500/50' },
  { color: 'from-teal-500/20 to-teal-600/5', border: 'hover:border-teal-500/50' },
];

export default function FoodCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🗂️ Browse By</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Food Categories</h2>
          <p className="text-gray-400">Explore our wide range of delicious offerings.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-dark-DEFAULT border border-dark-400 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, i) => {
              const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                >
                  <Link
                    href={`/menu?category=${cat.slug}`}
                    className={`group flex flex-col items-center gap-3 p-4 rounded-2xl bg-dark-DEFAULT border border-dark-400 ${style.border} transition-all duration-300 text-center`}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon || '🍔'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{cat.name}</p>
                      <p className="text-gray-500 text-xs">{cat.count || 0} Item{(cat.count || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
