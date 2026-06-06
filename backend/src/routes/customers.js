import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { sendPasswordResetEmail, sendSignupOTPEmail } from '../services/emailService.js';

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// === CUSTOMER AUTHENTICATION (PUBLIC) ===

// POST /api/customers/signup — creates unverified customer and sends OTP
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and phone number are required.' });
    }

    let customer = await Customer.findOne({ email: email.toLowerCase() });
    if (customer) {
      if (customer.isVerified) {
        return res.status(400).json({ success: false, message: 'Email is already registered. Please login instead.' });
      }
      // Update details for the unverified customer
      customer.name = name;
      customer.password = password;
      customer.phone = phone;
      if (address !== undefined) customer.address = address;
    } else {
      customer = new Customer({
        name,
        email,
        password,
        phone,
        address,
        isVerified: false
      });
    }

    const otp = generateOTP();
    customer.verificationOtp = otp;
    customer.verificationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await customer.save();

    await sendSignupOTPEmail(customer.email, customer.name, otp);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your email. Please verify your email to complete registration.',
      data: { email: customer.email }
    });
  } catch (err) { next(err); }
});

// POST /api/customers/verify-email — verifies signup OTP and activates account
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (customer.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please login.' });
    }

    if (!customer.verificationOtp || !customer.verificationOtpExpiry) {
      return res.status(400).json({ success: false, message: 'No verification code was requested.' });
    }

    if (customer.verificationOtpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code expired. Please sign up again.' });
    }

    if (customer.verificationOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    // Mark as verified
    customer.isVerified = true;
    customer.verificationOtp = undefined;
    customer.verificationOtpExpiry = undefined;
    await customer.save();

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Email verified and account created successfully!',
      data: {
        token,
        customer: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address }
      }
    });
  } catch (err) { next(err); }
});

// POST /api/customers/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      // Return success even if not found (security best practice)
      return res.json({ success: true, message: 'If an account exists with this email, a reset code has been sent.' });
    }

    const otp = generateOTP();
    customer.resetOtp = otp;
    customer.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await customer.save();

    await sendPasswordResetEmail(customer.email, customer.name, otp);

    res.json({ success: true, message: 'If an account exists with this email, a reset code has been sent.' });
  } catch (err) { next(err); }
});

// POST /api/customers/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    if (!customer.resetOtp || !customer.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'No reset code was requested.' });
    }
    if (customer.resetOtpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset code expired. Please request a new one.' });
    }
    if (customer.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid reset code.' });
    }

    customer.password = password;
    customer.resetOtp = undefined;
    customer.resetOtpExpiry = undefined;
    await customer.save();

    res.json({ success: true, message: 'Password reset successfully! You can now login with your new password.' });
  } catch (err) { next(err); }
});

// POST /api/customers/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        customer: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address }
      }
    });
  } catch (err) { next(err); }
});

// GET /api/customers/me
router.get('/me', protectCustomer, async (req, res) => {
  res.json({ success: true, data: req.customer });
});

// PUT /api/customers/me — update profile
router.put('/me', protectCustomer, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address }
    });
  } catch (err) { next(err); }
});

// PUT /api/customers/me/password — change password
router.put('/me/password', protectCustomer, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const isMatch = await customer.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    customer.password = newPassword;
    await customer.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
});

// GET /api/customers/me/orders — get my orders
router.get('/me/orders', protectCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id).populate({
      path: 'orders',
      select: 'orderId items total status createdAt customer',
      options: { sort: { createdAt: -1 } }
    });
    res.json({ success: true, data: customer?.orders || [] });
  } catch (err) { next(err); }
});

// GET /api/customers/me/wishlist — get my wishlist (foods)
router.get('/me/wishlist', protectCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id)
      .select('wishlist')
      .populate('wishlist', 'name description price discountPrice images isAvailable');
    res.json({ success: true, data: customer?.wishlist || [] });
  } catch (err) { next(err); }
});

// POST /api/customers/me/wishlist — toggle wishlist item
router.post('/me/wishlist', protectCustomer, async (req, res, next) => {
  try {
    const { foodId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'Invalid food ID.' });
    }

    const customer = await Customer.findById(req.customer._id).select('wishlist');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const idStr = String(foodId);
    const exists = customer.wishlist?.some((id) => String(id) === idStr);
    if (exists) {
      customer.wishlist = customer.wishlist.filter((id) => String(id) !== idStr);
    } else {
      customer.wishlist.push(foodId);
    }
    await customer.save();

    const populated = await Customer.findById(req.customer._id)
      .select('wishlist')
      .populate('wishlist', 'name description price discountPrice images isAvailable');

    res.json({ success: true, data: { action: exists ? 'removed' : 'added', wishlist: populated?.wishlist || [] } });
  } catch (err) { next(err); }
});

// DELETE /api/customers/me/wishlist/:foodId — remove item from wishlist
router.delete('/me/wishlist/:foodId', protectCustomer, async (req, res, next) => {
  try {
    const { foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'Invalid food ID.' });
    }

    const customer = await Customer.findById(req.customer._id).select('wishlist');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    customer.wishlist = customer.wishlist.filter((id) => String(id) !== String(foodId));
    await customer.save();

    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) { next(err); }
});

// === ADMIN MANAGEMENT (ADMIN ONLY) ===
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(query),
    ]);
    res.json({ success: true, data: customers, pagination: { page: parseInt(page), total } });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({ path: 'orders', select: 'orderId total status createdAt', options: { sort: { createdAt: -1 } } })
      .populate('wishlist', 'name description price discountPrice images isAvailable');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
});

export default router;
