'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const email = searchParams.get('email') || '';
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!email) {
      toast.error('No email address provided for verification.');
      router.push('/signup');
    }
  }, [email, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema)
  });

  const onSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const res = await api.post('/customers/verify-email', { email, otp: data.otp });
      setAuth(res.data.data.customer, res.data.data.token);
      toast.success('Email verified! Account created successfully.');
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-50 rounded-3xl border border-dark-400 p-8 shadow-card text-center">
      <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
        <ShieldCheck className="w-8 h-8 text-primary-500" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Verify Your Email</h1>
      <p className="text-gray-400 text-sm mb-6">
        We sent a 6-digit verification code to <br />
        <strong className="text-white">{email}</strong>. Enter it below to activate your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register('otp')} maxLength={6} placeholder="000000" className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 rounded-xl bg-dark-DEFAULT border border-dark-400 text-primary-500 placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors" />
          {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? 'Verifying...' : <><CheckCircle className="w-5 h-5" /> Verify & Login</>}
        </button>
      </form>
    </div>
  );
}

export default function CustomerVerifyEmailPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center p-4 pt-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/8 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
          <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
