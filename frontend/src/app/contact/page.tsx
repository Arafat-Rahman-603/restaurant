'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">📞 Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Contact Us</h1>
            <p className="text-gray-400 max-w-lg mx-auto">Have a question or need help? We'd love to hear from you. Drop us a message!</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              {[
                { icon: MapPin, title: 'Our Location', lines: ['House 12, Road 7, Dhanmondi R/A', 'Dhaka-1205, Bangladesh'], color: 'text-primary-500' },
                { icon: Phone, title: 'Phone Number', lines: ['+880 1712-345678', '+880 1712-345679'], color: 'text-green-400' },
                { icon: Mail, title: 'Email Address', lines: ['order@takeoutdhanmondi.com', 'support@takeoutdhanmondi.com'], color: 'text-blue-400' },
                { icon: Clock, title: 'Opening Hours', lines: ['Mon - Sun: 11:00 AM - 11:00 PM', 'Delivery till 10:30 PM'], color: 'text-yellow-400' },
              ].map(({ icon: Icon, title, lines, color }) => (
                <div key={title} className="flex gap-5 p-5 rounded-2xl bg-dark-50 border border-dark-400 hover:border-primary-500/30 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{title}</h3>
                    {lines.map(line => <p key={line} className="text-gray-400 text-sm">{line}</p>)}
                  </div>
                </div>
              ))}

              {/* Map embed placeholder */}
              <div className="rounded-2xl overflow-hidden border border-dark-400 h-56 bg-dark-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Dhanmondi, Dhaka, Bangladesh</p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm mt-1 inline-block hover:underline">Open in Google Maps →</a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-dark-50 rounded-2xl border border-dark-400 p-8">
                <h2 className="text-white font-bold text-xl mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Name *</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Subject *</label>
                    <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="What's this about?" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Write your message here..." className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                    <Send className="w-5 h-5" /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
