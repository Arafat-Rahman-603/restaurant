'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Flame, LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Star, LogOut, Bell, X, Volume2, FolderOpen, Tag } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notificationStore';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { notifications, unreadCount, addNotification, markAllRead } = useNotificationStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
      return;
    }
    const user = localStorage.getItem('admin_user');
    if (user) setAdminUser(JSON.parse(user));

    // Socket.IO connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;
    socket.emit('join_admin');

    socket.on('new_order', (data) => {
      addNotification(data);
      toast.custom((t) => (
        <div className={cn('bg-dark-50 border border-primary-500/50 rounded-2xl p-4 shadow-xl flex items-start gap-3', t.visible ? 'animate-slide-up' : 'opacity-0')}>
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">New Order! {data.orderId}</p>
            <p className="text-gray-400 text-xs">{data.customerName} — {formatPrice(data.total)}</p>
          </div>
        </div>
      ), { duration: 6000 });
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-dark-DEFAULT flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-50 border-r border-dark-400 flex flex-col fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-dark-400">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none block">Takeout Admin</span>
              <span className="text-primary-500 text-xs">Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === href
                  ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30'
                  : 'text-gray-400 hover:bg-dark-300 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-dark-400">
          {adminUser && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {adminUser.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{adminUser.name}</p>
                <p className="text-gray-500 text-xs truncate">{adminUser.email}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-300 text-gray-400 hover:text-white text-xs transition-colors">
              View Site
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-dark-50 border-b border-dark-400 flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="text-white font-bold capitalize">{pathname.split('/').slice(-1)[0] || 'Dashboard'}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              className="relative w-10 h-10 rounded-xl bg-dark-300 border border-dark-400 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notification Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-16 right-4 w-80 bg-dark-50 border border-dark-400 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-400">
                <h3 className="text-white font-bold text-sm">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">No notifications yet.</div>
                ) : notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-dark-400 hover:bg-dark-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{n.orderId}</p>
                        <p className="text-gray-400 text-xs">{n.customerName} · {formatPrice(n.total)}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{n.itemCount} items · {formatDate(n.orderTime)}</p>
                      </div>
                      <Link href="/admin/orders" className="flex-shrink-0 text-primary-500 text-xs font-semibold hover:underline">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
