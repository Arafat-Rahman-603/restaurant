'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tag, Copy, Check } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

interface CouponData {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  description?: string;
}

const OFFER_STYLES = [
  { gradient: 'from-primary-500 to-orange-600', emoji: '🎉' },
  { gradient: 'from-accent to-red-700', emoji: '🔥' },
  { gradient: 'from-purple-600 to-indigo-800', emoji: '⭐' },
  { gradient: 'from-teal-600 to-emerald-800', emoji: '💸' },
];

export default function SpecialOffers() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.get('/coupons')
      .then((res) => {
        setCoupons(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load coupons', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-6 w-32 bg-dark-50 rounded animate-pulse mx-auto mb-3" />
          <div className="h-10 w-64 bg-dark-50 rounded animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-dark-50 border border-dark-400 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (coupons.length === 0) {
    return null; // Don't show the section if there are no active coupons
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🎁 Exclusive Deals</span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Special Offers</h2>
        <p className="text-gray-400">Grab these limited-time deals before they're gone!</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon, i) => {
          const style = OFFER_STYLES[i % OFFER_STYLES.length];
          const discountLabel = coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue)} OFF`;
          const minOrderLabel = coupon.minOrderAmount > 0 ? `Min. spend: ${formatPrice(coupon.minOrderAmount)}` : 'No minimum spend';
          const isExpired = new Date(coupon.expiresAt) < new Date();
          const expiryLabel = isExpired ? 'Expired' : `Valid till ${new Date(coupon.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

          return (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-0.5`}
            >
              <div className="bg-dark-50 rounded-[15px] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                {/* Background decoration */}
                <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-br ${style.gradient} opacity-10 blur-2xl`} />

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl">{style.emoji}</span>
                      <div className={`bg-gradient-to-br ${style.gradient} text-white text-xl font-black px-3 py-1.5 rounded-xl`}>
                        {discountLabel}
                      </div>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1">{coupon.code} Coupon</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{coupon.description || 'Use this promo code at checkout to claim your discount!'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-5">
                      <span>{minOrderLabel}</span>
                      <span>•</span>
                      <span>{expiryLabel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-primary-500/40 bg-primary-500/5 text-primary-500 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-500/15 transition-all duration-200"
                      >
                        {copiedCode === coupon.code ? (
                          <><Check className="w-4 h-4 text-green-400" /> Copied</>
                        ) : (
                          <><Tag className="w-4 h-4" /> {coupon.code}</>
                        )}
                      </button>
                      <Link
                        href="/menu"
                        className="btn-primary px-4 py-2.5 rounded-xl text-sm font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
