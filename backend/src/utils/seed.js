import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Food from '../models/Food.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const CATEGORIES = [
  { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 1 },
  { name: 'Fried Chicken', slug: 'fried-chicken', icon: '🍗', sortOrder: 2 },
  { name: 'Combos', slug: 'combos', icon: '🍱', sortOrder: 3 },
  { name: 'Wraps', slug: 'wraps', icon: '🌯', sortOrder: 4 },
  { name: 'Sides', slug: 'sides', icon: '🍟', sortOrder: 5 },
  { name: 'Drinks', slug: 'drinks', icon: '🥤', sortOrder: 6 },
  { name: 'Desserts', slug: 'desserts', icon: '🍰', sortOrder: 7 },
  { name: 'Pizzas', slug: 'pizzas', icon: '🍕', sortOrder: 8 },
];

const seed = async () => {
  await connectDB();

  // Seed Admin
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await Admin.create({ name: 'Super Admin', email: process.env.ADMIN_EMAIL || 'admin@takeoutdhanmondi.com', password: process.env.ADMIN_PASSWORD || 'admin123', role: 'super_admin' });
    console.log('✅ Admin created');
  }

  // Seed Categories
  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log('✅ Categories seeded');

  // Seed Sample Foods
  const burgerCat = await Category.findOne({ slug: 'burgers' });
  const chickenCat = await Category.findOne({ slug: 'fried-chicken' });
  const combosCat = await Category.findOne({ slug: 'combos' });
  const sidesCat = await Category.findOne({ slug: 'sides' });
  const drinksCat = await Category.findOne({ slug: 'drinks' });

  const foods = [
    { name: 'Classic Smash Burger', description: 'Double smash patty, American cheese, caramelized onions, pickles, our secret sauce on a brioche bun.', price: 280, discountPrice: 250, category: burgerCat._id, images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'], isFeatured: true, isPopular: true, preparationTime: 15, ratings: 4.8, reviewCount: 124, tags: ['bestseller', 'spicy'] },
    { name: 'BBQ Bacon Burger', description: 'Juicy beef patty with crispy bacon, BBQ sauce, cheddar cheese, lettuce and tomato.', price: 320, category: burgerCat._id, images: ['https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800'], isFeatured: true, preparationTime: 18, ratings: 4.7, reviewCount: 89, tags: ['bbq', 'bacon'] },
    { name: 'Spicy Volcano Burger', description: 'Fire grilled patty, jalapeños, habanero sauce, pepper jack cheese — not for the faint-hearted!', price: 300, category: burgerCat._id, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800'], isFeatured: true, preparationTime: 20, ratings: 4.9, reviewCount: 201, tags: ['spicy', 'hot'] },
    { name: 'Crispy Fried Chicken', description: 'Southern-style double-dredged fried chicken, crispy outside, juicy inside.', price: 200, category: chickenCat._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=800'], isPopular: true, preparationTime: 20, ratings: 4.6, reviewCount: 156 },
    { name: 'Hot & Crispy Combo', description: 'Smash Burger + Crispy Chicken + Large Fries + Soft Drink. Best value meal!', price: 550, discountPrice: 490, category: combosCat._id, images: ['https://images.unsplash.com/photo-1619881590738-a111d176d906?w=800'], isFeatured: true, isPopular: true, preparationTime: 25, ratings: 4.8, reviewCount: 312, tags: ['combo', 'value'] },
    { name: 'Family Feast Combo', description: '4 Burgers + 2 Large Fries + 2 Drinks + 4 Piece Chicken — feed the whole family!', price: 1200, discountPrice: 999, category: combosCat._id, images: ['https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'], isFeatured: true, preparationTime: 30, ratings: 4.7, reviewCount: 78, tags: ['family', 'combo', 'value'] },
    { name: 'Loaded Fries', description: 'Crispy fries topped with cheese sauce, jalapeños, sour cream and bacon bits.', price: 150, category: sidesCat._id, images: ['https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800'], isPopular: true, preparationTime: 10, ratings: 4.5, reviewCount: 234 },
    { name: 'Mango Smoothie', description: 'Fresh Bangladeshi mango blended with milk and a hint of honey.', price: 120, category: drinksCat._id, images: ['https://images.unsplash.com/photo-1546173159-315724a31696?w=800'], preparationTime: 5, ratings: 4.9, reviewCount: 67 },
  ];

  for (const food of foods) {
    await Food.findOneAndUpdate({ name: food.name }, food, { upsert: true });
  }
  console.log('✅ Foods seeded');

  // Seed Coupon
  await Coupon.findOneAndUpdate({ code: 'WELCOME20' }, {
    code: 'WELCOME20', discountType: 'percentage', discountValue: 20,
    minOrderAmount: 300, maxUses: 500, expiresAt: new Date('2025-12-31'),
    description: '20% off for new customers!', isActive: true,
  }, { upsert: true });

  await Coupon.findOneAndUpdate({ code: 'FLAT50' }, {
    code: 'FLAT50', discountType: 'fixed', discountValue: 50,
    minOrderAmount: 400, maxUses: 200, expiresAt: new Date('2025-12-31'),
    description: '৳50 flat off on orders above ৳400', isActive: true,
  }, { upsert: true });

  console.log('✅ Coupons seeded');
  console.log('\n🎉 Database seeded successfully!');
  console.log(`👑 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@takeoutdhanmondi.com'}`);
  console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
