import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

export const protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer account not found.' });
    }
    if (!customer.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email address first.' });
    }
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};
