import mongoose from 'mongoose';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ORDER_STATUSES },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 60 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: null },
  status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  estimatedDelivery: { type: Date },
  notes: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  statusHistory: [statusHistorySchema],
}, { timestamps: true });

// Auto-generate orderId before saving
orderSchema.pre('save', async function() {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `TKD-${year}${month}-${random}`;
  }
});

export default mongoose.model('Order', orderSchema);
