'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Food } from '@/types';
import { useRouter } from 'next/navigation';

const COMBOS: Food[] = [
  {
    _id: 'combo1', name: 'Hot & Crispy Combo', description: 'Smash Burger + Crispy Chicken + Large Fries + Soft Drink. Best value!',
    price: 550, discountPrice: 490, category: { _id: 'c3', name: 'Combos', slug: 'combos', icon: '🍱', isActive: true, sortOrder: 3 },
    images: ['https://images.unsplash.com/photo-1619881590738-a111d176d906?w=800'], isAvailable: true, isFeatured: true, isPopular: true, preparationTime: 25, ratings: 4.8, reviewCount: 312, createdAt: '', tags: ['combo'],
  },
  {
    _id: 'combo2', name: 'Family Feast Combo', description: '4 Burgers + 2 Large Fries + 2 Drinks + 4 Piece Chicken — feed the whole family!',
    price: 1200, discountPrice: 999, category: { _id: 'c3', name: 'Combos', slug: 'combos', icon: '🍱', isActive: true, sortOrder: 3 },
    images: ['https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'], isAvailable: true, isFeatured: true, isPopular: false, preparationTime: 30, ratings: 4.7, reviewCount: 78, createdAt: '', tags: ['family', 'combo'],
  },
  {
    _id: 'combo3', name: 'Lunch Deal Combo', description: 'Single Burger + Fries + Drink + Chicken Strip — perfect for a satisfying lunch.',
    price: 350, discountPrice: 299, category: { _id: 'c3', name: 'Combos', slug: 'combos', icon: '🍱', isActive: true, sortOrder: 3 },
    images: ['https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?w=800'], isAvailable: true, isFeatured: false, isPopular: true, preparationTime: 20, ratings: 4.6, reviewCount: 145, createdAt: '', tags: ['lunch', 'deal'],
  },
];

export default function PopularCombos() {
  const router = useRouter();
  const addItem = useCartStore(s => s.addItem);

  return (
    <section className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🍱 Best Value</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Popular Combos</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Get more bang for your buck with our carefully curated combo deals.</p>
        </motion.div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMBOS.map((combo, i) => {
            const savings = combo.price - (combo.discountPrice || combo.price);
            return (
              <motion.div
                key={combo._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative bg-dark-DEFAULT rounded-2xl overflow-hidden border border-dark-400 hover:border-primary-500/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img src={combo.images[0]} alt={combo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-DEFAULT via-dark-DEFAULT/20 to-transparent" />
                  {savings > 0 && (
                    <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save {formatPrice(savings)}
                    </div>
                  )}
                  {i === 0 && (
                    <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      🔥 Bestseller
                    </div>
                  )}
                </div>
 
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2">{combo.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{combo.description}</p>
 
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-primary-500 text-2xl font-black">{formatPrice(combo.discountPrice!)}</span>
                      <span className="text-gray-500 text-sm line-through ml-2">{formatPrice(combo.price)}</span>
                    </div>
                    <button
                      onClick={() => {
                        addItem(combo);
                        toast.success(`${combo.name} added!`);
                        router.push('/cart');
                      }}
                      className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/menu?category=combos" className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all duration-200">
            View All Combos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
