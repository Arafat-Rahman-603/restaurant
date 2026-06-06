'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle, Truck, ChefHat, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Order, OrderStatus } from '@/types';
import { formatDate, formatPrice, getStatusClass } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const STATUS_STEPS: { status: OrderStatus; icon: typeof Package; label: string }[] = [
  { status: 'Pending', icon: Clock, label: 'Order Placed' },
  { status: 'Confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'Preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'Out For Delivery', icon: Truck, label: 'On the Way' },
  { status: 'Delivered', icon: Package, label: 'Delivered' },
];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const trackOrder = async (id?: string) => {
    const trackId = id || orderId;
    if (!trackId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/orders/${trackId.trim()}/track`);
      setOrder(res.data.data);
    } catch {
      setOrder(null);
      toast.error('Order not found. Please check your Order ID.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setOrderId(id); trackOrder(id); }
  }, []);

  const currentStepIndex = order ? STATUS_STEPS.findIndex(s => s.status === order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">📦 Track Order</span>
            <h1 className="text-4xl font-black text-white mb-2">Order Tracking</h1>
            <p className="text-gray-400">Enter your Order ID to see real-time status updates.</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-10">
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && trackOrder()}
              placeholder="e.g. TKD-202406-1234"
              className="flex-1 px-5 py-4 rounded-xl bg-dark-50 border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors font-mono"
            />
            <button onClick={() => trackOrder()} disabled={loading} className="btn-primary px-6 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70">
              <Search className="w-5 h-5" /> {loading ? 'Searching...' : 'Track'}
            </button>
          </motion.div>

          {/* Result */}
          {searched && !loading && !order && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-dark-50 rounded-2xl border border-dark-400">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-white font-bold text-lg mb-2">Order not found</h3>
              <p className="text-gray-400">Double-check your Order ID and try again.</p>
            </motion.div>
          )}

          {order && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Order Header */}
              <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order ID</p>
                    <p className="text-primary-500 font-black text-2xl font-mono">{order.orderId}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(order.status)}`}>{order.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Customer</p><p className="text-white font-medium">{order.customer.name}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Ordered At</p><p className="text-white font-medium">{formatDate(order.createdAt)}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Total</p><p className="text-primary-500 font-bold">{formatPrice(order.total)}</p></div>
                </div>
              </div>

              {/* Progress Tracker */}
              {!isCancelled && (
                <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                  <h3 className="text-white font-bold mb-6">Order Progress</h3>
                  <div className="relative">
                    {/* Progress Bar */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-dark-400">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full"
                      />
                    </div>

                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        const Icon = step.icon;
                        return (
                          <div key={step.status} className="flex flex-col items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary-500 border-primary-500' : 'bg-dark-DEFAULT border-dark-400'} ${isCurrent ? 'animate-pulse-glow' : ''}`}
                            >
                              <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-600'}`} />
                            </motion.div>
                            <span className={`text-xs font-medium text-center ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="bg-red-500/10 rounded-2xl border border-red-500/30 p-5 text-center">
                  <p className="text-red-400 font-semibold">❌ This order has been cancelled.</p>
                </div>
              )}

              {/* Items */}
              <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                <h3 className="text-white font-bold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-dark-400 last:border-0">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs">x{item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-primary-500 font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-dark-400 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Delivery</span><span className="text-white">{formatPrice(order.deliveryCharge)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-green-400">-{formatPrice(order.discount)}</span></div>}
                  <div className="flex justify-between font-bold pt-1 border-t border-dark-400"><span className="text-white">Total</span><span className="text-primary-500">{formatPrice(order.total)}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-DEFAULT text-white flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        <p className="text-gray-400 font-semibold animate-pulse">Loading Order Tracker...</p>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
