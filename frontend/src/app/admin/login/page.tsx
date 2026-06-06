'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, AdminLoginFormData } from '@/lib/validations';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormData>({ resolver: zodResolver(adminLoginSchema) });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) router.push('/admin');
  }, []);

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('admin_token', res.data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
      toast.success('Welcome back!');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/8 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-dark-50 rounded-3xl border border-dark-400 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Takeout Dhanmondi</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
              <input {...register('email')} type="email" placeholder="admin@takeoutdhanmondi.com" className="w-full px-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full px-4 py-3.5 pr-12 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base mt-2 disabled:opacity-70">
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                ← Back to Customer Login
              </Link>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
