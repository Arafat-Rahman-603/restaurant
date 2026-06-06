'use client';
import { motion } from 'framer-motion';
import StarRating from '../ui/StarRating';

const REVIEWS = [
  { name: 'Rakib Hassan', avatar: 'RH', rating: 5, comment: 'Absolutely mind-blowing burgers! The Classic Smash is now my go-to. Delivered in 35 minutes, piping hot. 10/10 would order again.', time: '2 days ago', order: 'Classic Smash Burger' },
  { name: 'Fatima Begum', avatar: 'FB', rating: 5, comment: 'The Family Feast combo is incredible value. Fed 4 people, everyone was happy. The fried chicken is so crispy and juicy!', time: '5 days ago', order: 'Family Feast Combo' },
  { name: 'Arif Hossain', avatar: 'AH', rating: 4, comment: 'Really impressed with the quality. The Spicy Volcano Burger lives up to its name! Delivery tracking worked perfectly.', time: '1 week ago', order: 'Spicy Volcano Burger' },
  { name: 'Nadia Islam', avatar: 'NI', rating: 5, comment: 'Best fast food in Dhanmondi, hands down. The loaded fries are addictive! Customer service is top-notch.', time: '1 week ago', order: 'Loaded Fries' },
  { name: 'Karim Ahmed', avatar: 'KA', rating: 5, comment: 'Ordered for office lunch — whole team loved it. The BBQ Bacon Burger is absolutely delicious. Will definitely reorder.', time: '2 weeks ago', order: 'BBQ Bacon Burger' },
  { name: 'Sadia Rahman', avatar: 'SR', rating: 4, comment: 'Great food, great service. The mango smoothie paired with the combo was perfect. Highly recommend!', time: '2 weeks ago', order: 'Hot & Crispy Combo' },
];

export default function CustomerReviews() {
  return (
    <section className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">⭐ Customer Love</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <StarRating rating={5} size="sm" />
            <span className="font-semibold text-white">4.9</span>
            <span>out of 5 from 2,400+ reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-dark-DEFAULT rounded-2xl p-6 border border-dark-400 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.time}</p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">"{review.comment}"</p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                <span className="text-primary-500 text-xs font-medium">{review.order}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
