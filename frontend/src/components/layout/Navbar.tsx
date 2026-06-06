'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, Flame, User, LogOut, ChevronDown, Package, MapPin, UserCircle, Search, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalWishlistItems = useWishlistStore((s) => s.items.length);
  const { user, token, logout } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-dark shadow-lg py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">Takeout</span>
              <span className="block text-primary-500 font-semibold text-sm leading-none">Dhanmondi</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2.5">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-dark-50 hover:bg-dark-300 border border-dark-400 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:border-primary-500/50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/profile?tab=wishlist"
              className="relative flex items-center gap-2 bg-dark-50 hover:bg-dark-300 border border-dark-400 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:border-primary-500/50"
            >
              <Heart className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">Wishlist</span>
              {totalWishlistItems > 0 && (
                <motion.span
                  key={totalWishlistItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold"
                >
                  {totalWishlistItems}
                </motion.span>
              )}
            </Link>

            {/* User Area */}
            {token ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white text-xs font-bold border border-primary-500/30 hover:scale-105 active:scale-95 transition-all shadow-glow"
                  title="My Profile"
                >
                  {userInitials}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-dark-50 border border-dark-400 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3.5 border-b border-dark-400 bg-dark-300/30">
                        <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors text-sm"
                        >
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors text-sm"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/profile?tab=wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors text-sm"
                        >
                          <Heart className="w-4 h-4" />
                          My Wishlist
                        </Link>
                        <Link
                          href="/order-tracking"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors text-sm"
                        >
                          <Search className="w-4 h-4" />
                          Track Order
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-dark-400 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="w-9 h-9 rounded-full bg-dark-50 border border-dark-400 hover:border-primary-500/50 text-gray-300 hover:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Login / Sign Up"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-dark-50 border border-dark-400 text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-dark-50 border-t border-dark-400 shadow-2xl overflow-hidden z-50 mt-0"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30'
                      : 'text-gray-300 hover:bg-dark-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-dark-400 my-1" />

              {token ? (
                <>
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-dark-50 border border-dark-400">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Mobile Profile Links */}
                  <Link href="/profile" className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-gray-300 hover:bg-dark-50 transition-colors">
                    <UserCircle className="w-4 h-4 text-primary-500" /> My Profile
                  </Link>
                  <Link href="/profile?tab=orders" className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-gray-300 hover:bg-dark-50 transition-colors">
                    <Package className="w-4 h-4 text-primary-500" /> My Orders
                  </Link>
                  <Link href="/profile?tab=wishlist" className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-gray-300 hover:bg-dark-50 transition-colors">
                    <Heart className="w-4 h-4 text-primary-500" /> My Wishlist
                  </Link>
                  <Link href="/order-tracking" className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-gray-300 hover:bg-dark-50 transition-colors">
                    <Search className="w-4 h-4 text-primary-500" /> Track Order
                  </Link>
 
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pathname)}`}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-gray-300 hover:bg-dark-50 text-center border border-dark-400"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(pathname)}`}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-dark-50 border border-primary-500/30 text-center hover:bg-dark-300 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
