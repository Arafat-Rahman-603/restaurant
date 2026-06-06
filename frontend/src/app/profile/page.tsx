'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Package, Lock, MapPin, Phone, Mail, Save, Eye, EyeOff, ChevronRight, ArrowUpRight, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/Badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'profile' | 'orders' | 'wishlist' | 'security';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'security', label: 'Security', icon: Lock },
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, updateUser, logout } = useAuthStore();

  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam && TABS.some(t => t.id === tabParam) ? tabParam : 'profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { items: wishlistItems, toggleWishlist, setItems: setWishlistItems } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [wishlistMounted, setWishlistMounted] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    setWishlistMounted(true);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/profile');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    api.get('/customers/me/wishlist')
      .then((res) => setWishlistItems(res.data.data || []))
      .catch(() => {});
  }, [token, setWishlistItems]);

  // Sync form fields when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      setOrdersLoading(true);
      api.get('/customers/me/orders')
        .then(res => setOrders(res.data.data))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res = await api.put('/customers/me', { name, phone, address });
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    setChangingPassword(true);
    try {
      await api.put('/customers/me/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setChangingPassword(false); }
  };

  if (!token) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">My Account</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your profile, orders, and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-dark-50 rounded-2xl border border-dark-400 overflow-hidden">
            {/* User Card */}
            <div className="p-5 border-b border-dark-400 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-3 text-white text-xl font-bold">
                {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <p className="text-white font-bold text-lg truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>

            {/* Tab Navigation */}
            <div className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-dark-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="p-2 pt-0">
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">

            {/* ===== PROFILE TAB ===== */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                  <h2 className="text-white font-bold text-lg mb-5">Personal Information</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                        <div className="relative">
                          <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                          <input value={user?.email || ''} disabled className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-gray-500 cursor-not-allowed text-sm" />
                        </div>
                        <p className="text-gray-600 text-[11px] mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4.5 h-4.5 text-gray-500" />
                        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="House #, Road #, Area, Dhaka" className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none text-sm" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-70">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-dark-50 rounded-2xl border border-dark-400">
                  <div className="p-6 border-b border-dark-400">
                    <h2 className="text-white font-bold text-lg">Order History</h2>
                    <p className="text-gray-500 text-xs mt-0.5">View all your past and current orders</p>
                  </div>

                  {ordersLoading ? (
                    <div className="p-10 text-center">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-10 text-center">
                      <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-4">You haven't placed any orders yet.</p>
                      <Link href="/menu" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-block">
                        Browse Menu
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-dark-400">
                      {orders.map((order: any) => (
                        <div key={order._id} className="p-5 hover:bg-dark-300/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-primary-500 font-mono font-bold text-sm">#{order.orderId}</span>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="text-gray-400 text-xs">
                                {formatDate(order.createdAt)} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-white font-bold">{formatPrice(order.total)}</p>
                              <Link
                                href={`/order-tracking?id=${order.orderId}`}
                                className="inline-flex items-center gap-1 text-primary-500 text-xs font-semibold hover:underline mt-1"
                              >
                                Track <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== WISHLIST TAB ===== */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                  <h2 className="text-white font-bold text-lg mb-1">My Wishlist</h2>
                  <p className="text-gray-500 text-xs mb-6">Foods you've saved for later</p>

                  {!wishlistMounted ? (
                    <div className="text-center py-10">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-10">
                      <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-4">Your wishlist is empty.</p>
                      <Link href="/menu" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-block">
                        Explore Menu
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistItems.map((food) => {
                        const displayPrice = food.discountPrice || food.price;
                        return (
                          <div key={food._id} className="bg-dark-DEFAULT border border-dark-400 rounded-xl p-4 flex gap-4 hover:border-primary-500/30 transition-all">
                            <img src={food.images[0]} alt={food.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h3 className="text-white font-bold text-sm truncate">{food.name}</h3>
                                <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{food.description}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-primary-500 font-bold text-sm">{formatPrice(displayPrice)}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      toggleWishlist(food);
                                      api.delete(`/customers/me/wishlist/${food._id}`).catch(() => {});
                                      toast.success('Removed from wishlist');
                                    }}
                                    className="p-2 rounded-lg bg-dark-300 border border-dark-400 text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      addItem(food);
                                      toast.success(`${food.name} added to cart!`);
                                      router.push('/cart');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== SECURITY TAB ===== */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-dark-50 rounded-2xl border border-dark-400 p-6">
                  <h2 className="text-white font-bold text-lg mb-5">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                        <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" className="w-full pl-11 pr-12 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type={showNew ? 'text' : 'password'} placeholder="At least 6 characters" className="w-full pl-11 pr-12 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                        <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Re-enter new password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <button type="submit" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-70">
                      <Lock className="w-4 h-4" />
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark-DEFAULT pt-28 pb-20">
        <Suspense fallback={<div className="text-center pt-40 text-gray-400">Loading...</div>}>
          <ProfileContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
