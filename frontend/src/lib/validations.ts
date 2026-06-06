import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^(?:\+?880|0)1[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  address: z.string().min(10, 'Please enter a complete delivery address').max(300),
  notes: z.string().max(500).optional(),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export const reviewSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Please write at least 10 characters').max(500),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const foodSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  description: z.string().min(10, 'Description required').max(500),
  price: z.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.number().optional().nullable(),
  category: z.string().min(1, 'Category required'),
  ingredients: z.string().optional(),
  preparationTime: z.number().min(1).max(120),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  tags: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
export type FoodFormData = z.infer<typeof foodSchema>;

export const customerSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^(?:\+?880|0)1[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  address: z.string().max(300).optional().or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type CustomerSignupFormData = z.infer<typeof customerSignupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
