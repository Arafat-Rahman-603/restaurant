'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSignupSchema, CustomerSignupFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (token) {
      router.push(redirectUrl);
    }
  }, [token, redirectUrl, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerSignupFormData>({
    resolver: zodResolver(customerSignupSchema)
  });

  const onSubmit = async (data: CustomerSignupFormData) => {
    setLoading(true);
    try {
      const res = await api.post('/customers/signup', data);
      toast.success(res.data.message || 'Verification OTP sent to your email.');
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectUrl)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center p-4 pt-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/8 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
          <div className="bg-dark-50 rounded-3xl border border-dark-400 p-8 shadow-card">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">Create Account</h1>
              <p className="text-gray-400 text-sm mt-1">Sign up for Takeout Dhanmondi</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('name')} placeholder="e.g. Rakib Hassan" className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('email')} type="email" placeholder="your@email.com" className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" className="w-full pl-12 pr-12 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('phone')} placeholder="01XXXXXXXXX" className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Delivery Address (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                  <textarea {...register('address')} rows={2} placeholder="House #, Road #, Area, Dhaka" className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none" />
                </div>
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold text-base mt-2 disabled:opacity-70">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary-500 font-semibold hover:underline">
                Login here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
