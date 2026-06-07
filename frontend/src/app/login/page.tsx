'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, AdminLoginFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, token } = useAuthStore();
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

  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema)
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true);
    try {
      const res = await api.post('/customers/login', data);
      setAuth(res.data.data.customer, res.data.data.token);
      toast.success('Welcome back!');
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed.');
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">Login Account</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back to Takeout Dhanmondi</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-primary-500 text-xs font-medium hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base mt-2 disabled:opacity-70">
                {loading ? 'Logging in...' : 'Login to Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Link href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary-500 font-semibold hover:underline">
                Create Account
              </Link>
            </div>

            <div className="mt-3 pt-3 border-t border-dark-400 text-center">
              <Link href="/admin/login" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                Admin? Login here →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
