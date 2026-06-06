import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

// Routes
import foodRoutes from './src/routes/foods.js';
import categoryRoutes from './src/routes/categories.js';
import orderRoutes from './src/routes/orders.js';
import customerRoutes from './src/routes/customers.js';
import reviewRoutes from './src/routes/reviews.js';
import couponRoutes from './src/routes/coupons.js';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import uploadRoutes from './src/routes/upload.js';

import { errorHandler } from './src/middleware/errorHandler.js';
import { initSocketService } from './src/services/socketService.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket service
initSocketService(io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Takeout Dhanmondi API is running 🚀' });
});

// API Routes
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export { io };
