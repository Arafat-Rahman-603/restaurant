'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, FolderOpen, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('🍔');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data);
    } catch (err: any) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingCategory) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [name, editingCategory]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('🍔');
    setDescription('');
    setSortOrder(0);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || '🍔');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder || 0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and slug are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name, slug, icon, description, sortOrder };
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created successfully!');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All foods belonging to it will lose their category association.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (err: any) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderOpen className="text-primary-500 w-6 h-6" /> Categories
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your menu categories and display order</p>
        </div>
        <button onClick={openAddModal} className="btn-primary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:scale-[1.02] transition-transform">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-dark-50 border border-dark-400 rounded-2xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">No Categories</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first category to get started.</p>
          <button onClick={openAddModal} className="btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm">
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-50 border border-dark-400 rounded-2xl p-5 hover:border-primary-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-DEFAULT border border-dark-400 flex items-center justify-center text-2xl shadow-inner">
                    {cat.icon || '🍔'}
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-dark-300 border border-dark-400 text-gray-400 font-semibold">
                    Order: {cat.sortOrder}
                  </div>
                </div>
                <h3 className="text-white font-bold text-base mb-1">{cat.name}</h3>
                <p className="text-gray-500 text-xs font-mono select-all">/{cat.slug}</p>
                <p className="text-gray-400 text-sm leading-relaxed mt-2 line-clamp-2">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="flex gap-2 border-t border-dark-400 pt-4 mt-4">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex-1 py-2 rounded-xl bg-dark-300 border border-dark-400 hover:border-primary-500/40 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="py-2 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center justify-center transition-all"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-dark-50 border border-dark-400 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-dark-400">
                <h3 className="text-white font-bold text-lg">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Burgers" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Slug (API Identifier) *</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. burgers" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Emoji Icon</label>
                    <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🍔" className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white text-center focus:outline-none focus:border-primary-500 transition-colors text-lg" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Sort Order</label>
                    <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider font-semibold">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe this category..." className="w-full px-4 py-3 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none text-sm" />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 mt-2">
                  <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
