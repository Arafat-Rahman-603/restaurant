'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Users, TrendingUp, Clock, ArrowUpRight, Package } from 'lucide-react';
import { AdminStats, Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, change: stats.changes?.orders || '+0%', color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', label: 'this week' },
    { title: "Today's Orders", value: stats.todayOrders.toString(), icon: Clock, change: stats.changes?.todayOrders || '+0%', color: 'from-orange-500/20 to-orange-600/5', iconColor: 'text-primary-500', label: 'vs yesterday' },
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, change: stats.changes?.revenue || '+0%', color: 'from-green-500/20 to-green-600/5', iconColor: 'text-green-400', label: 'this week' },
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, change: stats.changes?.customers || '+0%', color: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400', label: 'this week' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          {stats?.pendingOrders && stats.pendingOrders > 0 ? (
            <Link href="/admin/orders?status=Pending" className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500/20 transition-colors">
              <Package className="w-4 h-4" />
              {stats.pendingOrders} Pending Orders
            </Link>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="bg-dark-50 rounded-2xl border border-dark-400 p-5 space-y-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-32" /></div>)
          : statCards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`bg-gradient-to-br ${card.color} rounded-2xl border border-dark-400 p-5`}>
              <div className={`w-11 h-11 rounded-xl bg-dark-DEFAULT/50 flex items-center justify-center mb-4 ${card.iconColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{card.value}</p>
              <p className="text-gray-400 text-sm">{card.title}</p>
              <p className={`${card.change.startsWith('-') ? 'text-red-400' : 'text-green-400'} text-xs mt-1 font-semibold`}>
                {card.change} {card.label}
              </p>
            </motion.div>
          ))
        }
      </div>

      {/* Recent Orders */}
      <div className="bg-dark-50 rounded-2xl border border-dark-400">
        <div className="flex items-center justify-between p-5 border-b border-dark-400">
          <h2 className="text-white font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-primary-500 text-sm font-semibold hover:gap-2 transition-all">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-400">
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-400">
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
                : stats?.recentOrders?.map((order: Order) => (
                  <tr key={order._id} className="hover:bg-dark-300 transition-colors">
                    <td className="px-5 py-4 text-primary-500 font-mono font-bold text-sm">{order.orderId}</td>
                    <td className="px-5 py-4 text-white text-sm">{order.customer.name}</td>
                    <td className="px-5 py-4 text-white font-semibold text-sm">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      {stats?.weeklyRevenue && (
        <WeeklyRevenueChart weeklyRevenue={stats.weeklyRevenue} />
      )}
    </div>
  );
}

interface WeeklyRevenueChartProps {
  weeklyRevenue: { _id: string; revenue: number; orders: number }[];
}

function WeeklyRevenueChart({ weeklyRevenue }: WeeklyRevenueChartProps) {
  // Fill in 7 days (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayData = weeklyRevenue?.find(day => day._id === dateStr);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: dateStr,
      label,
      revenue: dayData ? dayData.revenue : 0,
      orders: dayData ? dayData.orders : 0
    };
  });

  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1000);

  const points = last7Days.map((day, i) => {
    const x = paddingLeft + (i / 6) * chartWidth;
    const y = height - paddingBottom - (day.revenue / maxRevenue) * chartHeight;
    return { x, y, ...day };
  });

  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.min(6, Math.max(0, Math.round(((svgX - paddingLeft) / chartWidth) * 6)));
    setActiveIdx(idx);
  };

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="bg-dark-50 rounded-2xl border border-dark-400 p-5 relative">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-bold">Weekly Revenue</h2>
          <p className="text-gray-400 text-xs mt-0.5">Revenue trends over the last 7 days</p>
        </div>
        {activePoint && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-right">
            <p className="text-xs text-gray-400">{activePoint.date}</p>
            <p className="text-sm font-bold text-primary-500">
              {formatPrice(activePoint.revenue)} <span className="text-xs text-gray-500">({activePoint.orders} orders)</span>
            </p>
          </motion.div>
        )}
      </div>

      <div className="relative w-full h-[240px]">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveIdx(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#E63946" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const value = Math.round(maxRevenue * (1 - ratio));
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#2A2A2A"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#666"
                  fontSize={10}
                  textAnchor="end"
                >
                  {formatPrice(value)}
                </text>
              </g>
            );
          })}

          {/* X Axis labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 12}
              fill={activeIdx === i ? '#FF6B00' : '#666'}
              fontWeight={activeIdx === i ? 'bold' : 'normal'}
              fontSize={11}
              textAnchor="middle"
              className="transition-colors duration-200"
            >
              {p.label}
            </text>
          ))}

          {/* Filled Area */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#areaGradient)"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Active hover vertical line & dots */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={height - paddingBottom}
                stroke="#FF6B00"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.6}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill="#FF6B00"
                stroke="#fff"
                strokeWidth={2}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={12}
                fill="#FF6B00"
                opacity={0.3}
                className="animate-ping"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
