'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl mb-6">🛒</motion.div>
            <h1 className="text-3xl font-black text-white mb-3">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Looks like you haven't added anything yet. Let's fix that!</p>
            <Link href="/menu" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base">
              Browse Menu <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-white mb-2">Your Cart</h1>
            <p className="text-gray-400 mb-8">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, i) => {
                  const price = item.food.discountPrice || item.food.price;
                  return (
                    <motion.div
                      key={item.food._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 p-4 rounded-2xl bg-dark-50 border border-dark-400 hover:border-primary-500/30 transition-all duration-200"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(item.food.images)} alt={item.food.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base truncate">{item.food.name}</h3>
                        <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{item.food.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-primary-500 font-bold text-lg">{formatPrice(price * item.quantity)}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-dark-300 rounded-xl p-1">
                              <button onClick={() => updateQuantity(item.food._id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-dark-400 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-white font-bold w-6 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.food._id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-dark-400 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.food._id)} className="w-8 h-8 rounded-lg bg-dark-300 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-24 bg-dark-50 rounded-2xl border border-dark-400 p-6">
                <h2 className="text-white font-bold text-xl mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Delivery Charge</span>
                    <span className={deliveryCharge === 0 ? 'text-green-400 font-semibold' : 'text-white'}>
                      {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-gray-500">Add {formatPrice(500 - subtotal)} more for free delivery!</p>
                  )}
                  <div className="border-t border-dark-400 pt-3 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-primary-500 font-black text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Link>

                <Link href="/menu" className="flex items-center justify-center gap-2 mt-4 text-gray-400 hover:text-white text-sm transition-colors">
                  <ShoppingBag className="w-4 h-4" /> Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
