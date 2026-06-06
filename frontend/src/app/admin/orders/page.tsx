'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const STATUSES: (OrderStatus | 'all')[] = ['all', 'Pending', 'Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status, page]);
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(), 500);
    return () => clearTimeout(t);
  }, [search]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status.'); } finally { setUpdatingStatus(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Orders</h1>
        <p className="text-gray-400 text-sm">Manage and update all customer orders.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID, name, or phone..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${status === s ? 'bg-primary-500 text-white' : 'bg-dark-DEFAULT border border-dark-400 text-gray-400 hover:border-primary-500/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-dark-50 rounded-2xl border border-dark-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-400 bg-dark-100">
                {['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-400">
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>)}</tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No orders found.</td></tr>
              ) : orders.map(order => (
                <>
                  <tr key={order._id} className="hover:bg-dark-300 transition-colors cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                    <td className="px-4 py-3.5 text-primary-500 font-mono font-bold text-sm whitespace-nowrap">{order.orderId}</td>
                    <td className="px-4 py-3.5 text-white text-sm">{order.customer.name}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-sm">{order.customer.phone}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-sm">{order.items.length} items</td>
                    <td className="px-4 py-3.5 text-white font-semibold text-sm">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order._id, e.target.value as OrderStatus)}
                        disabled={updatingStatus === order._id}
                        className="px-2 py-1.5 rounded-lg bg-dark-DEFAULT border border-dark-400 text-white text-xs focus:outline-none focus:border-primary-500 disabled:opacity-50"
                      >
                        {(['Pending','Confirmed','Preparing','Out For Delivery','Delivered','Cancelled'] as OrderStatus[]).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr key={`${order._id}-expanded`}>
                      <td colSpan={8} className="px-4 py-4 bg-dark-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Items</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm mb-1">
                                <span className="text-white">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                <span className="text-primary-500">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Delivery Address</p>
                            <p className="text-white text-sm">{order.customer.address}</p>
                            {order.notes && <><p className="text-gray-400 text-xs mt-3 mb-1 font-semibold uppercase tracking-wider">Notes</p><p className="text-white text-sm">{order.notes}</p></>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm transition-all ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-50 border border-dark-400 text-gray-400'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
