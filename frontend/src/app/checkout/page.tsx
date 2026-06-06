'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ShieldCheck, Tag, CheckCircle, User } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { checkoutSchema, CheckoutFormData } from '@/lib/validations';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Step = 'details' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryCharge - couponDiscount;

  const { register: regDetails, handleSubmit: handleDetails, formState: { errors: errDetails }, setValue } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  // Pre-fill fields from logged-in customer info
  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      if (user.phone) setValue('phone', user.phone);
      if (user.address) setValue('address', user.address);
    }
  }, [user, setValue]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponDiscount(res.data.data.discount);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const onSubmitDetails = async (data: CheckoutFormData) => {
    if (items.length === 0) { toast.error('Your cart is empty.'); return; }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        food: i.food._id,
        name: i.food.name,
        price: i.food.discountPrice || i.food.price,
        quantity: i.quantity,
        image: i.food.images[0],
      }));
      const res = await api.post('/orders', {
        customer: data,
        items: orderItems,
        couponCode: couponCode || undefined,
        notes: data.notes
      });
      setOrderId(res.data.data.orderId);
      clearCart();
      setStep('success');
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 flex items-center justify-center bg-dark-DEFAULT">
          <div className="bg-dark-50 border border-dark-400 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-card">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">Login Required</h1>
              <p className="text-gray-400 text-sm">Please log in or create an account to complete your order.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/login?redirect=/checkout" className="flex-1 btn-primary py-3 rounded-xl font-bold text-center text-sm">
                Login
              </Link>
              <Link href="/signup?redirect=/checkout" className="flex-1 py-3 rounded-xl font-bold text-center text-sm bg-dark-300 border border-dark-400 text-white hover:border-primary-500/50 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0 && step === 'details') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🛒</p>
            <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
            <Link href="/menu" className="btn-primary px-6 py-3 rounded-xl font-bold">Browse Menu</Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">

                {/* Step 1: Details */}
                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                      <h2 className="text-white font-bold text-xl mb-5">Delivery Details</h2>
                      <form onSubmit={handleDetails(onSubmitDetails)} className="space-y-4">
                        <div>
                          <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                          <input {...regDetails('name')} placeholder="e.g. Rakib Hassan" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                          {errDetails.name && <p className="text-red-400 text-xs mt-1">{errDetails.name.message}</p>}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-1.5 block">Email Address *</label>
                          <input {...regDetails('email')} type="email" placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                          {errDetails.email && <p className="text-red-400 text-xs mt-1">{errDetails.email.message}</p>}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-1.5 block">Phone Number *</label>
                          <input {...regDetails('phone')} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                          {errDetails.phone && <p className="text-red-400 text-xs mt-1">{errDetails.phone.message}</p>}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-1.5 block">Delivery Address *</label>
                          <textarea {...regDetails('address')} rows={3} placeholder="House #, Road #, Area, Dhaka" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none" />
                          {errDetails.address && <p className="text-red-400 text-xs mt-1">{errDetails.address.message}</p>}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-1.5 block">Special Notes (Optional)</label>
                          <textarea {...regDetails('notes')} rows={2} placeholder="Any special instructions..." className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none" />
                        </div>

                        {/* Promo Code */}
                        <div className="pt-2">
                          <label className="text-gray-400 text-sm mb-1.5 block">Promo Code</label>
                          <div className="flex gap-2">
                            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME20" className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                            <button type="button" onClick={applyCoupon} disabled={couponLoading} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-500 font-semibold text-sm hover:bg-primary-500/20 transition-colors disabled:opacity-50">
                              <Tag className="w-4 h-4" /> Apply
                            </button>
                          </div>
                          {couponDiscount > 0 && (
                            <p className="text-green-400 text-xs mt-1">✓ Coupon applied! You save {formatPrice(couponDiscount)}</p>
                          )}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
                          {loading ? 'Placing Order...' : <><ShieldCheck className="w-5 h-5" /> Confirm and Order</>}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Success */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bg-dark-50 rounded-2xl border border-green-500/30 p-8 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </motion.div>
                      <h2 className="text-white font-black text-2xl mb-2">Order Confirmed! 🎉</h2>
                      <p className="text-gray-400 text-sm mb-4">Your order has been placed successfully. Check your email for the confirmation.</p>
                      <div className="bg-dark-DEFAULT rounded-xl p-4 mb-6">
                        <p className="text-gray-400 text-xs mb-1">Order ID</p>
                        <p className="text-primary-500 font-black text-2xl tracking-wider">{orderId}</p>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/order-tracking?id=${orderId}`} className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <ArrowRight className="w-4 h-4" /> Track Order
                        </Link>
                        <Link href="/menu" className="flex-1 py-3 rounded-xl font-bold text-sm bg-dark-300 border border-dark-400 text-white flex items-center justify-center hover:border-primary-500/50 transition-colors">
                          Order More
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            {step !== 'success' && (
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-50 rounded-2xl border border-dark-400 p-5 sticky top-24">
                  <h3 className="text-white font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.food._id} className="flex gap-3">
                        <img src={item.food.images[0]} alt={item.food.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.food.name}</p>
                          <p className="text-gray-400 text-xs">x{item.quantity}</p>
                        </div>
                        <span className="text-primary-500 text-sm font-bold">{formatPrice((item.food.discountPrice || item.food.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dark-400 pt-3 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery</span><span className={deliveryCharge === 0 ? 'text-green-400' : 'text-white'}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span></div>
                    {couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Discount</span><span className="text-green-400">-{formatPrice(couponDiscount)}</span></div>}
                    <div className="flex justify-between font-bold border-t border-dark-400 pt-2 mt-2"><span className="text-white">Total</span><span className="text-primary-500 text-lg">{formatPrice(total)}</span></div>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                    <p className="text-primary-500 text-xs font-semibold">💳 Cash on Delivery</p>
                    <p className="text-gray-400 text-xs mt-0.5">Pay when your order arrives.</p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
