import Link from 'next/link';
import { Flame, MapPin, Phone, Mail } from 'lucide-react';

// Inline SVG social icons (lucide-react doesn't include brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-dark-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none">Takeout</span>
                <span className="block text-primary-500 font-semibold text-sm leading-none">Dhanmondi</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium fast food delivered fresh and hot to your doorstep. Serving the best burgers, fried chicken and combos in Dhanmondi.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FacebookIcon, href: '#', color: 'hover:text-blue-500' },
                { icon: InstagramIcon, href: '#', color: 'hover:text-pink-500' },
                { icon: YoutubeIcon, href: '#', color: 'hover:text-red-500' },
              ].map(({ icon: Icon, href, color }) => (
                <a key={color} href={href} className={`w-10 h-10 rounded-xl bg-dark-300 border border-dark-400 flex items-center justify-center text-gray-400 ${color} transition-all duration-200 hover:border-primary-500`}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/menu', label: 'Our Menu' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/order-tracking', label: 'Track Order' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-primary-500 transition-colors duration-200 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
            <ul className="space-y-3">
              {[
                { emoji: '🍔', label: 'Burgers' },
                { emoji: '🍗', label: 'Fried Chicken' },
                { emoji: '🍱', label: 'Combos' },
                { emoji: '🍟', label: 'Sides' },
                { emoji: '🥤', label: 'Drinks' },
                { emoji: '🍰', label: 'Desserts' },
              ].map((cat) => (
                <li key={cat.label}>
                  <Link href={`/menu?category=${cat.label.toLowerCase()}`} className="text-gray-400 text-sm hover:text-primary-500 transition-colors flex items-center gap-2">
                    <span>{cat.emoji}</span> {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">House 12, Road 7, Dhanmondi R/A, Dhaka-1205</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="tel:+8801712345678" className="text-gray-400 text-sm hover:text-primary-500 transition-colors">+880 1712-345678</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="mailto:order@takeoutdhanmondi.com" className="text-gray-400 text-sm hover:text-primary-500 transition-colors">order@takeoutdhanmondi.com</a>
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <p className="text-primary-500 font-semibold text-sm">⏰ Delivery Hours</p>
              <p className="text-gray-400 text-xs mt-1">Daily: 11:00 AM — 11:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 Takeout Dhanmondi. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
