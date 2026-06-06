'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, resetPasswordSchema, ForgotPasswordFormData, ResetPasswordFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (token) router.push('/');
  }, [token, router]);

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmitEmail = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await api.post('/customers/forgot-password', data);
      setEmail(data.email);
      toast.success('Reset code sent! Check your email.');
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      const res = await api.post('/customers/reset-password', {
        email,
        otp: data.otp,
        password: data.password,
      });
      toast.success(res.data.message || 'Password reset successfully!');
      setStep('success');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed.');
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
            <AnimatePresence mode="wait">

              {/* Step 1: Enter Email */}
              {step === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Forgot Password</h1>
                    <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset code</p>
                  </div>

                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input {...emailForm.register('email')} type="email" placeholder="you@example.com" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                      </div>
                      {emailForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{emailForm.formState.errors.email.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base mt-2 disabled:opacity-70">
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link href="/login" className="flex items-center justify-center gap-1.5 text-gray-400 text-sm hover:text-primary-500 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Enter Code & New Password */}
              {step === 'reset' && (
                <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                      <ShieldCheck className="w-8 h-8 text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Reset Password</h1>
                    <p className="text-gray-400 text-sm mt-1">
                      Enter the 6-digit code sent to<br />
                      <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Reset Code</label>
                      <input {...resetForm.register('otp')} maxLength={6} placeholder="000000" className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 rounded-xl bg-dark-DEFAULT border border-dark-400 text-primary-500 placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors" />
                      {resetForm.formState.errors.otp && <p className="text-red-400 text-xs mt-1">{resetForm.formState.errors.otp.message}</p>}
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input {...resetForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {resetForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{resetForm.formState.errors.password.message}</p>}
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input {...resetForm.register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {resetForm.formState.errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{resetForm.formState.errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-base mt-2 disabled:opacity-70">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <button onClick={() => setStep('email')} className="flex items-center justify-center gap-1.5 text-gray-400 text-sm hover:text-primary-500 transition-colors mx-auto">
                      <ArrowLeft className="w-4 h-4" /> Use a different email
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-white font-black text-2xl mb-2">Password Reset! 🎉</h2>
                    <p className="text-gray-400 text-sm mb-6">Your password has been changed successfully. You can now login with your new password.</p>
                    <Link href="/login" className="btn-primary w-full py-4 rounded-xl font-bold text-base inline-block text-center">
                      Go to Login
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
