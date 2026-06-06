'use client';
import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, Heart } from 'lucide-react';
import { Customer } from '@/types';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSelectCustomer = async (customer: Customer) => {
    setSelected(customer);
    try {
      const res = await api.get(`/customers/${customer._id}`);
      setSelected(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Customers</h1>
        <p className="text-gray-400 text-sm">View and manage your customer base.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="lg:col-span-2 bg-dark-50 rounded-2xl border border-dark-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-400 bg-dark-100">
                  {['Customer', 'Orders', 'Total Spent', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-400">
                {loading ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(4).fill(0).map((_, j) => <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>)}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No customers found.</td></tr>
                ) : filtered.map(customer => (
                  <tr key={customer._id} onClick={() => handleSelectCustomer(customer)} className={`hover:bg-dark-300 transition-colors cursor-pointer ${selected?._id === customer._id ? 'bg-dark-300 border-l-2 border-primary-500' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center text-primary-500 font-bold text-sm flex-shrink-0">
                          {customer.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{customer.name}</p>
                          <p className="text-gray-400 text-xs">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-white text-sm font-semibold">{customer.totalOrders}</td>
                    <td className="px-4 py-3.5 text-primary-500 font-bold text-sm">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-dark-50 rounded-2xl border border-dark-400 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-black text-xl">
                  {selected.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold">{selected.name}</h3>
                  <p className="text-gray-400 text-xs">Customer since {formatDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-gray-300 truncate">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-300">{selected.phone}</span>
                  </div>
                )}
                {selected.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-xs leading-relaxed">{selected.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-dark-300 text-center">
                  <p className="text-white font-black text-xl">{selected.totalOrders}</p>
                  <p className="text-gray-400 text-xs">Total Orders</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-300 text-center">
                  <p className="text-primary-500 font-black text-xl">{formatPrice(selected.totalSpent)}</p>
                  <p className="text-gray-400 text-xs">Total Spent</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Order History
                </p>
                {selected.orders?.length > 0 ? (
                  typeof selected.orders[0] === 'object' ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selected.orders.slice(0, 5).map((order: any) => (
                        <div key={order._id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-300">
                          <span className="text-primary-500 font-mono text-xs font-bold">{order.orderId}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Loading order history...</p>
                  )
                ) : (
                  <p className="text-gray-500 text-xs">No order history loaded.</p>
                )}
              </div>

              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> Wishlist
                </p>
                {selected.wishlist?.length ? (
                  typeof selected.wishlist[0] === 'object' ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {(selected.wishlist as any[]).slice(0, 10).map((food: any) => (
                        <div key={food._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-300">
                          <img
                            src={getImageUrl(food.images)}
                            alt={food.name}
                            className="w-10 h-10 rounded-lg object-cover border border-dark-400 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-semibold truncate">{food.name}</p>
                            <p className="text-gray-500 text-[11px] truncate">{formatPrice(food.discountPrice || food.price)}</p>
                          </div>
                          <Link
                            href={`/menu/${food._id}`}
                            className="text-primary-500 text-xs font-semibold hover:underline flex-shrink-0"
                            target="_blank"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                      {selected.wishlist.length > 10 && (
                        <p className="text-gray-500 text-[11px] text-center pt-1">
                          Showing 10 of {selected.wishlist.length}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Loading wishlist...</p>
                  )
                ) : (
                  <p className="text-gray-500 text-xs">No wishlist items.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-dark-50 rounded-2xl border border-dark-400 p-8 text-center flex flex-col items-center justify-center h-full min-h-48">
              <div className="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">Click a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
