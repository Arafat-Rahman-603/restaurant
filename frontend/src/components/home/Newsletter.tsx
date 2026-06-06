'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("🎉 You're subscribed! Check your email for a welcome offer.");
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-accent" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Get Exclusive Deals</h2>
            <p className="text-orange-100 text-lg mb-8 max-w-md mx-auto">
              Subscribe for weekly offers, new menu items, and exclusive discounts delivered to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-orange-200 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-4 rounded-xl bg-white text-primary-500 font-bold hover:bg-orange-50 transition-colors duration-200 flex items-center gap-2 justify-center disabled:opacity-70"
              >
                {loading ? 'Subscribing...' : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-orange-200 text-sm mt-4">No spam, unsubscribe anytime. 🔒 We respect your privacy.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
