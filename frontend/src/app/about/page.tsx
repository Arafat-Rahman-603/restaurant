import { motion } from 'framer-motion';
import { Flame, Heart, Award, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent/10" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mx-auto mb-6">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
              About <span className="gradient-text">Takeout Dhanmondi</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Born from a passion for premium fast food and a love for Dhanmondi's vibrant food culture, we've been serving up unforgettable flavors since 2020.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🔥 Our Story</span>
                <h2 className="text-3xl font-black text-white mb-5">From a Dream to Dhanmondi's Favorite</h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>It all started in 2020 when our founder Karim Ahmed couldn't find a burger in Dhaka that matched the quality he loved abroad. Frustrated but inspired, he spent 6 months perfecting the ultimate smash burger recipe.</p>
                  <p>Starting from a small kitchen with just 3 menu items and a bicycle for delivery, Takeout Dhanmondi quickly became the talk of the neighborhood. Today, we operate from our own restaurant with a full kitchen team and a fleet of delivery riders.</p>
                  <p>We remain committed to our core promise: <strong className="text-white">premium quality ingredients, honest pricing, and consistently excellent food.</strong></p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden h-80">
                  <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800" alt="Our Kitchen" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-5 rounded-2xl">
                  <p className="text-3xl font-black">4+</p>
                  <p className="text-sm font-semibold">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-dark-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, value: '15,000+', label: 'Happy Customers', color: 'from-blue-500/20 to-blue-600/5' },
                { icon: Award, value: '4.9★', label: 'Average Rating', color: 'from-yellow-500/20 to-yellow-600/5' },
                { icon: Flame, value: '50,000+', label: 'Orders Delivered', color: 'from-orange-500/20 to-orange-600/5' },
                { icon: Heart, value: '30+', label: 'Menu Items', color: 'from-red-500/20 to-red-600/5' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className={`p-6 rounded-2xl bg-gradient-to-br ${color} border border-dark-400 text-center`}>
                  <Icon className="w-8 h-8 text-white mx-auto mb-3 opacity-70" />
                  <p className="text-white text-3xl font-black mb-1">{value}</p>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Values */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">Our Values</h2>
              <p className="text-gray-400">The principles that guide everything we do.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: '🎯', title: 'Quality First', description: 'We never compromise on ingredients. Every patty, every bun, every sauce is the best we can source.' },
                { emoji: '⚡', title: 'Speed & Reliability', description: 'Your time matters. We aim for 30-45 minute delivery every single order, every single day.' },
                { emoji: '🤝', title: 'Customer Obsession', description: 'Every decision we make starts with one question: will this make our customers happier?' },
              ].map(card => (
                <div key={card.title} className="p-6 rounded-2xl bg-dark-50 border border-dark-400 hover:border-primary-500/30 transition-all text-center">
                  <div className="text-5xl mb-4">{card.emoji}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
