import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationOtp: { type: String },
  verificationOtpExpiry: { type: Date },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
}, { timestamps: true });

customerSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

customerSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Customer', customerSchema);
