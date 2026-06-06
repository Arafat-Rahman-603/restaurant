'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Upload, Search } from 'lucide-react';
import { Food, Category } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', discountPrice: '', category: '', preparationTime: '20', isFeatured: false, isPopular: false, isAvailable: true, ingredients: '', tags: '' };

export default function AdminMenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, catsRes] = await Promise.all([api.get('/admin/foods'), api.get('/categories')]);
      setFoods(foodsRes.data.data);
      setCategories(catsRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (food: Food) => {
    setEditingFood(food);
    const catId = typeof food.category === 'object' ? food.category._id : food.category;
    setForm({
      name: food.name, description: food.description,
      price: food.price.toString(), discountPrice: food.discountPrice?.toString() || '',
      category: catId, preparationTime: food.preparationTime.toString(),
      isFeatured: food.isFeatured, isPopular: food.isPopular, isAvailable: food.isAvailable,
      ingredients: food.ingredients?.join(', ') || '', tags: food.tags?.join(', ') || '',
    });
    setShowModal(true);
  };

  const openAdd = () => { setEditingFood(null); setForm(EMPTY_FORM); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        category: form.category, preparationTime: parseInt(form.preparationTime),
        isFeatured: form.isFeatured, isPopular: form.isPopular, isAvailable: form.isAvailable,
        ingredients: form.ingredients ? form.ingredients.split(',').map(s => s.trim()) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()) : [],
      };
      if (editingFood) {
        await api.put(`/admin/foods/${editingFood._id}`, payload);
        toast.success('Food item updated!');
      } else {
        await api.post('/admin/foods', payload);
        toast.success('Food item created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/foods/${id}`);
      toast.success('Deleted!');
      setFoods(foods.filter(f => f._id !== id));
    } catch { toast.error('Delete failed.'); }
  };

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Menu Management</h1>
          <p className="text-gray-400 text-sm">Add, edit or remove food items from your menu.</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Food
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array(8).fill(0).map((_, i) => <div key={i} className="bg-dark-50 rounded-2xl border border-dark-400 overflow-hidden"><Skeleton className="h-40 rounded-none" /><div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-20" /></div></div>)
          : filtered.map((food, i) => (
            <motion.div key={food._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-dark-50 rounded-2xl border border-dark-400 overflow-hidden hover:border-primary-500/30 transition-all group">
              <div className="relative h-36 overflow-hidden">
                <img src={getImageUrl(food.images)} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-DEFAULT/80 to-transparent" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {food.isFeatured && <span className="px-2 py-0.5 rounded-lg bg-primary-500 text-white text-xs font-bold">Featured</span>}
                  {!food.isAvailable && <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-xs font-bold">Unavailable</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{food.name}</h3>
                <p className="text-primary-500 font-bold text-sm mb-3">{formatPrice(food.discountPrice || food.price)}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(food)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-300 border border-dark-400 text-gray-400 hover:text-white hover:border-primary-500/50 text-xs transition-all">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(food._id, food.name)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-dark-50 rounded-2xl border border-dark-400 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-dark-400 sticky top-0 bg-dark-50 z-10">
                <h2 className="text-white font-bold">{editingFood ? 'Edit Food Item' : 'Add New Food Item'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {[
                  { label: 'Name *', key: 'name', placeholder: 'e.g. Classic Smash Burger' },
                  { label: 'Price (৳) *', key: 'price', type: 'number', placeholder: '280' },
                  { label: 'Discount Price (৳)', key: 'discountPrice', type: 'number', placeholder: '250 (optional)' },
                  { label: 'Preparation Time (min)', key: 'preparationTime', type: 'number', placeholder: '20' },
                  { label: 'Ingredients', key: 'ingredients', placeholder: 'Beef patty, cheddar, lettuce (comma separated)' },
                  { label: 'Tags', key: 'tags', placeholder: 'spicy, bestseller (comma separated)' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
                    <input type={field.type || 'text'} value={(form as any)[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} className="w-full px-4 py-2.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description *</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the food item..." className="w-full px-4 py-2.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 text-sm">
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  {[{ key: 'isFeatured', label: 'Featured' }, { key: 'isPopular', label: 'Popular' }, { key: 'isAvailable', label: 'Available' }].map(toggle => (
                    <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(form as any)[toggle.key]} onChange={e => setForm({...form, [toggle.key]: e.target.checked})} className="w-4 h-4 accent-primary-500" />
                      <span className="text-gray-400 text-sm">{toggle.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-dark-300 border border-dark-400 text-gray-400 hover:text-white text-sm font-semibold transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm disabled:opacity-70">
                    {saving ? 'Saving...' : editingFood ? 'Update Food' : 'Add Food'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
