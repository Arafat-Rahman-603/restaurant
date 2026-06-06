'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Save, Tag, Calendar, ShieldCheck, Percent } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  description?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data);
    } catch (err: any) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setMaxUses(100);
    setDescription('');
    
    // Set default expiry to 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setExpiresAt(nextMonth.toISOString().split('T')[0]);
    
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || discountValue <= 0 || !expiresAt) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        expiresAt: new Date(expiresAt),
        description
      };
      await api.post('/admin/coupons', payload);
      toast.success('Coupon created successfully!');
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err: any) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Tag className="text-primary-500 w-6 h-6" /> Coupons
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage customer discount codes and validation rules</p>
        </div>
        <button onClick={openAddModal} className="btn-primary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:scale-[1.02] transition-transform">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-dark-50 border border-dark-400 rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">No Coupons</h3>
          <p className="text-gray-400 text-sm mb-6">Create a coupon to offer discounts to customers.</p>
          <button onClick={openAddModal} className="btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-dark-50 border border-dark-400 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-dark-300/40 border-b border-dark-400 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Coupon Details</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Usage Limits</th>
                  <th className="p-4">Expires At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-400 text-sm">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) < new Date();
                  const isFullyUsed = coupon.usedCount >= coupon.maxUses;
                  const isActive = coupon.isActive && !isExpired && !isFullyUsed;

                  return (
                    <tr key={coupon._id} className="hover:bg-dark-300/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold font-mono">
                            %
                          </div>
                          <div>
                            <p className="text-white font-black font-mono tracking-wider text-base">{coupon.code}</p>
                            <p className="text-gray-500 text-xs">{coupon.description || 'No description.'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-bold text-sm">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{formatPrice(coupon.minOrderAmount)}</span>
                      </td>
                      <td className="p-4">
                        <div className="w-full max-w-[120px]">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Used: {coupon.usedCount}</span>
                            <span>Limit: {coupon.maxUses}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-dark-DEFAULT border border-dark-400 overflow-hidden">
                            <div
                              className="h-full bg-primary-500"
                              style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(coupon.expiresAt).split(' at')[0]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {isActive ? 'Active' : isExpired ? 'Expired' : isFullyUsed ? 'Fully Used' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all inline-flex items-center justify-center"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-dark-50 border border-dark-400 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-dark-400">
                <h3 className="text-white font-bold text-lg">Create Discount Coupon</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Coupon Code *</label>
                  <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. WELCOME20" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm font-mono uppercase font-bold tracking-wider" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Discount Value *</label>
                    <input type="number" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Min Spend Amount</label>
                    <input type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Max Uses Limit</label>
                    <input type="number" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Expiration Date *</label>
                  <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Coupon Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Briefly describe this discount offer..." className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none text-sm" />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 mt-2">
                  <Save className="w-4 h-4" /> {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
