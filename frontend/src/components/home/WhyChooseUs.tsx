'use client';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Truck, ChefHat, Star } from 'lucide-react';

const REASONS = [
  { icon: ChefHat, title: 'Premium Ingredients', description: 'We source only the freshest, highest-quality ingredients for every dish we prepare.', color: 'from-orange-500/20 to-orange-600/5' },
  { icon: Clock, title: '30-Min Guarantee', description: 'Your food arrives hot within 30-45 minutes or we give you 20% off your next order.', color: 'from-blue-500/20 to-blue-600/5' },
  { icon: Truck, title: 'Real-time Tracking', description: 'Track every step of your order from preparation to delivery right on your phone.', color: 'from-green-500/20 to-green-600/5' },
  { icon: Star, title: '4.9 Star Rating', description: 'Over 2,400 happy customers rate us 4.9/5 stars. Quality is our obsession.', color: 'from-yellow-500/20 to-yellow-600/5' },
  { icon: Shield, title: '100% Hygienic', description: 'Our kitchen follows the strictest food safety standards. HACCP certified.', color: 'from-purple-500/20 to-purple-600/5' },
  { icon: Zap, title: 'Easy Ordering', description: 'No account needed. Order as a guest in seconds and pay on delivery.', color: 'from-red-500/20 to-red-600/5' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">✨ Our Promise</span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Why Choose Takeout Dhanmondi?</h2>
        <p className="text-gray-400 max-w-xl mx-auto">We're not just another fast food joint — we're your neighborhood's premium fast food destination.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REASONS.map(({ icon: Icon, title, description, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group p-6 rounded-2xl bg-dark-50 border border-dark-400 hover:border-primary-500/40 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
