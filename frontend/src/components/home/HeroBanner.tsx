'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Truck, ChevronDown } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-DEFAULT noise-overlay">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 blur-[150px]" />
      </div>

      {/* Floating food images */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[5%] top-[20%] hidden lg:block"
      >
        <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-primary-500/30 shadow-glow-lg">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
            alt="Signature Burger"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute right-[22%] top-[8%] hidden xl:block"
      >
        <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-accent/30">
          <img
            src="https://images.unsplash.com/photo-1562967914-608f82629710?w=300"
            alt="Fried Chicken"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute right-[10%] bottom-[20%] hidden xl:block"
      >
        <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-primary-500/20">
          <img
            src="https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300"
            alt="Loaded Fries"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-500 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Now Delivering in Dhanmondi
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6"
          >
            Taste The{' '}
            <span className="gradient-text">Fire</span>
            <br />
            Feel The{' '}
            <span className="gradient-text">Flavor</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl"
          >
            Premium smash burgers, crispy fried chicken, and loaded combos — crafted with the finest ingredients and delivered hot to your door in under 45 minutes.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-6 mb-10"
          >
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-2 h-2 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">4.9</span>
              <span className="text-gray-500 text-[0.4rem] md:text-sm">(2.4k+ reviews)</span>
            </div>
            <div className="w-px h-5 bg-dark-400" />
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
              <span className="text-[0.5rem] md:text-sm">Free delivery on orders over ৳500</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/menu"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold group"
            >
              Order Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-dark-50 border border-dark-400 text-white hover:border-primary-500/50 hover:bg-dark-100 transition-all duration-200"
            >
              View Menu
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mt-4 max-w-sm sm:max-w-none"
          >
            {[
              { icon: '🔥', text: 'Made Fresh Daily' },
              { icon: '⚡', text: '30-45 Min Delivery' },
              { icon: '🛵', text: 'Live Order Tracking' },
              { icon: '💳', text: 'Cash on Delivery' },
            ].map((pill) => (
              <div key={pill.text} className="flex items-center gap-2 glass px-2 py-2 rounded-full text-[.7rem] md:text-sm text-gray-300">
                <span>{pill.icon}</span>
                <span>{pill.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
